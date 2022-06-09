/**
 * SiteController
 *
 * @description :: handle the initial request for the page load
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const async = require("async");
const path = require("path");

var hashTitles = {
   /* tenant.uuid : tenant.options.title */
};

module.exports = {
   // labelMissing: function (req, res) {
   //    console.log("!!!! LabelMissing !!!!");
   //    res.ab.success({ done: true });
   // },
   /**
    * get /
    * in cases where we are not embedded in another webpage, we can
    * return a default HTML container to load the AppBuilder in.
    */
   index: async function (req, res) {
      // req.ab.log("req.ab", req.ab);
      var title = "";
      if (hashTitles[req.ab.tenantID]) {
         title = hashTitles[req.ab.tenantID];
      }
      var tenantID = "";
      // {string} tenantID
      // the default tenantID the loaded AB_Runtime should be working with

      // if a tenant is set from our policies:
      if (req.ab.tenantSet()) {
         tenantID = `appbuilder-tenant="${req.ab.tenantID}"`;
      }
      // if a tenantID was set due to our route:  get /admin
      // then include that here (override the policies)
      if (req.options.useTenantID) {
         tenantID = `appbuilder-tenant="${sails.config.tenant_manager.siteTenantID}"`;
      }

      // defaultView specifies which portal_* view to default to.
      // normally it should show up in the work view
      let defaultView = `appbuilder-view="work"`;
      if (!req.ab.user) {
         // unless we are not logged in. then we show the login form:
         defaultView = `appbuilder-view="auth_login_form"`;
      }
      if (req.session?.defaultView) {
         defaultView = req.session.defaultView;
         req.ab.log(">>> PULLING Default View from Session");
      }

      res.view(
         // path to template: "views/site/index.ejs",
         { title, v: "2", layout: false, tenantID, defaultView }
      );
      return;
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
    * get /sails.io.js
    * return our common sails.io library.
    */
   sailsio: function (req, res) {
      var options = {
         root: path.join(__dirname, "..", "..", "assets", "dependencies"),
      };
      res.sendFile("sails.io.js", options, (err) => {
         if (err) {
            console.error(err);
         }
      });
   },

   /*
    * get /config
    * return the config data for the current request
    */
   config: function (req, res) {
      // we need to combine several config sources:
      // tenant: tenantManager.config (id:uuid)
      // user: userManager.config(id:uuid)
      // definitions: definitionManager.config(roles:user.roles);
      // labels: appbuilder.labels("en")

      var configDefinitions = null;
      // {array} [ {ABDefinition}, {ABDefinition}, ...]
      // The list of ABxxxx definitions to send to the Web client to create
      // the applications to display.

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

      var configSite = {
         relay: sails.config.relay?.enable ?? false,
      };
      console.log("configSite", configSite);
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
               Object.keys(req.ab.user).forEach((k)=>{
                  if (k.indexOf("__relation") > -1) return;
                  if (k.indexOf("AB") == 0) return;
                  if (k.indexOf("SITE") == 0) return;
                  userSimple[k] = req.ab.user[k];
               })

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
               var langCode = "en";
               if (req.ab.user) {
                  langCode = req.ab.user.languageCode;
               }

               var jobData = {
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
                           // Pull the Definitions for this user
                           (done) => {
                              var jobData = {
                                 roles: configUser.roles,
                              };

                              // pass the request off to the uService:
                              req.ab.serviceRequest(
                                 "definition_manager.definitionsForRoles",
                                 jobData,
                                 (err, results) => {
                                    if (err) {
                                       req.ab.log("error:", err);
                                       return;
                                    }
                                    configDefinitions = results;
                                    done();
                                 }
                              );
                           },

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
                  res.ab.success({
                     definitions: configDefinitions,
                     inbox: configInbox,
                     inboxMeta: configInboxMeta,
                     labels: configLabels,
                     site: configSite,
                     tenant: configTenant,
                     user: configUser,
                     meta: configMeta,
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
    * get /plugin/:key
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

      req.ab.log(`/plugin/${key}`);
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
      res.send("console.log('plugin request: login first');");
      // res.ab.error(new Error("no tenant set. Login first."));
   },
};
