export class UserModel {
    static validateUser(user) {
        return !!(user.username && user.password);
    }
    static sanitizeUser(user) {
        const { password, ...sanitized } = user;
        return sanitized;
    }
}
//# sourceMappingURL=user.model.js.map