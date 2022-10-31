/**
 * Initialize the authUser Passport.js object.
 * @see api/policies/authUser.js
 */
const async = require("async");
const passport = require("passport");
const abUtilsPolicy = require(__dirname + "/../policies/abUtils.js");
const tenantPolicy = require(__dirname + "/../policies/authTenant.js");

module.exports = function (sails) {
   return {
      initialize: async function () {
         if (global.AB_AUTHUSER_INIT) {
            global.AB_AUTHUSER_INIT(sails);
         } else {
            console.warn("AB_AUTHUSER_INIT was not available.");
         }
      },

      routes: {
         // These routes will run before any policies
         before: {
            // Okta callback route.
            // User is sent here after signing on from the Okta site.
            "GET /authorization-code/callback": (req, res) => {
               // if baseurl is api_sails replace with x-fowarded-host
               const baseUrl = /api_sails/.test(req.baseUrl)
                  ? `https://${req.headers["x-forwarded-host"]}`
                  : req.baseUrl;
               const callbackURL = `${baseUrl}/authorization-code/callback`;
               // This needs to exactly match the callbackURL sent to okta.
               // Note: req.baseUrl does not include the port number, so you'll
               // need to add for local testing.
               const auth = passport.authenticate("oidc", {
                  callbackURL,
                  failureRedirect: "/okta-error",
               });
               async.series(
                  [
                     (ok) => {
                        // Need to do this because policies are not auto-loaded for this route
                        abUtilsPolicy(req, res, ok);
                     },
                     (ok) => {
                        tenantPolicy(req, res, ok);
                     },
                     (ok) => {
                        const initialize = passport.initialize();
                        initialize(req, res, ok);
                     },
                     (ok) => {
                        const session = passport.session();
                        session(req, res, ok);
                     },
                     (ok) => {
                        // Finalize Okta auth
                        auth(req, res, ok);
                     },
                     (ok) => {
                        // User is now fully authenticated.
                        // `req.user` should have been set by Passport.
                        req.session.user_id = req.user.uuid;
                        req.session.tenant_id = req.ab.tenantID;
                        req.ab.user = req.user;
                        ok();
                     },
                  ],
                  (err) => {
                     if (err) {
                        console.error("Failed to authenticate user", err);
                        res.serverError(err);
                        return;
                     }
                     // Send the user to where they originally requested
                     res.redirect(req.session.okta_original_url || "/");
                  }
               );
            },

            // Okta will redirect here if it gets an error
            "GET /okta-error": (req, res) => {
               let message = "Okta authentication error";
               let data = {
                  session: req.session,
                  headers: req.headers,
                  url: req.url,
                  user: req.user,
                  ab: req.ab,
               };
               if (req.ab && req.notify) {
                  req.ab.notify.developer(message, data);
               } else {
                  console.error(message, data);
               }

               res.forbidden(message);
            },
         },
      },
   };
};
