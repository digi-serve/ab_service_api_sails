/**
 * process_manager/reset.js
 * @apiDescription send a signal to reset a specific process & task. This will cause that
 * task to restart and run again.
 *
 * @api {PUT} /process/reset/:taskID Task Reset
 * @apiGroup Process
 * @apiPermission User
 * @apiParam {string} taskID uuid of the process task
 * @apiBody {string/string[]} instanceID ids of process instances
 * @apiUse successRes
 * @apiSuccess (200) {number} data the number of process resets
 */
var inputParams = {
   instanceID: { required: true },
   // instanceID can either be a {string} or {array[string]}
   taskID: { string: { uuid: true }, required: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`process_manager::reset`);

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
   let jobData = {
      instanceID: req.ab.param("instanceID"),
      taskID: req.ab.param("taskID"),
   };

   // pass the request off to the uService:
   req.ab.serviceRequest("process_manager.reset", jobData, (err, results) => {
      if (err) {
         res.ab.error(err);
         return;
      }
      res.ab.success(results);
   });
};
