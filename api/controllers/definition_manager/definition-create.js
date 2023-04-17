/**
 * definition_manager/definition-create.js
 *
 *
 * @api {post} /definition/create Create
 * @apiGroup Definition
 * @apiPermission Builder
 * @apiBody {string} id a uuid
 * @apiBody {string} name
 * @apiBody {string} type
 * @apiBody {string} json
 * @apiUse successRes
 * @apiSuccess (200) {object} data complete definition
 */

var inputParams = {
   id: { string: { uuid: true }, required: true },
   name: { string: true, required: true },
   type: { string: true, required: true },
   json: { required: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`definition_manager::definition-create`);

   // verify your inputs are correct:
   // false : prevents an auto error response if detected. (default: true)
   // valuesToCheck: {obj} a specified subset of the input values to validate.
   //    { [key] : [value] }
   //       [key] = inputParams[key] entry .
   //       [value] = req.param(value)
   //    if no values given, then req.allParams() are evaluated. In some cases
   //    you'll want to only require a certain subset of input values and then
   //    let the rest be evaluated by the destination service.
   if (
      !(req.ab.validUser(/* false */)) ||
      !(req.ab.validBuilder(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // Add User to definition.* rooms.
   // verify that the request is from a socket not a normal HTTP
   if (req.isSocket) {
      req.ab.log("Joining ABDesigner Updates");
      // Subscribe socket to a room with the name of the object's ID
      sails.sockets.join(req, req.ab.socketKey("abdesigner"));
   }

   // create a new job for the service
   let jobData = {};
   Object.keys(inputParams).forEach((k) => {
      jobData[k] = req.ab.param(k);
   });

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "definition_manager.definition-create",
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
