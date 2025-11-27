export const errorHandler = (err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
};
//# sourceMappingURL=errorHandler.middleware.js.map