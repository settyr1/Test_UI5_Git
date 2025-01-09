sap.ui.controller("ZBP_CREATE.view.CreateBp", {

	_oAlertDialog: null,

	oBusyDialog: null,

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf ZBP.view.newPartner
	 */

	onInit: function() {

		var e = sap.ui.getCore().getEventBus();

		e.subscribe("Validate", "SaveButton", this.onLiveChange, this);

		this.getView().setModel(new sap.ui.model.json.JSONModel(), "newPartner");

		this.initializeNewPartner();

		var oSaveButton = this.getView().byId("Save");

		oSaveButton.setEnabled(false);

		var oModelCountry = sap.ui.getCore().getModel("oModelCountry");

		this.getView().setModel(oModelCountry, "oModelCountry");

		var oItemSelectTemplate = new sap.ui.core.Item({

			key: "{Land1}",

			text: "{Landx}"

		});

		//Define the template for items, which will be inserted inside a select element

		var mySelectMenu = this.byId("idCountry");

		mySelectMenu.setModel(sap.ui.getCore().getModel("oModelCountry"));

		mySelectMenu.bindAggregation("items", "/CountrySet", oItemSelectTemplate);

		// attach handlers for validation errors
		sap.ui.getCore().attachValidationError(function(evt) {
			var control = evt.getParameter("element");
			if (control && control.setValueState) {
				control.setValueState("Error");
			}
		});
		sap.ui.getCore().attachValidationSuccess(function(evt) {
			var control = evt.getParameter("element");
			if (control && control.setValueState) {
				control.setValueState("None");
			}
		});

		// //helpurl
		//   var HelpUrlModel = sap.ui.getCore().getModel("HelpUrlModel");
		//   if( HelpUrlModel != null )
		//   {
		//      var myHelplink = this.byId("idhelplink");
		//      myHelplink.setHref(sap.ui.getCore().getModel("HelpUrlModel").data.Helpurl);
		//   }

	},

	onLiveChange: function() {

		var oSaveButton = this.getView().byId("Save");

		var txtname1 = this.getView().byId("txtName1").getValue();

		var comboEntity = this.byId("comboEntity").getSelectedItem();

		// var txtStreet = this.byId("txtStreet").getValue();

		var txtCity = this.byId("txtCity").getValue();

		var comboCountry = this.byId("idCountry").getSelectedItem();

		if (txtname1.trim() === "" ||

			//txtStreet.trim() === "" ||

			comboEntity == null ||

			comboCountry === null ||

			txtCity.trim() === ""

		) {

			oSaveButton.setEnabled(false);

		} else

		{

			oSaveButton.setEnabled(true);

		}

	},

	onCountryChange: function() {

		this.getView().getModel().setCountSupported(false);

		var oSaveButton = this.getView().byId("Save");

		var txtname1 = this.getView().byId("txtName1").getValue();

		var comboEntity = this.byId("comboEntity").getSelectedItem();

		// var txtStreet = this.byId("txtStreet").getValue();

		var txtCity = this.byId("txtCity").getValue();

		var comboCountry = this.byId("idCountry").getSelectedItem();

		if (txtname1.trim() === "" ||

			//txtStreet.trim() === "" ||

			comboEntity == null ||

			comboCountry === null ||

			txtCity.trim() === ""

		) {

			oSaveButton.setEnabled(false);

		} else

		{

			oSaveButton.setEnabled(true);

		}

		if (comboCountry != null) {

			this.byId("lblRegion").setVisible(true);

			this.byId("idRegion").setVisible(true);

			this.getRegion();

		}

	},

	getRegion: function() {

		this.getView().getModel().setCountSupported(false);

		var oItemSelectTemplate1 = new sap.ui.core.Item({

			key: "{Bland}",

			text: "{Bezei}"

		});

		//Define the template for items, which will be inserted inside a select element

		var countryKey = this.byId("idCountry").getSelectedItem().getKey();

		var mySelectRegion = this.byId("idRegion");

		mySelectRegion.setModel(sap.ui.getCore().getModel("oModelCountry"));

		var regionFilter = "/RegionSet?$filter=Land1%20eq%20" + "'" + countryKey + "'";

		mySelectRegion.bindAggregation("items", regionFilter, oItemSelectTemplate1);

	},

	onCancel: function() {

		// clear form fields after Cancel action

		/* do not clear the fields

		this.getView().byId("comboEntity").setValue("");

		this.getView().byId("txtName1").setValue("");

		this.getView().byId("txtName2").setValue("");

		this.getView().byId("txtName3").setValue("");

		this.getView().byId("txtName4").setValue("");

		this.getView().byId("txtStreet").setValue("");

		this.getView().byId("txtCity").setValue("");

		this.getView().byId("idCountry").setValue("");

		//this.getView().byId("idCountry").setForceSelection(false);

		this.getView().byId("idRegion").setValue("");

		*/

		sap.ui.core.UIComponent.getRouterFor(this).backWithoutHash(this.getView());

	},

	onDialogClose: function(oEvent) {

		oEvent.getSource().getParent().close();

	},

	initializeNewPartner: function() {

		this.getView().getModel("newPartner").setData({});

	},

	onSave: function() {

		// collect input controls
		var view = this.getView();
		var inputs = [
			view.byId("txtName1"),
			view.byId("txtName2"),
			view.byId("txtName3"),
			view.byId("txtName4"),
			view.byId("txtStreet"),
			view.byId("txtCity")
		];

		// check that inputs are not empty
		// this does not happen during data binding as this is only triggered by changes
		jQuery.each(inputs, function(i, input) {
			if (input.getValue().toString().length > 40) {
				input.setValueState("Error");
			} else {
				input.setValueState("None");
			}
		});

		var canContinue = true;
		// check states of inputs
		jQuery.each(inputs, function(i, input) {
			if (input.getValueState() === "Error") {
				canContinue = false;
				return false;
			}
		});

		if (canContinue) {
			if (!this.oBusyDialog) {
				this.oBusyDialog = new sap.m.BusyDialog();
				//		 this.oBusyDialog = this.getView().byId("BusyDialog");
				this.oBusyDialog.open();
			}
			this.savePartner();
		}

	},

	getUserInfo: function() {

		var userInfo = {};

		var oUserParameters = jQuery.sap.getUriParameters().mParams;

		//var userName = oUserParameters.USERID[0];

		var userName = oUserParameters.userid[0];

		//var logSysName = oUserParameters.LOGSYS[0];

		var logSysName = oUserParameters.logsys[0];

		userInfo.userId = userName.substring(1, (userName.length - 1));

		userInfo.logSys = logSysName.substring(1, (logSysName.length - 1));

		return userInfo;

	},

	savePartner: function() {

		var oEventBus = this.getEventBus();

		var mNewPartner = this.getView().getModel("newPartner").getData();

		var userId = this.getUserInfo().userId;

		var logSys = this.getUserInfo().logSys;

		var mPayload = {

			Userid: userId.toString().toUpperCase(),

			Logsys: logSys.toString().toUpperCase(),

			Bptype: mNewPartner.Entity,

			Name1: mNewPartner.Name1,

			Name2: mNewPartner.Name2,

			Name3: mNewPartner.Name3,

			Name4: mNewPartner.Name4,

			Street1: mNewPartner.Street,

			City1: mNewPartner.City1,

			Country: mNewPartner.Country,

			Region: mNewPartner.Region

		};

		var oModel = this.getView().getModel("oModelCountry");

		oModel.setHeaders({

			"X-Requested-With": "X"

		});
		oModel.create("/GTS_BPSet", mPayload, {
			
			success: jQuery.proxy(function(oData, oResponse) {

				this.initializeNewPartner();

				jQuery.sap.require("sap.m.MessageToast");
				this.oBusyDialog.close();

				//sap.m.MessageToast.show("Partner '" + mPayload.Name1 + "' added");

				sap.m.MessageToast.show("' " + mPayload.Name1 + " ' " + oResponse.data.Msg);

				//this.getView().getController().getOwnerComponent().getModel().refresh(true,true);

				//this.getView().getModel().refresh(true);

				this.fireListUpdate({
					sEntityPath: "GTS_BP('" + oResponse.data.Id + "')"
				});

			}, this),

			error: jQuery.proxy(function(oError) {

				this.oBusyDialog.close();
				if (oError.response.statusText !== null) {
					this.showErrorAlert(oError.response.statusText + ". Please restart application. ");
				} else {
					this.showErrorAlert("Problem creating new Partner");
				}

			}, this)

		});

		//	oForm.setBusy(false);

		this.getView().getModel().setCountSupported(false);

		sap.ui.core.UIComponent.getRouterFor(this.getView()).backWithoutHash(this.getView(), "backMaster");

	},

	showErrorAlert: function(sMessage) {

		jQuery.sap.require("sap.m.MessageBox");

		//    sap.m.MessageBox.alert(sMessage);
		sap.m.MessageBox.error(sMessage, {
			title: "Error Processing Request",
			onClose: null,
			styleClass: "sapUiSizeCompact",
			initialFocus: sap.m.MessageBox.Action.CANCEL,
			textDirection: sap.ui.core.TextDirection.Inherit
		});
	},

	handleValueHelp: function(oEvent) {

		var sInputValue = oEvent.getSource().getValue();

		this.inputId = oEvent.getSource().getId();

		// create value help dialog

		if (!this._valueHelpDialog) {

			this._valueHelpDialog = sap.ui.xmlfragment(

				"ZBP_CREATE.view.Dialog",

				this

			);

			this.getView().addDependent(this._valueHelpDialog);

		}

		// create a filter for the binding

		this._valueHelpDialog.getBinding("items").filter([new sap.ui.model.Filter(

			"Name",

			sap.ui.model.FilterOperator.Contains, sInputValue

		)]);

		// open value help dialog filtered by the input value

		this._valueHelpDialog.open(sInputValue);

	},

	_handleValueHelpSearch: function(evt) {

		var sValue = evt.getParameter("value");

		var oFilter = new sap.ui.model.Filter(

			"Landx",

			sap.ui.model.FilterOperator.Contains, sValue

		);

		evt.getSource().getBinding("items").filter([oFilter]);

	},

	_handleValueHelpClose: function(evt) {

		var oSelectedItem = evt.getParameter("selectedItem");

		if (oSelectedItem) {

			var productInput = this.getView().byId(this.inputId);

			productInput.setValue(oSelectedItem.getTitle());

		}

		evt.getSource().getBinding("items").filter([]);

	},

	// Get Event Bus

	getEventBus: function() {

		return sap.ui.getCore().getEventBus();

	},

	fireListUpdate: function(oData) {

		// fire "UpdateList" event

		this.getEventBus().publish("CreateBp", "UpdateList", oData);

	}

});

/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
 * (NOT before the first rendering! onInit() is used for that one!).
 * @memberOf ZBP.view.newPartner
 */

//  onBeforeRendering: function() {

//

//  },

/**
 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
 * This hook is the same one that SAPUI5 controls get after being rendered.
 * @memberOf ZBP.view.newPartner
 */

//  onAfterRendering: function() {

//

//  },

/**
 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
 * @memberOf ZBP.view.newPartner
 */

//  onExit: function() {

//

//  }