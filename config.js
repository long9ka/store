module.exports = {
    PORT: process.env.PORT || 8888,
    DB: process.env.DB_URI || 'mongodb://localhost:27017/store',
    SECRET: process.env.SECRET || 'abc..xyz',
    EMAIL_USER: process.env.EMAIL_USER || 'example@gmail.com',
    EMAIL_PASS: process.env.EMAIL_PASS || '123456'
}