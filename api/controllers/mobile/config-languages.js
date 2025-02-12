/**
 * mobile/config-languages.js
 *
 *
 * url:     get /mobile/config/languages/:appID
 * header:  X-CSRF-Token : [token]
 * params:
 */

module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`mobile::config-languages`);

   // verify your inputs are correct:
   // Handle the case where ?v=unknown (requested before login)
   const v = req.query.v;
   if (v === "unknown" || !(req.ab.validUser(/* false */))) {
      res.set("Content-Type", "text/javascript");
      res.set("Cache-Control", "max-age=31536000"); // Cache for 1 year
      res.send(`window.definitions=[]`);
      return;
   }

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "appbuilder.languages",
      {},
      { stringResult: true },
      (err, results) => {
         if (err) {
            req.ab.log("Error fetching appbuilder-languages:", err);
            res.ab.error(err);
            return;
         }
         // Send response as JavaScript
         res.set("Content-Type", "text/javascript");
         res.set("Cache-Control", "max-age=31536000"); // Cache for 1 year
         res.send(`window.__ab_config.languages=${results}`);
      }
   );
};
