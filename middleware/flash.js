module.exports = (req, res, next) => {
    res.locals.error = req.flash('error');
    next();
}