const User = require('../models/User');
const bcrypt = require('bcrypt');
const { randomBytes } = require('crypto');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/email/sendEmail');

// @desc Login
// @route POST /auth
// access Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    
    if(!email || !password) {
        return res.status(400).json({message: 'All fields are required'})
    }
    
    const foundUser = await User.findOne({ email }).populate('customer', 'name').exec()
    
    if(!foundUser) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if(!match) return res.status(401).json({ message: 'Unauthorized' })

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "id": foundUser._id,
                "email": foundUser.email,
                "name": foundUser.name,
                "picture": foundUser.picture,
                "roles": foundUser.roles,
                "customer": foundUser.customer,
                "color": foundUser.color
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '15m'}
    )

    const refreshToken = jwt.sign(
        { "email": foundUser.email },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '7d'}
    )

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({ accessToken })

});

// @desc Refresh
// @route GET /auth/refresh
// access Public
const refresh = asyncHandler(async (req, res) => {

    console.log('Acces Token expired')

    const cookies = req.cookies
    
    if(!cookies.jwt) return res.status(401).json({ message: 'Unauthorized' })
    
    const refreshToken = cookies.jwt
    
    console.log('RefreshToken expired')

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if(err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ email: decoded.email }).populate('customer').exec()

            if(!foundUser) return res.status(400).json({message: 'Session epxired, please login again'})

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "id": foundUser._id,
                        "email": foundUser.email,
                        "name": foundUser.name,
                        "picture": foundUser.picture,
                        "roles": foundUser.roles,
                        "customer": foundUser.customer,
                        "color": foundUser.color
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '15m'}
            )

            res.json({ accessToken })

        })
    )

});

// @desc Lgoout
// @route GET /auth/logut
// access Public
const logout = asyncHandler(async (req, res) => {
    const cookies = req.cookies
    if(!cookies.jwt) return res.sendStatus(204)
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })

});

const resetPassword = asyncHandler(async (req, res) => {

    // Time that the token expires in milliseconds (1800000 = 30 minutes)
    const expireTime = 1800000
    const { email } = req.body

    try {
        const user = await User.findOne({ email }).select('email');

        if( !user ) {
            return res.send({msg: 'done'})
        }

        const token = randomBytes(32).toString('hex');
        const resetUrl = `http://localhost:3000/resetpassword/${token}`;
        
        user.reset_token = token

        user.reset_token_expiring = Date.now() + expireTime;
    
        const newUser = await User.findByIdAndUpdate(user._id, user, { new: true })

        const options = {email: email, template: './templates/resetPassword.handlebars', subject: 'Reset password', payload: {resetUrl, name: newUser.name}}

        await sendEmail(options);
        res.json({token, id: user._id})

    } catch (error) {
        console.log(error);
        res.status(500).send('Something went wrong....')
    }
});

const changePassword = asyncHandler(async (req, res) => {
    const { passwordold, password, password2, token, id } = req.body;

    if(!password || !password2) {
        return res.status(500).json({message: 'All fields are required'})
    }
    
    if(password !== password2) {
        return res.status(500).json({message: 'All fields are required'})
    }

    let user

    if(token) {
        user = await User.findOne({ reset_token: token })

        if(user.reset_token_expiring < Date.now()) {
            return res.status(400).json({message: 'Token has expired'})
        }
        user.reset_token_expiring = '',
        user.reset_token = ''

    } else if(id) {
        user = await User.findById(id)
        const correctPwd = await bcrypt.compare(passwordold, user.password);

        if(!correctPwd) return res.status(400).json({ message: 'Old Password is incorrect' })

    }

    const hashedPwd = await bcrypt.hash(password, 10);

    user.password = hashedPwd

    const newUser = await user.save()

    if(newUser) {
        res.status(201).json({ message: `Password has changed`});
    } else {
        res.status(400).json({ message: 'Invalid user data received' });
    }
    

});

module.exports = {
    login,
    refresh,
    logout,
    resetPassword,
    changePassword
}