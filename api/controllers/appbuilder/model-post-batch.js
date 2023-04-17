/**
 * appbuilder/model-post-batch.js
 * @apiDescription Perform a Create operation on a batch of data managed by a specified
 * ABObject. This returns a fully populated row value of the newly created
 * entry.
 *
 * NOTE: the incoming data contains an .id value used on the client to identify
 * the entry.  This is not part of the data being stored, but a local reference.
 * Our return data references this .id to update the client with the results
 * for that entry.
 *
 * @api {post} /app_builder/model/:objID/batch Model Create Batch
 * @apiGroup AppBuilder
 * @apiParam {string} objID uuid of the ABObject to add to
 * @apiBody {array} batch records to add
 * @apiUse successRes
 * @apiSuccess (200) {object} data
 * @apiSuccess (200) {object} data.data entries that added successfully `{ id: rowEntry }`
 * @apiSuccess (200) {object} data.errors entries that could not be saved `{ id: error }`
 */
var inputParams = {
   objID: { string: { uuid: true }, required: true },
   batch: { array: true, required: true },
   /*    "email": { string:{ email: { allowUnicode: true }}, required:true }   */
   /*                -> NOTE: put .string  before .required                    */
   /*    "param": { required: true } // NOTE: param Joi.any().required();      */
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`appbuilder::model-post-batch`);

   var validationParams = Object.keys(inputParams);

   // in our preparations for the service, we only validate the required ID
   // param.
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

   var objectID = req.ab.param("objID");
   var batch = req.ab.param("batch");

   var allResults = {};
   var allErrors = {};

   var allCreates = [];
   batch.forEach((newRecord) => {
      // newRecord: {hash}
      //   .id : {int} the client side id of an entry they are trying to create
      //   .data : {json} the key=>value hash of the new entry.

      allCreates.push(
         submitJob(req, objectID, newRecord.data)
            .then((result) => {
               allResults[newRecord.id] = result;
            })
            .catch((err) => {
               allErrors[newRecord.id] = err;
            })
      );
   });

   Promise.all(allCreates).then(() => {
      res.ab.success({
         data: allResults,
         errors: allErrors,
      });
   });
};

function submitJob(req, objectID, values) {
   return new Promise((resolve, reject) => {
      // create a new job for the service
      // start with our expected required inputs
      let jobData = {
         objectID,
         values,
         // NOTE: When there are a lot of inserting row, then It will take more time to response.
         // Set .longRequest to avoid timeout error.
         longRequest: true,
         // relocate the rest of the params as .values
      };

      req.ab.serviceRequest(
         "appbuilder.model-post",
         jobData,
         (err, newItem) => {
            if (err) {
               req.ab.log("api_sails:model-post-batch:error:", err);
               reject(err);
               return;
            }

            resolve(newItem);
         }
      );
   });
}
