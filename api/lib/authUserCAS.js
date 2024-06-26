/**
 * authUser (CAS)
 *
 * Add this to your config/local.js:
 * cas: {
 *    baseURL: "https://signin.example.com/cas",  // your CAS server URL
 *    uuidKey: "guid", // CAS profile attribute to become your user UUID
 *    siteURL: "http://localhost:1337"  // the external URL of AppBuilder
 * }
 *
 */
const url = require("url");
const async = require("async");
const AB = require("@digiserve/ab-utils");
const passport = require("passport");
const CasStrategy = require("passport-cas2").Strategy;
const authLogger = require("./authLogger.js");

module.exports = {
   init: () => {
      passport.use(
         new CasStrategy(
            {
               casURL: sails.config.cas.baseURL,
               pgtURL: sails.config.cas.pgtURL || sails.config.cas.proxyURL,
               sslCert: sails.config.cas.sslCert || null,
               sslKey: sails.config.cas.sslKey || null,
               sslCA: sails.config.cas.sslCA || null,
               passReqToCallback: true,
            },
            function (req, username, profile, done) {
               let authKey = sails.config.cas.uuidKey || "id"; // "eaguid"
               let authName = profile[authKey] || username;
               if (Array.isArray(authName)) {
                  authName = authName[0];
               }

               // Result is the final user object that Passport will use
               let result = null;

               async.series(
                  [
                     // Find user account
                     (ok) => {
                        req.ab.serviceRequest(
                           "user_manager.user-find",
                           { authname: authName },
                           (err, user) => {
                              if (err) {
                                 //ok(err);
                                 ok();
                                 req.ab.notify.developer(err, {
                                    context: "Error from user-find",
                                    authName,
                                 });
                                 return;
                              }
                              if (user) {
                                 result = user;
                              }
                              ok();
                           }
                        );
                     },
                     // Create new user entry if needed
                     (ok) => {
                        // Skip this step if user already exists
                        if (result) return ok();

                        let email =
                           profile.defaultmail ||
                           profile.email ||
                           profile.emails; //||
                        // uuid;
                        if (Array.isArray(email)) {
                           email = email[0];
                        }

                        let language =
                           profile.language || profile.languages || "en";
                        if (Array.isArray(language)) {
                           language = language[0];
                        }

                        // It may take several tries to create the user account entry
                        let numTries = 5;

                        async.whilst(
                           // while condition
                           (w_cb) => {
                              numTries -= 1;
                              if (numTries == 0) {
                                 w_cb(
                                    new Error(
                                       "Too many tries to create user account"
                                    )
                                 );
                              } else {
                                 w_cb(null, result == null);
                              }
                           },
                           // do
                           (d_cb) => {
                              req.ab.serviceRequest(
                                 //"user_manager.new-user????",
                                 "appbuilder.model-post",
                                 {
                                    objectID:
                                       "228e3d91-5e42-49ec-b37c-59323ae433a1", // site_user
                                    values: {
                                       // Generate a new random UUID.
                                       // Can't put authname here because
                                       // AppBuilder needs it to follow a
                                       // standard format.
                                       uuid: AB.uuid(),
                                       username,
                                       email,
                                       password: "CAS",
                                       languageCode: language,
                                       isActive: 1,
                                       authname: authName,
                                    },
                                 },
                                 { longRequest: true },
                                 (err, user) => {
                                    // Duplicate user name
                                    if (err && err.code == "ER_DUP_ENTRY") {
                                       // Change username and try again
                                       username = `${username}-${AB.uuid()}`;
                                       d_cb();
                                    }
                                    // Some other error
                                    else if (err) {
                                       d_cb(err);
                                    }
                                    // Success
                                    else {
                                       result = user;
                                       d_cb();
                                    }
                                 }
                              );
                           },
                           // finished
                           (err) => {
                              if (err) ok(err);
                              else ok();
                           }
                        );
                     },
                  ],
                  (err) => {
                     if (err) done(err);
                     else done(null, result);
                  }
               );
            }
         )
      );
   },

   login: (req, res, tenantUrl) => {
      // Authenticate the unknown user now

      // Inject the AppBuilder site URL from the config into
      // the headers so that Passport CAS will know where to
      // redirect back to.
      const siteURL = new url.URL(tenantUrl);
      req.headers["x-forwarded-proto"] = siteURL.protocol;
      req.headers["x-forwarded-host"] = siteURL.host;

      const auth = passport.authenticate("cas");
      const afterAuth = (err, ...params) => {
         // Server errors
         if (err) {
            res.serverError(err);
            authLogger(req, "CAS auth error");
            req.ab.notify.developer(err, {
               context: "CAS authentication (err)",
               ...params,
            });
            return;
         }
         // Authentication failed
         if (!req.user) {
            let err = new Error("CAS Auth failed");
            res.serverError(err);
            authLogger(req, "CAS auth error");
            req.ab.notify.developer(err, {
               context: "CAS authentication failed",
               ...params,
            });
            return;
         }
         // Successful auth redirect to "/"
         res.redirect("/");
         authLogger(req, "CAS auth successful");
      };
      // auth(req, res, callback);
      // passport.initialize() "As of v0.6.x, it is typically no longer
      // necessary to use this middleware", but passport-cas2 expects it
      passport.initialize()(req, res, () => auth(req, res, afterAuth));
   },
};
