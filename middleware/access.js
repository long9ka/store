module.exports = (...roles) => (req, res, next) => {
    let result = false;
    roles.map(role => result |= req.user.roles.includes(role));
    if (result) {
        return next();
    }
    // render 401 unauthorized
    res.status(401).render('error', {
        title: 'Error',
        user: req.user,
        statusCode: 401,
        message: 'Access to feature blocked'
    });
}