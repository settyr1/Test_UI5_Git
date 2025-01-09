sap.ui.define([
		"sap/ui/base/Object",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"com/pfizer/fda/controller/ErrorHandler"
	], function (Object, JSONModel, Filter, FilterOperator, ErrorHandler) {
		// "use strict";

		return Object.extend("com.pfizer.fda.model.fdaDataCalls", {
			
			constructor: function(oModel, oViewModel, oComponent, oResourceBundle) {
				
				this._fdaGuid = "";
				
				//make oDataCalls
				this._oDataModel = new sap.ui.model.odata.ODataModel(oModel.sServiceUrl, true);
				this._oDataModel.setSizeLimit(10000);
				
				//adjust view for busy indicator
				this._oViewModel = oViewModel;
		
				//container to store result of oData Call		
				this._oFDADataJsonMdl = new JSONModel();
				this._oFDADataJsonMdl.setDefaultBindingMode("TwoWay");
				
				this._fdaData = {};
				
				//to raise events that will be listened by other controllers
				this.eventBus = oComponent.getEventBus();
				
				//get the language dependent texts
				this.oResourceBundle = oResourceBundle;
				
				//errorHandler modified to give more detailed errors
				this._oErrorHandler1 = new ErrorHandler(oComponent, oResourceBundle, this._oDataModel);
				
			},
			
			getJsonModel: function(){
				return this._oFDADataJsonMdl;	
			},
			
			readFdaExpand: function(inFdaGuid){
//create list of deferred promises to wait for all data being read
				this.oFetchMainDeferred                = jQuery.Deferred();  //main entity
				this.oFetchddProcessPromisToResolve    = jQuery.Deferred();  //Process Dropdown Values
				
				//refresh UI only after all data is loaded and promis resolved
				jQuery.when(this.oFetchMainDeferred.promise(),this.oFetchddProcessPromisToResolve.promise()).done(function ( v1, ddDataProcess ) {
						if(ddDataProcess){
							this._fdaData.ddProcess = ddDataProcess;
						}
						this.refreshUIScreen();
						this.showBusyIndicator();
					}.bind(this)
				);
				
				var oExpandEntities = [
					"$expand=PgeneralToPPG04,PgeneralToPPG19PG20,PgeneralToPPG23BP,PgeneralToPPG23P"
				];
				
				this.showBusyIndicator(true);
				this.clearJsonModel();
				
				this._oDataModel.read("/FDA_PGENERALSet('" + inFdaGuid + "')", 
					{
						urlParameters: oExpandEntities,
						success: function(response) {
							this.processExpandoDataResults(response);
							this.oFetchMainDeferred.resolve();
						}.bind(this),
						error: function(oError) {
							this.oFetchMainDeferred.reject();
							this._oErrorHandler1._showServiceError(oError.response.body);
							this.showBusyIndicator(false);
						}.bind(this)
					}
				);
					
			},
			
			processExpandoDataResults: function(inRresponse){
				this._fdaData = inRresponse;  //link header data
				
				//create new attributes for dependent entities
				this._fdaData.PgeneralToPPG04     = inRresponse.PgeneralToPPG04.results;
				this._fdaData.PgeneralToPPG19PG20 = inRresponse.PgeneralToPPG19PG20.results;
				this._fdaData.PgeneralToPPG23BP   = inRresponse.PgeneralToPPG23BP.results;
				this._fdaData.PgeneralToPPG23P    = inRresponse.PgeneralToPPG23P.results;
				
				this._fdaData.ddProcess = [];
				
				this.fetchDropDown('PROCESS',this._fdaData.Gapgmcode, this.oFetchddProcessPromisToResolve );
				
			},
			
			saveFdaDeepEntity: function(){
				
				var requestData = this._oFDADataJsonMdl.getData();
				
				delete requestData.ddProcess;
				
				debugger;
				this._oDataModel.create("/FDA_PGENERALSet", requestData, {
					success: function(oResponse) {
						// Navigate to Display view and select the new/modified record

					}.bind(this),
					error: function(oError) {
						this._oViewModel.setProperty("/busy", false);
						if (oError.response !== undefined) {
							this._oErrorHandler1._showServiceError(oError.response.body);
						} else {
							this._oErrorHandler1._showServiceError('Error in backend call');
						}

					}.bind(this)
				});
				
			},
			
			fetchDropDown: function(iZkey1, iZvalue, iPromisToResolve) {
				var key1Filter = new Filter("Zkey", FilterOperator.EQ, iZkey1);
				var key2Filter = new Filter("Zvalue", FilterOperator.EQ, iZvalue);
				this._oDataModel.read("/FDA_DROPDOWNSet", {
					filters: [key1Filter, key2Filter],
					success: function(oResponse) {
						iPromisToResolve.resolve(oResponse.results);
						return;
					}.bind(this),
					error: function(oError) {
						this.oFetchMainDeferred.reject();
						this._oViewModel.setProperty("/busy", false);
						this._oErrorHandler1._showServiceError(oError.response.body);
					}
				});
			},		
			
			setProcessDD: function(ddDataProcess,oEvent){

				this._fdaData.ddProcess = ddDataProcess;
				this.refreshUIScreen();
			},
			
			refreshUIScreen: function(){
				this._oFDADataJsonMdl.setData(this._fdaData);
				this._oFDADataJsonMdl.updateBindings();				
			},
			
			clearJsonModel: function(){

				this._fdaData = {};  //link header data
				
				//create new attributes for dependent entities
				this._fdaData.PgeneralToPPG04     = [];
				this._fdaData.PgeneralToPPG19PG20 = [];
				this._fdaData.PgeneralToPPG23BP   = [];
				this._fdaData.PgeneralToPPG23P    = [];
				
				this.refreshUIScreen();

			},
			
			addPPG04: function(oEvent){

// New Array to append to JSON Model	
				var obj = {
					ConstName: "",
					ConstPerc: "",
					ConstQty:  "",
					ConstUom:  "",
					GuidChar:  "",
					GuidPr:    "",
					SeqNr:     "000000"
				};
			
				obj.GuidChar = this._fdaData.GuidChar;
				obj.GuidPr   = this._fdaData.GuidPr;
				this._fdaData.PgeneralToPPG04.push(obj);
				this.refreshUIScreen();
			},

			delPPG04: function(vindex){
				if(vindex){
					this._fdaData.PgeneralToPPG04.splice(vindex, 1);
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
				var oDataModelSearchHelp = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZGTS_FDA_SRV", true );
				oDataModelSearchHelp.read("/DynamicSearchHelpSet?$filter= Tabname eq '" + searchHelpName + "'", null, null, false,
				function(response, oData) {
					oJsonModelSearchHelp.setData(jQuery.extend({}, response.results));
					myresponse = response;
					myodata = oData;
					if( oData != null )
					{
						this._fdaData.searchHelp = [];
						this._fdaData.searchHelpOutputCols = [];
						
						oData.data.results.forEach(function(item, index, array){
							if ( item.Outputstyle === '02' ){  //input
								this._fdaData.searchHelp.push(item);
							} 
							if ( item.Outputstyle === '01' ) {  //output

								var lFieldName = vEntityProperty.find(function(oField){
										if( item.Fieldname === oField.name.toUpperCase() ){
											return true;
										}
									}
							);	
							if(lFieldName)
								this._fdaData.searchHelpOutputCols.push(item);
							}
						}.bind(this)
						);
						//this._fdaData.searchHelp = oData.data.results;
						this._fdaData.searchHelpName = searchHelpName;  //keep the sh name
						this._fdaData.SearchService  = lSearchService;  //keep the sh service name
						this.refreshUIScreen();
						oFetchDeferred.resolve();	
					}
				}.bind(this),
				function(response) {
					oFetchDeferred.reject();
					jQuery.sap.log.getLogger().error("HelpUrl Data fetch failed" + response.toString());
				}.bind(this));
							
			},
			
			// readSearchHelpUom: function(searchHelpName, oFetchDeferred){

			// 	var myresponse;
			// 	var myodata;

			// 	var oJsonModelSearchHelp = new sap.ui.model.json.JSONModel();
			// 	var oDataModelSearchHelp = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZGTS_FDA_SRV", true );
			// 	oDataModelSearchHelp.read("/DynamicSearchHelpSet?$filter= Tabname eq 'ZFDA_CTSUOM'", null, null, false,
			// 	function(response, oData) {
			// 		oJsonModelSearchHelp.setData(jQuery.extend({}, response.results));
			// 		myresponse = response;
			// 		myodata = oData;
			// 		if( oData != null )
			// 		{
			// 			this._fdaData.searchHelp_ZFDA_CTSUOM = oData.data.results;
			// 			this.refreshUIScreen();
			// 			oFetchDeferred.resolve();	
			// 		}
			// 	}.bind(this),
			// 	function(response) {
			// 		oFetchDeferred.reject();
			// 		jQuery.sap.log.getLogger().error("HelpUrl Data fetch failed" + response.toString());
			// 	}.bind(this));
							
			// },
			
			resetSearchHelp: function(){
				this._fdaData.searchHelpResult = [];
			},

			readSearchHelpResults: function(oFilter, lSearchHelpName, lSearchService){

				var myresponse;
				var myodata;
				var lEntitySetToCall;
				
				lEntitySetToCall = '/' + lSearchService;
				var oJsonModelSearchHelpResult = new sap.ui.model.json.JSONModel();
				var oDataModelSearchHelpResult = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZGTS_FDA_SRV", true );
				oDataModelSearchHelpResult.read(lEntitySetToCall, {
					filters: oFilter,
					success: function(response, oData) {

								oJsonModelSearchHelpResult.setData(jQuery.extend({}, response.results));
								myresponse = response;
								myodata = oData;
								if( oData != null )
								{
									this._fdaData.searchHelpResult = oData.data.results;
									this.refreshUIScreen();
								}
							}.bind(this),
					error: function(response) {
							jQuery.sap.log.getLogger().error("Data fetch failed" + response.toString());
						}.bind(this)
				});
							
			}


		}); //end of return

	}
);