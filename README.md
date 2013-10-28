IWC - Inter Widget Communication with Drag and Drop
===

Enables the inter-widget communication and drag and drop between widgets
within a widget container.

## How to start
Check test/index.html as an example

## Description

Widgets are often rendered as iframes inside a widget container. The
library allows a widget to broadcast messages to other widgets open on
the page. In addition, an object can be brought from one widget to
another with drag and drop.

## Example 1: send data from one widget to another

    // require thi iwc library in your html code
    <script type="text/javascript" src="http://graasp.epfl.ch/gadget/libs/iwc.js"></script>

    // ------- Source gadget --------

    // send some data
    iwc.publish({
      event: "select",
      type: "json",
      message: {
        data: "some text"
      }
    });

    // ------- Destination gadget --------

    // start listenning on incoming events
    iwc.connect(function (envelope, message) {
      var data = message.data
      console.log(data)
    }


## Example 2: drag and drop an object from one widget to another

    // require thi iwc library in your html code
    <script type="text/javascript" src="http://graasp.epfl.ch/gadget/libs/iwc.js"></script>

    // ------- Source gadget --------

    // send some data
    iwc.publish({
      event: "select",
      type: "json",
      message: {
        data: "some text"
      }
    });

    // ------- Destination gadget --------

    // start listenning on incoming events
    iwc.connect(function (envelope, message) {
      var data = message.data
      console.log(data)
    }



## License
Copyright (c) 2013 Evgeny Bogdanov. All rights reserved.

## Thanks

The initial code of inter-widget communication is based on
the [openapp library](https://code.google.com/p/open-app/) by
[Erik Isaksson](https://github.com/erikis)
and [Matthias Palmér](https://github.com/matthiaspalmer).





