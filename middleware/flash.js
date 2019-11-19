module.exports = (req, res, next) => {
    res.locals.msg = req.flash('message');
    res.locals.error = req.flash('error');
    next();
}