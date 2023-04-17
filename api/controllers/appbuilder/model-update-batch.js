/**
 * appbuilder/model-update-batch.js
 * @apiDescription Perform an Update operation on a batch of data managed by a specified
 * ABObject.
 *
 * @api {put} /app_builder/batch/model/:objID Model Update Batch
 * @apiGroup AppBuilder
 * @apiPermission User
 * @apiUse objID
 * @apiBody {string[]} rowIds uuids of the records to update
 * @apiBody {object} values values to update
 * @apiUse resTrue
 */
var inputParams = {
   objID: { string: true, required: true },
   rowIds: { array: true, required: true },
   values: { object: true, required: true },
   /*    "email": { string:{ email: { allowUnicode: true }}, required:true }   */
   /*                -> NOTE: put .string  before .required                    */
   /*    "param": { required: true } // NOTE: param Joi.any().required();      */
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`appbuilder::model-update-batch`);

   // verify your inputs are correct:
   // false : prevents an auto error response if detected. (default: true)
   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, true, validateThis */)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   var objectID = req.ab.param("objID");
   var rowIDs = req.ab.param("rowIds");
   var values = req.ab.param("values");

   var allUpdates = [];
   rowIDs.forEach((id) => {
      allUpdates.push(submitJob(req, objectID, id, values));
   });

   Promise.all(allUpdates)
      .then(() => {
         res.ab.success(true);
      })
      .catch((err) => {
         req.ab.log("Error in model-update-batch : ", err);
         res.ab.error(err);
      });
};

function submitJob(req, objectID, ID, values) {
   return new Promise((resolve, reject) => {
      // create a new job for the service
      let jobData = {
         objectID,
         ID,
         values,
      };

      req.ab.serviceRequest(
         "appbuilder.model-update",
         jobData,
         (err, results) => {
            if (err) {
               req.ab.log("Error in model-update-batch : ", err);
               reject(err);
               return;
            }

            resolve(results);
         }
      );
   });
}
