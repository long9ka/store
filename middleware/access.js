module.exports = (...roles) => (req, res, next) => {
    roles.includes(req.user.role) ? next() :
    // error 401
    res.status(401).render('error', {
        title: 'Error',
        user: req.user,
        views: {
            statusCode: 401,
            message: 'Access to feature blocked'
        }
    });
}