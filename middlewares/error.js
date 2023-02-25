exports.error = (err, req, res, next) => {
    res.send({
        success: false,
        code: err.statusCode || 500,
        message: err.message || 'Internal server error'
    })
}