import { User } from '../types/index.js';
export declare class UserModel {
    static validateUser(user: Partial<User>): boolean;
    static sanitizeUser(user: User): Omit<User, 'password'>;
}
//# sourceMappingURL=user.model.d.ts.map