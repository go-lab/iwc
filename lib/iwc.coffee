###
Library to enable inter-widget communication between
two widgets (or iframes in general)
###

###
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
###
usePostMessage = typeof window isnt "undefined" and typeof window.parent isnt "undefined" and typeof window.postMessage isnt "undefined" and typeof JSON isnt "undefined" and typeof JSON.parse isnt "undefined" and typeof JSON.stringify isnt "undefined"

if not usePostMessage
  console.log "postMessage is not supported by your browser"
  return

###
Initialization data received from the parent, with default values.
###

###
Whether events should only be sent to the parent or be broadcasted to both the
parent and all the parent's frames.
###
init = postParentOnly: false

###
Initialization data to be used when the parent does not take responsiblity for
message propagation (the data will be set at the first call to "publish").
###
ownData = null

###
The callback function specified by a call to connect is kept here.
###
doCallback = null

###
The internal callback function that in turn calls doCallback is kept here.
###
onMessage = (event) ->
  if typeof event.data is "string" and event.data.slice(0, 13) is "{\"IWCEvent\":{"
    envelope = JSON.parse(event.data).IWCEvent
    if envelope.event is "iwc" and envelope.welcome is true and event.source is window.parent
      for p of envelope.message
        init[p] = envelope.message[p]  if envelope.message.hasOwnProperty(p)
    else
      envelope.source = event.source
      envelope.origin = event.origin
      envelope.toJSON = ->
        json = {}
        for e of this
          json[e] = this[e]  if @hasOwnProperty(e) and typeof this[e] isnt "function" and e isnt "source" and e isnt "origin"
        json

      if typeof doCallback is "function"
        if doCallback(envelope, envelope.message) is true
          window.parent.postMessage JSON.stringify(IWCEvent:
            event: "iwc"
            receipt: true
          ), "*"

if typeof window.attachEvent isnt "undefined"
  window.attachEvent "onmessage", onMessage
else
  window.addEventListener "message", onMessage, false
if typeof window.parent isnt "undefined"
  window.parent.postMessage JSON.stringify(IWCEvent:
    event: "iwc"
    hello: true
  ), "*"

# object that contains public functions
iwc =
  ###
  Sets the function to be called when an event has occurred. The callback function
  will be called as: callback(envelope, message)
  ###
  connect: (callback) ->
    doCallback = callback


  ###
  Stops calls from being made to the callback function set using connect(callback).
  ###
  disconnect: ->
    doCallback = null


  ###
  Publishes an event. The message may be given either as envelope.message or as
  the second argument.
  ###
  publish: (envelope, message) ->
    envelope.event = envelope.event or "select"
    envelope.sharing = envelope.sharing or "public"
    envelope.date = envelope.date or new Date()
    envelope.message = message or envelope.message

    if init.postParentOnly is false and ownData is null
      ownData =
        sender: "unknown"
        viewer: "unknown"

      if typeof window.location isnt "undefined" and typeof window.location.search is "string" and typeof window.unescape is "function"
        pairs = window.location.search.substring(1).split("&")
        pair = undefined
        query = {}
        unless pairs.length is 1 and pairs[0] is ""
          p = 0

          while p < pairs.length
            pair = pairs[p].split("=")
            query[pair[0]] = window.unescape(pair[1])  if pair.length is 2
            p++
        ownData.sender = query.url  if typeof query.url is "string"
    if ownData isnt null
      envelope.sender = ownData.sender  if typeof ownData.sender is "string"
      envelope.viewer = ownData.viewer  if typeof ownData.viewer is "string"
    data = JSON.stringify(IWCEvent: envelope)
    if window.parent isnt "undefined"
      window.parent.postMessage data, "*"
      unless init.postParentOnly
        frames = window.parent.frames
        i = 0

        while i < frames.length
          frames[i].postMessage data, "*"
          i++
    else
      window.postMessage data, "*"

  ###
  Builds an object that can be dragged

  @opts Object containing possible additional options
    :dragstart - callback allows to send data to another widget,
        it should return the data that will be sent
  ###
  draggable: (elemId, opts) ->
    opts = opts || {}

    # find object node in DOM
    draggable = document.getElementById(elemId)

    draggable.addEventListener "dragstart", (ev) ->
      if opts.dragstart
        data = opts.dragstart()
        ev.dataTransfer.setData "IWCData", data

  ###
  Builds an object where data can be dropped

  @opts Object containing possible additional options
    :dragstart - callback allows to send data to another widget,
        it should return the data that will be sent
  ###
  droppable: (elemId, opts) ->
    opts = opts || {}

    # find object node in DOM
    target = document.getElementById(elemId)

    target.addEventListener "drop", (ev) ->
      ev.preventDefault()
      data = ev.dataTransfer.getData("IWCData")
      $("#droparea").append $("<img src='" + data + "'/>")
      console.log "drop"

    target.addEventListener "dragover", (ev) ->
      ev.preventDefault()
      console.log "dragover"


# attache iwc to the window object
window.iwc = iwc
