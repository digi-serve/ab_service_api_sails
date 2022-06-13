/**
 * process_manager/inbox-meta.js
 *
 *
 * url:     post /process/inbox/meta
 * header:  X-CSRF-Token : [token]
 * params:
 */

var inputParams = {
   ids: { array: true, required: true },
   /*                -> NOTE: put .string  before .required                    */
   /*    "param": { required: true } // NOTE: param Joi.any().required();      */
   /*    "param": { optional: true } // NOTE: param Joi.any().optional();      */
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`process_manager::inbox-meta`);

   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   var jobData = {
      ids: req.ab.param("ids"),
   };

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "process_manager.inbox.meta",
      jobData,
      (err, results) => {
         if (err) {
            res.ab.error(err);
            return;
         }
         res.ab.success(results);
      }
   );
};
