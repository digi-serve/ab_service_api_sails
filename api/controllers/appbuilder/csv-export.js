/**
 * appbuilder/csv-export.js
 *
 *
 * url:     get /appbuilder/csv-export/:viewID
 * header:  X-CSRF-Token : [token]
 * params:
 */
/**
 * @api {get} /appbuilder/csv-export/:viewID CSV Export
 * @apiGroup AppBuilder
 * @apiPermission User
 * @apiParam {string} viewID
 * @apiQuery {string} [where]
 */

var inputParams = {
   viewID: { string: true, required: true },
   where: { string: true, optional: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`appbuilder::csv-export`);

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
   let jobData = {
      viewID: req.ab.param("viewID"),
      longRequest: true,
   };

   if (req.ab.param("where")) {
      try {
         jobData.where = JSON.parse(req.ab.param("where"));
      } catch (e) {
         req.ab.notify("developer", e, {
            context: "api_sails: convert where condition",
            where: req.ab.param("where"),
         });
      }
   }

   // pass the request off to the uService:
   req.ab.serviceRequest("appbuilder.csv-export", jobData, (err, results) => {
      if (err) {
         res.ab.error(err);
         return;
      }

      req.ab.performance.mark("csvQuery");
      req.ab.log("--> connecting to mysql");

      let outputFilename = results.fileName;

      let dataStore = sails.getDatastore("appbuilder");
      let tenantConn = {};
      Object.keys(dataStore.config).forEach((k) => {
         tenantConn[k] = dataStore.config[k];
      });
      tenantConn.database = results.tenantDB;

      let connection = dataStore.driver.mysql.createConnection(tenantConn);
      connection.connect();

      // NOTE: for streaming, do not send a callback
      req.ab.log(`appbuilder.csv-export: query to DB ${results.SQL}`);
      let query = connection.query(results.SQL);

      let hasErrored = false;

      // Set res header
      res.setHeader(
         "Content-disposition",
         `attachment; filename=${outputFilename}.csv`
      );

      // stream the results:
      query
         .on("error", (err) => {
            req.ab.notify("developer", err, {
               context: "api_sails: csv-export: error running sql",
               results,
            });
            res.ab.error(err);
            hasErrored = true;
         })
         .on("result", (row) => {
            // console.log(row);
            res.write(
               `${Object.values(row)
                  .map((r) => `"${r != null ? r : ""}"`) // To encode a quote, use "" to support , (comma) in text
                  .join(",")}\r\n`
            );
         })
         .on("end", () => {
            req.ab.performance.measure("csvQuery");
            req.ab.log("--> end connection.");
            if (!hasErrored) {
               res.end();
            }
            connection.end();
            req.ab.performance.log(["appbuilder.csv-export", "csvQuery"]);
         });
   });
};
