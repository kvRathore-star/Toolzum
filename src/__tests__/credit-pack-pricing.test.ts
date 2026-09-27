import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Pricing-lie guard for AI credit packs — the create-order.ts comment's
 * "MUST match the UI" rule, extended to packs (and covering the existing
 * pass/monthly/yearly prices while we're here). Prices exist in two files
 * on purpose (edge function + client component, no shared import across
 * the boundary); this test is the tie.
 */

const ROOT = process.cwd();
const cards = fs.readFileSync(
  path.join(ROOT, 'src/components/pricing/PricingCards.tsx'),
  'utf8',
);
const order = fs.readFileSync(
  path.join(ROOT, 'functions/api/payments/create-order.ts'),
  'utf8',
);

interface Pack {
  id: string;
  credits: number;
  USD: number;
  INR: number;
}

function uiPacks(): Pack[] {
  const out: Pack[] = [];
  const re = /\{ id: "(pack_\d+)", credits: (\d+), USD: "([\d.]+)", INR: "(\d+)"(?:, badge: "[^"]+")? \}/g;
  for (const m of cards.matchAll(re)) {
    out.push({ id: m[1]!, credits: Number(m[2]), USD: Number(m[3]), INR: Number(m[4]) });
  }
  return out;
}

function serverPrices(): Map<string, { INR: number; USD: number }> {
  const out = new Map<string, { INR: number; USD: number }>();
  const re = /(\w+): \{ INR: (\d+), USD: ([\d.]+) \}/g;
  for (const m of order.matchAll(re)) {
    out.set(m[1]!, { INR: Number(m[2]), USD: Number(m[3]) });
  }
  return out;
}

describe('credit pack pricing (UI ↔ create-order parity)', () => {
  it('ships exactly the three decided tiers (100 / 500 / 1000)', () => {
    const packs = uiPacks();
    expect(packs.map((p) => p.credits)).toEqual([100, 500, 1000]);
    expect(packs.map((p) => p.id)).toEqual(['pack_100', 'pack_500', 'pack_1000']);
  });

  it('every UI pack price matches create-order PRICES (both currencies)', () => {
    const prices = serverPrices();
    for (const pack of uiPacks()) {
      const server = prices.get(pack.id);
      expect(server, `create-order PRICES missing ${pack.id}`).toBeTruthy();
      expect(server!.USD, `${pack.id} USD mismatch`).toBe(pack.USD);
      expect(server!.INR, `${pack.id} INR mismatch`).toBe(pack.INR);
    }
  });

  it('every create-order pack has UI (no phantom sellable plan)', () => {
    const ids = new Set(uiPacks().map((p) => p.id));
    for (const key of serverPrices().keys()) {
      if (key.startsWith('pack_')) {
        expect(ids.has(key), `${key} sells with no UI card`).toBe(true);
      }
    }
  });

  it('packs keep the volume ladder (per-credit price drops as size grows)', () => {
    const packs = uiPacks();
    const perCredit = packs.map((p) => p.USD / p.credits);
    expect(perCredit[0]).toBeGreaterThan(perCredit[1]!);
    expect(perCredit[1]).toBeGreaterThan(perCredit[2]!);
    // floor: top tier never cheaper than the Pro effective rate (~$0.05)
    expect(perCredit[2]!).toBeGreaterThanOrEqual(0.049);
  });

  it('existing subscription prices still match between the two files', () => {
    const prices = serverPrices();
    expect(prices.get('pass')).toEqual({ INR: 99, USD: 3.99 });
    expect(prices.get('monthly')).toEqual({ INR: 299, USD: 9.99 });
    expect(prices.get('yearly')).toEqual({ INR: 2990, USD: 99 });
    const uiPass = cards.match(/pass: \{ price: "([\d.]+)", unit: "7 days", label: "7-Day Project Pass" \}/);
    expect(uiPass?.[1]).toBe('3.99');
    expect(cards).toMatch(/monthly: \{ price: "9\.99"/);
    expect(cards).toMatch(/yearly: \{ price: "99"/);
  });
});
