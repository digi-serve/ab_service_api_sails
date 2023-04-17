/**
 * auth/reset-request.js
 * @apiDescription Request an email to be sent to the user's
 * address with a link to reset their password.
 *
 * @api {post} /auth/login/reset Reset Password
 * @apiGroup Auth
 * @apiPermission None
 * @apiUse email
 * @apiUse tenantO
 * @apiBody {string} url
 * @apiUse successRes
 */
const authLogger = require("../../lib/authLogger.js");

var inputParams = {
   email: { string: { email: { allowUnicode: true } }, required: true },
   tenant: { string: true, optional: true },
   url: { string: true, required: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`auth::reset-request`);

   // verify your inputs are correct:
   if (!req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // NOTE: in the /config route, the tenant_manager.config() handler
   // returns "default" if no tenant could be found for the request.
   // this should only happen if we have enabled the ability to access
   // a generic login that lets you choose which tenant to log into:
   if (!req.ab.tenantSet() || req.ab.tenantID == "default") {
      var tenant = req.ab.param("tenant");
      if (tenant) {
         req.ab.tenantID = tenant;
      }
   }

   // create a new job for the service
   let jobData = {
      email: req.ab.param("email"),
      url: req.ab.param("url"),
   };

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "user_manager.user-password-reset-request",
      jobData,
      (err, results) => {
         if (err) {
            res.ab.error(err);
            authLogger(req, "Password reset email error");
            return;
         }
         // If email address could not be found, log the failure but don't
         // tell the user so they can't use this to fish for valid emails.
         else if (results?.code == "ENOTFOUND") {
            delete results.code;
            authLogger(req, "Password reset email FAILED");
            // continue normally?
         }
         res.ab.success(results);
      }
   );
};
