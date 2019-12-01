const router = require('express').Router();

const passport = require('passport');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// config
const transporter = require('../config/transporter');
const config = require('../config/config');
const token = require('../config/token-generator');

// models
const User = require('../models/User');
const Profile = require('../models/Profile');
const Otp = require('../models/Otp');

// middleware
const checkAuth = require('../middleware/auth');
const validInput = require('../middleware/valid');
const verify = require('../middleware/verify');

router.route('/')
    .get(checkAuth, verify, (req, res) => {
        res.render('page', { user: req.user });
    })
    .post()
    .put()
    .delete()

router.route('/login')
    .get((req, res) => {
        res.render('login', { title: 'Login' });
    })
    .post(passport.authenticate('login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }))
    .put()
    .delete()

router.route('/password_reset')
    .get((req, res) => {
        res.render('reset_password', { title: 'Reset Password' });
    })
    .post(validInput.validResetPassword, (req, res) => {
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
    })
    .put()
    .delete()

router.route('/password_reset/verify')
    .get()
    .post((req, res) => {
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
    })
    .put()
    .delete()

router.route('/logout')
    .get((req, res) => {
        req.logout();
        res.redirect('/login');
    })
    .post()
    .put()
    .delete()

router.route('/register')
    .get((req, res) => {
        res.render('register', { title: 'Register' });
    })
    .post(validInput.validRegister, passport.authenticate('register', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    }))
    .put()
    .delete()

router.route('*')
    .get((req, res) => {
        res.status(404).render('error', {
            title: 'Error',
            statusCode: 404,
            message: `This page isn't available`
        });
    })
    .post()
    .put()
    .delete()

module.exports = router;