/**
 * process_manager/inbox-update.js
 * @apiDescription Complete an proces task from the inbox
 *
 * @api {put} /process/inbox/:ID Inbox Update
 * @apiGroup Process
 * @apiPermission User
 * @apiParam {string} ID id of the inbox task
 * @apiBody {string} response response to send to the process
 * @apiUse successRes
 */

var inputParams = {
   ID: { string: true, required: true },
   response: { string: true, required: true },
   /*    "email": { string:{ email: { allowUnicode: true }}, required:true }   */
   /*                -> NOTE: put .string  before .required                    */
   /*    "param": { required: true } // NOTE: param Joi.any().required();      */
   /*    "param": { optional: true } // NOTE: param Joi.any().optional();      */
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`process_manager::inbox-update`);

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
      response: req.ab.param("response"),
      user: req.ab.userDefaults().username,
   };

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "process_manager.inbox-update",
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
