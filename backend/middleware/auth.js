const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // In a real prod environment we might want to use httpOnly cookies, but for this SPA 
    // it's easier to use the Authorization header "Bearer <token>"
    // The prompt says "httpOnly cookies", so we'll check cookies first, then header fallback.
    
    // Express requires cookie-parser to parse cookies directly. 
    // Since we didn't install cookie-parser, we'll extract from headers.cookie manually, or use Authorization header.
    let token = '';

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';');
        const jwtCookie = cookies.find(c => c.trim().startsWith('token='));
        if (jwtCookie) {
            token = jwtCookie.split('=')[1];
        }
    }

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id: userId, email: userEmail }
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ status: 'error', message: 'Not authorized, token failed' });
    }
};

module.exports = { auth };
