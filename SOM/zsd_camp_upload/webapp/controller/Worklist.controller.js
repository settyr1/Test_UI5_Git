sap.ui.define([
		"zsdcampupload/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"zsdcampupload/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"zsdcampupload/model/ODataCalls",
		'sap/m/MessageToast'
	], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator,ODataCalls,MessageToast) {
		"use strict";

		return BaseController.extend("zsdcampupload.controller.Worklist", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,


				// Put down worklist table's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the table is
				// taken care of by the table itself.

				// keeps the search state


				// Model used to manipulate control states
				oViewModel = new JSONModel({
					worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
					saveAsTileTitle: this.getResourceBundle().getText("worklistViewTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("worklistViewTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "worklistView");

				//before rendering the first route, read data
				if(!this.getOwnerComponent().ODataCallsObj){
				//create new fda oDataCalls object
					var ODataCallsObj = new ODataCalls(	this.getOwnerComponent().getModel(),
														this.getModel("worklistView"),
														this.getOwnerComponent(),
														this.getOwnerComponent().getModel("i18n").getResourceBundle()
													);
													
					this.getOwnerComponent().ODataCallsObj = ODataCallsObj;					
				}
				
				this.getOwnerComponent().ODataCallsObj.getJsonModel().attachRequestCompleted(
					function() { 
						this.setModel(this.getOwnerComponent().ODataCallsObj.getJsonModel(), "JMDL");
						this.getOwnerComponent().ODataCallsObj.refreshUIScreen();
					}, 
					this
				);
				
				
				// Make sure, busy indication is showing immediately so there is no
				// break after the busy indication for loading the view's meta data is
				// ended (see promise 'oWhenMetadataIsLoaded' in AppController)

			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Triggered by the table's 'updateFinished' event: after new table
			 * data is available, this handler method updates the table counter.
			 * This should only happen if the update was successful, which is
			 * why this handler is attached to 'updateFinished' and not to the
			 * table's list binding's 'dataReceived' method.
			 * @param {sap.ui.base.Event} oEvent the update finished event
			 * @public
			 */
			onUpdateFinished : function (oEvent) {
				// update the worklist's object counter after the table update
				var sTitle,
					oTable = oEvent.getSource(),
					iTotalItems = oEvent.getParameter("total");
				// only update the counter if the length is final and
				// the table is not empty
				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getResourceBundle().getText("worklistTableTitle");
				}
				this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			},

		handleUploadComplete: function(oEvent) {
			var sMsg = "";
			var sResponse = oEvent.getParameter("response");
			if (sResponse) {
				if( oEvent.getParameter("status") === 201 )
				{
					sMsg = "File Uploaded";
				} else {
					sMsg = "File Upload Failed" + sResponse;
				}
				MessageToast.show(sMsg);
			}
		},

		handleUploadPress: function(oEvent) {
			var oFileUploader = this.byId("fileUploader");
			
			oFileUploader.sameFilenameAllowed = true;
			oFileUploader.destroyHeaderParameters();
			
			if (!oFileUploader.getValue()) {
				MessageToast.show("Choose a file first");
				return;
			}
			
			this.getOwnerComponent().ODataCallsObj.validateData();
			if( this.getOwnerComponent().ODataCallsObj.validationError === true){
				MessageToast.show("Please fill required fields");
				return;
			}
			
			var oCustomerHeaderSlug = new sap.ui.unified.FileUploaderParameter({
				name: "slug",
				value: this.getOwnerComponent().ODataCallsObj.getFilePropertySlug()
			});


			oFileUploader.addHeaderParameter(oCustomerHeaderSlug);

			this.getModel().bDisableHeadRequestForToken = true;
			this.getModel().setTokenHandlingEnabled(true);
			var oCustomerHeaderToken = new sap.ui.unified.FileUploaderParameter({
				name: "x-csrf-token",
				value: this.getModel().getSecurityToken()
			});
			
			oFileUploader.addHeaderParameter(oCustomerHeaderToken);
			oFileUploader.setSendXHR(true); 
			
			oFileUploader.upload();
		},

		handleTypeMissmatch: function(oEvent) {
			var aFileTypes = oEvent.getSource().getFileType();
			jQuery.each(aFileTypes, function(key, value) {aFileTypes[key] = "*." +  value;});
			var sSupportedFileTypes = aFileTypes.join(", ");
			MessageToast.show("The file type *." + oEvent.getParameter("fileType") +
									" is not supported. Choose one of the following types: " +
									sSupportedFileTypes);
		},

		handleValueChange: function(oEvent) {
			MessageToast.show("Press 'Upload File' to upload file '" +
									oEvent.getParameter("newValue") + "'");
		},

			onDataExport : function (oEvent){
				this.getOwnerComponent().ODataCallsObj.onDataExportBrandMaterialSet();
			},
			
			onEdit: function(oEvent){
				this.getOwnerComponent().ODataCallsObj.readEntitySet('SoldToSet');
				this.setModel(this.getOwnerComponent().ODataCallsObj.getJsonModel(), "JMDL");
				
			},
			
			onSave: function (oEvent){
				this.getOwnerComponent().ODataCallsObj.saveDeepEntity(oEvent);
			},
			
			onAdd: function(oEvent){
				this.getOwnerComponent().ODataCallsObj.AddNewBrand(oEvent);
			},
			
			onDeleteBrandLink: function(oEvent){
				this.getOwnerComponent().ODataCallsObj.DeleteNewBrand(oEvent);
			},
			/**
			 * Event handler when a table item gets pressed
			 * @param {sap.ui.base.Event} oEvent the table selectionChange event
			 * @public
			 */
			onPress : function (oEvent) {
				// The source is the list item that got pressed
				this._showObject(oEvent.getSource());
			},


			/**
			 * Event handler for navigating back.
			 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
			 * If not, it will navigate to the shell home
			 * @public
			 */
			onNavBack : function() {

var regex = "(.*)" + window.location.hash ;
var aURLparts = window.location.href.match(new RegExp(regex));
window.location.href = aURLparts[1];

				// var sPreviousHash = History.getInstance().getPreviousHash(),
				// 	oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

				// if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				// 	history.go(-1);
				// } else {
				// 	oCrossAppNavigator.toExternal({
				// 		target: {shellHash: "#Shell-home"}
				// 	});
				// }
			},

			/**
			 * Event handler when the share in JAM button has been clicked
			 * @public
			 */
			onShareInJamPress : function () {
				var oViewModel = this.getModel("worklistView"),
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

			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
				} else {
					var oTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						oTableSearchState = [new Filter("Brand", FilterOperator.Contains, sQuery)];
					}
					this._applySearch(oTableSearchState);
				}

			},

			/**
			 * Event handler for refresh event. Keeps filter, sort
			 * and group settings and refreshes the list binding.
			 * @public
			 */
			onRefresh : function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Shows the selected item on the object page
			 * On phones a additional history entry is created
			 * @param {sap.m.ObjectListItem} oItem selected Item
			 * @private
			 */
			_showObject : function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("Brand")
				});
			},

			/**
			 * Internal helper method to apply both filter and search state together on the list binding
			 * @param {object} oTableSearchState an array of filters for the search
			 * @private
			 */
			_applySearch: function(oTableSearchState) {
				var oTable = this.byId("table"),
					oViewModel = this.getModel("worklistView");
				oTable.getBinding("items").filter(oTableSearchState, "Application");
				// changes the noDataText of the list in case there are no filter results
				if (oTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				}
			}

		});
	}
);