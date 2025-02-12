/**
 * mobile/config-user.js
 *
 *
 * url:     get /mobile/config/user
 * header:  X-CSRF-Token : [token]
 * params:
 */

function UserSimple(req) {
   let simpleUser = {};

   Object.keys(req.ab.user).forEach((key) => {
      if (key.indexOf("__relation") > -1) return;
      if (key.indexOf("AB") == 0) return;
      if (key.indexOf("SITE") == 0) return;
      simpleUser[key] = req.ab.user[key];
   });
   return simpleUser;
}

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`mobile::config-user`);

   // verify your inputs are correct:
   // Handle the case where ?v=unknown (requested before login)
   const v = req.query.v;
   if (v === "unknown" || !(req.ab.validUser(/* false */))) {
      res.set("Content-Type", "text/javascript");
      res.set("Cache-Control", "max-age=31536000"); // Cache for 1 year
      res.send(`window.definitions=[]`);
      return;
   }

   // default to "en" labels
   let simpleUser = UserSimple(req);

   var jobData = {
      user: simpleUser,
   };

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "user_manager.config",
      jobData,
      { stringResult: true },
      (err, results) => {
         if (err) {
            req.ab.log("Error fetching appbuilder-labels:", err);
            res.ab.error(err);
            return;
         }
         // Send response as JavaScript
         res.set("Content-Type", "text/javascript");
         res.set("Cache-Control", "max-age=31536000"); // Cache for 1 year
         res.send(`window.__ab_config.user=${results}`);
      }
   );
};
