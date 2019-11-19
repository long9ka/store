const passport = require('passport');

module.exports = {
    renderPage: (req, res) => {
        res.render('page', { user: req.user });
    },
    renderLogin: (req, res) => {
        res.render('login', { title: 'Login' });
    },
    renderRegister: (req, res) => {
        res.render('register', { title: 'Register' });
    },
    pageNotFound: (req, res) => {
        res.status(404).render('error', {
            title: 'Error',
            statusCode: 404,
            message: `This page isn't available`
        });
    },
    handleLogout: (req, res) => {
        req.logout();
        res.redirect('/login');
    },
    handleLogin: passport.authenticate('login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }),
    handleRegister: passport.authenticate('register', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    })
}