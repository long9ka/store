const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');

// config
const transporter = require('../config/transporter');
const config = require('../config/config');
const token = require('../config/token-generator');

// models
const User = require('../models/User');
const Token = require('../models/Token');
const Role = require('../models/Role');

// middleware
const auth = require('../middleware/auth');
const access = require('../middleware/access');
const verify = require('../middleware/verify');
const valid = require('../middleware/valid');

const router = express();

router.route('/register')
    .get((req, res) => res.render('user/register', { title: 'Register' }))
    .post(
        valid('username', 'password', 'email', 'name', 'birthday', 'gender'),
        passport.authenticate('register', {
            successRedirect: '/',
            failureRedirect: '/user/register',
            failureFlash: true
        })
    )

router.route('/login')
    .get((req, res) => res.render('user/login', { title: 'Login' }))
    .post(
        passport.authenticate('login', {
            successRedirect: '/',
            failureRedirect: '/user/login',
            failureFlash: true
        })
    )

router.route('/logout')
    .get((req, res) => {
        req.logout();
        res.redirect('/user/login');
    })
    .post()

router.route('/profile')
    .get(auth, (req, res) => {
        res.render('user/profile', {
            title: 'Profile',
            user: req.user
        });
    })
    .post(auth, valid('name', 'birthday', 'gender'), async (req, res) => {
        const { name, birthday, gender } = req.body;
        try {
            await User.findByIdAndUpdate(req.user.id, {
                profile: {
                    name,
                    email: req.user.profile.email,
                    birthday,
                    gender
                }
            })
            req.flash('success', 'Update profile successful');
            res.redirect('back');
        } catch (error) {
            console.error(error.message);
        }
    })

router.route('/email/verify')
    .get(auth, (req, res) => res.render('user/verify_email', { title: 'Email verifier', user: req.user }))
    .post(auth, async (req, res) => {
        try {
            const token = await Token.findOneAndRemove({
                userId: req.user.id,
                payload: req.body.code
            });
            if (!token) {
                req.flash('error', 'Code incorrect');
                return res.redirect('back');
            }
            await User.findByIdAndUpdate(req.user.id, { isVerified: true });
            res.redirect('/');
        } catch (error) {
            console.error(error.message);
        }
    })

router.route('/email/verify/code')
    .get()
    .post(auth, async (req, res) => {
        try {
            // create new token
            const code = await new Token({
                userId: req.user.id,
                payload: token(1e5, 1e6 - 1)
            }).save();
            // send email
            await transporter.sendMail({
                from: `"Store Manager" <${config.EMAIL_USER}>`,
                to: req.user.profile.email,
                subject: 'User verification',
                html: `
                    <h1>Hello ${req.user.profile.name}</h1>
                    <br>
                    Here is the Otp code you need to verify account: <h1 style="color:blue">${code.payload.toString()}</h1>
                    <section>Visit Store manager <a href="storei.herokuapp.com">here</a></section>
                `
            });
            req.flash('success', 'Send email successful');
            res.redirect('back');
        } catch (error) {
            console.error(error.message);
        }
    })

router.route('/password/reset')
    .get((req, res) => res.render('user/reset_password', { title: 'Reset Password' }))
    .post(valid('code', 'password', 'confirmPassword'), async (req, res) => {

        const { code, password } = req.body;

        try {
            const token = await Token.findOneAndRemove({ payload: code }).populate('userId');
            if (!token) {
                req.flash('error', 'Code incorrect');
                return res.redirect('back');
            }
            // hash new password
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const user = await User.findByIdAndUpdate(token.userId, {
                isVerified: true,
                password: hashPassword
            });
            if (user) {
                req.flash('success', 'Reset password successful, please Login');
                res.redirect('/user/login');
            } else {
                req.flash('error', 'User not found');
                res.redirect('back');
            }
        } catch (error) {
            console.error(error.message);
        }
    })

router.route('/password/reset/code')
    .get()
    .post(async (req, res) => {
        try {
            const user = await User.findOne({ 'profile.email': req.body.email });
            if (!user) {
                req.flash('error', 'Email not found');
                return res.redirect('back');
            }
            // new token
            const code = await new Token({
                userId: user.id,
                payload: token(1e5, 1e6 - 1)
            }).save();
            // send email
            await transporter.sendMail({
                from: `"Store Manager" <${config.EMAIL_USER}>`,
                to: user.profile.email,
                subject: 'Forgot password',
                html: `
                    <h1>Hello ${user.profile.name}</h1>
                    <br>
                    Here is the Otp code you need to confirm: <h1 style="color:blue">${code.payload.toString()}</h1>
                    <section>Visit Store manager <a href="storei.herokuapp.com">here</a></section>
                `
            });
            req.flash('success', 'Send email successful');
            res.redirect('back');
        } catch (error) {
            console.error(error.message);
        }
    })


router.route('/password/change')
    .get(auth, (req, res) => res.render('user/change_password', { title: 'Change Password', user: req.user }))
    .post(auth, valid('newPassword', 'confirmNewPassword'), async (req, res) => {
        const { password, newPassword } = req.body;
        try {
            const isMatch = await bcrypt.compare(password, req.user.password);
            if (!isMatch) {
                req.flash('error', 'Password does not match');
                return res.redirect('back');
            }
            // password encoding
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(newPassword, salt);
            // change password
            await User.findByIdAndUpdate(req.user.id, { password: hashPassword });
            req.flash('success', 'Change password successful');
            res.redirect('back');
        } catch (error) {
            console.error(error.message);
        }
    })
    .put()
    .delete()

    /*
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
    */
module.exports = router;