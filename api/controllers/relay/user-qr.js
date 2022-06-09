/**
 * relay/user-qr.js
 *
 *
 * url:     get /relay/user-qr
 * header:  X-CSRF-Token : [token]
 * params:
 */

var inputParams = {};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`relay::user-qr`);

   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   let jobData = {};

   // pass the request off to the uService:
   req.ab.serviceRequest("relay.user-qr", jobData, (err, results) => {
      if (err) {
         res.ab.error(err);
         return;
      }
      res.set("Cache-Control", "max-age=0, no-cache;");
      res.set("Content-Type", "image/png");
      res.send(results);
   });
};
