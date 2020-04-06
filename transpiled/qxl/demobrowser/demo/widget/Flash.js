(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.application.Standalone": {
        "require": true
      },
      "qx.ui.tabview.TabView": {},
      "qx.ui.tabview.Page": {},
      "qx.ui.layout.Canvas": {},
      "qx.ui.window.Window": {},
      "qx.ui.embed.Flash": {},
      "qx.ui.container.Composite": {},
      "qx.ui.layout.VBox": {},
      "qx.ui.form.Button": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.basic.Label": {},
      "qx.ui.form.TextArea": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /* ************************************************************************
  
  
  ************************************************************************ */

  /**
   *
   * @asset(qxl/demobrowser/demo/flash/fo_tester.swf)
   * @asset(qxl/demobrowser/demo/flash/TestFlash.swf)
   * @asset(qxl/demobrowser/demo/flash/FlashVersion.swf)
   */
  qx.Class.define("qxl.demobrowser.demo.widget.Flash", {
    extend: qx.application.Standalone,
    members: {
      __window: null,
      main: function main() {
        qxl.demobrowser.demo.widget.Flash.prototype.main.base.call(this);
        var tabView = new qx.ui.tabview.TabView();
        tabView.setContentPadding([8, 8, 8, 8]);
        var doc = this.getRoot();
        doc.add(tabView, {
          edge: 0
        });
        var page1 = new qx.ui.tabview.Page("Simple demo with FlashVars");
        page1.setLayout(new qx.ui.layout.Canvas());
        page1.add(this.createFlashDemo1(), {
          edge: 0
        });
        tabView.add(page1);
        var page2 = new qx.ui.tabview.Page("Two way communication (ActionScript <-> JavaScript)");
        page2.setLayout(new qx.ui.layout.Canvas());
        page2.add(this.createFlashDemo2(), {
          edge: 0
        });
        tabView.add(page2);
        this.__window = this.createWindow();
        doc.add(this.__window, {
          top: 20,
          left: 20
        });
      },
      createWindow: function createWindow() {
        var win = new qx.ui.window.Window("Flash Player Version").set({
          width: 300,
          height: 200,
          contentPadding: [0, 0, 0, 0]
        });
        win.setLayout(new qx.ui.layout.Canvas());
        win.add(new qx.ui.embed.Flash("demobrowser/demo/flash/FlashVersion.swf"), {
          edge: 0
        });
        return win;
      },

      /*
      ***************************************************************************
        SOURCE FOR FLASH DEMO 1
      ***************************************************************************
      */
      createFlashDemo1: function createFlashDemo1() {
        var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));
        var variables = {
          flashVarText: "this is passed in via FlashVars"
        };
        var flash = new qx.ui.embed.Flash("demobrowser/demo/flash/fo_tester.swf").set({
          scale: "noscale",
          variables: variables
        });
        flash.getContentElement().setParam("bgcolor", "#FF6600");
        container.add(flash, {
          flex: 1
        });
        var button = new qx.ui.form.Button("Show Flash Player version");
        button.addListener("execute", function () {
          this.__window.open();
        }, this);
        container.add(button);
        return container;
      },

      /*
      ***************************************************************************
        SOURCE FOR FLASH DEMO 2
      ***************************************************************************
      */
      __flash: null,
      __messageFromFlash: null,
      __messageToFlash: null,
      __sendButton: null,
      createFlashDemo2: function createFlashDemo2() {
        //Set for call back
        qxl.demobrowser.demo.widget.Flash.setCallBackInstance(this);
        var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
        /*
         * Qooxdoo
         */

        var qooxdooContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));
        container.add(qooxdooContainer, {
          flex: 1
        });
        qooxdooContainer.add(new qx.ui.basic.Label("<b>qooxdoo:</b>").set({
          rich: true
        }));
        qooxdooContainer.add(new qx.ui.basic.Label("Message from Flash:"));
        this.__messageFromFlash = new qx.ui.form.TextArea("No message.");

        this.__messageFromFlash.setEnabled(false);

        qooxdooContainer.add(this.__messageFromFlash, {
          flex: 1
        });
        qooxdooContainer.add(new qx.ui.basic.Label("Message to Flash:"));
        this.__messageToFlash = new qx.ui.form.TextArea("qooxdoo is the best!");
        qooxdooContainer.add(this.__messageToFlash, {
          flex: 1
        });
        var buttonBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(0, "right"));
        this.__sendButton = new qx.ui.form.Button("Send to Flash");

        this.__sendButton.setEnabled(false);

        this.__sendButton.addListener("execute", function (e) {
          this.__flash.getFlashElement().sendMessage(this.__messageToFlash.getValue());
        }, this);

        buttonBar.add(this.__sendButton);
        qooxdooContainer.add(buttonBar);
        /*
         * Flash
         */

        var flashConteiner = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));
        container.add(flashConteiner, {
          flex: 1
        });
        flashConteiner.add(new qx.ui.basic.Label("Flash:").set({
          rich: true
        }));
        this.__flash = new qx.ui.embed.Flash("demobrowser/demo/flash/TestFlash.swf");

        this.__flash.setVariables({
          init: "qxl.demobrowser.demo.widget.Flash.flashReady"
        });

        flashConteiner.add(this.__flash, {
          flex: 1
        });
        return container;
      },
      sendMessage: function sendMessage(message) {
        this.__messageFromFlash.setValue(message);
      },

      /**
       * @lint ignoreDeprecated(alert)
       */
      initFlash: function initFlash() {
        if (this.__flash.getFlashElement().setup) {
          this.__flash.getFlashElement().setup("qxl.demobrowser.demo.widget.Flash.sendMessage");

          this.__sendButton.setEnabled(true);
        } else {
          alert("Couldn't connect to Flash Player! Please make sure that:\n1) no pop-up or advertising blocker is activated.\n2) this html page is not loaded from the file system, but a webserver.");
        }
      }
    },

    /*
    *****************************************************************************
        SOURCE FOR FLASH DEMO 2
    *****************************************************************************
    */
    statics: {
      __callBackInstance: null,
      setCallBackInstance: function setCallBackInstance(callBackInstance) {
        qxl.demobrowser.demo.widget.Flash.__callBackInstance = callBackInstance;
      },
      sendMessage: function sendMessage(message) {
        qxl.demobrowser.demo.widget.Flash.__callBackInstance.sendMessage(message);
      },
      flashReady: function flashReady() {
        qxl.demobrowser.demo.widget.Flash.__callBackInstance.initFlash();
      }
    },

    /*
     *****************************************************************************
        DESTRUCT
     *****************************************************************************
     */
    destruct: function destruct() {
      this._disposeObjects("__messageFromFlash", "__messageToFlash", "__sendButton", "__flash", "__window");
    }
  });
  qxl.demobrowser.demo.widget.Flash.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Flash.js.map?dt=1586199392311