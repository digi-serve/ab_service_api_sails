/**
 * @broadcastManager
 * This is where we manage how and to who we are broadcasting our realtime updates.
 *
 * In this iteration of our RT Updates, users will only get updates on data THEY
 * have requested / created.
 *
 * Users should only get 1 update for a particular change, not multiple.
 *
 * How Broadcast Update work now:
 *
 * when a user performs a model_get request, our api_sails controller will register
 * the user's current request object with us: BroadcastManager.register(req);
 *
 * when the appbuilder.model_get handler is ready to respond, it will first
 * perform a .serviceRequest("api_sais.broadcastRegister", [IDs]) with an array
 * of all the IDs of the rows being returned.
 *
 * Our handler will then register the user's req with a {tenantID}-{ID} socket
 * room.
 *
 * the appbuilder.model_get handler will return it's data, and before our
 * api_sails.model_get controller resolves, it will then BroadcastManager.unregister(req)
 * the current connection.
 *
 * When future Broadcasts are sent out, they will be sent to {tenantID}-{ID} rooms
 * and those connected sockets will get the updates.
 */
const CurrentUserRequests = {
   /* username : { sails.req } */
};
// Keep track of the currently active req objects that are awaiting a broadcast-register

const CurrentSocketUsers = {
   /* socket.id : username */
};
// keep track of which user in the system is related to a socket

var broadcastRequiredFields = ["room", "event", "data"];
// {array[string]}
// a list of required fields each of our broadcast packets need to have.

const AB = require("@digiserve/ab-utils");
const ReqAB = AB.reqApi({}, {}, {});
ReqAB.jobID = "api_broadcast_manager";

const MetricManager = require("./metricManager");
MetricManager.setIntervalToReset(60);

/**
 * @event api.broadcast
 * This event is for our Appbuilder Model operations (create, update, delete)
 * to notify our connected clients of changes to data they have loaded.
 */
ReqAB.serviceResponder("api.broadcast", (req, cb) => {
   var data = req.param();
   if (!Array.isArray(data)) {
      data = [data];
   }
   var errors = [];
   data.forEach((d) => {
      var errMsg = false;
      broadcastRequiredFields.forEach((f) => {
         if (!d[f]) {
            if (!errMsg) {
               errMsg = `data packet missing field: ${f}`;
            } else {
               errMsg = `${errMsg}, ${f}`;
            }
         }
      });
      if (errMsg) {
         errors.push({ message: errMsg, packet: data });
         return;
      }
      req.log(`::::: BroadcastManager:  broadcasting: ${d.room} ${d.event}`);

      // create a hash of the individual sockets we will collect from our rooms
      let socketList = {
         /* socket.id : {Socket} */
      };

      // pull the Sockets from the main d.room
      // let RoomSockets = sails.io.sockets.in(d.room); // THIS retrieves ALL client sockets.
      // console.log(
      //    `NUMBER OF SOCKETS: ${Object.keys(RoomSockets.sockets).length} ${
      //       d.event
      //    } ${d.room}`
      // );
      let RoomSockets = sails.io.sockets.adapter.rooms?.[d.room] ?? {
         sockets: {},
      };

      Object.keys(RoomSockets.sockets).forEach((id) => {
         socketList[id] = RoomSockets.sockets[id];
      });

      // now check the copyTo rooms and pull those sockets
      if (d.copyTo?.length > 0) {
         d.copyTo.forEach((r) => {
            req.log(
               `::::: BroadcastManager:  broadcasting copyTo: ${r} ${d.event}`
            );
            RoomSockets = sails.io.sockets.in(r);
            Object.keys(RoomSockets.sockets).forEach((id) => {
               socketList[id] = RoomSockets.sockets[id];
            });
            // sails.sockets.broadcast(r, d.event, d.data);
         });
      }

      let socketListLength = Object.keys(socketList).length;

      // It is possible for a client to have > 1 socket connection. We only
      // want to send 1 message to a client, so let's try to resolve socket.id
      // to users, and then just send to each user:

      let userList = {
         /* userID : socket.id */
         "*": [], // "*" is a catch all for sockets that don't resolve to users
      };
      Object.keys(socketList).forEach((id) => {
         let user = CurrentSocketUsers[id];
         if (user) {
            // TODO: verify socketList[id] is still connected and valid before
            userList[user] = id; // just replace with the last one
         } else {
            userList["*"].push(id);
         }
      });

      let reducedSocketList = {};
      Object.keys(userList).forEach((user) => {
         if (user != "*") {
            let id = userList[user];
            reducedSocketList[id] = socketList[id];
         }
      });
      userList["*"].forEach((id) => {
         reducedSocketList[id] = socketList[id];
      });

      let reducedSocketListLength = Object.keys(reducedSocketList).length;
      if (reducedSocketListLength < socketListLength) {
         req.log(
            `::::: BroadcastManager:  reducedSocketList length: ${socketListLength} -> ${reducedSocketListLength}`
         );
      }

      // now step through the reducedSocketList and send each of them a message:
      Object.keys(reducedSocketList).forEach((id) => {
         // Log to Prometheus server
         MetricManager.logSocketPayload({
            event: d.event,
            data: d.data,
         });

         sails.sockets.broadcast(id, d.event, d.data);
      });
   });
   if (errors.length > 0) {
      console.log(JSON.stringify(errors, null, 4));
      cb(errors);
      return;
   }
   cb(null);
});

/**
 * @event api_sails.broadcast-register
 * This event is for our Appbuilder Model operations (get, create)
 * to notify us of specific Data Entries (id) that a connected user
 * is interested in.
 */
ReqAB.serviceResponder("api.broadcast-register", (req, cb) => {
   let IDs = req.param("ID") || [];

   req.log(`::::: BroadcastManager received for IDs[${IDs.length}]`);
   let user = req.user;
   if (req.userReal) {
      user = req.userReal;
   }
   if (!user) {
      req.log("::::: BroadcastManager: Unable to find User entry:", req);
      return cb(null);
   }
   let userReq = CurrentUserRequests[user.username]?.req;
   if (!userReq) {
      req.log(
         `::::: BroadcastManager: could not find userReq entry for provided user[${user.username}]`
      );
      req.log(
         `::::: BroadcastManager: Keys:${Object.keys(CurrentUserRequests)}`
      );
      cb(null);
      return;
   }
   IDs.forEach((id) => {
      const userRoom = userReq.ab.socketKey(id);
      sails.sockets.join(userReq, userRoom);
   });
   cb(null);
});

module.exports = {
   register: function (req) {
      // NOTE: req here is from our sails controllers, so req.ab has our
      // user info:

      // we make sure to use the switcheroo'd user since the actual
      // user might also be using the site, and we don't want to
      // confuse the two different sockets.
      let user = req.ab.user;
      if (req.ab.isSwitcherood()) {
         user = req.ab.userReal;
      }
      // req.ab.log(`1111111 registering user request [${user.username}]`);
      if (!CurrentUserRequests[user.username]) {
         CurrentUserRequests[user.username] = {
            c: 0,
            req,
         };
      }
      CurrentUserRequests[user.username].c++;
      CurrentUserRequests[user.username].req = req;
      // req.ab.log(`1111111 Keys: ${Object.keys(CurrentUserRequests)}`);

      // now connect the current user to their socket.id
      let socketID = sails.sockets.getId(req);
      CurrentSocketUsers[socketID] = user.username;
   },

   unregister: function (req) {
      // NOTE: req here is from our sails controllers, so req.ab has our
      // user info:

      // we make sure to use the switcheroo'd user since the actual
      // user might also be using the site, and we don't want to
      // confuse the two different sockets.
      let user = req.ab.user;
      if (req.ab.isSwitcherood()) {
         user = req.ab.userReal;
      }
      // req.ab.log("222222222 removing user request ", user, user.username);
      let entry = CurrentUserRequests[user.username];
      if (entry) {
         // req.ab.log("222222222 entry found");
         entry.c--;

         if (entry.c <= 0) {
            // req.ab.log("222222222 entry DELETED");
            delete CurrentUserRequests[user.username];
         }
         // req.ab.log(`222222222 Keys: ${Object.keys(CurrentUserRequests)}`);
      }
   },
};
