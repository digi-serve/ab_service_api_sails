/**
 * definitions/for-roles/
 *
 * @api {GET} /definition/myapps User Applications
 * @apiPermission none
 * @apiGroup Definition
 * @apiSuccess (200) {text/javascript} definitions script to add the app defintions
 */
module.exports = function (req, res) {
   // Package the Request and pass it off to the service
   req.ab.log(`definition_manager::definitionsForRoles`);

   // check for ?v=unknown  case where this is requested before a user is logged in:
   let v = req.param("v");
   if (v == "unknown") {
      // Send back an empty [] for definitions:

      res.set("Content-Type", "text/javascript");
      // Cache for 1 year (if definitons are changes this will be requested
      // with a new hash in the query param).
      res.set("Cache-Control", "max-age=31536000");
      res.send(`window.definitions=[]`);
      return;
   }

   // verify User is able to access service:
   if (!(req.ab.validUser(/* false */))) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   let jobData = {
      roles: req.ab.user.SITE_ROLE,
   };

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "definition_manager.definitionsForRoles",
      jobData,
      {
         stringResult: true,
      },
      (err, result) => {
         if (err) {
            console.log("err", err);
            res.ab.error(err);
            return;
         }
         // Send as JS
         res.set("Content-Type", "text/javascript");
         // Cache for 1 year (if definitons are changes this will be requested
         // with a new hash in the query param).
         res.set("Cache-Control", "max-age=31536000");
         res.send(`window.definitions=${result}`);
      }
   );
};
