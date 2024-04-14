const express = require('express');
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcrypt');
const connectDB = require('./db/connect');
const passportConfig = require('./passport-config')
const googleUser = require('./models/google_user');
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
passportConfig(passport, googleUser);


app.get('/', (req, res) => {
    res.render('index')
});


// login route

app.get('/login', (req, res) => {
    res.render('login');
});


app.post('/login', async (req, res) => {


    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email })

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' })
        }

        res.redirect(`/profile/${user.id}`);


    } catch (error) {
        res.status(500).json({ success: false, msg: `Authentication Error` })
    }
})

// Register route
app.get('/register', (req, res) => {
    res.render('register')
});


app.post('/register', async (req, res) => {

    const { username, email, password, confirmPassword } = req.body;

    try {
        // check whether the user exists
        const user = await User.findOne({ email });

        if (!user && (password == confirmPassword)) {

            // hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            // create a new user if not found
            const newUser = new User({
                username,
                email,
                password: hashedPassword
            });
            await newUser.save();

            res.redirect('/login');

        } else {
            res.redirect('/register');
        }
    } catch (error) {
        console.log(error);
    }
});



// Authenticate with google

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function (req, res) {
        // Successful authentication, redirect home.
        // console.log(req.user.id);
        res.redirect(`/profile/${req.user.id}`);
        // res.redirect('/profile');
    });


// app.get('/profile', (req, res) => {
//     res.render('profile', { user: req.user });
// });

// Profile route handler
app.get('/profile/:userId', async (req, res) => {

    const userId = req.params.userId;
    // console.log(userId);

    // Fetch user details using userId
    try {
        let google_user = await googleUser.findById(userId);
        // console.log(google_user);

        // let user = await User.findById({ userId });
        // console.log(user);

        if (!google_user) {
            return res.status(404).json({ success: false, msg: `user not found` })
        }
        res.render('profile', { 
            googleuser: google_user,
            // user : user
        });

    } catch (error) {
        console.log(error);
    }

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
