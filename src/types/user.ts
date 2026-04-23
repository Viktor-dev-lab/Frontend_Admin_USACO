export const UserRoles = {
    ADMIN: 'admin',
    USER: 'user',
    MODERATOR: 'moderator'
} as const;

export type UserRoles = typeof UserRoles[keyof typeof UserRoles];

export const UserStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BANNED: 'banned',
    DELETED: 'deleted'
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

export type User = {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRoles;
    status: UserStatus;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
};
