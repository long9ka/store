const { check } = require('express-validator');

module.exports = {
    validRegister: [
        check('username')
            .isLength({ max: 20 })
            .withMessage('Your username cannot be longer than 20 characters'),
        check('email')
            .isEmail()
            .normalizeEmail(),
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
        check('fullName')
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
    validUpdateProfile: [
        check('fullName')
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
    validChangePassword: [
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
    validResetPassword: [
        check('otp')
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
                    throw new Error("Confirm Password don't match");
                } else {
                    return value;
                }
            })
    ],
    validAddRoles: [
        check('upgradeTo')
            .not()
            .isEmpty()
            .withMessage('UpgradeTo required'),
        check('message')
            .not()
            .isEmpty()
            .withMessage('Message required')
            .isLength({ max: 100 })
            .withMessage('Your message cannot be longer than 100 characters')
    ]
}