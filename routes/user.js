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
            res.render('profile', {
                title: 'Profile',
                user: req.user,
                views: {
                    fullName: profile.fullName,
                    email: profile.email,
                    birthday: profile.birthday.toISOString().split('T')[0],
                    gender: {
                        male: profile.gender === 'male' ? 'checked' : null,
                        female: profile.gender === 'female' ? 'checked' : null
                    }
                }
            });
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
        res.render('verify', {
            title: 'Email verifier',
            user: req.user,
            views: {}
        });
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
        res.render('password', {
            title: 'Change Password',
            user: req.user,
            views: {}
        });
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
            const roles = await Role.find({ userId: { $ne: req.user.id }, status: 'pending' }).populate({
                path: 'userId',
                populate: {
                    path: 'profileId'
                }
            });
            const list = roles.filter(role => {
                if (!req.user.roles.includes('admin')) {
                    if (!role.request.includes('admin')) {
                        return role;
                    }
                } else {
                    return role;
                }
            });
            const role = await Role.findOne({ userId: req.user.id });
            // check permissions
            const visible = (...roles) => {
                let result = false;
                roles.map(role => {
                    result |= req.user.roles.includes(role);
                })
                return result;
            }
            // render view
            res.render('roles', {
                title: 'Roles',
                user: req.user,
                views: {
                    requests: {
                        active: !'add delete'.includes(req.query.option) && visible('manager', 'admin') ? 'active' : null,
                        disable: visible('manager', 'admin') ? null : 'disabled',
                        list
                    },
                    add: {
                        active: req.query.option === 'add' || (!'add delete'.includes(req.query.option) && !visible('manager', 'admin')) || (req.query.option === 'delete' && !visible('staff', 'manager', 'admin')) ? 'active' : null,
                        full: req.user.roles.length === 4,
                        role
                    },
                    delete: {
                        active: req.query.option === 'delete' && visible('staff', 'manager', 'admin') ? 'active' : null,
                        disable: visible('staff', 'manager', 'admin') ? null : 'disabled'
                    }
                }
            });
        } catch (error) {
            console.error(error.message);
        }
    })
    .post(auth, verify, async (req, res) => {
        try {
            const role = await Role.findOneAndRemove({ userId: req.user.id });
            // check result
            if (role) {
                res.redirect('back');
            } else {
                req.flash('error', 'Confirm failed');
                res.redirect('back');
            }
        } catch (error) {
            console.error(error.message);
        }
    })
    .put()
    .delete()

router.route('/roles/add')
    .get()
    .post(auth, verify, valid.addRoles, async (req, res) => {
        // validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('back');
        }

        const { request, message } = req.body;

        try {
            // check request
            const user = await User.findOne({ _id: req.user.id, roles: request });
            if (user) {
                req.flash('error', 'Request error');
                return res.redirect('back');
            }
            const role = await Role.findOne({ userId: req.user.id });
            // check request exists
            if (role) {
                req.flash('error', 'Request is pending ...');
                return res.redirect('back');
            }
            // new role
            const newRole = await new Role({
                userId: req.user.id,
                request,
                message
            }).save();
            // check newRole
            if (newRole) {
                req.flash('success', 'Your request has been sent successfully');
                res.redirect('back');
            } else {
                req.flash('error', 'Add Roles failed');
                res.redirect('back');
            }
        } catch (error) {
            console.error(error.message);
        }
    })
    .put()
    .delete()

router.route('/roles/delete')
    .get()
    .post(auth, verify, access('staff', 'manager', 'admin'), valid.deleteRoles, async (req, res) => {
        // validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('back');
        }

        const { request, password } = req.body;

        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                req.flash('error', 'User not found');
                return res.redirect('back');
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                req.flash('error', 'Password incorrect');
                return res.redirect('back');
            }
            await user.roles.pull(request);
            const result = await user.save();
            if (result) {
                req.flash('success', `Delete ${request} successful`);
                res.redirect('back');
            } else {
                req.flash('success', `Delete ${request} failed`);
                res.redirect('back');
            }
        } catch (error) {
            console.error(error.message);
        }
    })
    .put()
    .delete()

router.route('/roles/:id')
    .get()
    .post(auth, verify, access('manager', 'admin'), async (req, res) => {
        try {
            const role = await Role.findOne({ _id: req.params.id, userId: { $ne: req.user.id }, status: 'pending' });
            if (!role) {
                return res.redirect('back');
            }
            if (!req.user.roles.includes('admin')) {
                if (!role.request.includes('admin')) {
                    role.status = req.body.response;
                }
            } else {
                role.status = req.body.response;
            }
            const result = await role.save();
            if (!result) {
                req.flash('error', 'Response does not match');
                return res.redirect('back');
            }
            if (role.status === 'accepted') {
                const user = await User.findByIdAndUpdate(role.userId, { $push: { roles: role.request } });
                if (!user) {
                    req.flash('error', 'User not found');
                    return res.redirect('back');
                }
            }
            req.flash('success', 'Confirm successful');
            res.redirect('back');
        } catch (error) {
            console.error(error.message);
        }
    })
    .put()
    .delete()


module.exports = router;