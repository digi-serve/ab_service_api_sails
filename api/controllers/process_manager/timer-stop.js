/**
 * process_manager/timer-stop.js
 *
 *
 * @api {put} /process/timer/:ID/stop Timer Stop
 * @apiGroup Process
 * @apiPermission Builder
 * @apiUse timerID
 * @apiUse successRes
 */

var inputParams = {
   ID: { string: { uuid: true }, required: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`process_manager::timer-stop`);

   // verify your inputs are correct:
   if (
      !(req.ab.validUser(/* false */)) ||
      !(req.ab.validBuilder(/* false */)) ||
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

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "process_manager.timer-stop",
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
