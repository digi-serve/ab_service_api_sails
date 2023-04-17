/**
 * definition_manager/definition-allapplications.js
 *
 *
 * @api {get} /definition/allapplications All Applications
 * @apiGroup Definition
 * @apiPermission Builder
 * @apiSuccess (200) {json} definitions
 */

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Request and pass it off to the service

   req.ab.log(`definition_manager::definition-allapplications`);

   // verify User is able to access service:
   if (
      !(req.ab.validUser(/* false */)) ||
      !(req.ab.validBuilder(/* false */))
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   let jobData = {};

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "definition_manager.export-all",
      jobData,
      (err, result) => {
         if (err) {
            res.ab.error(err);
            return;
         }

         res.json(result.definitions);
      }
   );
};
