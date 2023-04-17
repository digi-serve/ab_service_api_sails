/**
 * tenant_manager/tenant-add.js
 */

/**
 * @api {POST} /tenant/add Add
 * @apiPermission User
 * @apiGroup Tenant
 * @apiBody {string} key Short identifier for the tenant (no spaces)
 * @apiBody {string} title Full Tenant name
 * @apiBody {string="login", "okta", "cas"} authType Authentication method to use for the tenant's users
 * @apiBody {string} username Username for the new tenant's admin user (will be created)
 * @apiBody {string} password Password for the new admin user
 * @apiBody {string} email Email of the new admin user
 * @apiBody {string} url The tenants domain, must be a valid uri
 * @apiUse successRes
 */

var inputParams = {
   key: { string: true, required: true },
   title: { string: true, required: true },
   authType: { string: true, required: true },
   username: { string: true, required: true },
   password: { string: true, required: true },
   email: { string: { email: true }, required: true },
   url: { string: { uri: true }, required: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`tenant_manager::tenant-add`);

   // verify your inputs are correct:
   // false : prevents an auto error response if detected. (default: true)
   // valuesToCheck: {obj} a specified subset of the input values to validate.
   //    { [key] : [value] }
   //       [key] = inputParams[key] entry .
   //       [value] = req.param(value)
   //    if no values given, then req.allParams() are evaluated. In some cases
   //    you'll want to only require a certain subset of input values and then
   //    let the rest be evaluated by the destination service.
   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   let jobData = {};
   Object.keys(inputParams).forEach((k) => {
      jobData[k] = req.ab.param(k);
   });

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "tenant_manager.tenant-add",
      jobData,
      (err, results) => {
         if (err) {
            res.ab.error(err);
            return;
         }
         res.ab.success(results);
      }
   );
};
