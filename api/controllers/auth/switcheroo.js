/**
 * auth/switcheroo.js
 * @apiDescription Validate a request to switcheroo to another user.
 *
 * @api {post} /auth/switcheroo/:userID Switcheroo
 * @apiGroup Auth
 * @apiPermission Switcheroo
 * @apiParam {string} userID user to switch to
 * @apiUse successRes
 * @apiSuccess (200) {object} data
 * @apiSuccess (200) {string} data.switcherooID user switched to
 */
var inputParams = {
   userID: { string: true, required: true },
};

module.exports = function (req, res) {
   req.ab.log("auth/switcheroo:");

   // verify your inputs are correct:
   // false : prevents an auto error response if detected. (default: true)
   if (
      !req.ab.validateParameters(inputParams /*, true, validateThis */) ||
      !req.ab.validSwitcheroo()
   ) {
      // an error message is automatically returned to the client
      // so be sure to return here;
      return;
   }

   let userID = req.ab.param("userID");

   req.ab.log(`setting swticherooID => ${userID}`);
   req.session.switcherooID = userID;

   res.ab.success({ switcherooID: userID });
};
