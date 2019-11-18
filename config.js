module.exports = {
    PORT: process.env.PORT || 8888,
    DB: process.env.DB_URI || 'mongodb://localhost:27017/store',
    SECRET: process.env.SECRET || 'abc..xyz'
}