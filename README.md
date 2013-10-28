Inter Widget Communication with Drag&Drop
===

Enables the inter widget communication and drag and drop between widgets
within a widget container.

## How to start
Check test/index.html as an example
or
see widgets in action here:
[https://graasp.epfl.ch/#url=iwc](https://graasp.epfl.ch/#url=iwc)


## Description

Widgets are often rendered as iframes inside a widget container. The
library allows a widget to broadcast messages to other widgets open on
the page. In addition, an object can be brought from one widget to
another with drag and drop.

## Example 1: send data from one widget to another

    // require the iwc library in both src and dest widgets
    <script type="text/javascript" src="http://graasp.epfl.ch/gadget/libs/iwc.min.js"></script>

    // ------- Source gadget --------
    // send some data
    iwc.publish({
      event: "select",
      type: "json",
      message: {
        data: "some text"
      }
    })

    // ------- Destination gadget --------
    // start listenning on incoming events
    iwc.connect(function (envelope, message) {
      var data = message.data
      console.log(data)
    }


## Example 2: drag&drop from one widget to another

    // require the iwc library in both src and dest widgets
    <script type="text/javascript" src="http://graasp.epfl.ch/gadget/libs/iwc.min.js"></script>

    // ------- Source gadget --------
    // 'dragme' - id of the DOM node that can be dragged
    iwc.draggable('dragme', {
      // function should return the data that you want to transfer
      dragstart: function () {
        return "my data"
      }
    })

    // ------- Destination gadget --------
    // 'droparea' - id of the DOM node that accepts draged elements
    iwc.droppable('droparea', {
      drop: function (data) {
        // data - that was passed during the drop
      }
    })

## APIs
### Inter widget communication

    // start listenning on incoming events
    iwc.connect(function (envelope, message) {
      // envelope - contains extra info about the event  
      // message - object passed from one widget to another
    })

    // broadcasts event to other widgets
    iwc.publish({
      event: "select",       // type of event: select, click, etc.
      type: "json",
      message: {             // message object passed
        data: "some text"
      }
    })

### Drag and drop
  
    // turns a DOM element into a draggable object
    iwc.draggable(elemId, opts)

    opts.dragstart = function (drag) {
      // drag - object on which dragstart is executed
      return {data: "data"} // this data passed to droppable object
    }

    // turns a DOM element into a droppable object
    iwc.droppable(elemId, opts)

    opts.drop = function (data, drop, drag) {
      // data - that was passed to droppable object
      // drop - object on where the drop occured
      // drag - object that was dropped
    }

    opts.dragover = function (drop) {
      // drop - object on where the drop occured
    }

## Thanks

The initial code of inter-widget communication is based on
the [openapp library](https://code.google.com/p/open-app/) by
[Erik Isaksson](https://github.com/erikis)
and [Matthias Palmér](https://github.com/matthiaspalmer).

## MIT License

Copyright (c) 2013 Evgeny Bogdanov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.




