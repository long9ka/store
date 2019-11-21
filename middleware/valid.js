const { check } = require('express-validator');

module.exports = {
    validRegister: [
        check('username')
            .isLength({ max: 20 })
            .withMessage('The username must be <5 chars long'),
        check('email')
            .isEmail()
            .normalizeEmail(),
        check('password')
            .not()
            .isEmpty()
            .withMessage('Password is required')
            .isLength({ min: 5 })
            .withMessage('The password must be at least 5 chars long')
            .matches(/\d/)
            .withMessage('The password must contain a number')
            .not()
            .isIn(['12345', '123456', 'password'])
            .withMessage('Do not use a common word as the password'),
        check('fullName')
            .not()
            .isEmpty()
            .withMessage('Full name is required')
            .trim()
            .isLength({ max: 60 })
            .withMessage('Full name must be <60 chars long')
            .isLength({ min: 5 })
            .withMessage('Full name be at least 5 chars long'),
        check('birthday')
            .not()
            .isEmpty()
            .withMessage('Birthday is required')
    ],
    validUpdateProfile: [
        check('fullName')
            .not()
            .isEmpty()
            .withMessage('Full name is required')
            .trim()
            .isLength({ max: 60 })
            .withMessage('Full name must be <60 chars long')
            .isLength({ min: 5 })
            .withMessage('Full name be at least 5 chars long'),
        check('birthday')
            .not()
            .isEmpty()
            .withMessage('Birthday is required')
    ]
}