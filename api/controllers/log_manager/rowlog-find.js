/**
 * log_manager/rowlog-find.js
 * @apiDescription Request a series of log entries for the data managed by a specific ABObject.
 *
 * @api {get} /app_builder/object/:objID/track Find
 * @apiGroup Log
 * @apiPermission Builder
 * @apiUse objID
 * @apiQuery {string} [rowId] The specific {row} entry we are looking for
 * @apiQuery {string = insert, update, delete } [levelName] the type of entries
 * @apiQuery {string} [username] entries by a specific username
 * @apiQuery {date} [startDate] entries between a specific time frame
 * @apiQuery {date} [endDate] entries between a specific time frame
 * @apiQuery {number} [start] paging option
 * @apiQuery {number} [limit] paging option
 * @apiUse successRes
 * @apiSuccess (200) {object[]} data log enteries
 */

var inputParams = {
   objID: { string: { uuid: true }, required: true },
   rowId: { string: { uuid: true }, optional: true },
   // The specific {row} entry we are looking for.

   levelName: { string: true, optional: true },
   // the type of entries: [ insert, update, delete ]

   username: { string: true, optional: true },
   // entries by a specific username

   // entries between a specific time frame:
   startDate: { date: true, optional: true },
   endDate: { date: true, optional: true },

   // paging options:
   start: { number: { integer: true }, optional: true },
   limit: { number: { integer: true }, optional: true },
};

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`log_manager::rowlog-find`);

   if (
      !(req.ab.validUser(/* false */)) ||
      !(req.ab.validBuilder(/* false */)) ||
      !req.ab.validateParameters(inputParams /* , true, validateThis */)
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   // create a new job for the service
   let jobData = {
      objectID: req.ab.param("objID"),
      row: req.ab.param("rowId") || null,
      level: req.ab.param("levelName") || null,
   };
   // make sure we don't send the null values:
   if (!jobData.row) delete jobData.row;
   if (!jobData.level) delete jobData.level;

   // pull the rest of the optional values if provided.
   var matchingFields = ["username", "start", "limit", "startDate", "endDate"];
   matchingFields.forEach((m) => {
      var val = req.ab.param(m);
      if (val) {
         jobData[m] = val;
      }
   });

   // pass the request off to the uService:
   req.ab.serviceRequest("log_manager.rowlog-find", jobData, (err, results) => {
      if (err) {
         res.ab.error(err);
         return;
      }
      res.ab.success(results);
   });
};
