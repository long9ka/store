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
const auth = require('../middleware/auth');
const valid = require('../middleware/valid');
const verify = require('../middleware/verify');

router.route('/')
    .get(auth, verify, (req, res) => {
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
    .post(valid.register, passport.authenticate('register', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    }))
    .put()
    .delete()

router.route('/password_reset')
    .get((req, res) => {
        res.render('reset_password', { title: 'Reset Password' });
    })
    .post(valid.resetPassword, async (req, res) => {

        // validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('back');
        }

        const { token, newPassword, confirmPassword } = req.body;

        try {
            const otp = await Otp.findOneAndRemove({ token }).populate({
                path: 'userId',
                populate: 'profileId'
            })
            // check otp exists
            if (!otp) {
                req.flash('error', 'Otp incorrect');
                return res.redirect('back');
            }
            // password encoding
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);
            const user = await User.findByIdAndUpdate(otp.userId, {
                isVerified: true,
                password: hash
            });
            // check user exists
            if (user) {
                req.flash('success', 'Reset password successful, please Login');
                res.redirect('/login');
            } else {
                req.flash('error', 'User not found');
                res.redirect('back');
            }
        } catch (error) {
            console.error(error.message);
        }
    })
    .put()
    .delete()

router.route('/password_reset/verify')
    .get()
    .post(async (req, res) => {
        try {
            const profile = await Profile.findOne({ email: req.body.email });
            if (!profile) {
                req.flash('error', 'Email not found');
                return res.redirect('back');
            }
            const user = await User.findOne({ profileId: profile.id });
            if (!user) {
                req.flash('error', 'User not found');
                return res.redirect('back');
            }
            // new token
            const code = await new Otp({
                userId: user.id,
                token: token(1e5, 1e6 - 1)
            }).save();
            // send email
            await transporter.sendMail({
                from: `"Store Manager" <${config.EMAIL_USER}>`,
                to: profile.email,
                subject: 'Forgot password',
                html: `
                    <h1>Hello ${profile.fullName}</h1>
                    <br>
                    Here is the Otp code you need to confirm: <h1 style="color:blue">${code.token.toString()}</h1>
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

router.route('*')
    .get((req, res) => {
        res.status(404).render('error', {
            title: 'Error',
            user: req.user,
            statusCode: 404,
            message: `Sorry, This page isn't available`
        });
    })
    .post()
    .put()
    .delete()

module.exports = router;