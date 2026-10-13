import { cookies } from "next/headers";

export const ADMIN_CREDENTIALS = {
  email: "ebruatik98@gmail.com",
  password: "Ebru98.",
};

export const AUTH_COOKIE_NAME = "ebru_admin_session";

// Secret hash token representing a valid session
const SESSION_SECRET = "ebru_atik_makeup_studio_auth_token_2026_secured";

export function checkCredentials(email?: string, password?: string): boolean {
  if (!email || !password) return false;
  return (
    email.trim().toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() &&
    password === ADMIN_CREDENTIALS.password
  );
}

export function generateSessionToken(): string {
  return SESSION_SECRET;
}

export function isValidSessionToken(token?: string | null): boolean {
  return token === SESSION_SECRET;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return isValidSessionToken(token);
}
