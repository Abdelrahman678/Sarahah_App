export const systemRoles = {
    ADMIN:"admin",
    USER:"user",
    SUPERADMIN:"superadmin"
}

const {ADMIN, USER, SUPERADMIN} = systemRoles
export const ADMIN_USER = [ADMIN, USER]
export const ADMIN_SUPERADMIN = [ADMIN, SUPERADMIN]
export const USER_SUPERADMIN = [USER, SUPERADMIN]