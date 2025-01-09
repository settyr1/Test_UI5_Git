/*global location */
sap.ui.define([
		"com/pfizer/fda/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Fragment",
		"com/pfizer/fda/model/formatter",
		"com/pfizer/fda/model/fdaDataCalls"
	], function (BaseController, JSONModel, Fragment, formatter, fdaDataCalls) {
		"use strict";

		return BaseController.extend("com.pfizer.fda.controller.DetailObjectPage", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				var oViewModel = new JSONModel({
					busy : false,
					delay : 0,
					lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
				});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				this.setModel(oViewModel, "detailView");

				this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
				
				this.focusElement = null;
				this.fdaModelObj = {};
				
				this.getView().addEventDelegate(
				 	{onAfterShow:this._initialFocus.bind(this)}
				 );
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Event handler when the share by E-Mail button has been clicked
			 * @public
			 */
			onShareEmailPress : function () {
				var oViewModel = this.getModel("detailView");

				sap.m.URLHelper.triggerEmail(
					null,
					oViewModel.getProperty("/shareSendEmailSubject"),
					oViewModel.getProperty("/shareSendEmailMessage")
				);
			},

			/**
			 * Event handler when the share in JAM button has been clicked
			 * @public
			 */
			onShareInJamPress : function () {
				var oViewModel = this.getModel("detailView"),
					oShareDialog = sap.ui.getCore().createComponent({
						name : "sap.collaboration.components.fiori.sharing.dialog",
						settings : {
							object :{
								id : location.href,
								share : oViewModel.getProperty("/shareOnJamTitle")
							}
						}
					});

				oShareDialog.open();
			},

			/**
			 * Updates the item count within the line item table's header
			 * @param {object} oEvent an event containing the total number of items in the list
			 * @private
			 */
			onListUpdateFinished : function (oEvent) {
				var sTitle,
					iTotalItems = oEvent.getParameter("total"),
					oViewModel = this.getModel("detailView");

				// only update the counter if the length is final
				if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
					if (iTotalItems) {
						sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
					} else {
						//Display 'Line Items' instead of 'Line items (0)'
						sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
					}
					oViewModel.setProperty("/lineItemListTitle", sTitle);
				}
			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			_onObjectMatched : function (oEvent) {

				var sObjectId =  oEvent.getParameter("arguments").objectId;
				
				//create new fda oDataCalls object
				var fdaModelObj = new fdaDataCalls(	this.getModel(),
														this.getModel("detailView"),
														this.getOwnerComponent(),
														this.getModel("i18n").getResourceBundle()
												);
												
				this.getOwnerComponent().fdaModelObj = fdaModelObj;
				
				this.setModel(fdaModelObj.getJsonModel(), "FDA");
				
				fdaModelObj.readFdaExpand(sObjectId);
				
				this._initialFocus();
				
				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("FDA_PGENERALSet", {
						GuidChar :  sObjectId
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));
				
			},
			
			onSave : function(oEvent){
				this.getOwnerComponent().fdaModelObj.saveFdaDeepEntity();
			},

			/**
			 * Binds the view to the object path. Makes sure that detail view displays
			 * a busy indicator while data for the corresponding element binding is loaded.
			 * @function
			 * @param {string} sObjectPath path to the object to be bound to the view.
			 * @private
			 */
			_bindView : function (sObjectPath) {
				// Set busy indicator during view binding
				var oViewModel = this.getModel("detailView");

				// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
				oViewModel.setProperty("/busy", false);

				this.getView().bindElement({
					path : sObjectPath,
					events: {
						change : this._onBindingChange.bind(this),
						dataRequested : function () {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oElementBinding = oView.getElementBinding();

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("detailObjectNotFound");
					// if object could not be found, the selection in the master list
					// does not make sense anymore.
					this.getOwnerComponent().oListSelector.clearMasterListSelection();
					return;
				}

				var sPath = oElementBinding.getPath(),
					oResourceBundle = this.getResourceBundle(),
					oObject = oView.getModel().getObject(sPath),
					sObjectId = oObject.GuidChar,
					sObjectName = oObject.GuidPr,
					oViewModel = this.getModel("detailView");

				this.getOwnerComponent().oListSelector.selectAListItem(sPath);

				oViewModel.setProperty("/saveAsTileTitle",oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
				oViewModel.setProperty("/shareOnJamTitle", sObjectName);
				oViewModel.setProperty("/shareSendEmailSubject",
					oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
					oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},


			_initialFocus : function () {

				if(this.focusElement){
					this.focusElement = null;
				}
				
				var p01EditFrag = sap.ui.core.Fragment.createId(this.getView().createId('headerBlockP01-Collapsed'), 'inpGaCode');     //this.getView().createId('inpGaCode');
				var eleGaCode = this.getView().byId(p01EditFrag);
				var eleGaCode = sap.ui.getCore().byId(p01EditFrag);
				
				if(eleGaCode){
					this.focusElement = eleGaCode;
				} 					
													
				jQuery.sap.delayedCall(50, this, function() {
					if(this.focusElement){
						this.focusElement.focus();
					}
					//SET SELECTED PAGE
					// var objPage = this.getView().byId("ObjectPageLayout");
					// if(objPage){
					// 	objPage.setSelectedSection(this.getView().createId("idP04-P06")); }//full name is needed
				});				
				
			},
			

			_onMetadataLoaded : function () {
				// Store original busy indicator delay for the detail view
				var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
					oViewModel = this.getModel("detailView"),
					oLineItemTable = this.byId("ObjectPageLayout"); //this.byId("lineItemsList"),
					
					if(oLineItemTable){
						var iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();
		
						// Make sure busy indicator is displayed immediately when
						// detail view is displayed for the first time
						oViewModel.setProperty("/delay", 0);
						oViewModel.setProperty("/lineItemTableDelay", 0);
		
						oLineItemTable.attachEventOnce("updateFinished", function() {
							// Restore original busy indicator delay for line item table
							oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
						});
		
						// Binding the view will set it to not busy - so the view is always busy if it is not bound
						oViewModel.setProperty("/busy", true);
						// Restore original busy indicator delay for the detail view
						oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
					}
			}

		});

	}
);