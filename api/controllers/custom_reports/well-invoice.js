/**
 * custom_reports/well-invoice.js
 *
 *
 * url:     get /custom_reports/well-invoice
 * header:  X-CSRF-Token : [token]
 * params:
 */

var inputParams = {
   payeeId: { string: true, required: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`custom_reports::well-invoice`);

   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   const jobData = {
      payeeId: req.ab.param("payeeId"),
   };

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "custom_reports.well-invoice",
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
