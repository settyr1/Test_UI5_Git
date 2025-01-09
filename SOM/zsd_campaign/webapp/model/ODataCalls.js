sap.ui.define([
		"sap/ui/base/Object",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"zsdcampaign/controller/ErrorHandler",
		"sap/ui/core/util/Export",
		"sap/ui/core/util/ExportTypeCSV"		
	], function (Object, JSONModel, Filter, FilterOperator, ErrorHandler,Export,ExportTypeCSV) {
		// "use strict";

		return Object.extend("zsdcampaign.model.ODataCalls", {
			
			constructor: function(oModel, oViewModel, oComponent, oResourceBundle) {
				
				this._fdaGuid = "";
				
				//make oDataCalls
				this._oDataModel = new sap.ui.model.odata.ODataModel(oModel.sServiceUrl, true);
				this._oDataModel.setSizeLimit(10000);
				
				//adjust view for busy indicator
				this._oViewModel = oViewModel;
		
				//container to store result of oData Call		
				this._oLocalJsonMdl = new JSONModel();
				this._oLocalJsonMdl.setSizeLimit(10000);
				this._oLocalJsonMdl.setDefaultBindingMode("TwoWay");
				
				this._oDataResults = {};

				this._oDataResults.Campaign = {};
				this._oDataResults.Campaign.CampaignDetails = {};
							
				//to raise events that will be listened by other controllers
				this.eventBus = oComponent.getEventBus();
				
				this._oComponent = oComponent;
				
				//get the language dependent texts
				this.oResourceBundle = oResourceBundle;
				
				//errorHandler modified to give more detailed errors
				this._oErrorHandler1 = new ErrorHandler(oComponent, oResourceBundle, this._oDataModel);

				this.oGlobalBusyDialog = new sap.m.BusyDialog({"title":"","text":"Processing request..","showCancelButton":true});

				var sPath = jQuery.sap.getModulePath("zsdcampaign", "/model/mandatoryCampaign.json");
				this.oMandatoryCampaign = new JSONModel(sPath).attachRequestCompleted({},function(oEvent1) { oEvent1.getSource().getData(); },null);

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

							this._oDataResults.CampaignSet = oMainPromisResult.results;
							// this._oDataResults.CampaignBrandsSet = oMainPromisResult.CampaignBrandsSet.results;
						}
						this.oGlobalBusyDialog.close();
						this.refreshUIScreen();
						this.showBusyIndicator(false);
					}.bind(this)
				);
				
				var oExpandEntities = [
					"$expand=CampaignDetails"
				];
				
			//  this.showBusyIndicator(true);

				
				// var keyValue = 3000136081;
				// if( this._oLocalJsonMdl.getData() ) {
				// 	if ( this._oLocalJsonMdl.getData().Kunag ) {
				// 		keyValue = this._oLocalJsonMdl.getData().Kunag;
				// 	}
				// }
				// vEntitySetName = vEntitySetName + "('" + keyValue + "')";

				if(!this._oDataResults.DatabChar) { this._oDataResults.DatabChar = "" ; }
				if(!this._oDataResults.DatbiChar) { this._oDataResults.DatbiChar = "" ; }
				
				vEntitySetName = vEntitySetName + "?$filter=DatabChar eq '" + this._oDataResults.DatabChar
							+ "' and DatbiChar eq '" + this._oDataResults.DatbiChar + "'" ;
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
					
			},
			


			readSingleEntity: function(vEntitySetName, vCampID){
//create list of deferred promises to wait for all data being read
				this.oFetchMainDeferred                = jQuery.Deferred();  //main entity

// this._oLocalJsonMdl;	
//set busy indicator
				this.oGlobalBusyDialog.open();
				
				//refresh UI only after all data is loaded and promis resolved
				jQuery.when(this.oFetchMainDeferred.promise()
				            ).done(function ( oMainPromisResult ) {
						if(oMainPromisResult){
							this._oDataResults.Campaign = oMainPromisResult;
							//validation did not work during create
							if ( this._oDataResults.Campaign.DatabChar === "00000000" ) {
								this._oDataResults.Campaign.DatabChar = ""; }
							if ( this._oDataResults.Campaign.DatbiChar === "00000000" ) {
								this._oDataResults.Campaign.DatbiChar = ""; }
								
							this._oDataResults.Campaign.CampaignDetails = oMainPromisResult.CampaignDetails.results;
							this._oDataResults.Campaign.PartnerList     = oMainPromisResult.PartnerList.results;

							this.fetchShipToPartners();
							
							//prepare unique list of brands
							this._oDataResults.Campaign.Brands = [];
							//loop at Campaigns to find unique brands
							this._oDataResults.Campaign.CampaignDetails.forEach(function(item, index, array){

								var filter = "Brand";
								var keyword = item.Brand;
								
								var filteredArray = this._oDataResults.Campaign.Brands.filter(function(lsBrand) {
								    return lsBrand[filter] === keyword;
								});

								if(!filteredArray || filteredArray.length === 0){
									this._oDataResults.Campaign.Brands.push(item);
								}
								
							   }.bind(this)
							);
							
						}
						this.oGlobalBusyDialog.close();
						this.refreshUIScreen();
						this.showBusyIndicator(false);
					}.bind(this)
				);
				
				var oExpandEntities = [
					"$expand=CampaignDetails,PartnerList"
				];
				
			//  this.showBusyIndicator(true);

				vEntitySetName = vEntitySetName + "('" + vCampID + "')";
				
				// vEntitySetName = vEntitySetName + "?$filter=DatabChar eq '' and DatbiChar eq ''";
				// this.clearJsonModel();				
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
				this.fetchBrandMaterials();
				
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
				for (var property in requestData.Campaign) {
				   //console.log(`key= ${property} value = ${requestData[property]}  `);
				   if(typeof requestData[property] === "object"){
				   } else {
				   	  deepEntityData[property] = requestData.Campaign[property];
				   }
				}
				//add deep entity dependent tables
				// deepEntityData.CampaignDetails = requestData.Campaign.Brands ;
				deepEntityData.CampaignDetails = requestData.Campaign.CampaignDetails ;
				deepEntityData.PartnerList = requestData.Campaign.PartnerList ;
				
				delete deepEntityData.ShipToList;

				$.each(deepEntityData.CampaignDetails, function(sytabix,lsCampaignDetails){
					var filter = "Brand";
					var keyword = lsCampaignDetails.Brand;

					var filteredArray = this._oDataResults.Campaign.Brands.filter(function(item) {
					    return item[filter] == keyword;
					});
					if(filteredArray && filteredArray.length > 0){
						lsCampaignDetails.MinDisc = filteredArray[0].MinDisc;
						lsCampaignDetails.MaxDisc = filteredArray[0].MaxDisc;						
					}
					if( lsCampaignDetails.NewInd === true ){
						lsCampaignDetails.NewInd = "";
					}
				}.bind(this));


				//convert space to zero otherwise oData dumps
				var CampaignBrandEntity = this._oDataModel.getServiceMetadata().dataServices.schema[0].entityType[1].property;
				
				deepEntityData.CampaignDetails.forEach(function(item, index, array){
					for (var fname in item) {
						for( var fieldname in CampaignBrandEntity){
							if(CampaignBrandEntity[fieldname].name === fname && item[CampaignBrandEntity[fieldname].name] === "" ){
								if ( CampaignBrandEntity[fieldname].type === "Edm.Decimal" ){
									item[CampaignBrandEntity[fieldname].name] = "0";
								}
							}
						}
					}
				});
//set busy indicator
				this.oGlobalBusyDialog.open();
				
				this._oDataModel.create("/CampaignSet", deepEntityData, {
					success: function(oResponse) {

						this._oDataResults.Campaign = oResponse;
						this._oDataResults.Campaign.CampaignDetails = oResponse.CampaignDetails.results;
						this._oDataResults.Campaign.PartnerList     = oResponse.PartnerList.results;

						//prepare unique list of brands
						this._oDataResults.Campaign.Brands = [];
						//loop at Campaigns to find unique brands
						this._oDataResults.Campaign.CampaignDetails.forEach(function(item, index, array){

							var filter = "Brand";
							var keyword = item.Brand;
							
							var filteredArray = this._oDataResults.Campaign.Brands.filter(function(lsBrand) {
							    return lsBrand[filter] === keyword;
							});

							if(!filteredArray || filteredArray.length === 0){
								this._oDataResults.Campaign.Brands.push(item);
							}
							
						   }.bind(this)
						);
						this.fetchShipToPartners();
							
						this.oGlobalBusyDialog.close();
						this.showMessage("Data Saved " + this._oDataResults.Campaign.CampId );
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

			copyEntity: function(oEvent){
				this._oDataResults.Campaign.CampId = "";
				this.refreshUIScreen();
			},

			fetchBrands: function() {
				this._oDataModel.read("/BrandsSet", {
					success: function(oResponse) {
						this._oDataResults.Brands = oResponse.results;
						this._oDataResults.Brands.splice(0, 0, {"Brand":"", "Brandname":""});
						this.refreshUIScreen();
						return;
					}.bind(this),
					error: function(oError) {
						this._oViewModel.setProperty("/busy", false);
						this._oErrorHandler1._showServiceError(oError.response.body);
					}
				});
			},					


			fetchBrandMaterials: function() {
				this._oDataModel.read("/BrandMaterialSet", {
					success: function(oResponse) {
						this._oDataResults.BrandMaterials = oResponse.results;
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
				var DatabChar = this._oDataResults.DatabChar;
				var DatbiChar = this._oDataResults.DatbiChar;
				
				this._oDataResults = {};  //link header data
				this._oDataResults.DatabChar = DatabChar;
				this._oDataResults.DatbiChar = DatbiChar;
				
				this.refreshUIScreen();

			},
		getRowData: function(col1, col2, col3, col4, col5){
			var colData = {};
				colData.Column1 = col1;
				colData.Column2 = col2;
				colData.Column3 = col3;
				colData.Column4 = col4;
				colData.Column5 = col5;		
			return colData;
		},
		onDataExport: function(oEvent) {
// https://help.sap.com/viewer/468a97775123488ab3345a0c48cadd8f/7.4.19/en-US/f1ee7a8b2102415bb0d34268046cd3ea.html
				var tmpModel = new JSONModel();
				tmpModel.setSizeLimit(10000);
				tmpModel.setDefaultBindingMode("TwoWay");
				
				var colData = {};
				var DownloadSet = [];
				var ExpObj = {};
				
				DownloadSet.push(this.getRowData( "Campaign Id", "Description", "Begin Date", "End Date", ""
					));
				colData.Column1 = this._oDataResults.Campaign.CampId;
				colData.Column2 = this._oDataResults.Campaign.CampDesc;
				colData.Column3 = this._oDataResults.Campaign.DatabChar;
				colData.Column4 = this._oDataResults.Campaign.DatbiChar;
				colData.Column5 = "";
				
				DownloadSet.push(colData);
				
				DownloadSet.push(this.getRowData( "", "", "", "", "" ));
				// deepEntityData.PartnerList = requestData.Campaign.PartnerList ;
				// delete deepEntityData.ShipToList;

				DownloadSet.push(this.getRowData( "Brand", "", "", "Min Discount", "Max Discount" ));
				$.each(this._oDataResults.Campaign.Brands, function(sytabix,lsBrands){
					colData = {};
					colData.Column1 = lsBrands.Brand;
					colData.Column2 = "";
					colData.Column3 = "";
					colData.Column4 = lsBrands.MinDisc;
					colData.Column5 = lsBrands.MaxDisc;
					DownloadSet.push(colData);
				}.bind(this));

				DownloadSet.push(this.getRowData( "", "", "", "", "" ));
				
				DownloadSet.push(this.getRowData( "Brand", "Material", "Description", "Min Discount", "Max Discount" ));				
				$.each(this._oDataResults.Campaign.CampaignDetails, function(sytabix,lsCampaignDetails){
					colData = {};
					colData.Column1 = lsCampaignDetails.Brand;
					colData.Column2 = lsCampaignDetails.Matnr;
					colData.Column3 = lsCampaignDetails.Maktx;
					colData.Column4 = lsCampaignDetails.MinDisc;
					colData.Column5 = lsCampaignDetails.MaxDisc;
					DownloadSet.push(colData);
				}.bind(this));

				DownloadSet.push(this.getRowData( "", "", "", "", "" ));
				DownloadSet.push(this.getRowData( "Sold To", "Sold To Name", "", "", "" ));
				
				$.each(this._oDataResults.Campaign.PartnerList, function(sytabix,lsPartnerList){
					colData = {};
					colData.Column1 = lsPartnerList.Kunag;
					colData.Column2 = lsPartnerList.SoldtoName;
					colData.Column3 = "";
					colData.Column4 = "";
					colData.Column5 = "";
					DownloadSet.push(colData);
				}.bind(this));

				DownloadSet.push(this.getRowData( "", "", "", "", "" ));
				DownloadSet.push(this.getRowData( "Sold To", "Ship To", "Ship To Name", "Split Qty", "Pay Term" ));
				
				$.each(this._oDataResults.Campaign.ShipToList, function(sytabix,lsShipToList){
					colData = {};
					colData.Column1 = lsShipToList.Kunag;
					colData.Column2 = lsShipToList.Kunwe;
					colData.Column3 = lsShipToList.ShiptoName;
					colData.Column4 = lsShipToList.SplitQty;
					colData.Column5 = lsShipToList.Zterm;
					DownloadSet.push(colData);
				}.bind(this));
				
				ExpObj.DownloadSet = DownloadSet;
				
				tmpModel.setData(ExpObj);
				
			var oExport = new Export({

				// Type that willmytype be used to generate the content. Own ExportType's can be created to support other formats
				exportType : new ExportTypeCSV({
					separatorChar : ","
					
				}),

				// Pass in the model created above
				models : tmpModel,

				// binding information for the rows aggregation
				rows : {
					path : "/DownloadSet/"
				},

				// column definitions with column name and binding info for the content
			
				columns: [{
					name: "",
					template: {
						content: {
							path: "Column1"
						}
					}
				}, {
					name: "",
					template: {
						content: {
							path: "Column2"
						}
					}
				}, {
					name: "",
					template: {
						content: {
							path: "Column3"
						}
					}
				}, {
					name: "",
					template: {
						content: {
							path: "Column4"
						}
					}
				}, {
					name: "",
					template: {
						content: {
							path: "Column5"
						}
					}
				}
				
				]
			});

			// download exported file
			oExport.saveFile("Campaign").catch(function(oError) {
				return 'Error Downloading';
			}).then(function() {
				oExport.destroy();
			});
		},				

		AddCampaignBrand: function(oEvent){
			var i = 0;
			while ( i < 6) {
// New Array to append to JSON Model	
				var obj = {
					CampId:  "",
					Brand: "",
					Matnr: "",
					MinDisc:  "0",
					MaxDisc: "0",
					BrandErr:"None",
					MinDiscErr:"None",
					MaxDiscErr:"None",
					NewInd: true
				};
			
				this._oDataResults.Campaign.Brands.push(obj);
				i++;
			}
			this.refreshUIScreen();
		},

		AddCampaignDetails: function(oEvent){
			var i = 0;
			while ( i < 6) {
// New Array to append to JSON Model	
				var obj = {
					CampId:  "",
					Brand: "",
					Matnr: "",
					MinDisc:  "0",
					MaxDisc: "0",
					BrandErr:"None",
					MinDiscErr:"None",
					MaxDiscErr:"None",
					NewInd: true
				};
			
				this._oDataResults.Campaign.CampaignDetails.push(obj);
				i++;
			}
			this.refreshUIScreen();
		},

		AddAllBrands: function(oEvent){
			
//create list of deferred promises to wait for all data being read
				this.oFetchMainDeferred                = jQuery.Deferred();  //main entity

//set busy indicator
				this.oGlobalBusyDialog.open();
				
				//refresh UI only after all data is loaded and promis resolved
				jQuery.when(this.oFetchMainDeferred.promise()
				            ).done(function ( oMainPromisResult ) {
						if(oMainPromisResult){
							// this._oDataResults.BrandMaterialSet = oMainPromisResult.results;
		//loop at all rows
							$.each(oMainPromisResult.results, function(sytabix,ls_BrandMaterialSet){
		//loop at all fields in a row


								var obj = {
									CampId:  "",
									Brand: ls_BrandMaterialSet.Brand,
									Matnr: ls_BrandMaterialSet.Matnr,
									Bezei: ls_BrandMaterialSet.Bezei,
									Maktx: ls_BrandMaterialSet.Maktx,
									MinDisc:  "0",
									MaxDisc: "0",
									BrandErr:"None",
									MinDiscErr:"None",
									MaxDiscErr:"None"
								};
								
								var filter = "Brand";
								var keyword = ls_BrandMaterialSet.Brand;

								var filteredArray = this._oDataResults.Campaign.Brands.filter(function(item) {
								    return item[filter] == keyword;
								});

								if(ls_BrandMaterialSet.Bezei !== ""){
									if(!filteredArray || filteredArray.length === 0){
										this._oDataResults.Campaign.Brands.push(obj);
									}
								}

							}.bind(this));
							
						}
						this.oGlobalBusyDialog.close();
						this.showMessage('Please add linked materials to save Brands');
						this.refreshUIScreen();
						this.showBusyIndicator(false);

					}.bind(this)
				);
				
				var oExpandEntities = [
					// "$expand=PgeneralToPPG04,PgeneralToPPG19PG20,PgeneralToPPG23BP,PgeneralToPPG23P"
				];
				

// BrandMaterialSet?$skip=0&$top=20&$orderby=Brand%20asc 
				this._oDataModel.read("/" + 'BrandMaterialSet' + "?$skip=0&$top=200", 
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


		AddAllBrandMaterials: function(oEvent){

			if(this._oDataResults.BrandMaterials){
				// this._oDataResults.BrandMaterialSet = oMainPromisResult.results;
//loop at all rows
				$.each(this._oDataResults.BrandMaterials, function(sytabix,ls_BrandMaterialSet){
//loop at all fields in a row

					var obj = {
						CampId:  "",
						Brand: ls_BrandMaterialSet.Brand,
						Matnr: ls_BrandMaterialSet.Matnr,
						Bezei: ls_BrandMaterialSet.Bezei,
						Maktx: ls_BrandMaterialSet.Maktx,
						MinDisc:  "0",
						MaxDisc: "0",
						BrandErr:"None",
						MinDiscErr:"None",
						MaxDiscErr:"None"
					};
					
					//look for brand first
					var filter = "Brand";
					var keyword = ls_BrandMaterialSet.Brand;

					var filteredArray = this._oDataResults.Campaign.Brands.filter(function(item) {
					    return item[filter] === keyword;
					});
					
					if( filteredArray.length > 0 ){  //brand is included in campaign
					//look if material is not in already
						filter = "Matnr";
						keyword = ls_BrandMaterialSet.Matnr;
	
						filteredArray = this._oDataResults.Campaign.CampaignDetails.filter(function(item) {
						    return item[filter] === keyword;
						});
	
						if(ls_BrandMaterialSet.Bezei !== ""){
							if(!filteredArray || filteredArray.length === 0){
								this._oDataResults.Campaign.CampaignDetails.push(obj);
							}
						}
					}

				}.bind(this));
				
			}
			this.refreshUIScreen();
				
		},		
		
		AddAllPartners: function(oEvent){

//create list of deferred promises to wait for all data being read
				this.oFetchMainDeferred                = jQuery.Deferred();  //main entity
//set busy indicator
				this.oGlobalBusyDialog.open();
				
				//refresh UI only after all data is loaded and promis resolved
				jQuery.when(this.oFetchMainDeferred.promise()
				            ).done(function ( oMainPromisResult ) {
						if(oMainPromisResult){
		//loop at all rows
							$.each(oMainPromisResult.results, function(sytabix,ls_ZsdCampPartnerSet){
		//loop at all fields in a row
								var obj = {
									CampId:  this._oDataResults.Campaign.CampId,
									Kunag: ls_ZsdCampPartnerSet.Kunag,
									SoldtoName: ls_ZsdCampPartnerSet.Name1
								};
	
								var filter = "Kunag";
								var keyword = ls_ZsdCampPartnerSet.Kunag;
								
								var filteredArray = this._oDataResults.Campaign.PartnerList.filter(function(item) {
								    return item[filter] == keyword;
								});

								if(!filteredArray || filteredArray.length === 0){
									this._oDataResults.Campaign.PartnerList.push(obj);
								}

							}.bind(this));
							
						}
						this.oGlobalBusyDialog.close();
						this.refreshUIScreen();
						this.showBusyIndicator(false);
						
					}.bind(this)
				);
				
				var oExpandEntities = [
					// "$expand=PgeneralToPPG04,PgeneralToPPG19PG20,PgeneralToPPG23BP,PgeneralToPPG23P"
				];
				

// BrandMaterialSet?$skip=0&$top=20&$orderby=Brand%20asc 
				this._oDataModel.read("/" + 'ZsdCampPartnerSet' + "?$skip=0&$top=2000", 
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

		fetchShipToPartners: function(oEvent){

//create list of deferred promises to wait for all data being read
				this.oFetchMainDeferred                = jQuery.Deferred();  //main entity
//set busy indicator
				this.oGlobalBusyDialog.open();
				
				//refresh UI only after all data is loaded and promis resolved
				jQuery.when(this.oFetchMainDeferred.promise()
				            ).done(function ( oMainPromisResult ) {
						if(oMainPromisResult){
		//loop at all rows
							this._oDataResults.Campaign.ShipToList = [];
							$.each(oMainPromisResult.results, function(sytabix,ls_ZsdCampPartnerSet){
		//loop at all fields in a row
								var obj = ls_ZsdCampPartnerSet;
	
								// var filter = "Kunwe";
								// var keyword = ls_ZsdCampPartnerSet.Kunwe;
								
								// var filteredArray = this._oDataResults.Campaign.ShipToList.filter(function(item) {
								//     return item[filter] == keyword;
								// });

								// if(!filteredArray || filteredArray.length === 0){
									this._oDataResults.Campaign.ShipToList.push(obj);
								// }

							}.bind(this));
							
						}
						this.oGlobalBusyDialog.close();
						this.refreshUIScreen();
						this.showBusyIndicator(false);
						
					}.bind(this)
				);
				
				var oExpandEntities = [
					// "$expand=PgeneralToPPG04,PgeneralToPPG19PG20,PgeneralToPPG23BP,PgeneralToPPG23P"
				];
				

				var oFilters = [];
				$.each(this._oDataResults.Campaign.PartnerList,  function(sytabix,lsPartnerList){
						oFilters.push(new Filter("Kunag", FilterOperator.EQ, lsPartnerList.Kunag));
					}.bind(this)
				);
				oFilters.push(new Filter("Selected", FilterOperator.EQ, 'X'));
				
// BrandMaterialSet?$skip=0&$top=20&$orderby=Brand%20asc 
				this._oDataModel.read("/" + 'SoldToShipToDownloadSet' + "?$skip=0&$top=2000", 
					{
						urlParameters: oExpandEntities,
						filters: oFilters,
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
		
		DeleteCampaignDetails: function(selectedIndex){

			if(selectedIndex){
				this._oDataResults.Campaign.CampaignDetails.splice(selectedIndex, 1);
			}
		},

		DeleteCampaignBrand: function(selectedIndex){

			if(selectedIndex){
				var vDeletedBrand = this._oDataResults.Campaign.Brands.splice(selectedIndex, 1);

				var filter = "Brand";
				var keyword = vDeletedBrand[0].Brand;

				var filteredArray = this._oDataResults.Campaign.CampaignDetails.filter(function(item) {
				    return item[filter] !== keyword;
				});
				//set the matnr that are not deleted
				this._oDataResults.Campaign.CampaignDetails = filteredArray;
			}
		},
		
		AddPartnerList: function(oEvent){
			var i = 0;
			while ( i < 1) {
// New Array to append to JSON Model	
				var obj = {
					CampId:  this._oDataResults.Campaign.CampId,
					Kunag: ""
				};
			
				this._oDataResults.Campaign.PartnerList.push(obj);
				i++;
			}

			this.refreshUIScreen();
		},
		
		DeletePartnerList: function(selectedIndex){

			if(selectedIndex){
				this._oDataResults.Campaign.PartnerList.splice(selectedIndex, 1);
			}
		},

			showBusyIndicator: function(inOnOff){

				if (( inOnOff === true || inOnOff === false) && ( this._oViewModel )) {
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
			
			dateCompareGreater: function( firstDate, SecondDate ){
				var fd = new Date( firstDate.slice(0,4), firstDate.slice(4,6), firstDate.slice(6,8));
				var sd = new Date( SecondDate.slice(0,4), SecondDate.slice(4,6), SecondDate.slice(6,8));
				if( fd > sd){
					return false;
				} else {
					return true;
				}
			},
			
			validateData: function(){

//validate header fields
				this.oManFields = this._oComponent.getModel("mandatoryCampaign").getData();
				this.validationError = false;
			
				if(this.oManFields)
				{

					$.each( this.oManFields, function( key, value ) {
							this.oManFields[key] = 'None';
							if(this._oDataResults.Campaign[key] === "" || this._oDataResults.Campaign[key] === 0 )
							{
								this.oManFields[key] = 'Error';
								this.validationError = true;
							}
					}.bind(this));

					if ( !this.validationError && !this.dateCompareGreater(this._oDataResults.Campaign.DatabChar,this._oDataResults.Campaign.DatbiChar) ){
						this.validationError = true;
						this.oManFields["DatbiChar"] = 'Error';
					}
				}

				
				this._oComponent.getModel("mandatoryCampaign").setData(this.oManFields);
				this._oComponent.getModel("mandatoryCampaign").updateBindings();
	
//validate table fields
				this.mandatoryCampaignDetails = this._oComponent.getModel("mandatoryCampaignDetails").getData();

//remove empty rows
				this._oDataResults.Campaign.CampaignDetails = this._oDataResults.Campaign.CampaignDetails.filter(function(lsCampDetails) {
				    return lsCampDetails["Matnr"] !== "";
				});

				if(this.mandatoryCampaignDetails && this._oDataResults.Campaign.CampaignDetails){
//loop at all rows
					$.each(this._oDataResults.Campaign.Brands, function(sytabix,ls_CampaignDetails){
//loop at all fields in a row
						var emptyRow = "";
//check if row is empty with mandatory fields
						$.each(this.mandatoryCampaignDetails, function(manfname,fvalue){
							var errFname = manfname + "Err";
							ls_CampaignDetails[errFname] = "None";
							if(ls_CampaignDetails[manfname] === "" || parseFloat(ls_CampaignDetails[manfname], 2) === 0 || ls_CampaignDetails[manfname] !== ls_CampaignDetails[manfname]){
								// ls_CampaignDetails[errFname] = "Error";
								// this.validationError = true;
							} else {
								emptyRow = emptyRow + ls_CampaignDetails[manfname];
							}
						}.bind(this));

						if( emptyRow !== "" ){
							$.each(this.mandatoryCampaignDetails, function(manfname,fvalue){
								var errFname = manfname + "Err";
								ls_CampaignDetails[errFname] = "None";
								if(ls_CampaignDetails[manfname] === "" || parseFloat(ls_CampaignDetails[manfname], 2) === 0 || ls_CampaignDetails[manfname] !== ls_CampaignDetails[manfname]){
									ls_CampaignDetails[errFname] = "Error";
									this.validationError = true;
								} else {
									// emptyRow = emptyRow + ls_CampaignDetails[manfname];
								}
							}.bind(this));
							
							
							if (!this.validationError && parseFloat(ls_CampaignDetails.MinDisc,2) > parseFloat(ls_CampaignDetails.MaxDisc,2) ){
								this.validationError = true;
								ls_CampaignDetails["MaxDiscErr"] = "Error";
							}
						}
						
						// if(emptyRow === ""){
						// 	$.each(this.mandatoryCampaignDetails, function(manfname,fvalue){
						// 		var errFname = manfname + "Err";
						// 		ls_CampaignDetails[errFname] = "None";
						// 	}.bind(this));
						// }
						
					}.bind(this));
				}

				if(this.validationError === true){
					this.showMessage("Data Validation Error");
				}
				this.refreshUIScreen();	
			}

		}); //end of return

	}
);