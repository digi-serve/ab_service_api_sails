/**
 * process_manager/inbox-register.js
 * @apiDescription Register for socket updates for realtime inbox updates
 *
 * @api {post} /process/inbox/register Inbox Register
 * @apiGroup Process
 * @apiPermission User
 * @apiUse successRes
 * @apiSuccess (200) {string} data "ready" or "sockets not enabled, so no real time updates."
 */

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`process_manager::inbox-register`);

   // If there is no User, then we really can't do much from here.
   if (!(req.ab.validUser(/* false */))) {
      // req.ab.log("... No User Defined");
      // res.ab.error("user not initialized.");
      return;
   }

   // If the request isn't coming in from a socket, we can't create
   // the real time updates.  But maybe it is as the configuration intends.
   if (!req.isSocket) {
      res.ab.success("sockets not enabled, so no real time updates.");
      return;
   }

   // create a new job for the service
   var jobData = {
      user: req.ab.user,
   };

   // pass the request off to the uService:
   req.ab.serviceRequest("user_manager.config", jobData, (err, configUser) => {
      // Subscribe to Relevant Socket Rooms:
      // 1) The User themselves
      // TODO: do we go by .username instead? See what is being saved in our
      // User connections and what would be available in the userform-create
      // handler:
      sails.sockets.join(req, req.ab.socketKey(configUser.uuid));
      sails.sockets.join(req, req.ab.socketKey(configUser.username));

      // 2) all the Roles:
      (configUser.roles || []).forEach((role) => {
         sails.sockets.join(req, req.ab.socketKey(role.uuid));
      });

      res.ab.success("ready.");
   });
};
