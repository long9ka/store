const router = require('express').Router();
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
const Role = require('../models/Role');

// middleware
const checkAuth = require('../middleware/auth');
const verify = require('../middleware/verify');
const validInput = require('../middleware/valid');

router.route('/profile')
    .get(checkAuth, (req, res) => {
        Profile.findById(req.user.profileId)
            .then(profile => {
                if (profile) {
                    return res.render('profile', {
                        title: 'Profile',
                        user: req.user,
                        profile
                    })
                }
                res.render('profile', { user: req.user });
            })
            .catch(error => console.error(error.message));
    })
    .post(checkAuth, validInput.validUpdateProfile, (req, res) => {
        // input valid
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('/user/profile');
        }
        Profile.findByIdAndUpdate(req.user.profileId, { $set: req.body })
            .then(result => {
                req.flash('success', 'Update Profile successful');
                res.redirect('/user/profile');
            })
            .catch(error => console.error(error.message));
    })
    .put()
    .delete()

router.route('/verify')
    .get(checkAuth, (req, res) => {
        res.render('verify', { title: 'Email verifier', user: req.user });
    })
    .post(checkAuth, (req, res) => {
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
                    res.redirect('/user/verify')
                }
            })
            .catch(error => console.error(error.message));
    })
    .put()
    .delete()

router.route('/password')
    .get(checkAuth, (req, res) => {
        res.render('password', { title: 'Change Password', user: req.user });
    })
    .post(checkAuth, validInput.validChangePassword, (req, res) => {
        const { password, newPassword, confirmPassword } = req.body;
        // input valid
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('/user/password');
        }
        User.findById(req.user.id)
            .then(user => {
                if (user) {
                    // compare password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            return console.error(err.message);
                        }
                        if (isMatch) {
                            // change password
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(newPassword, salt, (err, hash) => {
                                    if (err) {
                                        return console.error(err.message);
                                    }
                                    user.password = hash;
                                    user.save()
                                        .then(user => {
                                            req.flash('success', 'Change password successful');
                                            res.redirect('/user/password');
                                        })
                                        .catch(error => console.log(error.message));
                                })
                            })
                        } else {
                            req.flash('error', 'Password do not match');
                            res.redirect('/user/password');
                        }
                    })
                } else {
                    req.flash('error', 'User not found');
                    res.redirect('/user/password');
                }
            })
            .catch(error => console.error(error.message));
    })
    .put()
    .delete()

router.route('/verify/otp')
    .get()
    .post(checkAuth, (req, res) => {
        Profile.findById(req.user.profileId)
            .then(profile => {
                if (profile) {
                    // new otp code
                    const otp = new Otp({
                        userId: req.user.id,
                        token: token(1e5, 1e6 - 1) // otpCode: length = 6
                    })
                    otp.save()
                        .then()
                        .catch(error => console.error(error.message));

                    // send email
                    const mailOptions = {
                        from: `"Store Manager" <${config.EMAIL_USER}>`,
                        to: profile.email,
                        subject: 'User verification',
                        html: `
                            <h1>Hello ${profile.fullName}</h1>
                            <br>
                            Here is the Otp code you need to verify account: <h1 style="color:blue">${otp.token.toString()}</h1>
                            <section>Visit Store manager <a href="storei.herokuapp.com">here</a></section>
                        `
                    }

                    transporter.sendMail(mailOptions)
                        .then(req.flash('success', 'Send email successful'))
                        .catch(error => console.error(error.message));
                } else {
                    req.flash('error', 'Email not found');
                }
                res.redirect('/user/verify');
            })
            .catch(error => console.error(error.message));
    })
    .put()
    .delete()

router.route('/roles')
    .get(checkAuth, verify, (req, res) => {
        Role.findOne({ userId: req.user.id })
            .then(roleReq => res.render('roles', { title: 'Roles', user: req.user, roleReq }))
            .catch(error => console.error(error.message));
    })
    .post(checkAuth, verify, validInput.validAddRoles, (req, res) => {
        const { upgradeTo, message } = req.body;
        // input valid
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('/user/roles');
        }
        if (req.user.roles.includes(upgradeTo.toLowerCase())) {
            req.flash('error', 'UpgradeTo do not match');
            return res.redirect('/user/roles');
        }

        Role.findOne({ userId: req.user.id })
            .then(role => {
                if (role) {
                    req.flash('error', 'Request is pending ...');
                    res.redirect('/user/roles');
                } else {
                    // new Role
                    let newRole = new Role({
                        userId: req.user.id,
                        currentRoles: req.user.roles,
                        upgradeTo,
                        message
                    })
                    newRole.save()
                        .then(result => {
                            req.flash('success', 'Send request sucessful');
                            res.redirect('/user/roles');
                        })
                        .catch(error => console.error(error.message));
                }
            })
            .catch(error => console.error(error.message));
    })
    .put()
    .delete()

router.route('/roles/confirm')
    .get()
    .post(checkAuth, verify, (req, res) => {
        Role.findOneAndRemove({ userId: req.user.id })
            .then(res.redirect('/user/roles'))
            .catch(error => console.error(error.message));
    })
    .put()
    .delete()

module.exports = router;