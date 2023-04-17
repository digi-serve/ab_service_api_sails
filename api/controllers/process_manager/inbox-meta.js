/**
 * process_manager/inbox-meta.js
 * @apiDescription  Given a list of process ids, return a consolidated list of
 * application-processes necessary for the UI to create the Inbox accordion
 *
 * @api {post} /process/inbox/meta Inbox Metadata
 * @apiGroup Process
 * @apiPermission User
 * @apiBody {string[]} ids process ids
 * @apiUse successRes
 * @apiSuccess (200) {Object[]} data application and process metadata see example
 * @apiSuccessExample {json} 200
 * [{
 *   "id": "cbf95e19-805b-4793-8d27-56c0c8c9449e",
 *   "translations": [{
 *     "language_code": "en"
 *     "label": "Site Administration",
 *     "description": "Manage access to the web site for our users"
 *   }],
 *   "processes": [
 *     {
 *        "id": "24cb6b33-3ac5-432b-a4ad-c9ae7f12367a",
 *        "translations": [{
 *          "language_code": "en",
 *          "label": "approve new Role"
 *        }]
 *     }
 *   ]
 * }]
 */

var inputParams = {
   ids: { array: true, required: true },
   /*                -> NOTE: put .string  before .required                    */
   /*    "param": { required: true } // NOTE: param Joi.any().required();      */
   /*    "param": { optional: true } // NOTE: param Joi.any().optional();      */
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`process_manager::inbox-meta`);

   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   var jobData = {
      ids: req.ab.param("ids"),
   };

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "process_manager.inbox.meta",
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
