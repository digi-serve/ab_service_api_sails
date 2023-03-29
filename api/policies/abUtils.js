/*
 * ABUtils
 * initialize a default req.ab data structure and utilities for use
 * in our policies and api end points.
 */

var AB = require("@digiserve/ab-utils");

//
// apiResponder
// Our api_sails cote responder. This is where we setup any service handlers
// that our api_sails is responsible for.
var apiResponder = null;

var broadcastRequiredFields = ["room", "event", "data"];
// {array[string]}
// a list of required fields each of our broadcast packets need to have.

module.exports = (req, res, next) => {
   req.session = req.session || {};
   req.ab = AB.reqApi(req, res, sails.config);
   res.ab = AB.resApi(req, res);
   req.ab.log(`${req.method} ${req.path}`);

   // setup our apiResponder :
   if (!apiResponder) {
      /**
       * Service: api.broadcast
       * broadcast changes to our (web) clients.
       * @param {array[json]} data
       *        An array of data packets to send. These packets should be in
       *        the format:
       *             .room : {string} the sails socket room to broadcast to
       *             .event : {string} the message key on the client
       *             .data : {json} the data packet sent to the client
       * @param {fn} cb
       *        a node style callback(err, data) for when this service is
       *        finished.
       */
      apiResponder = req.ab.serviceResponder("api.broadcast", (req, cb) => {
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
            console.log(`broadcasting: ${d.room} ${d.event}`);
            sails.sockets.broadcast(d.room, d.event, d.data);
         });

         if (errors.length > 0) {
            console.log(JSON.stringify(errors, null, 4));
            cb(errors);
            return;
         }

         cb(null);
      });
   }

   next();
};
