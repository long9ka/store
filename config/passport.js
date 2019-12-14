const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// models
const User = require('../models/User');
const Profile = require('../models/Profile');

module.exports = passport => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    // passport login
    passport.use('login', new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, username, password, done) => {
            try {
                const user = await User.findOne({ username })
                // check user exists
                if (!user) {
                    return done(null, false, { message: 'Username not registered' });
                }
                const isMatch = await bcrypt.compare(password, user.password);
                // check password is match
                if (isMatch) {
                    done(null, user);
                } else {
                    done(null, false, { message: 'Password incorrect' });
                }
            } catch (error) {
                console.error(error.message);
            }
        }
    ))

    // passport register
    passport.use('register', new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, username, password, done) => {

            // validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return done(null, false, { message: errors.array()[0].msg });
            }

            const { email, fullName, birthday, gender } = req.body;

            try {
                const user = await User.findOne({ username });
                if (user) {
                    return done(null, false, { message: 'Username already exists' });
                }
                const profile = await Profile.findOne({ email });
                //check profile exists
                if (profile) {
                    return done(null, false, { message: 'Email already exists' });
                }
                // password encoding
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);
                // new profile
                const newProfile = await new Profile({
                    email,
                    fullName,
                    birthday,
                    gender
                }).save();
                // new user
                const newUser = await new User({
                    username,
                    password: hash,
                    profileId: newProfile.id,
                    roles: ['guest']
                }).save();
                done(null, newUser);
            } catch (error) {
                console.error(error.message);
            }
        }
    ));
}