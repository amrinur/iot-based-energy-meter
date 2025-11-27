import { User } from '../types/index.js';

export class UserModel {
    static validateUser(user: Partial<User>): boolean {
        return !!(user.username && user.password);
    }

    static sanitizeUser(user: User): Omit<User, 'password'> {
        const { password, ...sanitized } = user;
        return sanitized;
    }
}
