const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No token, authorization denied' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecf08572cd46430f69072598774095298dbd4753a0f7afc90c5463e272a8373a0c9912421ad8f725f68fcfaf8405395936d680796fcedf96813fde2fa7d611d0');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};