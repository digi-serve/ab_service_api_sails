/**
 * definition_manager/test-import.js
 * @apiDescription Import definitions from a file already on the server.
 *
 * @api {post} /test/import Import
 * @apiGroup Test
 * @apiPermission User
 * @apiBody {string} file path to the file on the server
 * @apiUse resDone
 */
var fs = require("fs");
var path = require("path");

var inputParams = {
   file: { string: true, required: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`definition_manager::test-import`);

   // if this isn't in the testing environment, 404!
   if (typeof process.env.AB_TESTING == "undefined") {
      return res.notFound();
   }

   // verify your inputs are correct:
   if (
      !(req.ab.validUser(/* false */)) ||
      !req.ab.validateParameters(inputParams /*, false , valuesToCheck*/)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   var file = req.ab.param("file");

   fs.readFile(path.join(process.cwd(), file), function (err, data) {
      if (err) {
         req.ab.notify.developer(err, {
            context: "api_sails::definition_manager.test-import.js",
            message: "error reading specified file.",
            file,
         });
         res.send({ status: "error" });
         //res.AD.error(err);
      } else {
         try {
            var json = JSON.parse(data.toString());

            // create a new job for the service
            let jobData = {
               json,
               longRequest: true, // Tell cote to wait longer as import takes time.
            };

            // pass the request off to the uService:
            req.ab.serviceRequest(
               "definition_manager.json-import",
               jobData,
               (err /*, results */) => {
                  if (err) {
                     req.ab.log("Error in json-import : ", err);
                     res.ab.error(err);
                     return;
                  }
                  res.ab.success({ done: true });
               }
            );
         } catch (err) {
            req.ab.log("json-import parse error", err);
            err.message = `json parse error : ${err.message}`;
            res.ab.error(err, 500);
         }
      }
   });
};
