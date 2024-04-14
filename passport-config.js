const GoogleStrategy = require('passport-google-oauth20').Strategy;

const googleUser = require('./models/google_user');

module.exports = function (passport) {

  passport.serializeUser((user, done) => {

    done(null, user.id);

  });

  passport.deserializeUser((id, done) => {

    googleUser.findById(id)

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

      try {
        // Check if user already exists in database
        let user = await googleUser.findOne({ googleID: profile.id });

        if (!user) {
          // Create new user if not found
          user = new googleUser({
            googleID: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            // Add other necessary user data here
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(err);
      }
    }));
};
