/**
 * appbuilder/model-update.js
 * @apiDescription Perform an Update operation on the data managed by a specified ABObject.
 * This returns a fully populated row value of the newly created entry.
 *
 * @api {put} /app_builder/model/:objID/:id Model Update
 * @apiGroup AppBuilder
 * @apiPermission User
 * @apiUse objID
 * @apiParam {string} ID uuid of the record
 * @apiBody {any} ...params any values to update, based on the ABObject's columns
 * @apiUse successRes
 * @apiSuccess (200) {object} data row value
 */
var inputParams = {
   objID: { string: true, required: true },
   ID: { string: true, required: true },
   /*    "email": { string:{ email: { allowUnicode: true }}, required:true }   */
   /*                -> NOTE: put .string  before .required                    */
   /*    "param": { required: true } // NOTE: param Joi.any().required();      */
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`appbuilder::model-update`);

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

   // create a new job for the service
   let jobData = {
      objectID: req.ab.param("objID"),
      ID: req.ab.param("ID"),
      values: {},
   };

   // Now collect any remaining Values and use them for the UPDATE data:
   var incomingValues = req.allParams();
   Object.keys(incomingValues).forEach((k) => {
      // skip anything we already validated
      if (validationParams.indexOf(k) == -1) {
         // try {
         //    jobData.values[k] = JSON.parse(incomingValues[k]);
         // } catch (e) {
         //    console.error(e, incomingValues[k]);
         //    req.ab.log(`${k}: ${incomingValues[k]}`);
         jobData.values[k] = incomingValues[k];
         // }
      }
   });

   req.ab.serviceRequest(
      "appbuilder.model-update",
      jobData,
      { stringResult: true }, // prevent JSON.parse()ing the results
      (err, results) => {
         if (err) {
            req.ab.log("Error in model-update : ", err);
            res.ab.error(err);
            return;
         }

         res.ab.success(results);
      }
   );
};
