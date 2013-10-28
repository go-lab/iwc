/*
Library to enable inter-widget communication between
two widgets (or iframes in general)
*/


/*
Whether or not postMessage is the communication channel that is to be used.

IWC events when using postMessage:
1. When the script is loaded, notify the parent (i.e., the container) that "I exist and
want to use iwc via postMessage".
2. When an event is published, broadcast the event to (1) the parent (container) and
(2) the parent's frames (all gadgets).
3. If a special event is received from the parent as a reply to 1. above, that says it
wants to handle broadcast of events to other frames, then in 2., skip (2).
4. When an event is received, then if the event is accepted (i.e., the callback returns
true), send a special event to the parent to notify it of the receipt.
*/


(function() {
  var doCallback, init, iwc, onMessage, ownData, usePostMessage;

  usePostMessage = typeof window !== "undefined" && typeof window.parent !== "undefined" && typeof window.postMessage !== "undefined" && typeof JSON !== "undefined" && typeof JSON.parse !== "undefined" && typeof JSON.stringify !== "undefined";

  if (!usePostMessage) {
    console.log("postMessage is not supported by your browser");
    return;
  }

  /*
  Initialization data received from the parent, with default values.
  */


  /*
  Whether events should only be sent to the parent or be broadcasted to both the
  parent and all the parent's frames.
  */


  init = {
    postParentOnly: false
  };

  /*
  Initialization data to be used when the parent does not take responsiblity for
  message propagation (the data will be set at the first call to "publish").
  */


  ownData = null;

  /*
  The callback function specified by a call to connect is kept here.
  */


  doCallback = null;

  /*
  The internal callback function that in turn calls doCallback is kept here.
  */


  onMessage = function(event) {
    var envelope, p, _results;
    if (typeof event.data === "string" && event.data.slice(0, 13) === "{\"IWCEvent\":{") {
      envelope = JSON.parse(event.data).IWCEvent;
      if (envelope.event === "iwc" && envelope.welcome === true && event.source === window.parent) {
        _results = [];
        for (p in envelope.message) {
          if (envelope.message.hasOwnProperty(p)) {
            _results.push(init[p] = envelope.message[p]);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      } else {
        envelope.source = event.source;
        envelope.origin = event.origin;
        envelope.toJSON = function() {
          var e, json;
          json = {};
          for (e in this) {
            if (this.hasOwnProperty(e) && typeof this[e] !== "function" && e !== "source" && e !== "origin") {
              json[e] = this[e];
            }
          }
          return json;
        };
        if (typeof doCallback === "function") {
          if (doCallback(envelope, envelope.message) === true) {
            return window.parent.postMessage(JSON.stringify({
              IWCEvent: {
                event: "iwc",
                receipt: true
              }
            }), "*");
          }
        }
      }
    }
  };

  if (typeof window.attachEvent !== "undefined") {
    window.attachEvent("onmessage", onMessage);
  } else {
    window.addEventListener("message", onMessage, false);
  }

  if (typeof window.parent !== "undefined") {
    window.parent.postMessage(JSON.stringify({
      IWCEvent: {
        event: "iwc",
        hello: true
      }
    }), "*");
  }

  iwc = {
    /*
    Sets the function to be called when an event has occurred. The callback function
    will be called as: callback(envelope, message)
    */

    connect: function(callback) {
      return doCallback = callback;
    },
    /*
    Stops calls from being made to the callback function set using connect(callback).
    */

    disconnect: function() {
      return doCallback = null;
    },
    /*
    Publishes an event. The message may be given either as envelope.message or as
    the second argument.
    */

    publish: function(envelope, message) {
      var data, frames, i, p, pair, pairs, query, _results;
      envelope.event = envelope.event || "select";
      envelope.sharing = envelope.sharing || "public";
      envelope.date = envelope.date || new Date();
      envelope.message = message || envelope.message;
      if (init.postParentOnly === false && ownData === null) {
        ownData = {
          sender: "unknown",
          viewer: "unknown"
        };
        if (typeof window.location !== "undefined" && typeof window.location.search === "string" && typeof window.unescape === "function") {
          pairs = window.location.search.substring(1).split("&");
          pair = void 0;
          query = {};
          if (!(pairs.length === 1 && pairs[0] === "")) {
            p = 0;
            while (p < pairs.length) {
              pair = pairs[p].split("=");
              if (pair.length === 2) {
                query[pair[0]] = window.unescape(pair[1]);
              }
              p++;
            }
          }
          if (typeof query.url === "string") {
            ownData.sender = query.url;
          }
        }
      }
      if (ownData !== null) {
        if (typeof ownData.sender === "string") {
          envelope.sender = ownData.sender;
        }
        if (typeof ownData.viewer === "string") {
          envelope.viewer = ownData.viewer;
        }
      }
      data = JSON.stringify({
        IWCEvent: envelope
      });
      if (window.parent !== "undefined") {
        window.parent.postMessage(data, "*");
        if (!init.postParentOnly) {
          frames = window.parent.frames;
          i = 0;
          _results = [];
          while (i < frames.length) {
            frames[i].postMessage(data, "*");
            _results.push(i++);
          }
          return _results;
        }
      } else {
        return window.postMessage(data, "*");
      }
    },
    /*
    Builds an object that can be dragged
    
    @opts Object containing possible additional options
      :dragstart - callback allows to send data to another widget,
          it should return the data that will be sent
    */

    draggable: function(elemId, opts) {
      var draggable;
      opts = opts || {};
      draggable = document.getElementById(elemId);
      return draggable.addEventListener("dragstart", function(ev) {
        var data;
        if (opts.dragstart) {
          data = opts.dragstart();
          return ev.dataTransfer.setData("IWCData", data);
        }
      });
    },
    /*
    Builds an object where data can be dropped
    
    @opts Object containing possible additional options
      :dragstart - callback allows to send data to another widget,
          it should return the data that will be sent
    */

    droppable: function(elemId, opts) {
      var target;
      opts = opts || {};
      target = document.getElementById(elemId);
      target.addEventListener("drop", function(ev) {
        var data;
        ev.preventDefault();
        data = ev.dataTransfer.getData("IWCData");
        $("#droparea").append($("<img src='" + data + "'/>"));
        return console.log("drop");
      });
      return target.addEventListener("dragover", function(ev) {
        ev.preventDefault();
        return console.log("dragover");
      });
    }
  };

  window.iwc = iwc;

}).call(this);
