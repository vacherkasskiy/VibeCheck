const FALLBACK_USER_ID = 'current-user-id';

export const getCurrentUserId = (): string => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return FALLBACK_USER_ID;

  const payload = accessToken.split('.')[1];
  if (!payload) return FALLBACK_USER_ID;

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      '=',
    );
    const decoded = JSON.parse(atob(paddedPayload)) as { sub?: unknown };

    return typeof decoded.sub === 'string' ? decoded.sub : FALLBACK_USER_ID;
  } catch {
    return FALLBACK_USER_ID;
  }
};
