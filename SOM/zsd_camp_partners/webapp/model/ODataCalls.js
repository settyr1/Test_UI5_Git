sap.ui.define([
		"sap/ui/base/Object",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"zsdcamppartners/controller/ErrorHandler",
		"sap/ui/core/util/Export",
		"sap/ui/core/util/ExportTypeCSV",
		'sap/m/MessageToast'
	], function (Object, JSONModel, Filter, FilterOperator, ErrorHandler,Export,ExportTypeCSV,MessageToast) {
		// "use strict";

		return Object.extend("zsdcamppartners.model.ODataCalls", {
			
			constructor: function(oModel, oViewModel, oComponent, oResourceBundle) {
				
				this._fdaGuid = "";
				
				//make oDataCalls
				this._oDataModel = new sap.ui.model.odata.ODataModel(oModel.sServiceUrl, true);
				this._oDataModel.setSizeLimit(10000);
				
				//adjust view for busy indicator
				this._oViewModel = oViewModel;
		
				//container to store result of oData Call		
				this._oLocalJsonMdl = new JSONModel();
				this._oLocalJsonMdl.setDefaultBindingMode("TwoWay");
				
				this._oDataResults = {};
				
				//to raise events that will be listened by other controllers
				this.eventBus = oComponent.getEventBus();
				
				this._oComponent = oComponent;
				
				//get the language dependent texts
				this.oResourceBundle = oResourceBundle;
				
				//errorHandler modified to give more detailed errors
				this._oErrorHandler1 = new ErrorHandler(oComponent, oResourceBundle, this._oDataModel);

				this.oGlobalBusyDialog = new sap.m.BusyDialog({"title":"","text":"Processing request..","showCancelButton":true});

				var sPath = jQuery.sap.getModulePath("zsdcamppartners", "/model/mandatoryBrandMaterial.json");
				this.oMandatoryBrandMaterial = new JSONModel(sPath).attachRequestCompleted({},function(oEvent1) { oEvent1.getSource().getData(); },null);

			},
			
			getJsonModel: function(){
				return this._oLocalJsonMdl;	
			},
			
			readEntitySet: function(vEntitySetName){
//create list of deferred promises to wait for all data being read
				this.oFetchMainDeferred                = jQuery.Deferred();  //main entity

// this._oLocalJsonMdl;	
//set busy indicator
				this.oGlobalBusyDialog.open();
				
				//refresh UI only after all data is loaded and promis resolved
				jQuery.when(this.oFetchMainDeferred.promise()
				            ).done(function ( oMainPromisResult ) {
						if(oMainPromisResult){
							this._oDataResults = oMainPromisResult;
							this._oDataResults.ShipToQtySet = oMainPromisResult.ShipToQtySet.results;
						}
						this.oGlobalBusyDialog.close();
						this.refreshUIScreen();
						this.showBusyIndicator(false);
					}.bind(this)
				);
				
				var oExpandEntities = [
					"$expand=ShipToQtySet"
				];
				
			//  this.showBusyIndicator(true);

				
				var keyValue = '';
				if( this._oLocalJsonMdl.getData() ) {
					if ( this._oLocalJsonMdl.getData().Kunag ) {
						keyValue = this._oLocalJsonMdl.getData().Kunag;
					}
				}
				vEntitySetName = vEntitySetName + "('" + keyValue + "')";

				this.clearJsonModel();				
// BrandMaterialSet?$skip=0&$top=20&$orderby=Brand%20asc 
				this._oDataModel.read("/" + vEntitySetName , 
					{
						urlParameters: oExpandEntities,
						success: function(response) {
							this.oFetchMainDeferred.resolve(response);
						}.bind(this),
						error: function(oError) {
							this.oFetchMainDeferred.reject();
							this._oErrorHandler1._showServiceError(oError.response.body);
							this.showBusyIndicator(false);
							this.oGlobalBusyDialog.close();
						}.bind(this)
					}
				);

//get brand dropdown list				
				this.fetchBrands();
					
			},
			

			
			saveDeepEntity: function(){

				this.validateData();
				if( this.validationError === true ){
					this.refreshUIScreen();
					return false;
				}

				var requestData    = this._oLocalJsonMdl.getData();
				var deepEntityData = {};
				//get first level structure from json model
				for (var property in requestData) {
				   //console.log(`key= ${property} value = ${requestData[property]}  `);
				   if(typeof requestData[property] === "object"){
				   } else {
				   	  deepEntityData[property] = requestData[property];
				   }
				}
				//add deep entity dependent tables
				deepEntityData.ShipToQtySet = requestData.ShipToQtySet ;

				//convert space to zero otherwise oData dumps
				var ShipToQtyEntity = this._oDataModel.getServiceMetadata().dataServices.schema[0].entityType[4].property;
				
				deepEntityData.ShipToQtySet.forEach(function(item, index, array){
					for (var fname in item) {
						for( var property in ShipToQtyEntity){
							if(ShipToQtyEntity[property].name === fname && item[ShipToQtyEntity[property].name] === "" ){
								if ( ShipToQtyEntity[property].type === "Edm.Decimal" ){
									item[ShipToQtyEntity[property].name] = "0";
								}
							}
						}
					}
				});
//set busy indicator
				this.oGlobalBusyDialog.open();
				
				this._oDataModel.create("/SoldToSet", deepEntityData, {
					success: function(oResponse) {
						// Navigate to Display view and select the new/modified record

						this._oDataResults.ShipToQtySet = oResponse.ShipToQtySet.results;
						this.oGlobalBusyDialog.close();
						this.showMessage("Data Saved");
						this.refreshUIScreen();
						
					}.bind(this),
					error: function(oError) {
						this._oViewModel.setProperty("/busy", false);
						this.oGlobalBusyDialog.close();
						if (oError.response !== undefined) {
							this._oErrorHandler1._showServiceError(oError.response.body);
						} else {
							this._oErrorHandler1._showServiceError('Error in backend call');
						}

					}.bind(this)
				});
				
			},

			fetchBrands: function() {
				this._oDataModel.read("/BrandsSet", {
					success: function(oResponse) {
						this._oDataResults.Brands = oResponse.results;
						this.refreshUIScreen();
						return;
					}.bind(this),
					error: function(oError) {
						this._oViewModel.setProperty("/busy", false);
						this._oErrorHandler1._showServiceError(oError.response.body);
					}
				});
			},					
			
			// fetchDropDown: function(iZkey1, iZvalue, iPromisToResolve) {
			// 	var key1Filter = new Filter("Zkey", FilterOperator.EQ, iZkey1);
			// 	var key2Filter = new Filter("Zvalue", FilterOperator.EQ, iZvalue);
			// 	this._oDataModel.read("/BrandsSet", {
			// 		filters: [key1Filter, key2Filter],
			// 		success: function(oResponse) {
			// 			iPromisToResolve.resolve(oResponse.results);
			// 			return;
			// 		}.bind(this),
			// 		error: function(oError) {
			// 			this.oFetchMainDeferred.reject();
			// 			this._oViewModel.setProperty("/busy", false);
			// 			this._oErrorHandler1._showServiceError(oError.response.body);
			// 		}
			// 	});
			// },		
			
			// setProcessDD: function(ddDataProcess,oEvent){

			// 	this._oDataResults.ddProcess = ddDataProcess;
			// 	this.refreshUIScreen();
			// },
			
			refreshUIScreen: function(){
				this._oLocalJsonMdl.setData(this._oDataResults);
				this._oLocalJsonMdl.updateBindings();				
			},
			
			clearJsonModel: function(){

				this._oDataResults = {};  //link header data
				
				this.refreshUIScreen();

			},

		onDataExportShipTo : function(oEvent) {
// https://help.sap.com/viewer/468a97775123488ab3345a0c48cadd8f/7.4.19/en-US/f1ee7a8b2102415bb0d34268046cd3ea.html
				var that = this;
				var vEntitySetName = "SoldToShipToDownloadSet",
				    oExpandEntities = "";

				this._oExpModel = new JSONModel();
				this._oExpModel.setDefaultBindingMode("TwoWay");
				this._oExpData = {};
				
				this.oFetchMainDeferred = jQuery.Deferred();  //main entity
				
				this.oGlobalBusyDialog.open();
				
				//refresh UI only after all data is loaded and promis resolved
				jQuery.when(this.oFetchMainDeferred.promise()
				            ).done(function ( oMainPromisResult ) {
						if(oMainPromisResult){

							// this._oDataResults = oMainPromisResult;
							this._oExpData.ShipToDownloadSet = oMainPromisResult.results;
						
							this._oExpModel.setData(this._oExpData);
							var tModel = this._oExpModel;
							var oExport = new Export({
				
								// Type that willmytype be used to generate the content. Own ExportType's can be created to support other formats
								exportType : new ExportTypeCSV({
									separatorChar : ","
									
								}),
				
								// Pass in the model created above
								models : tModel,
				
								// binding information for the rows aggregation
								rows : {
									path : "/ShipToDownloadSet/"
								},
				
								// column definitions with column name and binding info for the content
							
								columns: [{
									name: "Sold To",
									template: {
										content: {
											path: "Kunag"
										}
									}
								}, {
									name: "Ship To",
									template: {
										content: {
											path: "Kunwe"
										}
									}
								}, {
									name: "Pay Term",
									template: {
										content: {
											path: "Zterm"
										}
									}
								}, {
									name: "Area Manager",
									template: {
										content: {
											path: "AreaMgr"
										}
									}
								}, {
									name: "Split Qty",
									template: {
										content: {
											path: "SplitQty"
										}
									}
								}, {
									name: "Soldto Name",
									template: {
										content: {
											path: "SoldtoName"
										}
									}
								}, {
									name: "Shipto Name",
									template: {
										content: {
											path: "ShiptoName"
										}
									}
								}
								
								]
							});
				
							// download exported file
							oExport.saveFile("ShipToDownloadSet").catch(function(oError) {
								return 'Error Downloading';
							}).then(function() {
								oExport.destroy();
								MessageToast.show(that.oResourceBundle.getText("downloadComplete"));
							});							
							
						}
						this.oGlobalBusyDialog.close();
						this.refreshUIScreen();
						this.showBusyIndicator(false);
					}.bind(this)
				);


				this._oDataModel.read("/" + vEntitySetName , 
					{
						urlParameters: oExpandEntities,
						success: function(response) {
							this.oFetchMainDeferred.resolve(response);
						}.bind(this),
						error: function(oError) {
							this.oFetchMainDeferred.reject();
							this._oErrorHandler1._showServiceError(oError.response.body);
							this.showBusyIndicator(false);
						}.bind(this)
					}
				);
			

		},				

		AddNewBrand: function(oEvent){
// New Array to append to JSON Model	
				var obj = {
					Brand:  "",
					DelInd: false,
					Matnr:  "",
					NewInd: true
				};
			
				this._oDataResults.BrandMaterialSet.push(obj);
				this.refreshUIScreen();
		},
		
		DeleteNewBrand: function(oEvent){

			var sBindingPath = oEvent.getSource().getBindingContext('JMDL').getPath();
			var selectedIndex = sBindingPath.split("/")[2];			
			if(selectedIndex){
				this._oDataResults.BrandMaterialSet.splice(selectedIndex, 1);
				this.refreshUIScreen();
			}
		},

			showBusyIndicator: function(inOnOff){

				if( inOnOff === true || inOnOff === false){
					this._oViewModel.setProperty("/busy", inOnOff);
					this._oViewModel.updateBindings();
				}
				
			},

			readSearchHelp: function(searchHelpName, lSearchService, oFetchDeferred, vEntityProperty){

				var myresponse;
				var myodata;

				var oJsonModelSearchHelp = new sap.ui.model.json.JSONModel();
				var oDataModelSearchHelp = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZSD_CAMP_SRV", true );
				oDataModelSearchHelp.read("/DynamicSearchHelpSet?$filter= Tabname eq '" + searchHelpName + "'", null, null, false,
				function(response, oData) {
					oJsonModelSearchHelp.setData(jQuery.extend({}, response.results));
					myresponse = response;
					myodata = oData;
					if( oData != null )
					{
						this._oDataResults.searchHelp = [];
						this._oDataResults.searchHelpOutputCols = [];
						
						oData.data.results.forEach(function(item, index, array){
							if ( item.Outputstyle === '02' ){  //input
								this._oDataResults.searchHelp.push(item);
							} 
							if ( item.Outputstyle === '01' ) {  //output

								var lFieldName = $(vEntityProperty).find(function(oField){
										if( oField.name && item.Fieldname === oField.name.toUpperCase() ){
											return true;
										}
									}
							);	
							if(lFieldName)
								this._oDataResults.searchHelpOutputCols.push(item);
							}
						}.bind(this)
						);
						//this._oDataResults.searchHelp = oData.data.results;
						this._oDataResults.searchHelpName = searchHelpName;  //keep the sh name
						this._oDataResults.SearchService  = lSearchService;  //keep the sh service name
						this.refreshUIScreen();
						oFetchDeferred.resolve();	
					}
				}.bind(this),
				function(response) {
					oFetchDeferred.reject();
					jQuery.sap.log.getLogger().error("HelpUrl Data fetch failed" + response.toString());
				}.bind(this));
							
			},
			
			resetSearchHelp: function(){
				this._oDataResults.searchHelpResult = [];
			},
			
			showMessage: function(msg){
				sap.m.MessageToast.show(msg, {
				    duration: 3000                  // default
				    // width: "15em",                   // default
				    // my: "center bottom",             // default
				    // at: "center bottom",             // default
				    // of: window,                      // default
				    // offset: "0 0",                   // default
				    // collision: "fit fit",            // default
				    // onClose: null,                   // default
				    // autoClose: true,                 // default
				    // animationTimingFunction: "ease", // default
				    // animationDuration: 1000,         // default
				    // closeOnBrowserNavigation: true   // default
				});				
			},

			readSearchHelpResults: function(oFilter, lSearchHelpName, lSearchService){

				var myresponse;
				var myodata;
				var lEntitySetToCall;
				this.oGlobalBusyDialog.open();
				
				lEntitySetToCall = '/' + lSearchService + 'Set';
				var oJsonModelSearchHelpResult = new sap.ui.model.json.JSONModel();
				var oDataModelSearchHelpResult = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZSD_CAMP_SRV", true );
				oDataModelSearchHelpResult.read(lEntitySetToCall, {
					filters: oFilter,
					success: function(response, oData) {

								oJsonModelSearchHelpResult.setData(jQuery.extend({}, response.results));
								myresponse = response;
								myodata = oData;
								if( oData != null )
								{
									this._oDataResults.searchHelpResult = oData.data.results;
									this.refreshUIScreen();
								}
								
								this.oGlobalBusyDialog.close();
								
							}.bind(this),
					error: function(response) {
							jQuery.sap.log.getLogger().error("Data fetch failed" + response.toString());
							this.oGlobalBusyDialog.close();
						}.bind(this)
				});
							
			},
			
			validateData: function(){

				this.validationError = false;

				var vTotalSplit = 0;
				var vTotalSplitInactive = 0;
				var StratcoUser = false;
				
				$.each(this._oDataResults.ShipToQtySet, function(sytabix,ls_ShipToQtySet){
					StratcoUser = ls_ShipToQtySet.StratcoUser;
					if( ls_ShipToQtySet.Selected === false ) ls_ShipToQtySet.SplitQty = "";                         
					if(ls_ShipToQtySet.Selected === true){
						vTotalSplit = vTotalSplit + parseFloat(ls_ShipToQtySet.SplitQty);}
					else{
						vTotalSplitInactive = vTotalSplitInactive + ( parseFloat(ls_ShipToQtySet.SplitQty) ? parseFloat(ls_ShipToQtySet.SplitQty) : 0 );
					}
				}.bind(this));
				
				if( parseFloat(vTotalSplit) !== 100 && StratcoUser === true ){
					this.validationError = true;
					this.showMessage("%Qty Split among ACTIVE Partners does not total to 100. Data not saved.");	
				}

				if( parseFloat(vTotalSplitInactive) !== 0 && StratcoUser === true ){
					this.validationError = true;
					this.showMessage("Please remove %Qty Split for inactive partners. Data not saved.");	
				}
				
				// if(this.validationError === true){
					this.refreshUIScreen();
				// }
				
			}

		}); //end of return

	}
);