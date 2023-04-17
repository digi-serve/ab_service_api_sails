/**
 * definition_manager/export-app.js
 *
 *
 * @api {get} /definition/export/:ID Export App
 * @apiGroup Definition
 * @apiPermission Builder
 * @apiParam {string} ID uuid of the ABApplication
 * @apiUse download
 * @apiUse exportRes
 */

var inputParams = {
   ID: { string: { uuid: true }, required: true },
   download: { number: { integer: true }, optional: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`definition_manager::export-app`);

   if (
      !(req.ab.validUser(/* false */)) ||
      !(req.ab.validBuilder(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   var download = req.ab.param("download");

   // create a new job for the service
   let jobData = {
      ID: req.ab.param("ID"),
   };

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "definition_manager.export-app",
      jobData,
      (err, results) => {
         if (err) {
            res.ab.error(err);
            return;
         }

         if (download) {
            res.set(
               "Content-Disposition",
               `attachment; filename="${
                  results.filename || "appbuilder_" + results.date
               }.json"`
            );
         }

         res.json(results);
      }
   );
};
