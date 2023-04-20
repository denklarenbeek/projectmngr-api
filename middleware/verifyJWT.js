const jwt = require('jsonwebtoken');

const verifyJWT =  (req, res, next) => {

    const authHeader = req.headers.authorization || req.headers.Authorization

    if(!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ messsage: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return res.status(403).json({ messsage: 'Forbidden' })
            req.roles = decoded.UserInfo.roles
            req.user = decoded.UserInfo
            next()
        }
    )
}

module.exports = verifyJWT