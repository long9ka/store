const passport = require('passport');
const transporter = require('../config/transporter');
const config = require('../config/config');

// models
const User = require('../models/User');
const Profile = require('../models/Profile');
const Otp = require('../models/Otp');

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
    renderVerify: (req, res) => {
        res.render('verify', { title: 'Email verifier', user: req.user });
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
    }),
    handleConfirmOtpCode: (req, res) => {
        Otp.findOneAndRemove({ userId: req.user.id, token: req.body.otp })
            .then(otp => {
                if (otp) {
                    User.findByIdAndUpdate(req.user.id, { isVerified: true })
                        .then(result => {
                            res.redirect('/');
                        })
                        .catch(error => console.error(error.message));
                } else {
                    req.flash('error', 'Otp incorrect');
                    res.redirect('/verify')
                }
            })
            .catch(error => console.error(error.message));
    },
    handleSendOptCode: (req, res) => {
        // function random otp code [low, high]
        const randomCode = (low, high) => {
            return Math.floor(Math.random() * (high - low + 1) + low);
        }

        Profile.findById(req.user.profileId)
            .then(profile => {
                if (profile) {
                    // new otp code
                    const otp = new Otp({
                        userId: req.user.id,
                        token: randomCode(1e5, 1e6 - 1) // otpCode: length = 6
                    })
                    otp.save()
                        .then()
                        .catch(error => console.error(error.message));

                    // send email
                    const mailOptions = {
                        from: config.EMAIL_USER,
                        to: profile.email,
                        subject: 'Welcome to Store Manager',
                        text: otp.token.toString()
                    }

                    transporter.sendMail(mailOptions)
                        .then(req.flash('success', 'Send email successful'))
                        .catch(error => console.error(error.message));
                } else {
                    req.flash('error', 'Email not found');
                }
                res.redirect('/verify');
            })
            .catch(error => console.error(error.message))
    }
}