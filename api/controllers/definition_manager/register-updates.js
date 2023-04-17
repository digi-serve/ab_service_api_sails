/**
 * definition_manager/register-updates.js
 * @apidescription Register for socket updates when definitons change
 *
 * @api {post} /definition/register Register
 * @apiGroup Definition
 * @apiPermission Builder
 * @apiUse successRes
 */

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`definition_manager::register-updates`);

   // verify your inputs are correct:
   if (
      !(req.ab.validUser(/* false */)) ||
      !(req.ab.validBuilder(/* false */))
      // || !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // User must be using ABDesigner, so
   // Add User to definition.* rooms.
   // verify that the request is from a socket not a normal HTTP
   if (req.isSocket) {
      req.ab.log("Joining ABDesigner Updates");
      // Subscribe socket to a room with the name of the object's ID
      sails.sockets.join(req, req.ab.socketKey("abdesigner"));
   }

   res.ab.success({});
};
