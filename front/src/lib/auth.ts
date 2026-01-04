type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

type AccessTokenPayload = {
  role?: UserRole;
  sub?: number;
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : `${normalized}${'='.repeat(4 - padding)}`;
  return atob(padded);
};

export const getRoleFromToken = (token: string | null): UserRole | null => {
  if (!token) {
    return null;
  }
  const payload = token.split('.')[1];
  if (!payload) {
    return null;
  }
  try {
    const decoded = decodeBase64Url(payload);
    const data = JSON.parse(decoded) as AccessTokenPayload;
    return data.role ?? null;
  } catch {
    return null;
  }
};
