sap.ui.define([
		"sap/ui/base/Object",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"zsdbrandmat/controller/ErrorHandler",
		"sap/ui/core/util/Export",
		"sap/ui/core/util/ExportTypeCSV"		
	], function (Object, JSONModel, Filter, FilterOperator, ErrorHandler,Export,ExportTypeCSV) {
		// "use strict";

		return Object.extend("zsdbrandmat.model.ODataCalls", {
			
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
				this._oLocalJsonMdl.setSizeLimit(10000);
				
				this._oDataResults = {};
				
				//to raise events that will be listened by other controllers
				this.eventBus = oComponent.getEventBus();
				
				this._oComponent = oComponent;
				
				//get the language dependent texts
				this.oResourceBundle = oResourceBundle;
				
				//errorHandler modified to give more detailed errors
				this._oErrorHandler1 = new ErrorHandler(oComponent, oResourceBundle, this._oDataModel);

				this.oGlobalBusyDialog = new sap.m.BusyDialog({"title":"","text":"Processing request..","showCancelButton":true});

				var sPath = jQuery.sap.getModulePath("zsdbrandmat", "/model/mandatoryBrandMaterial.json");
				this.oMandatoryBrandMaterial = new JSONModel(sPath).attachRequestCompleted({},function(oEvent1) { oEvent1.getSource().getData(); },null);

			},
			
			getJsonModel: function(){
				return this._oLocalJsonMdl;	
			},
			
			readEntitySet: function(vEntitySetName){
//create list of deferred promises to wait for all data being read
				this.oFetchMainDeferred                = jQuery.Deferred();  //main entity

//set busy indicator
				this.oGlobalBusyDialog.open();
				
				//refresh UI only after all data is loaded and promis resolved
				jQuery.when(this.oFetchMainDeferred.promise()
				            ).done(function ( oMainPromisResult ) {
						if(oMainPromisResult){
							this._oDataResults.BrandMaterialSet = oMainPromisResult.results;
						}
						this.oGlobalBusyDialog.close();
						this.refreshUIScreen();
						this.showBusyIndicator(false);
					}.bind(this)
				);
				
				var oExpandEntities = [
					// "$expand=PgeneralToPPG04,PgeneralToPPG19PG20,PgeneralToPPG23BP,PgeneralToPPG23P"
				];
				
			//  this.showBusyIndicator(true);
				this.clearJsonModel();
// BrandMaterialSet?$skip=0&$top=20&$orderby=Brand%20asc 
				this._oDataModel.read("/" + vEntitySetName + "?$skip=0&$top=200", 
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

//get brand dropdown list				
				this.fetchBrands();
					
			},
			

			
			saveDeepEntity: function(){

				this.validateData();
				if( this.validationError === true ){
					this.refreshUIScreen();
					return;
				}

				
				var requestData    = this._oLocalJsonMdl.getData();
				var deepEntityData = {Brand:"dummy",Brandname:"dummy"};
				deepEntityData.BrandMaterialSet = requestData.BrandMaterialSet;
				
//set busy indicator
				this.oGlobalBusyDialog.open();
				
				this._oDataModel.create("/BrandsSet", deepEntityData, {
					success: function(oResponse) {
						// Navigate to Display view and select the new/modified record

						if( oResponse.BrandMaterialSet.results ) {
						this._oDataResults.BrandMaterialSet = oResponse.BrandMaterialSet.results;
						} else {
							this._oDataResults.BrandMaterialSet = {};
						}
						
						this.oGlobalBusyDialog.close();
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

		onDataExportBrandMaterialSet : function(oEvent) {
// https://help.sap.com/viewer/468a97775123488ab3345a0c48cadd8f/7.4.19/en-US/f1ee7a8b2102415bb0d34268046cd3ea.html
			var tModel = this._oLocalJsonMdl;
			var oExport = new Export({

				// Type that willmytype be used to generate the content. Own ExportType's can be created to support other formats
				exportType : new ExportTypeCSV({
					separatorChar : ","
					
				}),

				// Pass in the model created above
				models : tModel,

				// binding information for the rows aggregation
				rows : {
					path : "/BrandMaterialSet/"
				},

				// column definitions with column name and binding info for the content
			
				columns: [{
					name: "Brand",
					template: {
						content: {
							path: "Brand"
						}
					}
				}, {
					name: "Material",
					template: {
						content: {
							path: "Matnr"
						}
					}
				}, {
					name: "Material Description",
					template: {
						content: {
							path: "Maktx"
						}
					}
				}
				
				]
			});

			// download exported file
			oExport.saveFile("BrandMaterialSet").catch(function(oError) {
				return 'Error Downloading';
			}).then(function() {
				oExport.destroy();
			});
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

			var sBindingPath = oEvent.getSource().getBindingContext('BRANDS').getPath();
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

//validate header fields
				// this.oManFields = this._oComponent.getModel("mandatoryFields").getData();
				this.validationError = false;
				
				// if(this.oManFields)
				// {

				// 	$.each( this.oManFields, function( key, value ) {
				// 			this.oManFields[key] = 'None';
				// 			if(this._oDataResults[key] === "" || this._oDataResults[key] === 0 )
				// 			{
				// 				this.oManFields[key] = 'Error';
				// 				this.validationError = true;
				// 			}
				// 	}.bind(this));

				// }
				
				// this._oComponent.getModel("mandatoryFields").setData(this.oManFields);
				// this._oComponent.getModel("mandatoryFields").updateBindings();

//validate table fields
				this.mandatoryBrandMaterialFields = this.oMandatoryBrandMaterial.getData();
				if(this.mandatoryBrandMaterialFields  && this._oDataResults.BrandMaterialSet){
//loop at all rows
					$.each(this._oDataResults.BrandMaterialSet, function(sytabix,ls_BrandMaterialSet){
//loop at all fields in a row

						if( ls_BrandMaterialSet.DelInd === true){
							return;
						}
						var emptyRow = "";
						//console.table(this._oDataResults.PgeneralToPPG04);
						$.each(this.mandatoryBrandMaterialFields, function(manfname,fvalue){
							var errFname = manfname + "Err";
							ls_BrandMaterialSet[errFname] = "None";
							if(ls_BrandMaterialSet[manfname] === "" || parseFloat(ls_BrandMaterialSet[manfname], 2) === 0 || ls_BrandMaterialSet[manfname] !== ls_BrandMaterialSet[manfname]){
								ls_BrandMaterialSet[errFname] = "Error";
								this.validationError = true;
							} else {
								emptyRow = emptyRow + ls_BrandMaterialSet[manfname];
							}
						}.bind(this));
						
						if(emptyRow === ""){
							$.each(this.mandatoryBrandMaterialFields, function(manfname,fvalue){
								var errFname = manfname + "Err";
								ls_BrandMaterialSet[errFname] = "None";
							}.bind(this));
						}
						
					}.bind(this));
				}

				// if(this.validationError === true){
					this.refreshUIScreen();
				// }
				
			}

		}); //end of return

	}
);