/**
 * file_processor/image-rotate.js
 *
 *
 * url:     put /image/rotate/:ID
 * header:  X-CSRF-Token : [token]
 * params:
 */

const inputParams = {
   ID: { string: { uuid: true }, required: true },
   direction: { string: true, optional: true },
};

module.exports = function (req, res) {
   req.ab.log(`file_processor::image-rotate`);

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
   const jobData = {
      uuid: req.ab.param("ID"),
      direction: req.ab.param("direction"),
   };

   req.ab.log(jobData);

   // pass the request off to the Service:
   req.ab.serviceRequest("file_processor.image-rotate", jobData, (err) => {
      if (err) {
         res.ab.error(err);
         return;
      }

      res.ab.success();
   });
};
