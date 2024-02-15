/**
 * file_processor/file-base64-upload.js
 *
 *
 * @api {post} /file/upload/base64/:objID/:fieldID Upload a Base64 Encoded File
 * @apiGroup File
 * @apiPermission User
 * @apiParam {uuid} objID
 * @apiParam {uuid} fieldID
 * @apiBody {string} file
 * @apiBody {uuid} fileID
 * @apiBody {string} fileName
 * @apiBody {string} type
 * @apiBody {string} uploadedBy
 * @apiUse successRes
 * @apiSuccess (200) {Object} data
 * @apiSuccess (200) {string} data.uuid
 */

const async = require("async");

var inputParams = {
   fieldID: { string: true, required: true },
   file: { string: true, required: true },
   fileID: { string: true, required: false },
   fileName: { string: true, required: true },
   objID: { string: true, required: true },
   type: { string: true, required: true },
   uploadedBy: { string: true, required: true },
};

module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service
   req.ab.log(`file_processor::file-base64-upload`);

   // verify your inputs are correct:
   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   const objID = req.ab.param("objID");
   // {uuid}
   // this will contain the uploaded file
   const fileID = req.ab.param("fileID") || null;
   // {uuid}
   // this will contain the uploaded file
   const fieldID = req.ab.param("fieldID");
   // {uuid}
   // this will contain the uploaded file
   const uploadedBy = req.ab.param("uploadedBy");
   // {string}
   // this is the owner of the file
   const type = req.ab.param("type");
   // {string}
   // this is the file type (image/png, image/jpeg, etc)
   const fileName = req.ab.param("fileName");
   // {string}
   // uuid+name+extension of uploaded file
   const file = req.ab.param("file");
   // {string}
   // this will contain the uploaded file
   async.series(
      [
         // 1) check if the file is oversized
         (next) => {
            var maxBytes = sails.config.file_processor.maxBytes || 10000000;
            // the file is one of the params: req.param('file')
            var fileData = Buffer.from(file, "base64");

            // check size of file
            if (fileData.length > maxBytes) {
               var err = new Error(
                  "File size exceeds maximum allowed: " + maxBytes
               );
               req.ab.notify.developer(err);
               next(err);
            } else {
               next();
            }
         },

         // 3) pass the job to the client
         () => {
            var jobData = {
               fileID,
               object: objID,
               field: fieldID,
               file, // raw base64 file
               type,
               fileName,
               uploadedBy,
            };

            // pass the request off to the uService:
            req.ab.serviceRequest(
               "file_processor.file-base64-upload",
               jobData,
               (err, results) => {
                  if (err != null) {
                     req.ab.log(
                        "api_sails:file_processor:file-base64-upload: error",
                        err
                     );
                     res.ab.error(err);
                     return;
                  }

                  res.ab.success(results);
               }
            );
         },
      ],
      (err /*, results */) => {
         // handle error reporting back to the client
         if (err) {
            req.ab.log(
               "api_sails:file_processor:file-base64-upload: error",
               err
            );
            res.ab.error(err);
         }
      }
   );
};
