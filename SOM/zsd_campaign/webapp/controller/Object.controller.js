/*global location*/
sap.ui.define([
		"zsdcampaign/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"zsdcampaign/model/formatter",
		'sap/ui/model/Filter',
		'sap/ui/model/Sorter',
		"zsdcampaign/model/ODataCalls"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter,Filter,Sorter,ODataCalls
	) {
		"use strict";

		return BaseController.extend("zsdcampaign.controller.Object", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0
					});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
				this._mViewSettingsDialogs = {};
				
				// Store original busy indicator delay, so it can be restored later on
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "objectView");
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						// Restore original busy indicator delay for the object view
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					}
				);
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Event handler when the share in JAM button has been clicked
			 * @public
			 */
			onExport: function(oEvent){
				this.getOwnerComponent().ODataCallsObj.onDataExport(oEvent);
			},

			 
			onCopy: function(oEvent){
				this.getOwnerComponent().ODataCallsObj.copyEntity(oEvent);
			},

			onSave: function (oEvent){
				this.getOwnerComponent().ODataCallsObj.saveDeepEntity(oEvent);
			},
			
			onShareInJamPress : function () {
				var oViewModel = this.getModel("objectView"),
					oShareDialog = sap.ui.getCore().createComponent({
						name: "sap.collaboration.components.fiori.sharing.dialog",
						settings: {
							object:{
								id: location.href,
								share: oViewModel.getProperty("/shareOnJamTitle")
							}
						}
					});
				oShareDialog.open();
			},

			/**
			 * Event handler  for navigating back.
			 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the worklist route.
			 * @public
			 */
			onNavBack : function() {

				var sPreviousHash = History.getInstance().getPreviousHash();
				var oCrossAppNavigator;
				if(sap.ushell.Container)
					oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

				this.getRouter().navTo("worklist", {}, true);
				
				// if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				// 	history.go(-1);
				// } else {
				// 	this.getRouter().navTo("worklist", {}, true);
				// }
			},

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Binds the view to the object path.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			_onObjectMatched : function (oEvent) {

				var sObjectId =  oEvent.getParameter("arguments").objectId;
				if(!this.getOwnerComponent().ODataCallsObj){

					var ODataCallsObj = new ODataCalls(	this.getOwnerComponent().getModel(),
														this.getModel("worklistView"),
														this.getOwnerComponent(),
														this.getOwnerComponent().getModel("i18n").getResourceBundle()
													);
													
					this.getOwnerComponent().ODataCallsObj = ODataCallsObj;	
					this.getOwnerComponent().ODataCallsObj.readEntitySet('CampaignSet');
					this.setModel(this.getOwnerComponent().ODataCallsObj.getJsonModel(), "JMDL");
				
				}
				this.getOwnerComponent().ODataCallsObj.readSingleEntity("CampaignSet" , sObjectId);

				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("CampaignSet", {
						CampId :  sObjectId
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));
			},

			/**
			 * Binds the view to the object path.
			 * @function
			 * @param {string} sObjectPath path to the object to be bound
			 * @private
			 */
			_bindView : function (sObjectPath) {
				var oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel();
				
				this.getView().setModel(this.getOwnerComponent().ODataCallsObj.getJsonModel(), "JMDL");
				this.getView().setModel(oDataModel);
				
				// this.getView().bindElement({
				// 	path: sObjectPath,
				// 	events: {
				// 		change: this._onBindingChange.bind(this),
				// 		dataRequested: function () {
				// 			oDataModel.metadataLoaded().then(function () {
				// 				// Busy indicator on view should only be set if metadata is loaded,
				// 				// otherwise there may be two busy indications next to each other on the
				// 				// screen. This happens because route matched handler already calls '_bindView'
				// 				// while metadata is loaded.
				// 				oViewModel.setProperty("/busy", true);
				// 			});
				// 		},
				// 		dataReceived: function () {
				// 			oViewModel.setProperty("/busy", false);
				// 		}
				// 	}
				// });
				
				oViewModel.setProperty("/busy", false);
			},



		createViewSettingsDialog: function (sDialogFragmentName) {
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!oDialog) {

				oDialog = sap.ui.xmlfragment("fgMaterials", sDialogFragmentName, this);
				oDialog.setModel(this.getOwnerComponent().ODataCallsObj.oModelmasterList);
				oDialog.setModel(this.getOwnerComponent().ODataCallsObj.getJsonModel(), "JMDL");
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
			}
			return oDialog;
		},

		handleSortButtonPressed: function (oEvent) {
			this.createViewSettingsDialog("zsdcampaign.view.Fragments.SortDialog").open();
		},

		handleFilterButtonPressed: function (oEvent) {
			this.createViewSettingsDialog("zsdcampaign.view.Fragments.FilterDialog").open();
		},

		handleSortDialogConfirm: function (oEvent) {
			var idTbl = sap.ui.core.Fragment.createId(this.getView().createId("fgMaterials"), "idCampaignDetails");
			var oTable = this.byId(idTbl),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},

		handleFilterDialogConfirm: function (oEvent) {
			var idTbl = sap.ui.core.Fragment.createId(this.getView().createId("fgMaterials"), "idCampaignDetails");			
			var oTable = this.byId(idTbl),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aFilters = [];

			mParams.filterItems.forEach(function(oItem) {
				var aSplit = oItem.getKey().split("___"),
					sPath = aSplit[0],
					sOperator = aSplit[1],
					sValue1 = aSplit[2],
					sValue2 = aSplit[3],
					oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});

			// apply filter settings
			oBinding.filter(aFilters);

			// update filter bar
			var filterBarId = sap.ui.core.Fragment.createId(this.getView().createId("fgMaterials"), "vsdFilterBar");	
			var filterLabelId = sap.ui.core.Fragment.createId(this.getView().createId("fgMaterials"), "vsdFilterLabel");	
			this.byId(filterBarId).setVisible(aFilters.length > 0);
			this.byId(filterLabelId).setText(mParams.filterString);
		},

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getModel("objectView"),
					oElementBinding = oView.getElementBinding();

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}

				var oResourceBundle = this.getResourceBundle(),
					oObject = oView.getBindingContext().getObject(),
					sObjectId = oObject.Brand,
					sObjectName = oObject.Brand;

				// Everything went fine.
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
				oViewModel.setProperty("/shareOnJamTitle", sObjectName);
				oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			}

		});

	}
);