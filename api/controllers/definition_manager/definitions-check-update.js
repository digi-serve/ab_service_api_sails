/**
 * definitions/check-update/
 * @apiDescription Check when the server last updated definitions.
 * Used for cache busting `/definition/myapps`
 *
 * @api {get} /definition/check-update Check
 * @apiGroup Definition
 * @apiPermission none
 * @apiUse successRes
 * @apiSuccess (200) {number} data the result of `Date.now()` when definitions were updated
 */

module.exports = function (req, res) {
   // Package the Request and pass it off to the service
   req.ab.log(`definition_manager::definitions-check-update`);

   // verify User is able to access service:
   if (!(req.ab.validUser(/* false */))) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   let jobData = {};

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "definition_manager.definitions-check-update",
      jobData,
      (err, result) => {
         if (err) {
            console.log("err", err);
            res.ab.error(err);
            return;
         }
         // Send as JS
         console.log("result", result);
         res.ab.success(result);
      }
   );
};
