const passport = require('passport');

module.exports = {
    renderPage: (req, res) => {
        res.send('hello world');
    },
    renderLogin: (req, res) => {
        res.render('login');
    },
    renderRegister: (req, res) => {
        res.render('register');
    },
    pageNotFound: (req, res) => {
        res.status(404).render('error', {
            statusCode: 404,
            message: `This page isn't available`
        });
    },
    handleRegister: passport.authenticate('register', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    })
}