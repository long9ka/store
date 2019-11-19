// use .env
require('dotenv').config();

const config = require('./config');

const express = require('express');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');
const app = express();

app.set(express.static('public'));

// use ejs engine
app.set('view engine', 'ejs');

// connect database
connectDB = async () => {
    try {
        await mongoose.connect(config.DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('Connected database');
    } catch (error) {
        console.error(error.message);
    }
}

connectDB();

// express body parser
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(require('express-ejs-layouts'));

app.use(session({
    secret: config.SECRET,
    resave: true,
    saveUninitialized: true
}))

// use passport
require('./middleware/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use('/terms', require('./routes/terms'));
app.use('/', require('./routes/index'));

app.listen(config.PORT, console.log(`Server started on port ${config.PORT}`));