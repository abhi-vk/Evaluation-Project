const errorHandler = (err, req, res, next) => {
    res.status(err.code || 500).send({
        status: err.name || 'Error',
        code: err.code || 500,
        msg: err.message || 'Internal Server Error',
    });
};

module.exports = errorHandler;
