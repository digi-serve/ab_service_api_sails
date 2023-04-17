/**
 * definition_manager/definition-delete.js
 *
 *
 * @api {delete} /definition/:ID Delete
 * @apiGroup Definition
 * @apiPermission Builder
 * @apiUse defID
 * @apiUse successRes
 */

var inputParams = {
   ID: { string: true, required: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`definition_manager::definition-delete`);

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

   // User must be using ABDesigner, so add User to abdesigner room.
   // verify that the request is from a socket not a normal HTTP
   if (req.isSocket) {
      req.ab.log("Joining ABDesigner Updates");
      // Subscribe socket to a room with the name of the object's ID
      sails.sockets.join(req, req.ab.socketKey("abdesigner"));
   }

   // create a new job for the service
   let jobData = {
      ID: req.ab.param("ID"),
   };

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "definition_manager.definition-delete",
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
