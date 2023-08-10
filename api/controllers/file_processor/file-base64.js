/**
 * file_processor/file-base64.js
 *
 *
 * @api {get} /file/:ID/base64 Get a File as base64
 * @apiGroup File
 * @apiPermission User
 * @apiParam {string} ID file uuid
 * @apiQuery {boolean} mobile whether to reutrn downscaled images for mobile
 * @apiUse successRes
 * @apiSuccess (200) {Object} data
 * @apiSuccess (200) {string} data.image base64
 */

var inputParams = {
   ID: { string: { uuid: true }, required: true },
   mobile: { boolean: true },
};

module.exports = async function (req, res) {
   req.ab.log(`file_processor::file-base64`);

   // verify your inputs are correct:
   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   const jobData = { uuid: req.ab.param("ID") };
   const mobile = req.ab.param("mobile");
   if (mobile) jobData.mobile = mobile;

   req.ab.log(jobData);

   // pass the request off to the service:
   try {
      const result = await req.ab.serviceRequest(
         "file_processor.file-base64",
         jobData
      );
      return res.ab.success(result);
   } catch (err) {
      return res.ab.error(err);
   }
};
