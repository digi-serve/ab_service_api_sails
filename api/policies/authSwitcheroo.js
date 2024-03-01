/*
 * authSwitcheroo
 * Check to see if the current user is assigned a "switcheroo" id.  If so, then
 * we will impersonate that person for the remaining process.
 *
 */
const Cache = require("../lib/cacheManager");
module.exports = async function (req, res, next) {
   const switcherooID = req.session.switcherooID;
   req.ab.log(`Checking Switcheroo : ${switcherooID || "no switcheroo"}`);

   // if no switcheroo session ID has been set, then just continue:
   if (!switcherooID) {
      next();
      return;
   }
   try {
      let switchUser = Cache.AuthUser(req.ab.tenantID, switcherooID);
      if (!switchUser) {
         switchUser = await req.ab.serviceRequest("user_manager.user-find", {
            uuid: switcherooID,
         });

         if (!switchUser) {
            throw new Error("No user returned from user-find");
         }
      }
      req.ab.log("switcheroo user", switchUser);
      req.ab.switcherooToUser(switchUser);
      next();
      return;
   } catch (err) {
      req.ab.notify("developer", err, {
         context: "authSwitcheroo: error switching to user",
         switcherooID,
      });
      delete req.session.switcherooID;
      next();
   }
};
