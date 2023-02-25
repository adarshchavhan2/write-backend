const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require('jsonwebtoken');
const { catchAsyncError } = require("./catchAsyncError");

exports.auth = catchAsyncError(async (req, res, next) => {
    const { authToken } = req.cookies;
    if (!authToken) {
        return next(new ErrorHandler('User not logged', 401));
    }
    const decoded = await jwt.decode(authToken, process.env.JWT_SECRET);
    req.userid = decoded.id
    next();
})