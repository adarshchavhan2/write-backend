exports.sendToken = async (res, code, message, user) => {
    const token = await user.getJWTToken();

    return res.cookie('authToken', token, {
        maxAge: 90 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }).send({
        success: true,
        code,
        message,
        user,
    });
}