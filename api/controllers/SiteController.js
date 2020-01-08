/**
 * SiteController
 *
 * @description :: handle the initial request for the page load
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const path = require("path");
module.exports = {
   /**
    * get /
    * in cases where we are not embedded in another webpage, we can
    * return a default HTML container to load the AppBuilder in.
    */
   index: async function(req, res) {
      // req.ab.log("req.ab", req.ab);
      res.view(
         // path to template: "views/site/index.ejs",
         { title: "site", v: "2" }
      );
      return;
   },

   /*
    * get /favicon.ico
    * determine which tenant's favicon.ico to return.
    */
   favicon: function(req, res) {
      res.redirect("/assets/tenant/adroit/favicon.ico");
   },

   /*
    * get /config
    * return the config data for the current request
    */
   config: function(req, res) {
      res.send({
         status: "success",
         data: {
            tenant: {
               id: req.ab.tenantID,
               options: {
                  textClickToEnter: "Click to Enter the AppBuilder"
               }
            }
         }
      });
   }
};