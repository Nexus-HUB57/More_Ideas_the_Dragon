import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type ContextUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const now = new Date();
  const user: ContextUser = {
    id: 999999,
    openId: "integration-user",
    email: "integration@example.com",
    name: "Integration User",
    loginMethod: "test",
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("new Nexus module contracts", () => {
  it("returns a governance snapshot with stable metric keys", async () => {
    const result = await appRouter.createCaller(createContext()).governance.snapshot();
    expect(result).toEqual(expect.objectContaining({ totalAgents: expect.any(Number), totalTransactions: expect.any(Number), totalBalance: expect.any(String) }));
  });

  it("supports read-only Forge and Asset Lab queries without mutation", async () => {
    const caller = appRouter.createCaller(createContext());
    const [projects, assets] = await Promise.all([caller.forge.list({ limit: 10 }), caller.assets.list({ limit: 10 })]);
    expect(Array.isArray(projects)).toBe(true);
    expect(Array.isArray(assets)).toBe(true);
  });

  it("returns the authenticated notification inbox contract", async () => {
    const caller = appRouter.createCaller(createContext());
    const [items, count] = await Promise.all([caller.notifications.getMine({ limit: 10 }), caller.notifications.unreadCount()]);
    expect(Array.isArray(items)).toBe(true);
    expect(typeof count).toBe("number");
  });
});
