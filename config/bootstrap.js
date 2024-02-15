/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

const AB = require("@digiserve/ab-utils");
const ReqAB = AB.reqApi({}, {}, {});
ReqAB.jobID = "api_bootstrap_loader";

function configTenant(list, cb) {
   if (list.length == 0) {
      return cb();
   }

   let tenant = list.shift();

   // make it look like we are making the request for this tenant:
   sails.request(
      {
         url: "get /config/site",
         headers: {
            "tenant-token": tenant.uuid,
         },
      },
      (err, data) => {
         if (err) {
            console.log(err);
            // return cb(err);
         }
      }
   );

   // rather than wait for the previous one to complete ...
   // I think the response type of this call isn't very compatible with
   // sails.request() ...  so we are just running the next every X seconds.
   setTimeout(() => {
      configTenant(list, cb);
   }, 1000);
}

module.exports.bootstrap = async function (done) {
   // let sails continue
   done();

   // 1) perform a manual healthcheck to establish our communications with
   // our services:
   // NOTE: sails.request() is considered an experimental feature. Keep an
   // eye on this.
   // https://sailsjs.com/documentation/reference/application/advanced-usage/sails-request
   sails.request("GET /healthcheck", (err, data) => {
      // 2) Pre-Cache the Various Site Config calls:
      ReqAB.serviceRequest("tenant_manager.config.list", {}, (err, results) => {
         let list = results || [];
         configTenant(list, (err) => {
            console.log("####################################################");
            console.log("###### Bootstrap Caching Site Config Complete ######");
            console.log("####################################################");
         });
      });
   });

   // attempt to pre-cache the different tenant site configs:

   // process.on("unhandledRejection", (reason, promise) => {
   //    console.log("::::: UNHANDLED REJECTION :::::");
   //    console.log(reason);
   // });

   // process.on("uncaughtException", (reason, promise) => {
   //    console.log("::::: uncaughtException :::::");
   //    console.log(reason);
   // });
};
