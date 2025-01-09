/**

 * DISCLAIMER:

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

jQuery.sap.require("sap.m.MessageBox");

ZBP_CREATE.util.Controller.extend("ZBP_CREATE.view.Master", {

	oBusyDialog: null,

	oLastRecord: 1,
	lbpcount : 1,

	onInit: function() {

		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		var oEventBus = this.getEventBus();

		oEventBus.subscribe("Detail", "TabChanged", this.onDetailTabChanged, this);

		oEventBus.subscribe("RefreshDetail1", "First Record", this.selectFirstItem, this);

		this.getView().byId("list").attachEventOnce("updateFinished", function() {

			this.oInitialLoadFinishedDeferred.resolve();

			oEventBus.publish("Master", "InitialLoadFinished", {

				oListItem: this.getView().byId("list").getItems()[0]

			});

		}, this);

		//on phones, we will not have to select anything in the list so we don't need to attach to events

		if (sap.ui.Device.system.phone) {

			return;

		}

		this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);

		oEventBus.subscribe("Detail", "Changed", this.onDetailChanged, this);

		oEventBus.subscribe("Detail", "NotFound", this.onNotFound, this);

		oEventBus.subscribe("CreateBp", "UpdateList", this.onUpdateList, this);

	},

	readHelpUrl: function() {

		var myresponse;
		var myodata;

		var oJsonModelHelpUrl = new sap.ui.model.json.JSONModel();
		var oDataModelHelpUrl = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZGTS_BP_SCREEN_SRV", true);
		oDataModelHelpUrl.read("/HelpUrlSet('00')", null, null, false,
			function(response, oData) {
				oJsonModelHelpUrl.setData(jQuery.extend({}, response));
				myresponse = response;
				myodata = oData;
				if (oData != null) {
					// var myHelplink = this.byId("idhelplink2");
					// myHelplink.setHref(oData.data.Helpurl);
					window.open(oData.data.Helpurl);
				}
				sap.ui.getCore().setModel(oData, "HelpUrlModel");
			}.bind(this),
			function(response) {
				jQuery.sap.log.getLogger().error("HelpUrl Data fetch failed" + response.toString());
			}.bind(this));

	},

	onUpdateList: function(sChanel, sEvent, oData) {

		var _this = this;

		setTimeout(function() {

			_this._sEntityPath = oData.sEntityPath;

			_this.listRefresh();

			_this.oInitialLoadFinishedDeferred = jQuery.Deferred();

			_this.waitForInitialListLoading(function() {

				//On the empty hash select the first item

				_this.onSearch();

				if (_this._oApplicationProperties !== null && _this._oApplicationProperties !== undefined) {

					_this._oApplicationProperties.setProperty("/isAppBusy", false);
				}

				_this.selectFirstItem();

			});

		}, 5000);

		//			this.listRefresh();

	},

	// Refresh List
	onRefreshPartner: function() {
		this.listRefresh();
	},

	listRefresh: function() {

		var oList = this.getView().byId("list");

		var userid = sap.ui.getCore().getModel("GlobalModel").getData().userid;
		var logsys = sap.ui.getCore().getModel("GlobalModel").getData().logsys;
		if (userid !== null) {
			var FilterUrl = "$filter=Userid eq " + userid + " and Logsys eq " + logsys + "";
			this.getView().getModel().aUrlParams = [];
			this.getView().getModel().aUrlParams.push(FilterUrl);
			oList.getBinding("items").filter([]);
		}

		this.getView().byId("list").getBinding("items").refresh();

		if (oList.getItems().length === 0) {

			//sap.ui.core.BusyIndicator.show();

			this.oLastRecord = 0;

			// sap.ui.core.BusyIndicator.show();

		}

		if (oList.getItems().length === 1 && this.oLastRecord === 0) {

			this.oBusyDialog = new sap.m.BusyDialog();

			this.oBusyDialog.setText("Setting up the app for the first time. This will take a while. Please wait...");

			this.oBusyDialog.open();

			this.oBusyDialog.setBusy(true);

			sap.ui.core.BusyIndicator.hide();

			window.location.reload(true);

			window.onload = function() {

				//sap.ui.core.BusyIndicator.hide();

				this.oBusyDialog.setBusy(false);

				this.oBusyDialog.close();

			};

		}

		oList.attachUpdateFinished(function(evt) {

			if (oList.getItems().length > 0) {

				var item = {
					listItem: oList.getItems()[0]
				};

				//var oContext = new sap.ui.model.Context(self.getView().getModel(), "/0");

				oList.setSelectedItem(oList.getItems()[0], true);

				oList.fireSelect(item);

			}

		});

	},

	onRouteMatched: function(oEvent) {

		var sName = oEvent.getParameter("name");

		if (sName !== "main") {

			return;

		}

		//Load the detail view in desktop

		this.getRouter().myNavToWithoutHash({

			currentView: this.getView(),

			targetViewName: "ZBP_CREATE.view.Detail",

			targetViewType: "XML"

		});

		//Wait for the list to be loaded once

		this.waitForInitialListLoading(function() {

			//On the empty hash select the first item

			this.selectFirstItem();

		});

	},

	onDetailChanged: function(sChanel, sEvent, oData) {

		this.getView().getModel().setCountSupported(false);

		var sEntityPath = oData.sEntityPath;

		//Wait for the list to be loaded once

		this.waitForInitialListLoading(function() {

			var oList = this.getView().byId("list");

			var oSelectedItem = oList.getSelectedItem();

			// the correct item is already selected

			if (oSelectedItem && oSelectedItem.getBindingContext().getPath() === sEntityPath) {

				return;

			}

			var aItems = oList.getItems();

			for (var i = 0; i < aItems.length; i++) {

				if (aItems[i].getBindingContext().getPath() === sEntityPath) {

					oList.setSelectedItem(aItems[i], true);

					break;

				}

			}

		});

	},

	onDetailTabChanged: function(sChanel, sEvent, oData) {

		this.sTab = oData.sTabKey;

	},

	waitForInitialListLoading: function(fnToExecute) {

		jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(fnToExecute, this));

	},

	onNotFound: function() {

		this.getView().byId("list").removeSelections();

	},

	selectFirstItem: function() {

		var oList = this.getView().byId("list");

		var aItems = oList.getItems();

		if (aItems.length === 0) {
			
			sap.ui.core.UIComponent.getRouterFor(this).myNavToWithoutHash({

				currentView: this.getView(),

				targetViewName: "ZBP_CREATE.view.NotFound",

				targetViewType: "XML",

				transition: "slide"

			});
			if(this.lbpcount === 1){
			  this.lbpcount = 0;
			}

		}

		if (aItems.length) {

			oList.setSelectedItem(aItems[0], true);

		}

		if (aItems.length > 1) {

			if (!sap.ui.getCore().getModel("OnlyOnce")) {
				var OnlyOnce = new sap.ui.model.json.JSONModel({
					onlyOnce: true
				});

				sap.ui.getCore().setModel(OnlyOnce, "OnlyOnce");
				this.onAddPartner();
			}

		}

	},

	onValueHelpBP: function(oEvent) {
		var me = this;

		var sInputValueBP = oEvent.getSource().getValue();

		this.inputId = oEvent.getSource().getId();
		// create value help dialog
		if (!this._valueHelpDialogBP) {
			this._valueHelpDialogBP = sap.ui.xmlfragment(
				"ZBP_CREATE.view.fragments.BPSearchDialog",
				this
			);
			this.getView().addDependent(this._valueHelpDialog);
		}

		if (this._oModel !== null) {
			this._oModel = new sap.ui.model.json.JSONModel({
				"formData": {
					"Name": "",
					"City": "",
					"PostalCode": "",
					"Country": "",
					"Telephone": "",
					"BPNumber": "",
					"SearchTerm1": "",
					"SearchTerm2": "",
					"ExternalNumber": "",
					"HouseNumber": "",
					"Street": "",
					"Region": ""
				}
			});
		}

		this._valueHelpDialogBP.setModel(this._oModel, "data");
		this.getView().setModel(this._oModel, "data");

		/*			var aData = this._oModel.getData();
					this._oModel.setData(aData);
		*/
		this._valueHelpDialogBP.destroyContent();
		this._valueHelpDialogBP.addContent(sap.ui.xmlfragment("ZBP_CREATE.view.fragments.BPSearchPageForm", this));

		var oModelCountry = sap.ui.getCore().getModel("oModelCountry");
		this.getView().setModel(oModelCountry, "oModelCountry");
		// open value help dialog filtered by the input value
		this._valueHelpDialogBP.open(sInputValueBP);

		// added to show item when user has no bp created. it does not show any bp after search
		this.getView().byId("list").attachUpdateFinished(function() {

			this.oInitialLoadFinishedDeferred.resolve();

			sap.ui.getCore().getEventBus().publish("Master", "InitialLoadFinished", {
				oListItem: this.getView().byId("list").getItems()[0]
			});

			var oList = this.getView().byId("list");
			if (oList.getItems().length > 0) {
				var item = {
					listItem: oList.getItems()[0]
				};
				oList.setSelectedItem(oList.getItems()[0], true);
				oList.fireSelect(item);
			}

		}, this);

	},

	onValueHelpBPB: function(oEvent) {
		var me = this;
		var sInputValueBP = " ";
		// create value help dialog
		if (!this._valueHelpDialogBP) {
			this._valueHelpDialogBP = sap.ui.xmlfragment(
				"ZBP_CREATE.view.fragments.BPSearchDialog",
				this
			);
			this.getView().addDependent(this._valueHelpDialog);
		}

		if (this._oModel !== null) {
			this._oModel = new sap.ui.model.json.JSONModel({
				"formData": {
					"Name": "",
					"City": "",
					"PostalCode": "",
					"Country": "",
					"Telephone": "",
					"BPNumber": "",
					"SearchTerm1": "",
					"SearchTerm2": "",
					"ExternalNumber": "",
					"HouseNumber": "",
					"Street": "",
					"Region": ""
				}
			});
		}

		this._valueHelpDialogBP.setModel(this._oModel, "data");
		this.getView().setModel(this._oModel, "data");

		/*			var aData = this._oModel.getData();
					this._oModel.setData(aData);
		*/
		this._valueHelpDialogBP.destroyContent();
		this._valueHelpDialogBP.addContent(sap.ui.xmlfragment("ZBP_CREATE.view.fragments.BPSearchPageForm", this));

		var oModelCountry = sap.ui.getCore().getModel("oModelCountry");
		this.getView().setModel(oModelCountry, "oModelCountry");
		// open value help dialog filtered by the input value
		this._valueHelpDialogBP.open(sInputValueBP);

		// added to show item when user has no bp created. it does not show any bp after search
		this.getView().byId("list").attachUpdateFinished(function() {

			this.oInitialLoadFinishedDeferred.resolve();

			sap.ui.getCore().getEventBus().publish("Master", "InitialLoadFinished", {
				oListItem: this.getView().byId("list").getItems()[0]
			});

			var oList = this.getView().byId("list");
			if (oList.getItems().length > 0) {
				var item = {
					listItem: oList.getItems()[0]
				};
				oList.setSelectedItem(oList.getItems()[0], true);
				oList.fireSelect(item);
			}

		}, this);

	},

	_onCancelBPDialog: function(oEvent) {
		this._valueHelpDialogBP.close();
	},

	_onSearchBPDialog: function(evt) {

		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		var filters = [];
		var oBinding = this.oView.byId("list").getBinding("items");
		var vDataInput = this.getView().getModel("data").getData();

		if (vDataInput.formData.BPNumber !== '') {
			var oFilter = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, vDataInput.formData.BPNumber);
			filters.push(oFilter);
		}
		if (vDataInput.formData.Name !== '') {
			oFilter = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.EQ, vDataInput.formData.Name);
			filters.push(oFilter);
		}
		if (vDataInput.formData.ExternalNumber !== '') {
			var qExtNum = "'" + vDataInput.formData.ExternalNumber + "'";
			oFilter = new sap.ui.model.Filter("Bpext", sap.ui.model.FilterOperator.EQ, qExtNum);
			filters.push(oFilter);
		}
		if (vDataInput.formData.PostalCode !== '') {
			var qPostCode = "'" + vDataInput.formData.PostalCode + "'";
			oFilter = new sap.ui.model.Filter("PostCode", sap.ui.model.FilterOperator.EQ, qPostCode);
			filters.push(oFilter);
		}
		if (vDataInput.formData.HouseNumber !== '') {
			var qHouse = "'" + vDataInput.formData.HouseNumber + "'";
			oFilter = new sap.ui.model.Filter("HouseNumber", sap.ui.model.FilterOperator.EQ, qHouse);
			filters.push(oFilter);
		}
		if (vDataInput.formData.Street !== '') {
			oFilter = new sap.ui.model.Filter("Street1", sap.ui.model.FilterOperator.EQ, vDataInput.formData.Street);
			filters.push(oFilter);
		}
		if (vDataInput.formData.Region !== '') {
			oFilter = new sap.ui.model.Filter("Region", sap.ui.model.FilterOperator.EQ, vDataInput.formData.Region);
			filters.push(oFilter);
		}
		if (vDataInput.formData.SearchTerm1 !== '') {
			oFilter = new sap.ui.model.Filter("Sort1", sap.ui.model.FilterOperator.EQ, vDataInput.formData.SearchTerm1);
			filters.push(oFilter);
		}
		if (vDataInput.formData.City !== '') {
			oFilter = new sap.ui.model.Filter("City1", sap.ui.model.FilterOperator.EQ, vDataInput.formData.City);
			filters.push(oFilter);
		}
		if (vDataInput.formData.Country !== '') {
			oFilter = new sap.ui.model.Filter("Country", sap.ui.model.FilterOperator.EQ, vDataInput.formData.Country);
			filters.push(oFilter);
		}

		if (filters.length !== 0) {
			oBinding.aFilters = [];
			this.oView.getModel().aUrlParams = [];
			oBinding.filter(filters);
		}

		this._valueHelpDialogBP.close();
	},

	onCountryChange: function(oEvent) {

		this.getView().getModel().setCountSupported(false);
		var oItemSelectTemplate1 = new sap.ui.core.Item({
			key: "{Bland}",
			text: "{Bezei}"
		});

		//Define the template for items, which will be inserted inside a select element
		var countryKey = sap.ui.getCore().byId("idCountry").getSelectedItem().getKey();

		var mySelectRegion = sap.ui.getCore().byId("idRegion");
		mySelectRegion.setModel(sap.ui.getCore().getModel("oModelCountry"));

		var regionFilter = "/RegionSet?$filter=Land1%20eq%20" + "'" + countryKey + "'";
		mySelectRegion.bindAggregation("items", regionFilter, oItemSelectTemplate1);

	},

	onSearch: function() {

		var recoveryArray = this.getView().byId("list").getItems();

		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		var searchString = this.getView().byId("searchField").getValue();

		var masterScreenList = this.getView().byId("list");

		var items = [];

		for (var i = 0; i < masterScreenList.getItems().length; i++) {

			masterScreenList.getItems()[i].setVisible(false);

		}

		for (var k = 0; k < recoveryArray.length; k++) {

			masterScreenList.getItems()[k].setVisible(true);

		}

		for (var i = 0; i < masterScreenList.getItems().length; i++) {

			var banktype = masterScreenList.getItems()[i].getTitle();

			var paymenttype = masterScreenList.getItems()[i].getNumber();

			var sDate = masterScreenList.getItems()[i].getAttributes()[0].getText();

			var eDate = masterScreenList.getItems()[i].getAttributes()[1].getText();

			if (banktype.toString().toUpperCase().indexOf(searchString.toUpperCase()) === -1

				&& paymenttype.toString().toUpperCase().indexOf(searchString.toUpperCase()) === -1

				&& sDate.toString().toUpperCase().indexOf(searchString.toUpperCase()) === -1

				&& eDate.toString().toUpperCase().indexOf(searchString.toUpperCase()) === -1) {

				var aItem = masterScreenList.getItems()[i];

				items.push(aItem);

			}

		}

		for (var j = 0; j < items.length; j++) {

			items[j].setVisible(false);

		}

		//On phone devices, there is nothing to select from the list  

		if (sap.ui.Device.system.phone) {

			return;

		}

	},

	onLiveSearch: function(oEvent) {

		//this.oInitialLoadFinishedDeferred = jQuery.Deferred();  

		var recoveryArray = this.getView().byId("list").getItems();

		var searchString = oEvent.getParameter("newValue");

		var masterScreenList = this.getView().byId("list");

		var items = [];

		for (var i = 0; i < masterScreenList.getItems().length; i++) {

			masterScreenList.getItems()[i].setVisible(false);

		}

		for (var k = 0; k < recoveryArray.length; k++) {

			masterScreenList.getItems()[k].setVisible(true);

		}

		for (var i = 0; i < masterScreenList.getItems().length; i++) {

			var banktype = masterScreenList.getItems()[i].getTitle();

			var paymenttype = masterScreenList.getItems()[i].getNumber();

			var sDate = masterScreenList.getItems()[i].getAttributes()[0].getText();

			var eDate = masterScreenList.getItems()[i].getAttributes()[1].getText();

			if (banktype.toString().toUpperCase().indexOf(searchString.toUpperCase()) === -1

				&& paymenttype.toString().toUpperCase().indexOf(searchString.toUpperCase()) === -1

				&& sDate.toString().toUpperCase().indexOf(searchString.toUpperCase()) === -1

				&& eDate.toString().toUpperCase().indexOf(searchString.toUpperCase()) === -1) {

				var aItem = masterScreenList.getItems()[i];

				items.push(aItem);

			}

		}

		for (var j = 0; j < items.length; j++) {

			items[j].setVisible(false);

		}

		//On phone devices, there is nothing to select from the list  

		if (sap.ui.Device.system.phone) {

			return;

		}

	},

	onSelect: function(oEvent) {

		// Get the list item, either from the listItem parameter or from the event's

		// source itself (will depend on the device-dependent mode).

		this.showDetail(oEvent.getParameter("listItem") || oEvent.getSource());

	},

	showDetail: function(oItem) {

		// If we're on a phone, include nav in history; if not, don't.

		var bReplace = jQuery.device.is.phone ? false : true;

		this.getRouter().navTo("detail", {

			from: "master",

			entity: oItem.getBindingContext().getPath().substr(1),

			tab: this.sTab

		}, bReplace);

	},

	onExit: function(oEvent) {

		var oEventBus = this.getEventBus();

		oEventBus.unsubscribe("Detail", "TabChanged", this.onDetailTabChanged, this);

		oEventBus.unsubscribe("Detail", "Changed", this.onDetailChanged, this);

		oEventBus.unsubscribe("Detail", "NotFound", this.onNotFound, this);

	},

	handleResponsivePopoverPress: function(oEvent) {
		if (!this._oPopover) {
			this._oPopover = sap.ui.xmlfragment("ZBP_CREATE.view.fragments.Popover", this);
			this.getView().addDependent(this._oPopover);
		}
		this._oPopover.openBy(oEvent.getSource());
	},

	handleCloseButton: function(oEvent) {
		this._oPopover.close();
	},

	onAddPartner: function() {
        if( this.lbpcount === 0){
			this.readHelpUrl();
			this.lbpcount = 2;
		}

		var eventBus = sap.ui.getCore().getEventBus();

		eventBus.publish("Validate", "SaveButton");

		sap.ui.core.UIComponent.getRouterFor(this).myNavToWithoutHash({

			currentView: this.getView(),

			targetViewName: "ZBP_CREATE.view.CreateBp",

			targetViewType: "XML",

			transition: "slide"

		});
	},
	onHelpLink: function() {
		this.readHelpUrl();
	}
});