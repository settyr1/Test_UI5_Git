sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"zsdcampaign/factory/SearchHelpFactory",
		"zsdcampaign/factory/SearchHelpResultColumn",
		"zsdcampaign/factory/SearchHelpResults",
		"sap/ui/model/SimpleType",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"		
	], function (Controller, SearchHelpFactory, SearchHelpResultColumn, SearchHelpResults,SimpleType,Filter,FilterOperator) {
		"use strict";

		return Controller.extend("zsdcampaign.controller.BaseController", {
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
		
		ConvZeroNumber : SimpleType.extend("ConvZeroNumber", {

			constructor : function () {
				SimpleType.apply(this, arguments);
				this.sName = "ConvZeroNumber";
			},			
			
			formatValue: function (oValue) {
				var outNum = parseFloat(oValue);
				if( parseFloat(oValue) === 0){ outNum = ""; }
				this.oldValue = outNum;
				if( outNum.toString() === "NaN") outNum = "";
				return outNum.toString();				
			},
			
			parseValue: function (oValue) {
				//parsing step takes place before validating step, value could be altered here
				var outNum = parseFloat(oValue);
				if( outNum.toString() === "NaN") outNum = "";
				return outNum.toString();
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
				this._searchView = sap.ui.xmlfragment("id_View_SearchHelp", "zsdcampaign.SearchHelp.DynamicSearchSelection",
							this);
				this.getView().addDependent(this._searchView);
			
				
			}

			jQuery.when(this.oFetchDeferred.promise()).done(function () {
					
					//set the updated view model to the dialog
					this._searchView.setModel(this.getView().getModel('JMDL'), "SH_MODEL");		
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
				EntityProperty.some                       (function(oField){
						if( oField.name && SearchHelpUserEntry[i].Fieldname === oField.name.toUpperCase() ){
							lFieldName = oField;
							return true;
						}
					}
				);

				if(SearchHelpUserEntry[i].CurValue){
					if(SearchHelpUserEntry[i].CurValue.indexOf('*') !== -1){
						if(SearchHelpUserEntry[i].CurValue.charAt(SearchHelpUserEntry[i].CurValue.length-1) === "*"){
							var regex = new RegExp(/\*/g);
							if(SearchHelpUserEntry[i].CurValue.match(regex).length === 1)
								customFilter = new Filter(lFieldName.name, FilterOperator.StartsWith, SearchHelpUserEntry[i].CurValue.replace(/\*/g, ''));
							else
								customFilter = new Filter(lFieldName.name, FilterOperator.Contains, SearchHelpUserEntry[i].CurValue.replace(/\*/g, ''));
						}
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

			bcAddCampaignBrand: function(oEvent){
				this.getOwnerComponent().ODataCallsObj.AddCampaignBrand(oEvent);                         
			},
			
			
			bcAddCampaignDetails: function(oEvent){
				this.getOwnerComponent().ODataCallsObj.AddCampaignDetails(oEvent);                         
			},
			
			bcAddAllBrands: function(oEvent){
				this.getOwnerComponent().ODataCallsObj.AddAllBrands(oEvent);
			},

			bcAddAllBrandMaterials: function(oEvent){
				this.getOwnerComponent().ODataCallsObj.AddAllBrandMaterials(oEvent);
			},
			
			bcAddAllPartners: function(oEvent){
				this.getOwnerComponent().ODataCallsObj.AddAllPartners(oEvent);
			},
			
			bcDeleteCampaignDetails: function(oEvent){

				var lTable = oEvent.getSource().getParent().getParent();
				var selectedContext = lTable.getSelectedContexts();
				if (selectedContext.length <= 0) {
					return;
				}
				
				//inverse row to delete higher rows first
				var invSelectedRow = selectedContext.sort( function compare(a, b) {
						  // Use toUpperCase() to ignore character casing
						  var genreA = a.sPath.toUpperCase();
						  var genreB = b.sPath.toUpperCase();
						
						  var comparison = 0;
						  if (genreA < genreB) {
						    comparison = 1;
						  } else if (genreA > genreB) {
						    comparison = -1;
						  }
						  return comparison;
						}
					);
					
				var ODataCallsObj = this.getOwnerComponent().ODataCallsObj;
				invSelectedRow.forEach(function(rowIndex) {
					var selectedRow = rowIndex.sPath;
					var selectedRowIndex = selectedRow.substring(parseInt(selectedRow.lastIndexOf("/"), 10) + 1);
					ODataCallsObj.DeleteCampaignDetails(selectedRowIndex);
					return;
				});

				lTable.setSelectedContextPaths();
				lTable.removeSelections(false, true);
				// lTable.selectAll(false);				
				ODataCallsObj.refreshUIScreen();
				ODataCallsObj.showMessage("Deleted Selected Material");

			},		

			onDeletePartnerList: function(oEvent){

				var sBindingPath = oEvent.getSource().getBindingContext("JMDL").getPath();
				var selectedIndex = sBindingPath.substring(parseInt(sBindingPath.lastIndexOf("/"), 10) + 1);
	
				if(selectedIndex){
					this.getOwnerComponent().ODataCallsObj.DeletePartnerList(selectedIndex);
					this.getOwnerComponent().ODataCallsObj.refreshUIScreen();
				}				

			},

			onDeleteBrandLink: function(oEvent){

				var sBindingPath = oEvent.getSource().getBindingContext("JMDL").getPath();
				var selectedIndex = sBindingPath.substring(parseInt(sBindingPath.lastIndexOf("/"), 10) + 1);
	
				if(selectedIndex){
					this.getOwnerComponent().ODataCallsObj.DeleteCampaignBrand(selectedIndex);
					this.getOwnerComponent().ODataCallsObj.refreshUIScreen();
				}				

			},
			
			bcDeleteCampaignBrands: function(oEvent){

				var lTable = oEvent.getSource().getParent().getParent();
				var selectedContext = lTable.getSelectedContexts();
				if (selectedContext.length <= 0) {
					return;
				}
				
				//inverse row to delete higher rows first
				var invSelectedRow = selectedContext.sort( function compare(a, b) {
						  // Use toUpperCase() to ignore character casing
						  var genreA = a.sPath.toUpperCase();
						  var genreB = b.sPath.toUpperCase();
						
						  var comparison = 0;
						  if (genreA < genreB) {
						    comparison = 1;
						  } else if (genreA > genreB) {
						    comparison = -1;
						  }
						  return comparison;
						}
					);
					
				var ODataCallsObj = this.getOwnerComponent().ODataCallsObj;
				invSelectedRow.forEach(function(rowIndex) {
					var selectedRow = rowIndex.sPath;
					var selectedRowIndex = selectedRow.substring(parseInt(selectedRow.lastIndexOf("/"), 10) + 1);
					ODataCallsObj.DeleteCampaignBrand(selectedRowIndex);
					return;
				});

				lTable.setSelectedContextPaths();
				lTable.removeSelections(false, true);
				// lTable.selectAll(false);				
				ODataCallsObj.refreshUIScreen();

			},		

			bcAddPartnerList: function(oEvent){
				this.getOwnerComponent().ODataCallsObj.AddPartnerList(oEvent);
			},
			
			bcDeletePartnerList: function(oEvent){

				var lTable = oEvent.getSource().getParent().getParent();
				var selectedContext = lTable.getSelectedContexts();
				if (selectedContext.length <= 0) {
					return;
				}
				
				//inverse row to delete higher rows first
				var invSelectedRow = selectedContext.sort( function compare(a, b) {
						  // Use toUpperCase() to ignore character casing
						  var genreA = a.sPath.toUpperCase();
						  var genreB = b.sPath.toUpperCase();
						
						  var comparison = 0;
						  if (genreA < genreB) {
						    comparison = 1;
						  } else if (genreA > genreB) {
						    comparison = -1;
						  }
						  return comparison;
						}
					);
					
				var ODataCallsObj = this.getOwnerComponent().ODataCallsObj;
				invSelectedRow.forEach(function(rowIndex) {
					var selectedRow = rowIndex.sPath;
					var selectedRowIndex = selectedRow.substring(parseInt(selectedRow.lastIndexOf("/"), 10) + 1);
					ODataCallsObj.DeletePartnerList(selectedRowIndex);
					return;
				});

				lTable.setSelectedContextPaths();
				lTable.removeSelections(false, true);
				// lTable.selectAll(false);				
				ODataCallsObj.refreshUIScreen();

			},


			bcHandleDateChange: function(oEvent){

				var oDP = oEvent.getSource();
				var bValid = oEvent.getParameter("valid");				

				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}
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