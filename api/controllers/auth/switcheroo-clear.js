/**
 * auth/switcherooClear.js
 * @apiDescription Remove a switcheroo assignment.
 *
 * @api {delete} /auth/switcheroo Switcheroo Clear
 * @apiGroup Auth
 * @apiPermission None
 * @apiUse successRes
 * @apiSuccess (200) {object} data
 * @apiSuccess (200) {boolean} data.success `true`
 */

module.exports = function (req, res) {
   req.ab.log("auth/switcheroo/clear:");

   // verify your inputs are correct:
   // false : prevents an auto error response if detected. (default: true)
   // if (!req.ab.validSwitcheroo()) {
   //    // an error message is automatically returned to the client
   //    // so be sure to return here;
   //    return;
   // }

   req.ab.log(`removing swticherooID => ${req.session.switcherooID}`);
   delete req.session.switcherooID;

   res.ab.success({ success: true });
};
