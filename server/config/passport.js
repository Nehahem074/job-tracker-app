const GoogleStrategy = require('passport-google-oauth20').Strategy
const jwt            = require('jsonwebtoken')
const User           = require('../models/User')

module.exports = (passport) => {
  passport.use(new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id })
        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value })
          if (user) {
            user.googleId = profile.id
            await user.save()
          } else {
            user = await User.create({
              googleId: profile.id,
              name:     profile.displayName,
              email:    profile.emails[0].value,
            })
          }
        }
        done(null, user)
      } catch (err) {
        done(err, null)
      }
    }
  ))
}