/**
 * custom_reports/report.js
 *
 *
 * url:     get /report/:key
 * header:  X-CSRF-Token : [token]
 * params:
 */

var inputParams = {
   key: { string: true, required: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`custom_reports::report`);

   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams, true, {
         key: req.ab.param("key"),
      })
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   const jobData = {
      reportKey: req.ab.param("key"),
   };

   const data = req.allParams();
   delete data.key;
   jobData.data = data;
   // pass the request off to the uService:
   req.ab.serviceRequest("custom_reports.report", jobData, (err, results) => {
      if (err) {
         res.ab.error(err);
         return;
      }
      res.status("200");
      res.send(results);
   });
};
