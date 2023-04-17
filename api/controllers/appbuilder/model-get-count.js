/**
 * appbuilder/model-get.js
 * @apiDescription Perform a Count operation on the data managed by a specified ABObject.
 * This returns a count of all the matching rows specified by the
 * `{where}` parameter.
 * @api {get} /app_builder/model/:objID/count Model Count
 * @apiGroup AppBuilder
 * @apiPermission User
 * @apiUse objID
 * @apiQuery {object} where filter conditions to apply before counting
 * @apiUse successRes
 * @apiSuccess (200) {object} data
 * @apiSuccess (200) {number} data.count count of all the matching rows
 */

var inputParams = {
   objID: { string: true, required: true },
   where: { object: true, optional: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`appbuilder::model-get-count`);

   var validationParams = Object.keys(inputParams);

   // in our preparations for the service, we only validate the required
   // objID param.
   var validateThis = {};
   (validationParams || []).forEach((p) => {
      validateThis[p] = req.param(p);
   });

   // verify your inputs are correct:
   // false : prevents an auto error response if detected. (default: true)
   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams, true, validateThis)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // NOTE: for the count() service, we do NOT pass along any sort, limit, skip
   // params, and populate is false.  We are just generating a count.

   // create a new job for the service
   let jobData = {
      objectID: req.ab.param("objID"),
      cond: {
         populate: false,
      },
   };

   var fields = ["where"];
   fields.forEach((f) => {
      var val = req.ab.param(f);
      if (val) {
         try {
            jobData.cond[f] = JSON.parse(val);
         } catch (e) {
            req.ab.log(e);
            jobData.cond[f] = val;
         }
      }
   });

   // verify that the request is from a socket not a normal HTTP
   if (req.isSocket) {
      // Subscribe socket to a room with the name of the object's ID
      // Join room for each role so that user only recieves data for their scope.
      const roles = req.ab.user.SITE_ROLE ?? [];
      roles.forEach((role) => {
         const roomKey = `${jobData.objectID}-${role.uuid}`;
         sails.sockets.join(req, req.ab.socketKey(roomKey));
      });
      // Also join a room for current user
      const userRoom = req.ab.socketKey(
         `${jobData.objectID}-${req.ab.user.username}`
      );
      sails.sockets.join(req, userRoom);
   }

   // pass the request off to the uService:
   req.ab.serviceRequest("appbuilder.model-get", jobData, (err, results) => {
      if (err) {
         req.ab.log("api_sails:model-get-count:error:", err);
         res.ab.error(err);
         return;
      }
      res.ab.success({ count: results.total_count });
   });
};
