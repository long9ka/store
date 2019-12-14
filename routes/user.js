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
const auth = require('../middleware/auth');
const verify = require('../middleware/verify');
const valid = require('../middleware/valid');
const access = require('../middleware/access');

router.route('/profile')
    .get(auth, async (req, res) => {
        try {
            const profile = await Profile.findById(req.user.profileId);
            if (!profile) {
                req.flash('error', 'Profile not found');
            }
            // render profile
            res.render('profile', { title: 'Profile', user: req.user, profile });
        } catch (error) {
            console.error(error.message);
        }
    })
    .post(auth, valid.updateProfile, async (req, res) => {
        // validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('back');
        }

        try {
            const profile = await Profile.findByIdAndUpdate(req.user.profileId, req.body);
            if (profile) {
                req.flash('success', 'Update Profile successful');
                res.redirect('back');
            }
        } catch (error) {
            console.error(error.message);
        }
    })
    .put()
    .delete()

router.route('/verify')
    .get(auth, (req, res) => {
        res.render('verify', { title: 'Email verifier', user: req.user });
    })
    .post(auth, async (req, res) => {
        try {
            const otp = await Otp.findOneAndRemove({
                userId: req.user.id,
                token: req.body.otp
            });
            // check otp exists
            if (!otp) {
                req.flash('error', 'Otp incorrect');
                return res.redirect('back');
            }
            const user = await User.findByIdAndUpdate(req.user.id, { isVerified: true });
            if (user) {
                res.redirect('/');
            } else {
                req.flash('error', 'User incorrect');
                return res.redirect('back');
            }
        } catch (error) {
            console.error(error.message);
        }
    })
    .put()
    .delete()

router.route('/password')
    .get(auth, (req, res) => {
        res.render('password', { title: 'Change Password', user: req.user });
    })
    .post(auth, valid.changePassword, async (req, res) => {

        // validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('back');
        }

        const { password, newPassword, confirmPassword } = req.body;

        try {
            const user = await User.findById(req.user.id);
            // check user exists
            if (!user) {
                req.flash('error', 'User not found');
                return res.redirect('back');
            }
            const isMatch = await bcrypt.compare(password, user.password);
            // check password is match
            if (!isMatch) {
                req.flash('error', 'Password does not match');
                return res.redirect('back');
            }
            // password encoding
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);
            // change password
            user.password = hash;
            const result = await user.save();
            if (result) {
                req.flash('success', 'Change password successful');
                res.redirect('back');
            } else {
                req.flash('error', 'Can not change password');
                res.redirect('back');
            }
        } catch (error) {
            console.error(error.message);
        }
    })
    .put()
    .delete()

router.route('/verify/otp')
    .get()
    .post(auth, async (req, res) => {
        try {
            const profile = await Profile.findById(req.user.profileId);
            if (!profile) {
                req.flash('error', 'Email not found');
                return res.redirect('back');
            }
            // new token
            const code = await new Otp({
                userId: req.user.id,
                token: token(1e5, 1e6 - 1)
            }).save();
            // send email
            await transporter.sendMail({
                from: `"Store Manager" <${config.EMAIL_USER}>`,
                to: profile.email,
                subject: 'User verification',
                html: `
                    <h1>Hello ${profile.fullName}</h1>
                    <br>
                    Here is the Otp code you need to verify account: <h1 style="color:blue">${code.token.toString()}</h1>
                    <section>Visit Store manager <a href="storei.herokuapp.com">here</a></section>
                `
            });
            req.flash('success', 'Send email successful');
            res.redirect('back');
        } catch (error) {
            console.error(error.message);
        }
    })
    .put()
    .delete()

router.route('/roles')
    .get(auth, verify, async (req, res) => {
        try {
            
        } catch (error) {
            console.error(error.message);
        }
        Role.find({})
            .then(roles => {
                Role.findOne({ userId: req.user.id })
                    .then(roleReq => res.render('roles', {
                        title: 'Roles',
                        user: req.user,
                        roleReq,
                        option: !['list', 'add', 'delete'].includes(req.query.option) ? 'list' : req.query.option
                    }))
                    .catch(error => console.error(error.message));
            })
            .catch(error => console.error(error.message));
    })
    .post()
    .put()
    .delete()

router.route('/roles/add')
    .get()
    .post(auth, verify, valid.addRoles, (req, res) => {
        const { upgradeTo, message } = req.body;
        // validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('/user/roles?option=add');
        }
        if (req.user.roles.includes(upgradeTo.toLowerCase())) {
            req.flash('error', 'UpgradeTo does not match');
            return res.redirect('/user/roles?option=add');
        }

        Role.findOne({ userId: req.user.id })
            .then(role => {
                if (role) {
                    req.flash('error', 'Request is pending ...');
                    res.redirect('/user/roles?option=add');
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
                            req.flash('success', 'Your request has been sent successfully');
                            res.redirect('/user/roles?option=add');
                        })
                        .catch(error => console.error(error.message));
                }
            })
            .catch(error => console.error(error.message));
    })
    .put()
    .delete()

router.route('/roles/delete')
    .get()
    .post(auth, verify, valid.deleteRoles, (req, res) => {
        const { deleteRole, password } = req.body;
        // validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('/user/roles?option=delete');
        }

        if (deleteRole.toLowerCase() === 'guest') {
            req.flash('error', 'Access denied');
            return res.redirect('/user/roles?option=delete');
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
                            user.roles.pull(deleteRole);
                            user.save()
                                .then(user => {
                                    req.flash('success', `Delete ${deleteRole} successful`);
                                    res.redirect('/user/roles?option=delete');
                                })
                                .catch(error => console.error(error.message));
                        } else {
                            req.flash('error', 'Password incorrect');
                            res.redirect('/user/roles?option=delete');
                        }
                    })
                } else {
                    req.flash('error', 'User not found');
                    res.redirect('/login');
                }
            })
            .catch(error => console.error(error.message));
    })
    .put()
    .delete()

router.route('/roles/confirm')
    .get()
    .post(auth, verify, (req, res) => {
        Role.findOneAndRemove({ userId: req.user.id })
            .then(res.redirect('/user/roles'))
            .catch(error => console.error(error.message));
    })
    .put()
    .delete()

module.exports = router;