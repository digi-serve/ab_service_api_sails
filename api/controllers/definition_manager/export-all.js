/**
 * definition_manager/export-all.js
 *
 *
 * @api {get} /definition/export/all Export All
 * @apiGroup Definition
 * @apiPermission Builder
 * @apiUse download
 * @apiUse exportRes
 */

var inputParams = {
   download: { number: { integer: true }, optional: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`definition_manager::export-all`);

   if (
      !(req.ab.validUser(/* false */)) ||
      !(req.ab.validBuilder(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
      // TODO: add req.ab.validUserRole("System Developer")
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   var download = req.ab.param("download");
   // {num/Bool} is this requested as a downloaded file?

   // create a new job for the service
   let jobData = {
      download,
   };

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "definition_manager.export-all",
      jobData,
      (err, results) => {
         if (err) {
            res.ab.error(err);
            return;
         }

         if (download) {
            res.set(
               "Content-Disposition",
               `attachment; filename="appbuilder_${results.date}.json"`
            );
         }
         res.json(results);
      }
   );
};
