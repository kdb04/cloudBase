const requireRole = (...roles) => (req, res, next) => {
    if(roles.length === 0) {
        throw new Error('No roles specified for requireRole middleware');
    } 
    
    if(!req.user) {
        return res.status(401).json({ message: 'Unauthorized: authentication required' });
    }

    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
};

module.exports = requireRole;
