/**
 * auth/reset-password-update.js
 *
 * @api {post} /auth/password/reset Set Password
 * @apiGroup Auth
 * @apiPermission User
 * @apiUse password
 * @apiUse successRes
 */

var inputParams = {
   password: { string: true, required: true },
};

module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`auth::reset-password-update`);

   // verify your inputs are correct:
   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   let jobData = {
      objectID: "228e3d91-5e42-49ec-b37c-59323ae433a1", // SiteUser object id
      ID: req.ab.user.id,
      values: { password: req.ab.param("password") },
   };

   req.ab.serviceRequest("appbuilder.model-update", jobData, (err, results) => {
      if (err) {
         req.ab.log("Error in model-update : ", err);
         res.ab.error(err);
         return;
      }

      // remove the users default View if this was a password reset request
      if (
         req.session.defaultView == `appbuilder-view="auth_login_resetPassword"`
      ) {
         req.session.defaultView = null;
      }

      res.ab.success({});
   });
};
