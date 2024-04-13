const express = require('express');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./db/connect');
const passportConfig = require('./passport-config')
const User = require('./models/user');
const port = process.env.PORT || 4000;

const app = express();

app.set('view engine', 'ejs');

//middleware
app.use(express.json());

app.use(express.urlencoded({ extended: true }));


require('dotenv').config();


// session management
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// passport middleware
app.use(passport.initialize());

app.use(passport.session());


// Passport configuration
passportConfig(passport, User);


app.get('/', (req, res) => {

    res.render('index', { user: req.user });

});


// login route
app.get('/login', (req, res) => {
    res.render('login');
});


// Authenticate with google
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/failure' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });


// logout route
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error logging out');
        } else {
            res.redirect('/');
        }
    });
});

// start server
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.log(error);
    }
};

start();
