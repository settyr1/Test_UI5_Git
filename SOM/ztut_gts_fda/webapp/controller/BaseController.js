/*global history */
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History",
		"com/pfizer/fda/factory/SearchHelpFactory",
		"com/pfizer/fda/factory/SearchHelpResultColumn",
		"com/pfizer/fda/factory/SearchHelpResults",		
		"sap/ui/model/ValidateException",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/SimpleType"
	], function (Controller, History, SearchHelpFactory, SearchHelpResultColumn, SearchHelpResults, ValidateException, Filter, FilterOperator, SimpleType ) {
		"use strict";

		return Controller.extend("com.pfizer.fda.controller.BaseController", {
			/**
			 * Convenience method for accessing the router in every controller of the application.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
			getRouter : function () {
				return this.getOwnerComponent().getRouter();
			},

			/**
			 * Convenience method for getting the view model by name in every controller of the application.
			 * @public
			 * @param {string} sName the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
			getModel : function (sName) {
				return this.getView().getModel(sName);
			},

			/**
			 * Convenience method for setting the view model in every controller of the application.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},


			/**
			 * Convenience method for getting the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */
			getResourceBundle : function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},


		ConvZeroNumber : SimpleType.extend("ConvZeroNumber", {

			constructor : function () {
				SimpleType.apply(this, arguments);
				this.sName = "ConvZeroNumber";
			},			
			
			formatValue: function (oValue) {
				var outNum = parseFloat(oValue);
				if( parseFloat(oValue) === 0){ outNum = ""; }
				if( isNaN(outNum) ){ outNum = ""; }
				this.oldValue = outNum;
				return outNum;				
			},
			
			parseValue: function (oValue) {
				//parsing step takes place before validating step, value could be altered here
				var outNum = parseFloat(oValue);
				return outNum;
			},
			
			validateValue: function (oValue) {

				// The following Regex is NOT a completely correct one and only used for demonstration purposes.
				// RFC 5322 cannot even checked by a Regex and the Regex for RFC 822 is very long and complex.
				// var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
				// if (!oValue.match(rexMail)) {
				// 	throw new ValidateException("'" + oValue + "' is not a valid email address");
				// }
			}
		}),
			
		BcAddPpg04: function(oEvent){
			this.getOwnerComponent().fdaModelObj.addPPG04(oEvent);                         
		},
		
		BcDeletePpg04: function(oEvent){

			var sBindingPath = oEvent.getSource().getBindingContext('FDA').getPath();
			var selectedIndex = sBindingPath.split("/")[2];
			this.getOwnerComponent().fdaModelObj.delPPG04(selectedIndex);
		},
		
		BcDeletePpg04_2: function(oEvent){

			var lTable = oEvent.getSource().getParent().getParent();
			var selectedContext = lTable.getSelectedContexts();
			if (selectedContext.length <= 0) {
				return;
			}
			var fdaModelObj = this.getOwnerComponent().fdaModelObj;
			selectedContext.forEach(function(rowIndex) {
				var selectedRow = rowIndex.sPath;
				var selectedRowIndex = selectedRow.substring(parseInt(selectedRow.lastIndexOf("/"), 10) + 1);
				fdaModelObj.delPPG04(selectedRowIndex);
				return;
			});

		},
					
		LiveChangeOnlyNumber: function(oEvent){

			var integerPart    = "11";
			var fractionalPart = "4";
			var regex = "";
			if (oEvent.getSource().getCustomData()) {
				for (var i = 0; i < oEvent.getSource().getCustomData().length; i++) {
					if (oEvent.getSource().getCustomData()[i].getProperty("key") === "integerPart") {
						integerPart = parseInt(oEvent.getSource().getCustomData()[i].getProperty("value"), 10);
					} else if (oEvent.getSource().getCustomData()[i].getProperty("key") === "fractionalPart") {
						fractionalPart = parseInt(oEvent.getSource().getCustomData()[i].getProperty("value"), 10);
					}
				}
			}

			integerPart = integerPart - fractionalPart;

			if (fractionalPart > 4) {
				fractionalPart = 2; //restrict to 2 decimal places for now
			}

			if( fractionalPart && fractionalPart > 0) {
			  regex = new RegExp("(^[0-9]{1," + integerPart + "}$)|(^[0-9]{1," + integerPart + "}\\.[0-9]{0," + fractionalPart + "}$)");
			}else{
			  regex = new RegExp("(^[0-9]{1," + integerPart + "}$)");
			}
			var qty = oEvent.getSource().getValue();
			if (!regex.test(qty)) {
				event.preventDefault();
				var toremove = oEvent.getSource().getValue().split("").length - 1;
				var correctValue = qty.slice(0, toremove);
				var atLeastOneCharRegex = new RegExp("([A-Za-z])");
				if (atLeastOneCharRegex.test(correctValue)) {
					correctValue = oEvent.getSource()._lastValue;
				}
				oEvent.getSource().setValue(correctValue);
			}
			
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
debugger;
//read entity metadata because filter needs case sensitive fieldnames
//following function will give all entity properties so you can prepare filters
			var entityMetadata = this.getOwnerComponent().fdaModelObj._oDataModel.getServiceMetadata().dataServices.schema["0"].entityType;
			entityMetadata.some(function(oLine){
				if(lSearchService.replace("Set","") === oLine.name){
					EntityProperty = oLine.property;
					}
				}.bind(this)
			);

			this.getOwnerComponent().fdaModelObj.readSearchHelp(lSearchHelpName, lSearchService, this.oFetchDeferred,EntityProperty);
			this._SearchElement = oEvent.getSource();

			if (!this._searchView) {
				this._searchView = sap.ui.xmlfragment("id_View_SearchHelp", "com.pfizer.fda.SharedBlocks.SearchHelp.DynamicSearchSelection",
							this);
				this.getView().addDependent(this._searchView);
			}

			jQuery.when(this.oFetchDeferred.promise()).done(function () {

					// fdaModelObj has updated data with search help metadata, set it to the view				
					this.setModel(this.getOwnerComponent().fdaModelObj.getJsonModel(), "FDA");
					
					//set the updated view model to the dialog
					this._searchView.setModel(this.getView().getModel('FDA'), "FDA");			
					jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._searchView);
					this.getView().getModel('FDA').updateBindings(true);

					var lfragUom = this.getView().getDependents();
					if(lfragUom){
						lfragUom.forEach(function(item, index, array) {
							item.getModel('FDA').updateBindings(true);
						});
					}
					
					var selTableId = sap.ui.getCore().byId("id_View_SearchHelp--idSearchHelpTable");
					selTableId.getBinding("items").refresh(); //update screen
					
					this._searchView.open();		
				}.bind(this)
			);
									
		},
		
		// bc_uom_searchhelp : function(oEvent) {

		// 	this.oFetchDeferred                = jQuery.Deferred();

		// 	this.getOwnerComponent().fdaModelObj.readSearchHelpUom('ZFDA_CTSUOM', this.oFetchDeferred);
		// 	this._SearchElement = oEvent.getSource();
			
			
		// 	if (!this._searchView_ZFDA_CTSUOM) {
		// 		this._searchView_ZFDA_CTSUOM = sap.ui.xmlfragment("id_View_ZFDA_CTSUOM", "com.pfizer.fda.SharedBlocks.SearchHelp.DynamicSearchHelp",
		// 					this);
		// 				this.getView().addDependent(this._searchView_ZFDA_CTSUOM);
		// 	}
			
		// 	jQuery.when(this.oFetchDeferred.promise()).done(function () {

		// 			// fdaModelObj has updated data with search help metadata, set it to the view				
		// 			this.setModel(this.getOwnerComponent().fdaModelObj.getJsonModel(), "FDA");
					
		// 			//set the updated view model to the dialog
		// 			this._searchView_ZFDA_CTSUOM.setModel(this.getView().getModel('FDA'), "FDA");			
		// 			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._searchView_ZFDA_CTSUOM);
		// 			this.getView().getModel('FDA').updateBindings();

		// 			var lfragUom = this.getView().getDependents('ZFDA_CTSUOM');
		// 			if(lfragUom){
		// 				lfragUom.forEach(function(item, index, array) {
		// 					item.getModel('FDA').updateBindings(true);
		// 				});
		// 			}
					
		// 			var selTableId = sap.ui.getCore().byId("id_View_ZFDA_CTSUOM--idSearchHelpTable");
		// 			selTableId.getBinding("items").refresh(); //update screen
					
		// 			this._searchView_ZFDA_CTSUOM.open();		
		// 		}.bind(this)
		// 	);
			
		// },
		
		// bc_onSearchClose: function(oEvent) {
		// 	this._searchView_ZFDA_CTSUOM.close();
		// },
		
		// bc_onSearchSelect: function(oEvent) {
		// 	this._searchView_ZFDA_CTSUOM.close();
		// },
		
		// bc_onSearchSelect_Ctsmu: function(oEvent){
		// },
		
// 		bc_execute_search: function(oEvent){

// 			var lSearchHelpName = null;
// //find search help name			
// 			if (oEvent.getSource().getCustomData()) {
// 				for (var i = 0; i < oEvent.getSource().getCustomData().length; i++) {
// 					switch(oEvent.getSource().getCustomData()[i].getProperty("key"))
// 					{
// 						case 'SearchName':
// 							lSearchHelpName = oEvent.getSource().getCustomData()[i].getProperty("value");
// 						  break;
// 						default:
// 						  break;
// 					}
// 				}
// 			}//custom data was passed with searchhelp name
// 			lSearchHelpName = this.getOwnerComponent().fdaModelObj._fdaData.searchHelpName;
// 			switch(lSearchHelpName){
// 				case 'ZFDA_CTSUOM':
// 					this.bc_execute_search_ZFDA_CTSUOM(oEvent);
// 					break;
// 				case '/SAPSLL/PRA':
// 					break;
// 				default: 
// 					break;
// 			}
			
			
// 		},

		bc_ExecuteSearchHelp: function(oEvent){

			var filters = [];
			var EntityProperty = [];
			var customFilter;

//			var fdaJsonModel = this.getView().getModel('FDA');
			var SearchHelpUserEntry = this.getOwnerComponent().fdaModelObj._fdaData.searchHelp; 
			var SearchService = this.getOwnerComponent().fdaModelObj._fdaData.SearchService;
//read entity metadata because filter needs case sensitive fieldnames
//following function will give all entity properties so you can prepare filters
			var entityMetadata = this.getOwnerComponent().fdaModelObj._oDataModel.getServiceMetadata().dataServices.schema["0"].entityType;
			entityMetadata.some(function(oLine){
				if(this.getOwnerComponent().fdaModelObj._fdaData.SearchService.replace("Set","") === oLine.name){
					EntityProperty = oLine.property;
					}
				}.bind(this)
			);
	
//prepare filter
			for(var i=0; i < SearchHelpUserEntry.length; i++){
				
				var lFieldName = EntityProperty.find(function(oField){
						if( SearchHelpUserEntry[i].Fieldname === oField.name.toUpperCase() ){
							return true;
						}
					}
				);

				customFilter = new Filter(lFieldName.name, FilterOperator.EQ, SearchHelpUserEntry[i].CurValue);
				filters.push(customFilter);	
			}

				
			var lSearchHelpName = this.getOwnerComponent().fdaModelObj._fdaData.searchHelpName;	
			customFilter = new Filter('Shlpname', FilterOperator.EQ, lSearchHelpName);
			filters.push(customFilter);	
			
			// switch(lSearchHelpName){
			// 	case 'ZFDA_CTSUOM':
			// 		break;
			// 	case '/SAPSLL/PRA':
					this.getOwnerComponent().fdaModelObj.readSearchHelpResults(filters,lSearchHelpName,SearchService,EntityProperty);
			// 		break;
			// 	default: 
			// 		break;
			// }			

		},		
// 		bc_execute_search_ZFDA_CTSUOM: function(oEvent){
			
// 			var filters = [];
// 			var customFilter;
// //prepare filter
// 			var fdaJsonModel = this.getView().getModel('FDA');

// 			customFilter = new Filter('Ctsms', FilterOperator.Contains, 'ZFDA');
// 			filters.push(customFilter);	
			
// 			fdaJsonModel.oData.searchHelp_ZFDA_CTSUOM.forEach(function(item, index, array) {

// 				  if ( item.Lfieldname ){
// 				  	item.Fieldname = item.Fieldname.substring(0,1).toUpperCase() + item.Fieldname.substring(1).toLowerCase();
// 				  	if(item.Fieldname === 'Ctsmu'){
// 				  		item.Lfieldname = item.Lfieldname.toUpperCase();
// 				  	}
// 				  	customFilter = new Filter(item.Fieldname, FilterOperator.Contains, item.Lfieldname);
// 				  	filters.push(customFilter);
// 				  }
				  
// 				}			
// 			);

// 			this.getOwnerComponent().fdaModelObj.readSearchHelp_ZFDA_CTSUOM(filters);

// 		},

		bc_SearchHelpSelect: function(oEvent) {

			var oSelectedItem = oEvent.getSource();
			var vCustomData = this._SearchElement.getCustomData();
			vCustomData.some(function(vappProp){ 
				if(vappProp.getKey() === 'SearchReturnField')
				{
					this._SearchElement.setValue(oEvent.getParameter('listItem').getBindingContext('FDA').getProperty(vappProp.getValue()));
				}
			}.bind(this)
			);

			oEvent.getSource().getParent().getParent().close();
			this._searchView = oEvent.getSource().getParent().getParent().destroy();
			this.getOwnerComponent().fdaModelObj.resetSearchHelp();
		},

		onGapgmcodeChange: function(oEvent) {

			var sValue5 = this.getView().byId("SelectGapgmcode").getSelectedKey();

			this.oFetchddProcessPromisToResolve    = jQuery.Deferred();
			jQuery.when(this.oFetchddProcessPromisToResolve.promise()).done(function (ddDataProcess ) {
					if(ddDataProcess){
						this.getOwnerComponent().fdaModelObj.setProcessDD(ddDataProcess,oEvent);
					}
				}.bind(this)
			);			

			this.getOwnerComponent().fdaModelObj.fetchDropDown('PROCESS',sValue5, this.oFetchddProcessPromisToResolve );
		},		
					/**
			 * Event handler for navigating back.
			 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the master route.
			 * @public
			 */
			onNavBack : function() {
				var sPreviousHash = History.getInstance().getPreviousHash(),
					oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

					if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
					history.go(-1);
				} else {
					this.getRouter().navTo("master", {}, true);
				}
			}

		});

	}
);