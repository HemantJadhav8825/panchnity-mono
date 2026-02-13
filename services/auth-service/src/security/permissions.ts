import { CONSTANTS } from '../config/constants';

export const Permissions = {
  getRoleScopes: (role: string): string[] => {
    switch (role) {
      case CONSTANTS.ROLES.ADMIN:
        return Object.values(CONSTANTS.SCOPES);
      case CONSTANTS.ROLES.SERVICE:
        return [CONSTANTS.SCOPES.READ, CONSTANTS.SCOPES.WRITE];
      default:
        return [CONSTANTS.SCOPES.READ];
    }
  },

  hasProjectScope: (userScopes: string[], requiredScope: string): boolean => {
    return userScopes.includes(requiredScope);
  }
};
