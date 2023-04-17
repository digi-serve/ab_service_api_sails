/**
 * definition_manager/tenants-update-application.js
 *
 *
 * @api {post} /definition/tenants-update-application Update App accross Tenant
 * @apiGroup Definition
 * @apiPermission Builder
 * @apiBody {string} applicationUUID
 * @apiBody {number=0,1,2} state States { 0: create the file, 1: tranfer data of those keys, 2: done }
 * @apiBody {date} date
 * @apiBody {string} [data]
 * @apiUse successRes
 */

const path = require("path");
const fs = require("fs");

const inputParams = {
   applicationUUID: { string: true, required: true },
   // Use for split a definition json file in coming.
   // States { 0: create the file, 1: tranfer data of those keys, 2: done }.
   state: { number: { integer: true }, require: true },
   // Number of milli seconds
   date: { date: true, required: true },
   data: { string: true, optional: true },
   /*    "email": { string:{ email: { allowUnicode: true }}, required:true }   */
   /*                -> NOTE: put .string  before .required                    */
   /*    "param": { required: true } // NOTE: param Joi.any().required();      */
   /*    "param": { optional: true } // NOTE: param Joi.any().optional();      */
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`definition_manager::tenants-update-application`);

   // // if this isn't in the testing environment, 404!
   // if (typeof process.env.AB_TESTING == "undefined") {
   //    return res.notFound();
   // }

   // verify your inputs are correct:
   if (
      !(req.ab.validUser(/* false */)) ||
      !(req.ab.validBuilder(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   const applicationUUID = req.ab.param("applicationUUID");
   const state = req.ab.param("state");
   const date = req.ab.param("date");
   const data = req.ab.param("data");

   const pathStorage = path.join(
      sails.config.paths.tmp,
      "tenants_update_application"
   );

   if (!fs.existsSync(pathStorage)) {
      fs.mkdirSync(pathStorage);
   }

   const filename = path.join(
      pathStorage,
      `${date.toISOString()}_${applicationUUID}.json`
   );

   try {
      switch (state) {
         case 0:
            fs.writeFileSync(filename, data ?? "");

            res.ab.success({});

            break;

         case 1:
            if (!fs.existsSync(filename))
               throw Error(
                  'You need to the parameter "state: 0" before this state'
               );

            if (!data)
               throw Error(
                  'You need to send the parameters "data" on this state'
               );
            fs.appendFileSync(filename, data);
            res.ab.success({});

            break;

         case 2:
            // pass the request off to the uService:
            req.ab.serviceRequest(
               "definition_manager.tenants-update-application",
               // the parameter "jobData"
               {
                  applicationUUID,
                  data: require(filename),
                  longRequest: true, // Tell cote to wait longer as import takes time.
               },
               (error /*, results */) => {
                  if (error) {
                     req.ab.log("Error in tenants-update-application: ", error);
                     res.ab.error(error);

                     return;
                  }
                  res.ab.success({});
               }
            );

            break;

         default:
            throw Error(`We don't have the specific state ${state}`);
      }
   } catch (error) {
      if (fs.existsSync(filename)) fs.unlinkSync(filename);

      req.ab.log("tenants-update-application parse error", error);
      error.message = `Tranfer files error: ${error.message}`;
      res.ab.error(error, 500);
   }
};
