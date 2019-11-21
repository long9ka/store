const nodemailer = require('nodemailer');
const config = require('./config');

module.exports = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    requireTLS: true,
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
    }
})