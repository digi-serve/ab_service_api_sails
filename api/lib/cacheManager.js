const AB = require("@digiserve/ab-utils");
const ReqAB = AB.reqApi({}, {}, {});
ReqAB.jobID = "api_cache_buster";
ReqAB.serviceResponder("api_sails.site-cache-stale", (req, cb) => {
   // Respond to warnings that our cached site configuration information is
   // no longer valid.

   // Things that breaks the cache:
   //    language
   //    tenants
   //    users
   //    scopes
   //    roles

   let tenantID = req.param("tenantID") ?? req.tenantID;

   console.log(":::::");
   console.log(`::::: site.cache.stale received for tenant[${tenantID}]`);
   console.log(":::::");

   if (tenantID == "all") {
      CachePreloaderSite = {};
      CachePreloaderSiteVersion = {};
   } else {
      delete CachePreloaderSite?.[tenantID];
      delete CachePreloaderSiteVersion?.[tenantID];
   }
   cb(null);
});

ReqAB.serviceResponder("api_sails.user-cache-stale", (req, cb) => {
   // Respond to warnings that our cached site configuration information is
   // no longer valid.

   let userUUID = req.param("userUUID");

   console.log(":::::");
   console.log(
      `::::: user.cache.stale received for tenant[${req.tenantID}]->user[${userUUID}]`
   );
   console.log(":::::");

   delete CacheAuthUser?.[req.tenantID]?.[userUUID];
   delete CachePreloaderUserVersion?.[req.tenantID]?.[userUUID];
   cb(null);
});

var CachePreloaderSite = {
   /* tenantID: { ConfigSite }, */
};

var CachePreloaderSiteVersion = {
   /* tenantID : "CurrentSiteConfigHash" */
};

var CachePreloaderUserVersion = {
   /* tenantID : {  user.uuid : "CurrentUserConfigHash" } */
};

var CacheAuthUser = {
   /* tenantID : { user.uuid : {user} } */
};

module.exports = {
   AuthUser: function (tenantID, userID, value) {
      if (typeof tenantID === "undefined") {
         return CacheAuthUser;
      }
      CacheAuthUser[tenantID] = CacheAuthUser[tenantID] || {};
      if (typeof value === "undefined") {
         return structuredClone(CacheAuthUser[tenantID][userID]);
      }
      CacheAuthUser[tenantID][userID] = structuredClone(value);
   },

   PreloaderSite: function (tenantID, config) {
      if (typeof config === "undefined") {
         return CachePreloaderSite[tenantID];
      }
      CachePreloaderSite[tenantID] = config;
   },

   PreloaderSiteVersion: function (tenantID, config) {
      if (typeof tenantID === "undefined") {
         return CachePreloaderSiteVersion;
      }
      if (typeof config === "undefined") {
         return CachePreloaderSiteVersion[tenantID];
      }
      CachePreloaderSiteVersion[tenantID] = config;
   },

   PreloaderUserVersion: function (tenantID, userID, value) {
      if (typeof tenantID === "undefined") {
         return CachePreloaderUserVersion;
      }
      if (typeof value === "undefined") {
         return CachePreloaderUserVersion[tenantID][userID];
      }
      CachePreloaderUserVersion[tenantID][userID] = value;
   },
};
