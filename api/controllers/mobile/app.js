/**
 * mobile/app.js
 * @apiDescription Respond with the index.html of the Mobile PWA
 *
 * @api {get} /mobile/app/:tenantID/:appID
 * @apiParam {string} tenantID
 * @apiParam {string} appID
 * @apiGroup Mobile
 * @apiPermission None
 * @apiSuccess (200) {HTML} html
 */
// var inputParams = {
//    tenant: { string: true, optional: true },
// };

module.exports = function (req, res) {
   req.ab.log("mobile/app():");

   // var user = req.ab.user;
   let appID = req.ab.param("ID");
   let tenantID = req.ab.tenantID;

   res.view("mobile_pwa.ejs", {
      layout: false,
      appID,
      tenantID,
   });
};
