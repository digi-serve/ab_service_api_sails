/*
 * authTenant
 * attempt to resolve which tenant this route is trying to work with.
 */

var hashLookup = {
   /* urlPrefix : "tenantID", */
   /* "adroit"  : "adlkfjaldkfjasdlkfj", */
};

function isNumeric(n) {
   return !isNaN(parseFloat(n)) && isFinite(n);
}

// const URL = require("url");

module.exports = (req, res, next) => {
   // there are several ways a Tenant can be specified:
   // console.log();
   // console.log("--------------------");
   // console.log("authTenant: headers:", req.headers);
   // console.log("authTenant: cookie:", req.cookie);

   // - session: tenant_id:'aedasl;dkfjasdlkfj'
   if (req.session && req.session.tenant_id) {
      req.ab.log("authTenant -> session");
      req.ab.tenantID = req.session.tenant_id;
      next();
      return;
   }

   // - header: tenant-token: 'adslkfaldkfjaslk;jf'
   if (req.headers && req.headers["tenant-token"]) {
      req.ab.log("authTenant -> token");
      req.ab.tenantID = req.headers["tenant-token"];
      // Q: if they are using the tenant-token header, should we store that
      //    in session? or just let them continue with the header?
      // req.session.tenant_id = req.ab.tenantID;
      next();
      return;
   }

   // Treat localhost as admin for development.
   if (
      process.env.NODE_ENV != "production" &&
      (req.hostname == "localhost" || req.hostname == "127.0.0.1") &&
      !req.query.tenant
   ) {
      req.ab.log("authTenant -> req from localhost -> use admin tenant");
      req.ab.tenantID = "admin";
      next();
      return;
   }

   // - url: prefix :  http://fcf.baseurl.org
   //   once we resolve the url prefix, we will store the tenant id in the
   //   session.
   var urlHostname = req.headers["x-forwarded-host"] || req.hostname;

   // if we are proxied by NGINX:
   if (urlHostname == "api_sails") {
      if (req.headers.referer) {
         urlHostname = req.headers.referer;
      }
   }

   //var incomingURL = URL.parse(urlHostname);
   // console.log("incomingURL:", incomingURL);
   //if (incomingURL.hostname) {
   if (urlHostname) {
      //var parts = incomingURL.hostname.split(".");
      var parts = urlHostname.split(".");
      var prefix = parts.shift();

      //// DEV TESTING:
      if (process.env.NODE_ENV == "development" && req.query.tenant) {
         prefix = req.query.tenant;
      }
      //// uncomment the initConfig.js && index.ejs entries for these values
      //// to test url prefix route resolutions:
      // if (req.headers && req.headers["tenant-test-prefix"]) {
      //    prefix = req.headers["tenant-test-prefix"];
      // }
      //// DEV TESTING

      if (hashLookup[prefix]) {
         req.ab.log(`authTenant -> url:hashed (${prefix})`);
         req.ab.tenantID = hashLookup[prefix];
         // be sure to set the session:
         // req.session.tenant_id = req.ab.tenantID;
         next();
         return;
      }

      // should we try to perform a lookup by the prefix?
      if (!isNumeric(prefix)) {
         req.ab.log(`authTenant -> tenant_manager.find(${prefix})`);

         var jobData = {
            key: prefix,
         };

         req.ab.serviceRequest(
            "tenant_manager.find",
            jobData,
            (err, results) => {
               if (err) {
                  res.notFound(err);
                  return;
               }
               if (results && results.uuid) {
                  req.ab.log("   -> url:service");
                  hashLookup[prefix] = results.uuid;
                  req.ab.tenantID = results.uuid;
                  req.ab.log(
                     "authTenant ==> found tenant id: " + req.ab.tenantID
                  );
                  // req.session = req.session || {};

                  // be sure to set the session:
                  // req.session.tenant_id = req.ab.tenantID;

                  next();
                  return;
               }
               res.notFound(`We couldn't find the tenant '${prefix}'.`);
               return;
            }
         );
      } else {
         req.ab.log("authTenant -> no valid tenant options");
         // no Tenant ID known for this request
         res.notFound(`We couldn't find a valid tenant.`);
         return;
      }
   } else {
      req.ab.log("No hostname??");
      res.notFound(`We couldn't find a valid tenant.`);
   }
};
