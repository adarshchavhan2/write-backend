const User = require('../models/User');
const Post = require('../models/Post');
const { catchAsyncError } = require("../middlewares/catchAsyncError");
const { sendToken } = require('../utils/sendToken');
const ErrorHandler = require('../utils/ErrorHandler');
const cloudinary = require('cloudinary').v2;
const sendEmail = require("../utils/sendEmail");

// Configuration 
cloudinary.config({
    cloud_name: "blogs-adarsh14",
    api_key: "749389945332788",
    api_secret: "EkJH8GK4FKQiIMgKL27ZCuEJqas"
});


exports.signup = catchAsyncError(async (req, res, next) => {
    const { name, handle, email, password, image } = req.body;

    let user = await User.findOne({ handle });
    if (user) {
        return next(new ErrorHandler('Handle is not available', 400));
    }

    user = await User.findOne({ email });
    if (user) {
        return next(new ErrorHandler('Email already exists', 400));
    }

    const img = image ? await cloudinary.uploader.upload(image, {
        folder: '/blogs/users'
    }) : null;

    user = await User.create({
        name, handle, email, password, img: img && {
            public_id: img.public_id,
            url: img.secure_url
        }
    });

    sendToken(res, 201, 'Signup successfully', user);
});


exports.login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorHandler('User not found', 400));
    }

    const matchPassowrd = await user.comparePassword(password);
    if (!matchPassowrd) {
        return next(new ErrorHandler('Password is wrong', 401));
    }

    sendToken(res, 200, 'Login successfully', user);
});


exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie('authToken', null, {
        expires: new Date(Date.now()),
    }).send({
        success: true,
        message: 'Logout successfully'
    })
});


exports.getMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.userid).populate('posts');
    if (!user) {
        return next(new ErrorHandler('User not found', 400));
    }

    res.send({
        success: true,
        user
    })
});


exports.getUserProfile = catchAsyncError(async (req, res, next) => {
    let user = await User.findOne({ handle: req.params.handle });
    if (!user) {
        return next(new ErrorHandler('User not found', 400));
    }

    res.send({
        success: true,
        user
    })
});


exports.updateProfile = catchAsyncError(async (req, res, next) => {
    let { name, handle, email, image } = req.body;

    let user = await User.findById(req.userid);

    handle === user.handle ? handle = null : handle = handle;
    email === user.email ? email = null : email = email;

    let isUsedData = await User.findOne({ handle });
    if (isUsedData) {
        return next(new ErrorHandler('Handle is not available', 400));
    }

    isUsedData = await User.findOne({ email });
    if (isUsedData) {
        return next(new ErrorHandler('Email already exists', 400));
    }

    name ? user.name = name : null;
    handle ? user.handle = handle : null;
    email ? user.email = email : null;


    if (image) {
        const oldImgId = user.img.public_id;
        const img = await cloudinary.uploader.upload(image, {
            folder: '/blogs/users'
        });
        user.img = {
            public_id: img.public_id,
            url: img.secure_url
        }
        if (oldImgId) {
            await cloudinary.uploader.destroy(oldImgId);
        }
    } else {
        if (user.img.public_id) {
            await cloudinary.uploader.destroy(user.img.public_id);
        }
        user.img = null;
    }

    await user.save();

    res.send({
        success: true,
        message: 'Profile updated'
    })
});


exports.updatePassword = catchAsyncError(async (req, res, next) => {
    const { newPassword, oldPassword } = req.body;

    let user = await User.findById(req.userid);
    if (!user) {
        return next(new ErrorHandler('User not found', 400));
    }

    const matchPassowrd = await user.comparePassword(oldPassword);
    if (!matchPassowrd) {
        return next(new ErrorHandler('Old password is wrong', 401));
    }

    user.password = newPassword;
    await user.save();

    res.send({
        success: true,
        message: 'Password updated'
    })
});


exports.forgetPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    const token = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://localhost:5500/password/reset/${token}`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Blogs password recovery",
            html: `Your password reset token is : ${resetPasswordUrl}</br></br>if you not requested for this email then, please ignore it`,
        });
        res.json({
            success: true,
            message: `Email sent successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        user = await user.save({ validateBeforeSave: true });

        return next(new ErrorHandler(error.message, 500));
    }
});


exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const { resetPasswordToken } = req.params.token;

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordToken: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Link is expires or invalid", 400));
    }

    const { password } = req.body;

    user.password = password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.send({
        success: true,
        message: 'Password reset successfully'
    })
});