/**
 * auth/logout.js
 *
 * @api {post} /auth/logout Logout
 * @apiGroup Auth
 * @apiPermission None
 * @apiDescription Clears the session and redirects the user
 * @apiSuccess (200 CAS) {object} data
 * @apiSuccess (200 CAS) {string} data.redirect if using CAS Authentication we send the redirect url for logout
 * @apiSuccess (200 CAS) {string} status `"success"`
 * @apiUse successRes
 */
// var inputParams = {
//    email: { string: { email: true }, required: true },
//    password: { string: true, required: true },
//    tenant: { string: true, optional: true },
// };

module.exports = function (req, res) {
   req.ab.log("auth/logout():");

   req.session.tenant_id = null;
   req.session.user_id = null;

   // passport session logout feature:
   if (req.logout) {
      req.logout();
   }

   // if cas is enabled we have to also log out of cas so pass a redirect link
   // that the frontend will follow after successfully loging out locally
   if (sails.config.cas?.enabled) {
      res.ab.success({
         redirect: `${sails.config.cas.baseURL}/logout?service=${req.ab.param(
            "tenantUrl"
         )}`,
      });
   } else {
      res.ab.success({});
   }
};
