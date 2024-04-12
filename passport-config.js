const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user');

module.exports = function (passport) {

  passport.serializeUser((user, done) => {

    done(null, user.id);

  });

  passport.deserializeUser((id, done) => {

    User.findById(id)

      .then(user => {
        done(null, user);
      })

      .catch(err => {
        done(err, null);
      });

  });


  passport.use(new GoogleStrategy({

    clientID: process.env.cliENT_ID,

    clientSecret: process.env.CLIENT_SECRET,

    callbackURL: 'http://localhost:4000/auth/google/callback',
    
  },
    async (accessToken, refreshToken, profile, done) => {
      // Check if user already exists in database
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // Create new user
        user = new User({
          googleID: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          // Add other necessary user data here
        });
        await user.save();
      }

      return done(null, user);
    }));
};
