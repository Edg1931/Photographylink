import { cookies } from "next/headers";
import { accountFromToken, Account } from "./backend";

export const SESSION_COOKIE = "pl_session";

/** Resolve the current account from the session cookie (server-side). */
export async function currentAccount(): Promise<Account | undefined> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return accountFromToken(token);
}

export function currentToken(): string | undefined {
  return cookies().get(SESSION_COOKIE)?.value;
}
