module.exports = {
    getTerms: (req, res) => {
        res.render('terms', { user: req.user });
    }
}