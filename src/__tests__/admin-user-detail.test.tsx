import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserDetailSlideOver } from '@/app/admin/_components/UserDetailSlideOver';

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} alt="" />,
}));

vi.mock('lucide-react', () => {
  const stub = () => <span />;
  return {
    X: stub,
    CreditCard: stub,
    Activity: stub,
    Clock: stub,
    Monitor: stub,
    ShieldOff: stub,
    ShieldCheck: stub,
    Trash2: stub,
    Save: stub,
  };
});

function detail() {
  return {
    user: {
      id: 'u1', name: 'Test User', email: 't@example.com', image: null,
      role: 'user', plan: 'free', status: 'active', credits: 30, lastLoginAt: null,
    },
    payments: [],
    toolUsage: [],
    roleHistory: [],
  } as any;
}

function renderOpen(onClose = vi.fn()) {
  return {
    onClose,
    ...render(
      <UserDetailSlideOver
        userDetail={detail()}
        loading={false}
        sessions={[]}
        sessionsLoading={false}
        revokingSession={null}
        onClose={onClose}
        onRevokeSession={vi.fn()}
        onUpdateCredits={vi.fn()}
        onChangePlan={vi.fn()}
        onBanUser={vi.fn()}
        onDeleteUser={vi.fn()}
        onToast={vi.fn()}
      />
    ),
  };
}

describe('UserDetailSlideOver dialog behavior', () => {
  it('closes on X click', () => {
    const { onClose } = renderOpen();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', () => {
    const { onClose } = renderOpen();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape on stacked delete confirm closes only the confirm', () => {
    const { onClose } = renderOpen();
    fireEvent.click(screen.getByText('Delete (GDPR)'));
    expect(screen.getByText('Delete Forever')).toBeDefined();

    fireEvent.keyDown(document, { key: 'Escape' });
    // Confirm dismissed…
    expect(screen.queryByText('Delete Forever')).toBeNull();
    // …but the panel stays open and no close was requested.
    expect(screen.getByText('User Detail')).toBeDefined();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('offers only stored billing tiers (free|pro) in the plan select', () => {
    renderOpen();
    const select = screen.getByLabelText('Change user plan') as HTMLSelectElement;
    const values = Array.from(select.options).map((o) => o.value);
    expect(values).toEqual(['free', 'pro']);
  });
});
