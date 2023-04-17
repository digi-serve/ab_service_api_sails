/**
 * appbuilder/model-get.js
 * Perform a Find operation on the data managed by a specified ABObject.
 *
 * url:     get /app_builder/model/:objID
 * header:  X-CSRF-Token : [token]
 * return:  {array} [ {rowentry}, ... ]
 * params:
 */
/**
 * @api {get} /app_builder/model/:objID Model Find
 * @apiGroup AppBuilder
 * @apiPermission User
 * @apiDescription Perform a Find operation on the data managed by a specified ABObject.
 * @apiParam {string} objID The uuid of the ABObject
 * @apiQuery {object} [where] filter conditions
 * @apiQuery {array} [sort] specify the fields used for sorting `[ { key: field.id, dir:["ASC", "DESC"]}, ... ]`
 * @apiQuery {boolean|array} [populate] return values with their connections populated?
 * @apiQuery {number} [offset] the number of entries to skip.
 * @apiQuery {number} [limit] the number of return.
 * @apiUse successRes
 * @apiSuccess (200) {object} data
 * @apiSuccess (200) {array} data.data all the matching rows
 * @apiSuccess (200) {number} data.total_count count of the returned rows (for pagination)
 * @apiSuccess (200) {number} data.pos starting position (for pagination)
 * @apiSuccess (200) {number} data.offset
 * @apiSuccess (200) {number} data.limit
 */
var inputParams = {
   objID: { string: true, required: true },
   where: { object: true, optional: true },
   sort: { array: true, optional: true },
   // sort: specify the fields used for sorting
   //    [ { key: field.id, dir:["ASC", "DESC"]}, ... ]

   populate: { optional: true },
   // populate: return values with their connections populated?
   // can be boolean or array

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

   const options = {};
   // if populate == true, then this might take longer, so mark this as a
   // longRequest
   // NOTE: only do this on a generic populate = true.  those can end up
   // gathering ALOT of data.  if this is a limited populate = [ 'field', ... ]
   // this is probably not necessary
   if (jobData.cond.populate === true || jobData.cond.populate === "true") {
      options.longRequest = true;
   }

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "appbuilder.model-get",
      jobData,
      options,
      (err, results) => {
         if (err) {
            req.ab.log("api_sails:model-get:error:", err);
            res.ab.error(err);
            return;
         }
         // req.ab.log(JSON.stringify(results));
         res.ab.success(results);
      }
   );
};
