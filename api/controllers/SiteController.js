/**
 * SiteController
 *
 * @description :: handle the initial request for the page load
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const async = require("async");
const Cache = require("../lib/cacheManager");
// const AB = require("@digiserve/ab-utils");
// const ReqAB = AB.reqApi({}, {}, {});
// ReqAB.jobID = "api_cache_buster";
// ReqAB.serviceResponder("api_sails.site-cache-stale", (req, cb) => {
//    // Respond to warnings that our cached site configuration information is
//    // no longer valid.

//    // Things that breaks the cache:
//    //    language
//    //    tenants
//    //    users
//    //    scopes
//    //    roles

//    let tenantID = req.tenantID;

//    console.log(":::::");
//    console.log(`::::: site.cache.stale received for tenant[${tenantID}]`);
//    console.log(":::::");

//    if (tenantID == "all") {
//       CachePreloaderSite = {};
//       CachePreloaderSiteVersion = {};
//    } else {
//       delete CachePreloaderSite[tenantID];
//       delete CachePreloaderSiteVersion[tenantID];
//    }
//    cb(null);
// });

// ReqAB.serviceResponder("api_sails.user-cache-stale", (req, cb) => {
//    // Respond to warnings that our cached site configuration information is
//    // no longer valid.

//    let userUUID = req.param("userUUID");

//    console.log(":::::");
//    console.log(
//       `::::: user.cache.stale received for tenant[${req.tenantID}]->user[${userUUID}]`
//    );
//    console.log(":::::");

//    delete CachePreloaderUserVersion[req.tenantID][userUUID];
//    cb(null);
// });

// var CachePreloaderSite = {
//    /* tenantID: { ConfigSite }, */
// };

// var CachePreloaderSiteVersion = {
//    /* tenantID : "CurrentSiteConfigHash" */
// };

// var CachePreloaderUserVersion = {
//    /* tenantID : {  user.uuid : "CurrentUserConfigHash" } */
// };

function UserSimple(req) {
   let sUser = {};

   Object.keys(req.ab.user).forEach((k) => {
      if (k.indexOf("__relation") > -1) return;
      if (k.indexOf("AB") == 0) return;
      if (k.indexOf("SITE") == 0) return;
      sUser[k] = req.ab.user[k];
   });
   return sUser;
}

module.exports = {
   // labelMissing: function (req, res) {
   //    console.log("!!!! LabelMissing !!!!");
   //    res.ab.success({ done: true });
   // },
   index: function (req, res) {
      // NGinx well send index.html from /home, but we go through sails for Authentication
      return res.redirect("/home");
   },

   /*
    * get /favicon.ico
    * determine which tenant's favicon.ico to return.
    */
   favicon: function (req, res) {
      var url;
      if (req.ab.tenantSet()) {
         url = `/assets/tenant/${req.ab.tenantID}/favicon.ico`;
      } else {
         url = "/assets/tenant/default/favicon.ico";
      }
      console.log("/favicon.ico : resolving to :" + url);
      res.redirect(url);
   },

   configInbox: async function (req, res) {
      var configInbox = null;
      // {array} [ {ABDefinition}, {ABDefinition}, ...]
      // The list of ABxxxx definitions to send to the Web client to create
      // the applications to display.

      var configInboxMeta = null;
      // {array} [ { appData}, ...]
      // Inbox items need a minimum set of Application / Process data to
      // display correctly.  It is possible a User might have an Inbox Item
      // related to an Application they do not have Rights to access, so we
      // need to send this data along with the configuration data.

      let user = req.ab.user;

      var jobData = {
         users: [user.username],
         roles: user.SITE_ROLE || [],
      };

      // pass the request off to the uService:
      await new Promise((done, error) => {
         req.ab.serviceRequest(
            "process_manager.inbox.find",
            jobData,
            (err, results) => {
               if (err) {
                  req.ab.log("error inbox.find:", err);
                  error(err);
                  return;
               }
               configInbox = results;
               // done();
               // now ask for the inbox Meta data
               var ids = results.map((r) => r.definition).filter((r) => r);
               req.ab.serviceRequest(
                  "process_manager.inbox.meta",
                  { ids },
                  (err, meta) => {
                     if (err) {
                        req.ab.log("error inbox.meta:", err);
                        error(err);
                        return;
                     }
                     configInboxMeta = meta;
                     done();
                  }
               );
            }
         );
      });

      res.ab.success({
         inbox: configInbox,
         inboxMeta: configInboxMeta,
      });
   },

   configSite: async function (req, res) {
      let config = Cache.PreloaderSite(req.ab.tenantID);
      if (!config) {
         await new Promise((resolve) => {
            req.ab.serviceRequest(
               "tenant_manager.config-site",
               { relay: sails.config.relay?.enable ?? false },
               {
                  stringResult: true,
               },
               (err, result) => {
                  if (err) {
                     return res.ab.error(err);
                  }

                  config = result;
                  Cache.PreloaderSite(req.ab.tenantID, config);
                  resolve();
               }
            );
         });
      }

      // Send as JS
      res.set("Content-Type", "text/javascript");
      // Cache for 1 year (if definitons are changed this will be requested
      // with a new hash in the query param).
      res.set("Cache-Control", "max-age=31536000");
      res.send(`window.__AB_Config=${config}`);
   },

   configUser: async function (req, res) {
      let user = null;
      if (req.ab.user) {
         // simplify the user data:
         let userSimple = UserSimple(req);

         var jobData = {
            user: userSimple,
         };
         await new Promise((resolve) => {
            req.ab.serviceRequest(
               "user_manager.config",
               jobData,
               {
                  stringResult: true,
               },
               (err, results) => {
                  if (err) {
                     return res.ab.error(err);
                  }

                  user = results;
                  resolve();
               }
            );
         });
      }
      // Send as JS
      res.set("Content-Type", "text/javascript");
      // Cache for 1 year (if definitons are changed this will be requested
      // with a new hash in the query param).
      res.set("Cache-Control", "max-age=31536000");
      res.send(`window.__AB_Config_User=${user}`);
   },

   // configUserReal: function (req, res) {
   //    let results = req.ab.isSwitcherood() ? req.ab.userReal : 0;

   //    // Send as JS
   //    res.set("Content-Type", "text/javascript");
   //    // Cache for 1 year (if definitons are changed this will be requested
   //    // with a new hash in the query param).
   //    // res.set("Cache-Control", "max-age=31536000");
   //    res.send(`window.__AB_Config_User_Real=${results}`);
   // },

   /*
    * get /config
    * return the config data for the current request
    */
   config: function (req, res) {
      // we need to combine several config sources:
      // tenant: tenantManager.config (id:uuid)
      // user: userManager.config(id:uuid)
      // labels: appbuilder.labels("en")

      var configInbox = null;
      // {array} [ {ABDefinition}, {ABDefinition}, ...]
      // The list of ABxxxx definitions to send to the Web client to create
      // the applications to display.

      var configInboxMeta = null;
      // {array} [ { appData}, ...]
      // Inbox items need a minimum set of Application / Process data to
      // display correctly.  It is possible a User might have an Inbox Item
      // related to an Application they do not have Rights to access, so we
      // need to send this data along with the configuration data.

      var configLabels = null;
      // {obj} { key: text }
      // The labels used by the web platform to display.  They will be in the
      // language of the user that is running this request.

      var configLanguages = null;
      // {obj} { key: text }
      // The languages defined in the current tenant for the site.

      var configSite = {
         relay: sails.config.relay?.enable ?? false,
      };
      // {obj} configSite
      // The information details for this site, used by the WEB platform to
      // process it's operation:
      //    .tenants: {array} of different Tenant options

      var configTenant = null;
      // {obj}
      // The configuration information for the CURRENT Tenant this request is
      // associated with.
      //    .id : {uuid}
      //    .options: {obj} Configuration Details for the current Tenant's
      //              operation.
      //    .options.authType: {string}
      //    .options.networkType: {string} the type of Network access to the server
      //    .title: {string}
      //    .clickTextToEnter: {string}

      var configUser = null;
      // {obj} configUser
      // The User information for the CURRENT User that is making this request.

      var configMeta = {};
      // {obj} configMeta
      // The Web platform also requires additional info about Roles/Scopes/Users
      // to function.
      // configMeta.roles : {array} of all SiteRoles
      // configMeta.scopes: {array} of all Scopes
      // configMeta.users : {array} of all users (just { username } )

      async.parallel(
         [
            (done) => {
               var jobData = {
                  uuid: req.ab.tenantID,
               };
               req.ab.log("/config jobData:", jobData);

               // pass the request off to the uService:
               req.ab.serviceRequest(
                  "tenant_manager.config",
                  jobData,
                  (err, results) => {
                     configTenant = results;
                     done(err);
                  }
               );
            },

            (done) => {
               // if a user isn't set, then just leave user:null
               if (!req.ab.user) {
                  done();
                  return;
               }

               // simplify the user data:
               let userSimple = UserSimple(req);

               var jobData = {
                  user: userSimple,
               };

               // pass the request off to the uService:
               req.ab.serviceRequest(
                  "user_manager.config",
                  jobData,
                  (err, results) => {
                     configUser = results;
                     done(err);
                  }
               );
            },

            (done) => {
               // pass the request off to the uService:
               req.ab.serviceRequest(
                  "tenant_manager.config.list",
                  {},
                  (err, results) => {
                     if (results) {
                        configSite.tenants = results;
                     }
                     done(err);
                  }
               );
            },

            (done) => {
               // default to "en" labels
               const langCode = req.ab.user?.languageCode ?? "en";

               const jobData = {
                  languageCode: langCode,
               };
               req.ab.log("label job data:", jobData);
               req.ab.log("user:", req.ab.user);

               // pass the request off to the uService:
               req.ab.serviceRequest(
                  "appbuilder.labels",
                  jobData,
                  (err, results) => {
                     configLabels = results;
                     done(err);
                  }
               );
            },

            (done) => {
               const jobData = {};

               // pass the request off to the uService:
               req.ab.serviceRequest(
                  "appbuilder.languages",
                  jobData,
                  (err, results) => {
                     configLanguages = results;
                     done(err);
                  }
               );
            },
         ],
         (err) => {
            if (err) {
               console.log(err);
               res.ab.error(err, 500);
               return;
            }

            Promise.resolve()
               .then(() => {
                  // if a user isn't set, then just leave user:null
                  if (!req.ab.user) {
                     return;
                  }

                  return new Promise((resolve, reject) => {
                     req.ab.log("configUser:", configUser);

                     async.parallel(
                        [
                           // Pull the Inbox Items for this User
                           (done) => {
                              var jobData = {
                                 users: [configUser.username],
                                 roles: configUser.roles,
                              };
                              // pass the request off to the uService:
                              req.ab.serviceRequest(
                                 "process_manager.inbox.find",
                                 jobData,
                                 (err, results) => {
                                    if (err) {
                                       req.ab.log("error inbox.find:", err);
                                       done(err);
                                       return;
                                    }
                                    configInbox = results;
                                    // done();
                                    // now ask for the inbox Meta data
                                    var ids = results
                                       .map((r) => r.definition)
                                       .filter((r) => r);
                                    req.ab.serviceRequest(
                                       "process_manager.inbox.meta",
                                       { ids },
                                       (err, meta) => {
                                          if (err) {
                                             req.ab.log(
                                                "error inbox.meta:",
                                                err
                                             );
                                             done(err);
                                             return;
                                          }
                                          configInboxMeta = meta;
                                          done();
                                       }
                                    );
                                 }
                              );
                           },

                           // Pull the Config-Meta data
                           (done) => {
                              req.ab.serviceRequest(
                                 "user_manager.config-meta",
                                 {},
                                 (err, results) => {
                                    if (err) {
                                       req.ab.log("error:", err);
                                       return;
                                    }
                                    configMeta = results;
                                    done();
                                 }
                              );
                           },
                        ],
                        (err) => {
                           if (err) {
                              reject(err);
                              return;
                           }
                           resolve();
                        }
                     );
                  });
               })
               .then(() => {
                  // Hotfix 11/30/22 These settings used to be added to our
                  // index.html but now we send that statically.
                  const settings = {};
                  settings["appbuilder-tenant"] = req.options.useTenantID //tenantID was set due to our route: get /admin
                     ? sails.config.tenant_manager.siteTenantID
                     : req.ab.tenantSet() //Tenant set from policies
                     ? req.ab.tenantID
                     : "";
                  // defaultView specifies which portal_* view to default to.
                  // normally it should show up in the work view
                  settings["appbuilder-view"] = "work";
                  if (!req.ab.user) {
                     // unless we are not logged in. then we show the login form:
                     settings["appbuilder-view"] = "auth_login_form";
                  }
                  if (req.session?.defaultView) {
                     let sessionView = req.session.defaultView;
                     if (/appbuilder-view="(.+)"/.test(sessionView)) {
                        sessionView = sessionView.match(
                           /appbuilder-view="(.+)"/
                        )[1];
                     }

                     settings["appbuilder-view"] = sessionView;
                     req.ab.log(">>> PULLING Default View from Session");
                  }

                  res.ab.success({
                     inbox: configInbox,
                     inboxMeta: configInboxMeta,
                     labels: configLabels,
                     languages: configLanguages,
                     site: configSite,
                     tenant: configTenant,
                     user: configUser,
                     userReal: req.ab.isSwitcherood() ? req.ab.userReal : 0,
                     meta: configMeta,
                     settings,
                  });
               })
               .catch((err) => {
                  // How did we get here?
                  req.ab.log(err);
                  res.ab.error(err);
                  req.ab.notify.developer(err, {
                     context: "Error gathering Configuration information",
                  });
               });
         }
      );
   },

   /*
    * get /plugin/:tenant/:key
    * return the proper path for the plugin requested for this Tenant.
    */
   pluginLoad: function (req, res) {
      var tenant = req.param("tenant");
      // {string} resolves to the current tenant the browser is requesting
      // the plugin for.
      // note: might be "??" if the browser didn't have a tenant set.

      var key = req.param("key");
      // {string} should resolve to the filename: {key}.js of the plugin
      // file to load.

      req.ab.log(`/plugin/${tenant}/${key}`);
      if (key.indexOf("ABDesigner.") == 0) {
         // ABDesigner is our common plugin for all Tenants.
         // We share the same tenant/default/ABDesigner.js file
         return res.redirect(`/assets/tenant/default/${key}`);
      }
      if (tenant != "??") {
         // Other plugins are loaded in reference to the tenant and
         // what they have loaded.
         let pluginSrc = `/assets/tenant/${tenant}/${key}`;
         req.ab.log(`loading plugin: ${pluginSrc}`);
         return res.redirect(pluginSrc);
      }
      req.ab.log(`no tenant set when requesting plugin ${key}`);
      res.send("plugin request: login first");
      // res.ab.error(new Error("no tenant set. Login first."));
   },

   preloader: async function (req, res) {
      let tenantID = req.ab.tenantSet() //Tenant set from policies
         ? req.ab.tenantID
         : "notKnown";

      let allLookups = [];

      let configSiteVersion;
      allLookups.push(
         cachedLookupSiteVersion(req).then((version) => {
            configSiteVersion = version;
         })
      );

      let configUserVersion;
      let configMyAppsVersion;
      if (!req.ab.user) {
         // if we are not logged in: we don't need to perform lookups:
         configUserVersion = "unknown";
         configMyAppsVersion = "unknown";
      } else {
         allLookups.push(
            cachedLookupUserVersion(req).then((version) => {
               configUserVersion = version;
            })
         );

         if (req.ab.isSwitcherood()) {
            // should be a unique enough to bust the cache
            configMyAppsVersion = req.ab.jobID;
         } else {
            allLookups.push(
               lookupMyAppVersion(req).then((version) => {
                  configMyAppsVersion = version;
               })
            );
         }
      }

      let configUserRealData = req.ab.isSwitcherood() ? req.ab.userReal : 0;

      // @TODO: we still haven't setup a way to assign Plugins to Roles.
      // So for now we are manually adding ABDesigner.js.
      // only add if they have 1 of our Builder Related Roles:

      let pluginList = [];
      const builderRoles = [
         "6cc04894-a61b-4fb5-b3e5-b8c3f78bd331",
         "e1be4d22-1d00-4c34-b205-ef84b8334b19",
      ];
      let roles = req.ab.user?.SITE_ROLE ?? [];
      if (roles.filter((r) => builderRoles.indexOf(r.uuid) > -1).length > 0) {
         pluginList.push("/assets/tenant/default/ABDesigner.js");
      }

      if (pluginList.length == 0) {
         pluginList = "";
      } else {
         pluginList = `"${pluginList.join('","')}"`;
      }

      await Promise.all(allLookups);

      res.view("web_preloader.ejs", {
         layout: false,
         tenantID,
         configUserRealData,
         configSiteVersion,
         configUserVersion,
         configMyAppsVersion,
         pluginList,
      });
   },
};

async function cachedLookup(req, Hash, keyHash, jobData, keyRequest) {
   if (!Hash[keyHash]) {
      await new Promise((resolve, reject) => {
         req.ab.serviceRequest(keyRequest, jobData, (err, results) => {
            if (err) {
               req.ab.log("error:", err);
               reject(err);
               return;
            }

            Hash[keyHash] = results;
            resolve();
         });
      });
   }

   return Hash[keyHash];
}

async function cachedLookupSiteVersion(req) {
   let tenantID = req.ab.tenantSet() //Tenant set from policies
      ? req.ab.tenantID
      : "notKnown";

   return await cachedLookup(
      req,
      Cache.PreloaderSiteVersion(),
      tenantID,
      {},
      "tenant_manager.config-site-version"
   );
}

async function cachedLookupUserVersion(req) {
   let tenantID = req.ab.tenantSet() //Tenant set from policies
      ? req.ab.tenantID
      : "notKnown";

   let CachePreloaderUserVersion = Cache.PreloaderUserVersion();
   CachePreloaderUserVersion[tenantID] =
      CachePreloaderUserVersion[tenantID] || {};
   let UserCache = CachePreloaderUserVersion[tenantID];

   return await cachedLookup(
      req,
      UserCache,
      req.ab.user?.uuid || "unknown",
      { user: req.ab.user },
      "user_manager.config-user-version"
   );
}

async function lookupMyAppVersion(req) {
   let version;
   await new Promise((resolve, reject) => {
      req.ab.serviceRequest(
         "definition_manager.definitions-check-update",
         {},
         (err, results) => {
            if (err) {
               req.ab.log("error:", err);
               reject(err);
               return;
            }

            version = results;
            resolve();
         }
      );
   });
   return version;
}
