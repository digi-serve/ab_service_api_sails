/**
 * file_processor/file-get.js
 *
 *
 * @api {get} /file/:ID Get a File
 * @apiGroup File
 * @apiPermission User
 * @apiParam {string} ID file uuid
 * @apiSuccess (302) {redirect} url to the file
 */

var inputParams = {
   ID: { string: { uuid: true }, required: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`file_processor::file-get`);

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
      uuid: req.ab.param("ID"),
   };

   req.ab.log(jobData);

   // pass the request off to the uService:
   req.ab.serviceRequest("file_processor.file-get", jobData, (err, results) => {
      if (err) {
         res.ab.error(err);
         return;
      }

      // redirect the client to the file url:
      req.ab.log(` redirect -> ${results.url}`);
      return res.redirect(results.url);
   });
};
