module.exports = (req, res, next) => {
    if (req.user.isVerified) {
        return next();
    }
    res.redirect('/user/verify');
}