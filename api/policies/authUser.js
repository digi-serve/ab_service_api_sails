/**
 * authUser
 * attempt to resolve which user this route is trying to work with.
 * this will either be from:
 * 1) Session
 *    - User prevously authenticated with local auth, okta, or CAS
 * 2) Relay Header
 *    - A valid relay header
 * 3) Auth Token
 *    - A valud user auth token
 *
 * If a user is found it will be set in req.ab.user. This is used elsewhere
 * to ensure the user is logged in and valid.
 *    req.ab.user : {ABSiteUser}
 *
 * This policy does not enforce log in. So the req will continue regardless
 * of outcome
 */
const passport = require("passport");

module.exports = async (req, res, next) => {
   // Passport 6.0 expect session to have regenerate() which sails doesn't have
   // see: https://github.com/jaredhanson/passport/issues/904
   if (req.session && !req.session.regenerate) {
      req.session.regenerate = (cb) => cb();
   }
   // If this req is from a signed-in user (via local, okta, or cas)
   // they will be authenticated by session
   passport.session()(req, res, () => {
      if (req.isAuthenticated()) {
         req.ab.log("authUser -> Session");
         req.ab.user = req.user;
         next(null, req.user);
      } else {
         // Check for Relay Header or Auth Token (these don't save to session)
         passport.authenticate(
            ["relay", "token"],
            { session: false },
            (err, user) => {
               if (user) {
                  req.ab.user = user;
                  next(null, user);
               } else {
                  // The user is not logged in, but that's not a problem here
                  next();
               }
            }
         )(req, res);
      }
   });
};
