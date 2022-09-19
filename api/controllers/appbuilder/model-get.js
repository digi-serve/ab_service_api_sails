/**
 * appbuilder/model-get.js
 * Perform a Find operation on the data managed by a specified ABObject.
 *
 * url:     get /app_builder/model/:objID
 * header:  X-CSRF-Token : [token]
 * return:  {array} [ {rowentry}, ... ]
 * params:
 */
var inputParams = {
   objID: { string: true, required: true },
   where: { object: true, optional: true },
   sort: { array: true, optional: true },
   // sort: specify the fields used for sorting
   //    [ { key: field.id, dir:["ASC", "DESC"]}, ... ]

   populate: { boolean: true, optional: true },
   // populate: return values with their connections populated?

   //// Paging Entries: skip, offset, limit
   skip: { number: { integer: true }, optional: true },
   // skip: a legacy param that will be converted to offset
   offset: { number: { integer: true }, optional: true },
   // offset: the number of entries to skip.
   limit: { number: { integer: true }, optional: true },
   // limit: the number or entreis to return.
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`appbuilder::model-get`);

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
      objectID: req.ab.param("objID"),
      cond: {},
   };

   Object.keys(inputParams).forEach((f) => {
      if (f == "objID") return;
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

   // move "skip" => "offset"
   if (jobData.cond.skip) {
      jobData.cond.offset = jobData.cond.skip;
      delete jobData.cond.skip;
   }

   // verify that the request is from a socket not a normal HTTP
   if (req.isSocket) {
      // Subscribe socket to a room with the name of the object's ID
      // Join room for each role so that user only recieves data for their scope.
      const roles = req.ab.user.SITE_ROLE ?? [];
      roles.forEach((role) => {
         const roomKey = `${jobData.objectID}-${role.uuid}`;
         sails.sockets.join(req, req.ab.socketKey(roomKey));
      });
      // Also join room for the current user
      const userRoom = req.ab.socketKey(
         `${jobData.objectID}-${req.ab.user.username}`
      );
      sails.sockets.join(req, userRoom);
   }

   // pass the request off to the uService:
   req.ab.serviceRequest("appbuilder.model-get", jobData, (err, results) => {
      if (err) {
         req.ab.log("api_sails:model-get:error:", err);
         res.ab.error(err);
         return;
      }
      // req.ab.log(JSON.stringify(results));
      res.ab.success(results);
   });
};
