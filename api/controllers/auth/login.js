/**
 * auth/login.js
 * @apiDescription Process the provided login email/password and establish a user session
 * if valid.
 *
 * @api {post} /auth/login Login
 * @apiGroup Auth
 * @apiPermission None
 * @apiUse email
 * @apiUse password
 * @apiUse tenantO
 * @apiUse successRes
 * @apiSuccess (200) {object} data
 * @apiSuccess (200) {object} data.user
 */
const authLogger = require("../../lib/authLogger.js");

var inputParams = {
   email: { string: { email: true }, required: true },
   password: { string: true, required: true },
   tenant: { string: true, optional: true },
};

module.exports = function (req, res) {
   req.ab.log("auth/login():");

   // verify your inputs are correct:
   // false : prevents an auto error response if detected. (default: true)
   if (!req.ab.validateParameters(inputParams /*, true, validateThis */)) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   var email = req.ab.param("email");
   var password = req.ab.param("password");

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

   req.ab.serviceRequest(
      "user_manager.user-find-password",
      { email, password },
      async (err, user) => {
         if (err) {
            req.ab.log("error logging in:", err);
            res.ab.error(err, 401);
            authLogger(req, "Local auth FAILED");
            return;
         }
         req.ab.log("successful auth/login");
         req.session.tenant_id = req.ab.tenantID;
         req.session.user_id = user.uuid;

         // make response last so session is updated before next user interaction
         await authLogger(req, "Local auth successful");
         res.ab.success({ user });
      }
   );
};
