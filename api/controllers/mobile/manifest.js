/**
 * mobile/manifest.js
 * @apiDescription Respond with the manifest.json of the Mobile PWA
 *
 * @api {get} /mobile/app/:tenantID/:ID/manifest.json Manifest
 * @apiGroup Mobile
 * @apiPermission None
 * @apiSuccess (200) {HTML} html
 */
// const authLogger = require("../../lib/authLogger.js");

// var inputParams = {
//    tenant: { string: true, optional: true },
// };

module.exports = function (req, res) {
   req.ab.log("mobile/manifest():");

   let tenantID = req.ab.tenantID; // <-- the validated ID from authTenant
   let appID = req.ab.param("ID");

   req.ab.log(`t[${tenantID}] a[${appID}]`);
   // here I can go lookup the actual manifest data related to the given
   // tenant / app

   res.view("mobile_manifest.ejs", {
      layout: false,
      tenantID,
   });
};
