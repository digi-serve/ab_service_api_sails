/**
 * relay/user-qr.js
 *
 *
 /** 
  * @api {GET} /relay/user-qr QR Code
  * @apiGroup Relay
  * @apiDescription Get a QR code to register the PWA
  * @apiPermission User
  * @apiSuccess (200) {image/png} image QR Code
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
