/**
 * process_manager/external.js
 * @apiDescription Allows an external approval task to report the task
 * as done to continue the process.
 * @api {post} /process/external External Done
 * @apiGroup Process
 * @apiPermission User
 * @apiBody {object} task
 * @apiBody {string} task.id id of the external approval task instance
 * @apiBody {object} [data] any data to add to the process context
 * @apiUse successRes
 */
var inputParams = {
   task: { object: true, required: true },
   data: { object: true, optional: true },
   /*    "email": { string:{ email: { allowUnicode: true }}, required:true }   */
   /*                -> NOTE: put .string  before .required                    */
   /*    "param": { required: true } // NOTE: param Joi.any().required();      */
   /*    "param": { optional: true } // NOTE: param Joi.any().optional();      */
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`process_manager::external`);

   // verify your inputs are correct:
   // false : prevents an auto error response if detected. (default: true)
   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams /* , true, validateThis */)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   const task = req.ab.param("task");
   const data = JSON.stringify(req.ab.param("data"));

   let jobData = {
      uuid: task.id,
      response: data,
      user: req.ab.userDefaults().username,
   };

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "process_manager.external",
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
