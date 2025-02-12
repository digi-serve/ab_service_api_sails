/**
 * mobile/preloader.js
 * @apiDescription Respond with the preloader of the Mobile PWA
 *
 * @api {get} /mobile/preloader/:tenantID/:appID
 * @apiParam {uuid} tenantID
 * @apiParam {uuid} appID
 * @apiGroup Mobile
 * @apiPermission None
 * @apiSuccess (200) {HTML} html
 */

var inputParams = {
   appID: { string: true, required: true },
};

module.exports = async function (req, res) {
   req.ab.log("mobile/preloader():");

   var validationParams = Object.keys(inputParams);

   var valuesToCheck = {};
   (validationParams || []).forEach((p) => {
      valuesToCheck[p] = req.param(p);
   });
   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams, true, valuesToCheck)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   let configUserRealData = req.ab.isSwitcherood() ? req.ab.userReal : 0;

   let configMyAppsVersion;
   if (!req.ab.user) {
      // if we are not logged in: we don't need to perform lookups:
      configMyAppsVersion = "unknown";
   } else {
      if (req.ab.isSwitcherood()) {
         // should be a unique enough to bust the cache
         configMyAppsVersion = req.ab.jobID;
      } else {
         try {
            configMyAppsVersion = await lookupMyAppVersion(req);
         } catch (err) {
            req.ab.log("Error fetching app version:", err);
            configMyAppsVersion = "error"; // Fallback to avoid breaking the view
         }
      }
   }

   let pluginList = "";

   let tsConfigSettings = configMyAppsVersion;
   // {timestamp}
   // these settings come from the Application definitions, so we borrow the
   // timestamp from our definitions as the settings here.

   let tsConfigLabels = configMyAppsVersion;
   // {timestamp}
   // these settings come from the Application definitions, so we borrow the
   // timestamp from our definitions as the settings here.

   let tsConfigLanguages = configMyAppsVersion;
   // {timestamp}
   // these settings come from the Application definitions, so we borrow the
   // timestamp from our definitions as the settings here.

   let tsConfigUser = new Date(req.ab.user.updated_at).getTime();
   // {timestamp}
   // The user setting wont change until a new .updated_at is set.

   // NOTE: the following are pulled in because they were needed in the
   // web platform.  It's possible they are not needed in the PWA.
   // We should review and remove if not needed.

   let tsMeta = configMyAppsVersion;
   // {timestamp}
   // @todo: when should this be updated? Roles, Scopes, permissions, etc.
   // NOTE: This might not be needed in PWA, it was pulled from web platform
   // that also needed this for ABDesigner.

   let tsTenants = configMyAppsVersion;
   // {timestamp}
   // @todo: when should this be updated? Site Tenant Information
   // NOTE: This might not be needed in PWA, it was pulled from web platform
   // that also needed this for ABDesigner.

   res.type("text/javascript");
   res.view("pwa_preloader.ejs", {
      layout: false,
      configUserRealData,
      configMyAppsVersion,
      pluginList,
      appID: valuesToCheck.appID,
      tsConfigSettings,
      tsConfigLabels,
      tsConfigLanguages,
      tsConfigUser,
      tsMeta,
      tsTenants,
   });

   if (req.ab && req.ab.performance) {
      req.ab.performance.log();
   }
};

function lookupMyAppVersion(req) {
   return new Promise((resolve, reject) => {
      let appID = req.param("appID");
      req.ab.serviceRequest(
         "definition_manager.definitions-mobile-check-update",
         { appID },
         (err, results) => {
            if (err) {
               req.ab.log("error:", err);
               reject(err);
               return;
            }
            resolve(results);
         }
      );
   });
}
