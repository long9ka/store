const { check, validationResult } = require('express-validator');

const objValid = {
    username:
        check('username')
            .not()
            .isEmpty()
            .withMessage('Username is required')
            .isLength({ max: 20 })
            .withMessage('Your username cannot be longer than 20 characters'),
    password:
        check('password')
            .not()
            .isEmpty()
            .withMessage('Password required')
            .isLength({ min: 5 })
            .withMessage('Your password must be at least 5 characters')
            .matches(/\d/)
            .withMessage('Your password must contain at least one number digit')
            .not()
            .isIn(['12345', '123456', 'password'])
            .withMessage(`Do not use easily guessed passwords, such as '12345', '123456' or 'password'`),
    confirmPassword:
        check('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Confirm Password doesn not match');
                } else {
                    return value;
                }
            }),
    email:
        check('email')
            .not()
            .isEmpty()
            .withMessage('Email is required')
            .isEmail()
            .normalizeEmail()
            .withMessage('Email does not match'),
    name:
        check('name')
            .not()
            .isEmpty()
            .withMessage('Full name required')
            .trim()
            .isLength({ max: 60 })
            .withMessage('Your full name cannot be longer than 60 characters')
            .isLength({ min: 5 })
            .withMessage('Your full name must be at least 5 characters'),
    birthday:
        check('birthday')
            .not()
            .isEmpty()
            .withMessage('Birthday required'),
    gender:
        check('gender')
            .not()
            .isEmpty()
            .withMessage('Gender is required'),
    newPassword:
        check('newPassword')
            .not()
            .isEmpty()
            .withMessage('New Password required')
            .isLength({ min: 5 })
            .withMessage('Your password must be at least 5 characters')
            .matches(/\d/)
            .withMessage('Your password must contain at least one number digit')
            .not()
            .isIn(['12345', '123456', 'password'])
            .withMessage(`Do not use easily guessed passwords, such as '12345', '123456' or 'password'`),
    confirmNewPassword:
        check('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Confirm Password doesn not match');
                } else {
                    return value;
                }
            }),
    code:
        check('code')
            .not()
            .isEmpty()
            .withMessage('Otp required')
}

module.exports = (...feilds) => [
    feilds.map(feild => objValid[feild]),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('back');
        }
        next();
    }
]

/*
module.exports = {

    register: [
        check('username')
            .isLength({ max: 20 })
            .withMessage('Your username cannot be longer than 20 characters'),
        check('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Email does not match'),
        check('password')
            .not()
            .isEmpty()
            .withMessage('Password required')
            .isLength({ min: 5 })
            .withMessage('Your password must be at least 5 characters')
            .matches(/\d/)
            .withMessage('Your password must contain at least one number digit')
            .not()
            .isIn(['12345', '123456', 'password'])
            .withMessage(`Do not use easily guessed passwords, such as '12345', '123456' or 'password'`),
        check('name')
            .not()
            .isEmpty()
            .withMessage('Full name required')
            .trim()
            .isLength({ max: 60 })
            .withMessage('Your full name cannot be longer than 60 characters')
            .isLength({ min: 5 })
            .withMessage('Your full name must be at least 5 characters'),
        check('birthday')
            .not()
            .isEmpty()
            .withMessage('Birthday required')
    ],
    updateProfile: [
        check('name')
            .not()
            .isEmpty()
            .withMessage('Full name required')
            .trim()
            .isLength({ max: 60 })
            .withMessage('Your full name cannot be longer than 60 characters')
            .isLength({ min: 5 })
            .withMessage('Your full name must be at least 5 characters'),
        check('birthday')
            .not()
            .isEmpty()
            .withMessage('Birthday required')
    ],
    changePassword: [
        check('password')
            .not()
            .isEmpty()
            .withMessage('Password required'),
        check('newPassword')
            .not()
            .isEmpty()
            .withMessage('New Password required')
            .isLength({ min: 5 })
            .withMessage('Your password must be at least 5 characters')
            .matches(/\d/)
            .withMessage('Your password must contain at least one number digit')
            .not()
            .isIn(['12345', '123456', 'password'])
            .withMessage(`Do not use easily guessed passwords, such as '12345', '123456' or 'password'`),
        check('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Confirm Password doesn not match');
                } else {
                    return value;
                }
            })
    ],
    resetPassword: [
        check('token')
            .not()
            .isEmpty()
            .withMessage('Otp required')
        ,
        check('newPassword')
            .not()
            .isEmpty()
            .withMessage('New Password required')
            .isLength({ min: 5 })
            .withMessage('Your password must be at least 5 characters')
            .matches(/\d/)
            .withMessage('Your password must contain at least one number digit')
            .not()
            .isIn(['12345', '123456', 'password'])
            .withMessage(`Do not use easily guessed passwords, such as '12345', '123456' or 'password'`),
        check('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error("Confirm Password does not match");
                } else {
                    return value;
                }
            })
    ],
    addRoles: [
        check('request')
            .not()
            .isEmpty()
            .withMessage('Request required'),
        check('message')
            .not()
            .isEmpty()
            .withMessage('Message required')
            .isLength({ max: 100 })
            .withMessage('Your message cannot be longer than 100 characters')
    ],
    deleteRoles: [
        check('password')
            .not()
            .isEmpty()
            .withMessage('Password required')
    ]
}
*/