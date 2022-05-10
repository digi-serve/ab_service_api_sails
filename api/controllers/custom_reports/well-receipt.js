/**
 * custom_reports/well-receipt.js
 *
 *
 * url:     get /custom_reports/well-receipt
 * header:  X-CSRF-Token : [token]
 * params:
 */

var inputParams = {
   id: { string: true, required: true },
   /*    "email": { string:{ email: { allowUnicode: true }}, required:true }   */
   /*                -> NOTE: put .string  before .required                    */
   /*    "param": { required: true } // NOTE: param Joi.any().required();      */
   /*    "param": { optional: true } // NOTE: param Joi.any().optional();      */
};
// { key : {validationObj} }
//   key: the name of the input parameter passed into the api
//   {validationObj} : description of the validation rules
//        An object hash describing the validation checks to use. At
//        the top level the Hash is: { [paramName] : {ruleHash} }
//        Each {ruleHash} follows this format:
//        "parameterName" : {
//           {joi.fn}  : true,  // performs: joi.{fn}();
//            {joi.fn} : {
//              {joi.fn1} : true,   // performs: joi.{fn}().{fn1}();
//              {joi.fn2} : { options } // performs: joi.{fn}().{fn2}({options})
//            }
//            // examples:
//            "required" : {bool},  // default = false
//
//            // custom:
//            "validation" : {fn} a function(value, {allValues hash}) that
//                           returns { error:{null || {new Error("Error Message")} }, result: {normalize(value)}}
//         }
//        (see https://joi.dev/api)

// make sure our BasePath is created:
module.exports = function (req, res) {
   // Package the Find Request and pass it off to the service

   req.ab.log(`custom_reports::well-receipt`);

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
   let jobData = {
      transactionId: req.ab.param("id"),
      // param : req.ab.param("param");
      //         req.ab.param() : returns values that have passed validation
      //            and been normalized via the .validateParameters()
      // param2: req.param("param2")
      //         req.param()    : returns the raw values receive by sails.
   };

   // pass the request off to the uService:
   req.ab.serviceRequest(
      "custom_reports.well-receipt",
      jobData,
      (err, results) => {
         if (err) {
            res.ab.error(err);
            return;
         }
         res.status("200");
         res.send(results);
         // res.ab.success(results);
      }
   );
};
