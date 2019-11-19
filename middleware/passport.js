const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Profile = require('../models/Profile');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    // passport login
    // passport register
    passport.use('register', new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        (req, username, password, done) => {
            const { email, fullName, birthday, gender } = req.body;
            User.findOne({ username })
                .then(user => {
                    if (user) {
                        return done(null, false, { error_message: 'Username already exists' });
                    }
                    Profile.findOne({ email })
                        .then(profile => {
                            if (profile) {
                                return done(null, false, { error_message: 'Email already exists' });
                            }
                            // new Profile
                            const newProfile = new Profile({
                                email,
                                fullName,
                                birthday,
                                gender
                            })
                            newProfile.save()
                                .catch(error => console.error(error.message))

                            // new User
                            let newUser = new User({
                                username,
                                password,
                                profileId: newProfile.id
                            })
                            // bcrypt
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(newUser.password, salt, (err, hash) => {
                                    if (err) {
                                        return done(err, false);
                                    }
                                    newUser.password = hash;
                                    newUser.save()
                                        .then(user => done(null, user))
                                        .catch(error => console.log(error.message));
                                })
                            })
                        })
                })
        }
    ));
}