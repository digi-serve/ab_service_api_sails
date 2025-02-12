/**
 * mobile/config-meta.js
 *
 *
 * url:     get /mobile/config/meta
 * header:  X-CSRF-Token : [token]
 * params:
 */

module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`mobile::config-meta`);

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
      "user_manager.config-meta",
      {},
      { stringResult: true },
      (err, results) => {
         if (err) {
            req.ab.log("Error fetching user_manager.config-meta:", err);
            res.ab.error(err);
            return;
         }
         // Send response as JavaScript
         res.set("Content-Type", "text/javascript");
         res.set("Cache-Control", "max-age=31536000"); // Cache for 1 year
         res.send(`window.__ab_config.meta=${results}`);
      }
   );
};
