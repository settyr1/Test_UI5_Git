/**


 * DISCLAIMER: steve

 * 

 * This view is implemented under the following assumptions related to the selected OData service:

 * 

 * 1. Status Property

 *    a. The main OData collection contains a status property

 *    b. The status property accepts the following values: "New", "In Process", "Approved", and “Rejected".

 *

 * 2. Attachments Collection

 *    a. The OData service provides an attachments collection.

 *    b. There is a navigation property from the main data collection to the attachment collection.

 *    c. Each attachment contains the following properties: file name, content (as a Base-64 string), content type and a unique id.

 *    d. Additionally, each attachment entry contains the id of the item in the main collection that relates to it (foreign key).

 *    e. Only image file attachments are supported.

 *

 * 3. Create Attachment

 *    a. The create operation is executed on the attachments collection.

 *    b. The new attachment entry includes all the attributes mentioned above.

 *    c. The new attachment entry includes the id of the item in the main collection it relates to.

 *    d. The new attachment unique id is created by the service during the create operation.

 * 

 */

jQuery.sap.require("ZBP_CREATE.util.Formatter");

jQuery.sap.require("ZBP_CREATE.util.Controller");

jQuery.sap.require("ZBP_CREATE.util.GuidGenerator");

ZBP_CREATE.util.Controller.extend("ZBP_CREATE.view.Detail", {

  onInit : function() {

    this.oInitialLoadFinishedDeferred = jQuery.Deferred();

    if (sap.ui.Device.system.phone) {

      //don't wait for the master on a phone

      this.oInitialLoadFinishedDeferred.resolve();

    } else {

      this.getView().setBusy(true);

      this.getEventBus().subscribe("Master", "InitialLoadFinished", this.onMasterLoaded, this);

    }

    this.getRouter().attachRouteMatched(this.onRouteMatched, this);

  },

  onMasterLoaded : function(sChannel, sEvent, oData) {

    if (oData.oListItem) {

      this.bindView(oData.oListItem.getBindingContext().getPath());

      this.getView().setBusy(false);

      this.oInitialLoadFinishedDeferred.resolve();

    }else{

      this.getView().setBusy(false);

    }

  },

  onRouteMatched : function(oEvent) {

    var oParameters = oEvent.getParameters();

    jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(function() {

      var oView = this.getView();

      // when detail navigation occurs, update the binding context

      if (oParameters.name !== "detail") {

        return;

      }

      var sEntityPath = "/" + oParameters.arguments.entity;

      this.bindView(sEntityPath);

      // Which tab?

      var sTabKey = oParameters.arguments.tab;

      this.getEventBus().publish("Detail", "TabChanged", {

        sTabKey : sTabKey

      });

    }, this));

  },

  bindView : function(sEntityPath) {

    this.getView().getModel().setCountSupported(false);

    var oView = this.getView();

    oView.bindElement(sEntityPath);

    var that = this;

    this.oModel = oView.getModel();

    this.sEntityPath = sEntityPath;

    //Check if the data is already on the client

    if (!oView.getModel().getData(sEntityPath)) {

      // Check that the entity specified actually was found.

      oView.getElementBinding().attachEventOnce("dataReceived", jQuery.proxy(function() {

        var oData = oView.getModel().getData(sEntityPath);

        if (!oData) {

          this.showEmptyView();

          this.fireDetailNotFound();

        } else {

          this.fireDetailChanged(sEntityPath);

        }

      }, this));

    } else {

      this.fireDetailChanged(sEntityPath);

    }

  },

  showEmptyView : function() {

    this.getRouter().myNavToWithoutHash({

      currentView : this.getView(),

      targetViewName : "ZBP_CREATE.view.NotFound",

      targetViewType : "XML"

    });

  },

  fireDetailChanged : function(sEntityPath) {

    this.getEventBus().publish("Detail", "Changed", {

      sEntityPath : sEntityPath

    });

  },

  fireDetailNotFound : function() {
    this.getEventBus().publish("Detail", "NotFound");
 

  },

  onNavBack : function() {

    // This is only relevant when running on phone devices

    this.getRouter().myNavBack("main");

  },

  updateModel : function() {

    var that = this;

    var oBusyDialog = new sap.m.BusyDialog();

    oBusyDialog.open();

    if (!this.oCurrentItemData.Crdat) {

        this.oCurrentItemData.Crdat = new Date();

    }

    this.oModel.update(this.sEntityPath, this.oCurrentItemData, {

      async : true,

      success : function(oData, response) {

        oBusyDialog.close();
        that.showPopup("Item data has been saved");

      },

      error : function(oError) {

        oBusyDialog.close();
        alert(oError.message);

      }

    });

  },

  onSaveSelect : function(oEvent) {

    this.oCurrentItemData = this.getView().getBindingContext().getObject();

    this.oCurrentItemData.Country = this.byId("textAttributeInputField").getValue();

    this.oCurrentItemData.Crdat = new Date(this.byId("dateAttributeInputField").getValue());

    this.updateModel();

  },

  showPopup : function(message) {

    jQuery.sap.require("sap.m.MessageToast");

    sap.m.MessageToast.show(message);

  },

  onDetailSelect : function(oEvent) {

    sap.ui.core.UIComponent.getRouterFor(this).navTo("detail", {

      entity : oEvent.getSource().getBindingContext().getPath().slice(1),

      tab : oEvent.getParameter("selectedKey")

    }, true);

  },

  onExit : function(oEvent){

    this.getEventBus().unsubscribe("Master", "InitialLoadFinished", this.onMasterLoaded, this);

  }

});