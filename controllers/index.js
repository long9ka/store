const passport = require('passport');
const bcrypt = require('bcryptjs');

const transporter = require('../config/transporter');
const config = require('../config/config');
const token = require('../config/token-generator');

// models
const User = require('../models/User');
const Profile = require('../models/Profile');
const Otp = require('../models/Otp');

const { validationResult } = require('express-validator');

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
    renderResetPassword: (req, res) => {
        res.render('reset_password', { title: 'Reset Password' });
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
    handleSendOtpCode: (req, res) => {
        Profile.findOne({ email: req.body.email })
            .then(profile => {
                if (profile) {
                    User.findOne({ profileId: profile.id })
                        .then(user => {
                            if (user) {
                                // new otp code
                                const otp = new Otp({
                                    userId: user.id,
                                    token: token(1e5, 1e6 - 1) // otpCode: length = 6
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
                                req.flash('error', 'User not found');
                            }
                            res.redirect('/password_reset');
                        })
                        .catch(error => console.error(error.message));
                } else {
                    req.flash('error', 'Email not found');
                    res.redirect('/password_reset');
                }
            })
            .catch(error => console.error(error.message));
    },
    handleResetPassword: (req, res) => {
        const { otp, newPassword, confirmPassword } = req.body;
        // input valid
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('/password_reset');
        }

        Otp.findOneAndRemove({ token: otp })
            .then(otp => {
                if (otp) {
                    User.findById(otp.userId)
                        .then(user => {
                            if (user) {
                                // change password
                                bcrypt.genSalt(10, (err, salt) => {
                                    bcrypt.hash(newPassword, salt, (err, hash) => {
                                        if (err) {
                                            return console.error(err.message);
                                        }
                                        user.password = hash;
                                        user.isVerified = true;
                                        user.save()
                                            .then(user => {
                                                req.flash('success', 'Reset password successful, please Login');
                                                res.redirect('/login');
                                            })
                                            .catch(error => console.log(error.message));
                                    })
                                })
                            } else {
                                req.flash('error', 'User not found');
                                res.redirect('/password_reset')
                            }
                        })
                        .catch(error => console.error(error.message));
                } else {
                    req.flash('error', 'Otp incorrect');
                    res.redirect('/password_reset')
                }
            })
            .catch(error => console.error(error.message));
    }
}