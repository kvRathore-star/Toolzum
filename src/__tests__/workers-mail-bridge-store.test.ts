import { describe, it, expect, vi, beforeEach } from "vitest";
import { storeMessage } from "../../workers/mail-bridge/src/index";

/**
 * Unit tests for the mail-bridge worker's store path: ticket open/close
 * semantics (auto-create, replied → new re-alert, archived never revived),
 * attachment storage, and the failure-isolation guarantees the pipeline
 * depends on (KV put failure must not lose the thread row).
 */

interface DbOpts {
  foundId?: string | null;
}

function mockDb(opts: DbOpts = {}) {
  const sqls: string[] = [];
  const binds: unknown[][] = [];
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn((...args: unknown[]) => {
      sqls.push(sql);
      binds.push(args);
      return {
        first: vi.fn(async () => {
          if (sql.includes("FROM contact_messages")) return opts.foundId ? { id: opts.foundId } : null;
          return null;
        }),
        run: vi.fn(async () => ({ meta: { changes: 1 } })),
      };
    }),
    first: vi.fn(async () => null),
    run: vi.fn(async () => {
      sqls.push(sql);
      return {};
    }),
  }));
  return { db: { prepare } as unknown as D1Database, sqls, binds };
}

function mockKv(failPut = false) {
  const puts: { key: string; value: unknown; meta: unknown }[] = [];
  return {
    puts,
    kv: {
      put: vi.fn(async (key: string, value: unknown, meta: unknown) => {
        if (failPut) throw new Error("KV unavailable");
        puts.push({ key, value, meta });
      }),
    } as unknown as KVNamespace,
  };
}

const MESSAGE = {
  from: "priya@example.com",
  to: "contact@toolzum.com",
  headers: new Headers(),
  raw: null,
  rawSize: 0,
  forward: vi.fn(async () => {}),
};

function parsed(overrides: Record<string, unknown> = {}) {
  return {
    from: { name: "Priya", address: "priya@example.com" },
    to: [{ name: "Toolzum", address: "contact@toolzum.com" }],
    subject: "Re: We got your message",
    text: "Thanks for the quick fix!",
    html: "",
    attachments: [],
    ...overrides,
  } as never;
}

const ENV = (db: D1Database, kv: KVNamespace) =>
  ({ DB: db, MAIL_KV: kv, FORWARD_TO: "owner@gmail.com" }) as never;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("worker storeMessage — ticket lifecycle", () => {
  it("auto-opens a new ticket when the sender has none (unsolicited email)", async () => {
    const { db, sqls, binds } = mockDb({ foundId: null });
    const { kv } = mockKv();
    await storeMessage(ENV(db, kv), MESSAGE as never, parsed());

    const ticketInsert = sqls.find((s) => s.includes("INSERT INTO contact_messages"));
    expect(ticketInsert).toBeTruthy();
    // ticket create binds: id, name, email, label, message, createdAt
    const ticketBind = binds.find((b) => b[1] === "Priya" && b[2] === "priya@example.com");
    expect(ticketBind).toBeTruthy();
    expect(ticketBind![4]).toBe("Thanks for the quick fix!");
    // no match → no re-alert UPDATE on this path (covered by the attach test)
    expect(sqls.some((s) => s.includes("SET status = 'new'"))).toBe(false);
    // archived exclusion lives in the SELECT the lookup used
    expect(sqls.some((s) => s.includes("status != 'archived'"))).toBe(true);

    const threadInsert = sqls.find((s) => s.includes("INSERT INTO contact_thread_messages"));
    expect(threadInsert).toBeTruthy();
    const threadBind = binds.find((b) => b[1] === (ticketBind![0] as string));
    expect(threadBind).toBeTruthy();
    expect(threadBind![2]).toBe("priya@example.com");
    expect(threadBind![3]).toBe("Thanks for the quick fix!");
  });

  it("attaches to the existing open ticket and re-alerts replied → new", async () => {
    const { db, sqls, binds } = mockDb({ foundId: "contact-42" });
    const { kv } = mockKv();
    await storeMessage(ENV(db, kv), MESSAGE as never, parsed());

    expect(sqls.some((s) => s.includes("INSERT INTO contact_messages"))).toBe(false);
    expect(sqls.some((s) => s.includes("SET status = 'new' WHERE id = ? AND status = 'replied'"))).toBe(true);
    const realert = binds.find((b) => b[0] === "contact-42" && b.length === 1);
    expect(realert).toBeTruthy();

    const threadBind = binds.find(
      (b) => typeof b[1] === "string" && b[1] === "contact-42" && typeof b[3] === "string"
    );
    expect(threadBind).toBeTruthy();
    expect(threadBind![2]).toBe("priya@example.com");
  });

  it("threads malformed-sender mail into one catch-all ticket, not a new row each", async () => {
    const { db, sqls, binds } = mockDb({ foundId: null });
    const { kv } = mockKv();
    const noFrom = { ...MESSAGE, from: "" };
    await storeMessage(ENV(db, kv), noFrom as never, parsed({ from: undefined }));

    // lookup still ran (with the empty address) so repeats can match it
    expect(sqls.some((s) => s.includes("lower(email) = ?"))).toBe(true);
    const ticketBind = binds.find((b) => b[1] === "Unknown sender" && b[2] === "");
    expect(ticketBind).toBeTruthy();
  });

  it("creates a fresh ticket for a sender whose only ticket is archived (excluded by the SELECT)", async () => {
    // The mock returns foundId only for non-archived matches — archived is
    // handled by the WHERE clause, so foundId: null models that exclusion.
    const { db, sqls } = mockDb({ foundId: null });
    const { kv } = mockKv();
    await storeMessage(ENV(db, kv), MESSAGE as never, parsed());
    expect(sqls.some((s) => s.includes("INSERT INTO contact_messages"))).toBe(true);
    expect(sqls.some((s) => s.includes("AND status != 'archived'") || s.includes("status != 'archived'"))).toBe(true);
  });
});

describe("worker storeMessage — attachments and body", () => {
  it("stores attachments in KV and records refs in the thread row", async () => {
    const { db, binds } = mockDb({ foundId: "contact-1" });
    const { kv, puts } = mockKv();
    await storeMessage(
      ENV(db, kv),
      MESSAGE as never,
      parsed({
        text: "",
        attachments: [
          { filename: "shot.png", mimeType: "image/png", disposition: "attachment", content: new TextEncoder().encode("img") },
        ],
      })
    );
    expect(puts).toHaveLength(1);
    expect(puts[0]!.key).toMatch(/^c\/[0-9a-f-]{36}\/0$/);
    expect((puts[0]!.meta as { metadata: { name: string } }).metadata.name).toBe("shot.png");

    const threadBind = binds.find((b) => typeof b[4] === "string" && (b[4] as string).startsWith("["));
    expect(threadBind).toBeTruthy();
    const refs = JSON.parse(threadBind![4] as string) as { name: string; mime: string }[];
    expect(refs[0]).toMatchObject({ name: "shot.png", mime: "image/png" });
    // attachment-only message gets the honest placeholder, not an empty bubble
    expect(threadBind![3]).toBe("[No text — attachment-only message]");
  });

  it("keeps the thread row when a KV put fails (per-attachment isolation)", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { db, sqls, binds } = mockDb({ foundId: "contact-1" });
    const { kv } = mockKv(true);
    await storeMessage(
      ENV(db, kv),
      MESSAGE as never,
      parsed({
        attachments: [
          { filename: "a.png", mimeType: "image/png", disposition: "attachment", content: new Uint8Array([1]) },
        ],
      })
    );
    expect(sqls.some((s) => s.includes("INSERT INTO contact_thread_messages"))).toBe(true);
    const threadBind = binds.find((b) => typeof b[4] === "string" && (b[4] as string).startsWith("["));
    expect(JSON.parse(threadBind![4] as string)).toEqual([]);
    expect(errSpy.mock.calls.map((c) => String(c[0])).join("\n")).toContain("KV put failed");
    errSpy.mockRestore();
  });

  it("labels a message with neither text nor attachments honestly", async () => {
    const { db, binds } = mockDb({ foundId: "contact-1" });
    const { kv } = mockKv();
    await storeMessage(ENV(db, kv), MESSAGE as never, parsed({ text: "" }));
    const threadBind = binds.find((b) => typeof b[3] === "string" && b[3] === "[No message text]");
    expect(threadBind).toBeTruthy();
  });

  it("runs lazy DDL including the versioned indexes before storing", async () => {
    const { db, sqls } = mockDb({ foundId: "contact-1" });
    const { kv } = mockKv();
    await storeMessage(ENV(db, kv), MESSAGE as never, parsed());
    expect(sqls.some((s) => s.includes('CREATE TABLE IF NOT EXISTS "contact_messages"'))).toBe(true);
    expect(sqls.some((s) => s.includes('CREATE TABLE IF NOT EXISTS "contact_thread_messages"'))).toBe(true);
    expect(sqls.some((s) => s.includes('"contact_messages_status_idx"'))).toBe(true);
    expect(sqls.some((s) => s.includes('"idx_contact_thread_contact"'))).toBe(true);
    // no schema drift: the lazy contact DDL must not carry DEFAULT '' clauses
    const createContact = sqls.find((s) => s.includes('CREATE TABLE IF NOT EXISTS "contact_messages"'));
    expect(createContact).not.toContain(`"name" text NOT NULL DEFAULT`);
  });
});
