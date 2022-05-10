/**
 * custom_reports/well-receipt.js
 *
 *
 * url:     get /custom_reports/well-receipt
 * header:  X-CSRF-Token : [token]
 * params:
 */

var inputParams = {
   id: { string: true, required: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`custom_reports::well-receipt`);

   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   let jobData = {
      transactionId: req.ab.param("id"),
   };

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "custom_reports.well-receipt",
      jobData,
      (err, results) => {
         if (err) {
            res.ab.error(err);
            return;
         }
         res.status("200");
         res.send(results);
         // res.ab.success(results);
      }
   );
};
