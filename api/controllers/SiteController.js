/**
 * SiteController
 *
 * @description :: handle the initial request for the page load
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const async = require("async");

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
      //     ??   .authType: {string}
      //     ??   .networkType: {string} the type of Network access to the server
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
               let userSimple = {};
               Object.keys(req.ab.user).forEach((k) => {
                  if (k.indexOf("__relation") > -1) return;
                  if (k.indexOf("AB") == 0) return;
                  if (k.indexOf("SITE") == 0) return;
                  userSimple[k] = req.ab.user[k];
               });

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
};
