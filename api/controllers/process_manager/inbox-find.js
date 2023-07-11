/**
 * process_manager/inbox-update.js
 * @apiDescription Complete an proces task from the inbox
 *
 * @api {get} /process/inbox/ Inbox Find
 * @apiGroup Process
 * @apiPermission User
 * @apiUse successRes
 */

var inputParams = {};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`process_manager::inbox.find`);

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
      roles: req.ab.user.SITE_ROLE,
      users: [req.ab.user.username],
   };
   console.log(jobData);

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "process_manager.inbox.find",
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
