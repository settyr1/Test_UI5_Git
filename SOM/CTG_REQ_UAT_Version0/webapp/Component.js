/* global document */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/pfizer/ctg/CTG_REQ/model/models",
	"com/pfizer/ctg/CTG_REQ/controller/ErrorHandler",
	"sap/ui/core/routing/HashChanger"
], function (UIComponent, Device, models, ErrorHandler, HashTagChng) {
	"use strict";

	return UIComponent.extend("com.pfizer.ctg.CTG_REQ.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the FLP and device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// set the FLP model
			this.setModel(models.createFLPModel(), "FLP");

			// create the views based on the url/hash
			this.getRouter().initialize();

			//set Global Application Model
			var userInfoModel = new sap.ui.model.json.JSONModel();
			userInfoModel.setData({
				ReqstorSet: [],
				VFCMgrSet: [],
				SPInputSet: [],
				ApprvSet: [],
				SrchReptSet: [],
				AdminSet: []
			});
			this.setModel(userInfoModel, "userInfoModel");

			var srchHeadModel = new sap.ui.model.json.JSONModel();
			srchHeadModel.setData({
				ReqSrchQuery: []
			});
			this.setModel(srchHeadModel, "srchHeadModel");

			var reqHeadModel = new sap.ui.model.json.JSONModel();
			reqHeadModel.setData({
				ReqHeadSet: []
			});
			this.setModel(reqHeadModel, "reqHeadModel");

			var reqHExtnModel = new sap.ui.model.json.JSONModel();
			reqHExtnModel.setData({
				ReqHExtnSet: []
			});
			this.setModel(reqHExtnModel, "reqHExtnModel");

			var reqHPreComModel = new sap.ui.model.json.JSONModel();
			reqHPreComModel.setData({
				ReqHPreCM: []
			});
			this.setModel(reqHPreComModel, "reqHPreComModel");

			var SPINamesModel = new sap.ui.model.json.JSONModel();
			SPINamesModel.setData({
				spInptId: []
			});
			this.setModel(SPINamesModel, "SPINamesModel");

			var prodTypeModel = new sap.ui.model.json.JSONModel();
			prodTypeModel.setData({
				myData: []
			});
			this.setModel(prodTypeModel, "prodTypeModel");

			var prodSrchModel = new sap.ui.model.json.JSONModel();
			prodSrchModel.setData({
				products: []
			});
			prodSrchModel.setSizeLimit(5000);
			this.setModel(prodSrchModel, "prodSrchModel");

			var selectedProdModel = new sap.ui.model.json.JSONModel();
			selectedProdModel.setData({
				matchedItems: []
			});
			selectedProdModel.setSizeLimit(5000);
			this.setModel(selectedProdModel, "selectedProdModel");

			var prodSrchWrkListModel = new sap.ui.model.json.JSONModel();
			prodSrchWrkListModel.setData({
				ProdReqItems: []
			});
			this.setModel(prodSrchWrkListModel, "prodSrchWrkListModel");

			var createProductModel = new sap.ui.model.json.JSONModel();
			this.setModel(createProductModel, "createProductModel");

			var otherNamesModel = new sap.ui.model.json.JSONModel();
			otherNamesModel.setData({
				Names: [{
					ProdId: "",
					Qualifier: "",
					ProdName: ""
				}]
			});
			this.setModel(otherNamesModel, "otherNamesModel");

			var newProdReqModel = new sap.ui.model.json.JSONModel();
			newProdReqModel.setData({
				ProdList: []
			});
			this.setModel(newProdReqModel, "newProdReqModel");

			var prodWrkListModel = new sap.ui.model.json.JSONModel();
			prodWrkListModel.setData({
				ProdList: []
			});
			this.setModel(prodWrkListModel, "prodWrkListModel");

			var dropDownModel = new sap.ui.model.json.JSONModel();
			dropDownModel.setData({
				devPhase: [],
				prodType: [],
				finiGoodsForm: [],
				prodSource: [],
				primaryInd: [],
				mechOfAction: [],
				destMarkets: [],
				uomValues: [],
				procureType: [],
				destType: [],
				pricing: [],
				reqGrp: [],
				intPercent: [],
				attriRate: [],
				aPIDiscnt: [],
				ficGrp: [],
				prodqualifier: []
			});
			dropDownModel.setSizeLimit(1000);
			this.setModel(dropDownModel, "dropDownModel");

			var priIndHierModel = new sap.ui.model.json.JSONModel();
			priIndHierModel.setData({
				priIndLevel1: [],
				priIndLevel2: [],
				priIndLevel3: []
			});
			this.setModel(priIndHierModel, "priIndHierModel");

			var createRequestModel = new sap.ui.model.json.JSONModel();
			this.setModel(createRequestModel, "createRequestModel");

			var reqDetailsModel = new sap.ui.model.json.JSONModel();
			this.setModel(reqDetailsModel, "reqDetailsModel");

			var savedVariantModel = new sap.ui.model.json.JSONModel();
			this.setModel(savedVariantModel, "savedVariantModel");

			var strengthsModel = new sap.ui.model.json.JSONModel();
			strengthsModel.setData({
				strengths: [{
					ReqNo: "",
					Strn1: "",
					SUoM1: "",
					Strn2: "",
					SUoM2: "",
					Strn3: "",
					SUoM3: "",
					Active: ""
				}]
			});
			this.setModel(strengthsModel, "strengthsModel");

			var marketsModel = new sap.ui.model.json.JSONModel();
			marketsModel.setData({
				market: [{
					ReqNo: "",
					Land1: "",
					Active: ""
				}]
			});
			this.setModel(marketsModel, "marketsModel");

			var ficPricGrpModel = new sap.ui.model.json.JSONModel();
			this.setModel(ficPricGrpModel, "ficPricGrpModel");

			var fileAttachmentModel = new sap.ui.model.json.JSONModel();
			fileAttachmentModel.setData({
				attachments: []
			});
			this.setModel(fileAttachmentModel, "fileAttachmentModel");

			var valuCtryPricModel = new sap.ui.model.json.JSONModel();
			valuCtryPricModel.setData({
				ValuCtryPricSet: [],
				AvgWhoSalePric: ""
			});
			this.setModel(valuCtryPricModel, "valuCtryPricModel");

			var reqAudtLogModel = new sap.ui.model.json.JSONModel();
			reqAudtLogModel.setData({
				ReqAudtLogSet: []
			});
			this.setModel(reqAudtLogModel, "reqAudtLogModel");

			var prodSummModel = new sap.ui.model.json.JSONModel();
			prodSummModel.setData({
				ProdSummSet: []
			});
			this.setModel(prodSummModel, "prodSummModel");

			//Hide Shell Header thru Renderer
			if (sap.ushell.Container) {
				var oRenderer = sap.ushell.Container.getRenderer("fiori2");
				oRenderer.setHeaderVisibility(false);
			}
		},
		destroy: function () {
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}

	});

});