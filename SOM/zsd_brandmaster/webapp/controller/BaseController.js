sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"zsdbrandmaster/factory/SearchHelpFactory",
		"zsdbrandmaster/factory/SearchHelpResultColumn",
		"zsdbrandmaster/factory/SearchHelpResults",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"		
	], function (Controller, SearchHelpFactory, SearchHelpResultColumn, SearchHelpResults,Filter,FilterOperator) {
		"use strict";

		return Controller.extend("zsdbrandmaster.controller.BaseController", {
			/**
			 * Convenience method for accessing the router.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
			getRouter : function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},

			/**
			 * Convenience method for getting the view model by name.
			 * @public
			 * @param {string} [sName] the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
			getModel : function (sName) {
				return this.getView().getModel(sName);
			},

			/**
			 * Convenience method for setting the view model.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},

			/**
			 * Getter for the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */
			getResourceBundle : function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},

		bc_onSearchHelp : function(oEvent){

			this.oFetchDeferred                = jQuery.Deferred();

			var lSearchHelpName = null; var lSearchService = null;
//find search help name			
			if (oEvent.getSource().getCustomData()) {
				for (var i = 0; i < oEvent.getSource().getCustomData().length; i++) {
					switch(oEvent.getSource().getCustomData()[i].getProperty("key"))
					{
						case 'SearchName':
							lSearchHelpName = oEvent.getSource().getCustomData()[i].getProperty("value");
						  break;
						case 'SearchService':
							lSearchService = oEvent.getSource().getCustomData()[i].getProperty("value");
						  break;
						default:
						  break;
					}
				}
			}//custom data was passed with searchhelp name

			var EntityProperty = [];
//read entity metadata because filter needs case sensitive fieldnames
//following function will give all entity properties so you can prepare filters
			var entityMetadata = this.getOwnerComponent().ODataCallsObj._oDataModel.getServiceMetadata().dataServices.schema["0"].entityType;
			entityMetadata.some(function(oLine){
				if(lSearchService.replace("Set","") === oLine.name){
					EntityProperty = oLine.property;
					}
				}.bind(this)
			);

			this.getOwnerComponent().ODataCallsObj.readSearchHelp(lSearchHelpName, lSearchService, this.oFetchDeferred,EntityProperty);
			this._SearchElement = oEvent.getSource();

			if (!this._searchView) {
				this._searchView = sap.ui.xmlfragment("id_View_SearchHelp", "zsdbrandmaster.SearchHelp.DynamicSearchSelection",
							this);
				this.getView().addDependent(this._searchView);

				// var self = this;
				// var dynId = sap.ui.core.Fragment.createId('id_View_SearchHelp', 'idSearchButton');
				// sap.ui.getCore().byId(dynId).onsapenter = function(e) {
				// 	self.bc_ExecuteSearchHelp();
				// };

			}

			jQuery.when(this.oFetchDeferred.promise()).done(function () {
					
					//set the updated view model to the dialog
					this._searchView.setModel(this.getView().getModel('BRANDS'), "SH_MODEL");		
					jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._searchView);
					
					var lfragUom = this.getView().getDependents();
					if(lfragUom){
						lfragUom.forEach(function(item, index, array) {
							item.getModel('SH_MODEL').updateBindings(true);
						});
					}
					
					var selTableId = sap.ui.getCore().byId("id_View_SearchHelp--idSearchHelpTable");
					selTableId.getBinding("items").refresh(); //update screen
					
					this._searchView.open();		
				}.bind(this)
			);
									
		},

		bc_SearchClose: function(oEvent) {
			oEvent.getSource().close();
			this._searchView = oEvent.getSource().destroy();
			this.getOwnerComponent().ODataCallsObj.resetSearchHelp();
		},	

		bc_ExecuteSearchHelp: function(oEvent){

			var filters = [];
			var EntityProperty = [];
			var customFilter;

//			var fdaJsonModel = this.getView().getModel('FDA');
			var SearchHelpUserEntry = this.getOwnerComponent().ODataCallsObj._oDataResults.searchHelp; 
			var SearchService = this.getOwnerComponent().ODataCallsObj._oDataResults.SearchService;
//read entity metadata because filter needs case sensitive fieldnames
//following function will give all entity properties so you can prepare filters
			var entityMetadata = this.getOwnerComponent().ODataCallsObj._oDataModel.getServiceMetadata().dataServices.schema["0"].entityType;
			entityMetadata.some(function(oLine){
				if(this.getOwnerComponent().ODataCallsObj._oDataResults.SearchService.replace("Set","") === oLine.name){
					EntityProperty = oLine.property;
					}
				}.bind(this)
			);

//prepare filter
			for(var i=0; i < SearchHelpUserEntry.length; i++){
				
				var lFieldName = {};
				
				EntityProperty.some(function(oField){
						if(  oField.name && SearchHelpUserEntry[i].Fieldname === oField.name.toUpperCase() ){
							lFieldName = oField;
							return true;
						}
					}
				);

				if(SearchHelpUserEntry[i].CurValue){
					if(SearchHelpUserEntry[i].CurValue.indexOf('*') !== -1){
						if(SearchHelpUserEntry[i].CurValue.charAt(SearchHelpUserEntry[i].CurValue.length-1) === "*")
							customFilter = new Filter(lFieldName.name, FilterOperator.StartsWith, SearchHelpUserEntry[i].CurValue.replace(/\*/g, ''));
						else
							customFilter = new Filter(lFieldName.name, FilterOperator.Contains, SearchHelpUserEntry[i].CurValue.replace(/\*/g, ''));
					} else {
						customFilter = new Filter(lFieldName.name, FilterOperator.EQ, SearchHelpUserEntry[i].CurValue);					
					}					
					filters.push(customFilter);	
				}

			}

				
			var lSearchHelpName = this.getOwnerComponent().ODataCallsObj._oDataResults.searchHelpName;	
			// customFilter = new Filter('Shlpname', FilterOperator.EQ, lSearchHelpName);
			// filters.push(customFilter);	
			

			this.getOwnerComponent().ODataCallsObj.readSearchHelpResults(filters,lSearchHelpName,SearchService,EntityProperty);

		},
		bc_SearchHelpSelect: function(oEvent) {

			var oSelectedItem = oEvent.getSource();
			var vCustomData = this._SearchElement.getCustomData();
			vCustomData.some(function(vappProp){ 
				if(vappProp.getKey() === 'SearchReturnField')
				{
					this._SearchElement.setValue(oEvent.getParameter('listItem').getBindingContext('SH_MODEL').getProperty(vappProp.getValue()));
				}
			}.bind(this)
			);

			oEvent.getSource().getParent().getParent().close();
			this._searchView = oEvent.getSource().getParent().getParent().destroy();
			this.getOwnerComponent().ODataCallsObj.resetSearchHelp();
		},
				
			/**
			 * Event handler when the share by E-Mail button has been clicked
			 * @public
			 */
			onShareEmailPress : function () {
				var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
				sap.m.URLHelper.triggerEmail(
					null,
					oViewModel.getProperty("/shareSendEmailSubject"),
					oViewModel.getProperty("/shareSendEmailMessage")
				);
			}

		});

	}
);