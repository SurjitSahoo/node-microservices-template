import * as sso from './sso';

export { init as initRoleGuard, role } from './role';

export const { authenticate, init: initSSO } = sso;

export default sso;
