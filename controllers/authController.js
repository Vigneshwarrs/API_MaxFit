const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/emailService');
const crypto = require('crypto');

const generateToken = (user) => {
    const payload = {userId: user._id, email: user.authentication.email};
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '24h'});
}

exports.login = async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({"authentication.email": email});
    
        if(!user)
            return res.status(404).json({msg: "User not found. Please create an account"});
        if(!user.compare(password))
            return res.status(401).json({msg: "Invalid credentials"});
        if(!user.accountStatus.isActive)
            return res.status(401).json({msg: "Please Verify your account. Check your email"});
    
        const token = generateToken(user);
        const userResponse = user.toObject();
        delete userResponse.authentication.password;
        res.status(200).json({user: userResponse, token, message: "Logged In successfully!!"});
    }catch(err){
        console.log(err)
        res.status(500).json({msg: "Server error during Login", error: err});
    }
};

exports.register = async (req, res) => {
    try{
        const { name, age, gender, country, activityLevel, height, weight, email, password, picture } = req.body;
        const user = await User.findOne({"authentication.email": email});

        if(user) 
            res.status(400).json({msg: "User already exists. Please Login"});

        const token = await crypto.randomBytes(32).toString('hex');

        const newUser = new User({
            personalInfo: {
                name,
                age,
                gender,
                country,
                picture,
                activityLevel
            },
            physicalMetrics: {
                height: {value: height.value, unit: height.unit},
                weight: {value: weight.value, unit: weight.unit}
            },
            authentication: {
                email,
                password,
            },
            accountStatus: {
                activateToken: token
            }
        });
        await newUser.save();
        await sendMail({
            to: email,
            subject: 'Account Activation',
            message: `Please activate your account by clicking on the following link: ${process.env.BASE_URL}/auth/activate/${token}`
        });
        res.status(201).json({ msg: "Please verify your account via email" });
    }catch(err) {
        console.log(err);
        res.status(500).json({ msg: "Server error during registration", error: err.message });
    }
}

exports.activate = async (req, res) => {
    try{
        const {token} = req.params;

        const user = await User.findOne({"accountStatus.activateToken": token});
        if(!user)
            return res.status(404).json({ message: "Invalid activation token" });

        user.accountStatus.activateToken = null;
        user.accountStatus.isActive = true;
        await user.save();

        res.status(200).json({ msg: "Account activated successfully" });
    }catch(err) {
        res.status(500).json({ msg: "Server error during activation", error: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try{
        const {email} = req.body;

        const user = await User.findOne({"authentication.email": email});
        if(!user)
            return res.status(404).json({ message: "User not found" });

        const token = await crypto.randomBytes(32).toString('hex');
        user.accountStatus.resetToken = token;
        user.accountStatus.resetTokenExpire = new Date(Date.now).getTime() + 6000000;

        await user.save();

        await sendMail({
            to: user.authentication.email,
            subject: 'Password Reset',
            message: `Please reset your password by clicking on the following link: ${process.env.BASE_URL}/auth/reset-password/${token}`
        });

        res.status(200).json({ msg: "Password reset link sent to your email" });
    }catch(err) {
        res.status(500).json({ msg: "Server error during forgot password", error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try{
        const {token} = req.params;
        const {password} = req.body;

        const user = await User.findOne({"accountStatus.resetToken": token});
        const isExpired = new Date(Date.now()).getTime() > user?.accountStatus?.resetTokenExpire;
        if(!user || isExpired)
            return res.status(403).json({ msg: 'Invalid or expired reset token.' });

        user.authentication.password = password;
        user.accountStatus.resetToken = null;
        user.accountStatus.resetTokenExpire = null;

        await user.save();

        res.status(200).json({msg: "Password reset successfully!"});
    }catch(err) {
        res.status(500).json({msg: `Server error during reset password. Error is: ${err}`});
        console.log(err);
    }
}