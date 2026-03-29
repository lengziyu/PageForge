const ADMIN_SESSION_COOKIE = "pageforge_admin_session";
const ADMIN_SESSION_PREFIX = "pageforge-admin";

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
}

export function getAdminSessionCookieName() {
  return ADMIN_SESSION_COOKIE;
}

export function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return null;
  }

  return { username, password };
}

export async function createAdminSessionToken(username: string, password: string) {
  const payload = `${ADMIN_SESSION_PREFIX}:${username}:${password}`;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payload),
  );

  return toHex(digest);
}

export async function getExpectedAdminSessionToken() {
  const credentials = getAdminCredentials();

  if (!credentials) {
    return null;
  }

  return createAdminSessionToken(credentials.username, credentials.password);
}

export async function isValidAdminSession(token?: string | null) {
  if (!token) {
    return false;
  }

  const expectedToken = await getExpectedAdminSessionToken();

  if (!expectedToken) {
    return true;
  }

  return token === expectedToken;
}
