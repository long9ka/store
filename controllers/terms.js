module.exports = {
    getTerms: (req, res) => {
        res.render('terms', { 
            title: 'Terms of service',
            user: req.user
        });
    }
}