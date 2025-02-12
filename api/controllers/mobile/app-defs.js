/**
 * mobile/app-defs
 *
 * @api {GET} /mobile/definitions/:appID Mobile App definitions
 * @apiPermission none
 * @apiGroup Definition
 * @apiSuccess (200) {text/javascript} definitions script to add the app definitions
 */

const inputParams = {
   ID: { string: true, required: true },
};

module.exports = function (req, res) {
   req.ab.log("mobile::Application Definitions");

   // Handle the case where ?v=unknown (requested before login)
   const v = req.query.v;
   if (v === "unknown") {
      res.set("Content-Type", "text/javascript");
      res.set("Cache-Control", "max-age=31536000"); // Cache for 1 year
      res.send(`window.definitions=[]`);
      return;
   }

   // Validate input parameters
   const validationParams = Object.keys(inputParams);
   const valuesToCheck = {};
   validationParams.forEach((p) => {
      valuesToCheck[p] = req.query[p] || req.params[p]; // Check both query and URL params
   });

   if (
      !req.ab.validUser() ||
      !req.ab.validateParameters(inputParams, true, valuesToCheck)
   ) {
      return; // `validateParameters` automatically handles errors
   }

   // Create a job for the service request
   const jobData = {
      ID: valuesToCheck.ID,
   };

   req.ab.serviceRequest(
      "definition_manager.definitions-app",
      jobData,
      { stringResult: true },
      (err, result) => {
         if (err) {
            req.ab.log("Error fetching app definitions:", err);
            return res.ab.error(err);
         }

         // Send response as JavaScript
         res.set("Content-Type", "text/javascript");
         res.set("Cache-Control", "max-age=31536000"); // Cache for 1 year
         res.send(`window.__ab_definitions=${result}`);
      }
   );
};
