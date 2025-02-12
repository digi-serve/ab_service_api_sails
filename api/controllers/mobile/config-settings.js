/**
 * mobile/config-settings.js
 *
 *
 * url:     get /mobile/config/settings/:appID
 * header:  X-CSRF-Token : [token]
 * params:
 */

var inputParams = {
   appID: { string: true, required: true },
};

module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`mobile::config-settings`);

   // verify your inputs are correct:
   // false : prevents an auto error response if detected. (default: true)
   // valuesToCheck: {obj} a specified subset of the input values to validate.
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
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams, true, valuesToCheck)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   let jobData = {
      ID: valuesToCheck.appID,
   };

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "definition_manager.mobile-config-settings",
      jobData,
      { stringResult: true },
      (err, results) => {
         if (err) {
            req.ab.log("Error fetching mobile-config-settings:", err);
            res.ab.error(err);
            return;
         }
         // Send response as JavaScript
         res.set("Content-Type", "text/javascript");
         res.set("Cache-Control", "max-age=31536000"); // Cache for 1 year
         res.send(`window.__ab_config.settings=${results}`);
      }
   );
};
