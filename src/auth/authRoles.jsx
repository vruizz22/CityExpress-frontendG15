export const CITYEXPRESS_ROLES_CLAIM = 'https://cityexpress/roles';

export function getUserRoles(user) {
  if (!user) return [];

  const roles = user[CITYEXPRESS_ROLES_CLAIM];

  return Array.isArray(roles) ? roles : [];
}

export function isAdminUser(user) {
  return getUserRoles(user).includes('admin');
}
