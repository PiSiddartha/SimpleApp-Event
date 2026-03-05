/**
 * Decode JWT payload without verification (client-side; token came from Cognito).
 * Used to read cognito:groups for admin check.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const ADMINS_GROUP = 'Admins';

export function isAdminFromToken(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  const groups = payload['cognito:groups'];
  if (Array.isArray(groups)) return groups.includes(ADMINS_GROUP);
  if (typeof groups === 'string') return groups === ADMINS_GROUP;
  return false;
}
