const errorHandler = (err, req, res, next) => {
    console.error(err);  // Log error details for debugging
    res.status(err.code || 500).json({
        status: err.name || 'Error',
        code: err.code || 500,
        msg: err.message || 'Internal Server Error',
    });
};


module.exports = errorHandler;
