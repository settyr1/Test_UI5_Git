sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"com/pfizer/ctg/CTG_REQ/model/formatter",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel"
], function (Controller, Formatter, MessageToast, History, MessageBox, Fragment, Export, ExportTypeCSV, Filter,
	FilterOperator, JSONModel) {
	"use strict";

	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.HeaderLevelList", {

		formatter: Formatter,

		onInit: function () {
			var oView = this.getView();
			oView.setModel(new JSONModel({
				globalFilter: ""
			}), "ui");
			this._oGlobalFilter = null;
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function (oEvent) {
			var srchHeadModel = this.getOwnerComponent().getModel("srchHeadModel");
			var results = srchHeadModel.getData();
			this.getView().setModel(srchHeadModel, "srchHeadModel");
			this.getView().byId("idUserName").setText(this.getUserName());
			var srchKey = this.getView().byId("srchText").getValue();
			if (srchKey === "") {
				this.getView().byId("count").setText("Header Results (" + results.length + ")");
			}
		},
		onFilterRows: function () {
			var that = this;
			var filteredResults = this.getView().byId("headerId").getBinding("rows");
			filteredResults.attachChange(function (oEvent) {
				that.getView().byId("count").setText("Header Results (" + oEvent.getSource().iLength + ")");
			});
		},
		filterGlobally: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;
			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter("ReqNo", FilterOperator.Contains, sQuery),
					new Filter("DestTypDesd", FilterOperator.Contains, sQuery),
					new Filter("PriceModelDesc", FilterOperator.Contains, sQuery),
					new Filter("ReqTypDesc", FilterOperator.Contains, sQuery),
					new Filter("ProdName", FilterOperator.Contains, sQuery),
					new Filter("OtherNames", FilterOperator.Contains, sQuery),
					new Filter("PhaseDesc", FilterOperator.Contains, sQuery),
					new Filter("ProdTypDesc", FilterOperator.Contains, sQuery),
					new Filter("HStatDesc", FilterOperator.Contains, sQuery),
					new Filter("ExpiryDt", FilterOperator.Contains, sQuery)
				], false);
			}
			this._filter();
		},
		_filter: function (oEvent) {
			var oFilter = null;
			if (this._oGlobalFilter) {
				oFilter = new sap.ui.model.Filter(this._oGlobalFilter, true);
			}
			this.byId("headerId").getBinding("rows").filter(oFilter, "Application");
			var filteredResults = this.getView().byId("headerId").getBinding("rows");
			this.getView().byId("count").setText("Header Results (" + filteredResults.iLength + ")");
		},
		clearAllFilters: function (oEvent) {
			var tab = this.getView().byId("headerId");
			var oUiModel = this.getView().getModel("ui");
			oUiModel.setProperty("/globalFilter", "");
			this._oGlobalFilter = null;
			this._filter();
			var aColumns = tab.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				tab.filter(aColumns[i], null);
			}
		},
		onReqNoHyperlink: function (oEvent) {
			var sPath = oEvent.getSource().getParent().getBindingContext("srchHeadModel").sPath;
			var sReqHead = this.getView().getModel("srchHeadModel").getProperty(sPath);
			var userName = this.getView().getModel("srchHeadModel").getProperty(sPath).ReqUserId;
			if (userName === this.getUserId()) {
				if (sReqHead.ReqTypDesc === "New") {
					if (sReqHead.HStatus === "DR" || sReqHead.HStatus === "RT") {
						this.onRequestCreDispView(sReqHead.ReqNo, "UPD-DR");
					}
					if (sReqHead.HStatus === "SB" || sReqHead.HStatus === "RW" || sReqHead.HStatus === "AS") {
						if (sReqHead.EffDate === "00/00/0000") {
							this.onRequestCreDispView(sReqHead.ReqNo, "UPD-SB");
						} else {
							this.oRouter.navTo("AppendRequest", {
								reqId: sReqHead.ReqNo,
								action: "DIS"
							});
						}
					}
					if (sReqHead.HStatus === "IP" || sReqHead.HStatus === "AI" ||
						sReqHead.HStatus === "AP" || sReqHead.HStatus === "AC" ||
						sReqHead.HStatus === "EX") {
						this.onRequestPricModelView(sReqHead);
					}
				}
				if (sReqHead.ReqTypDesc === "Update") {
					if (sReqHead.PriceModel === "CM" || sReqHead.PriceModel === "DS" || sReqHead.PriceModel === "FC" || sReqHead.PriceModel === "AC") {
						if (sReqHead.HStatus === "DR" || sReqHead.HStatus === "RT" || sReqHead.HStatus === "SB" ||
							sReqHead.HStatus === "RW" || sReqHead.HStatus === "AS") {
							this.oRouter.navTo("UpdateRequest", {
								reqId: sReqHead.ReqNo,
								action: "UPDT-DR"
							});
						} else {
							this.onRequestPricModelView(sReqHead);
						}
					}
				}
				if (sReqHead.ReqTypDesc === "Renewal") {
					if (sReqHead.HStatus === "DR" || sReqHead.HStatus === "RT" || sReqHead.HStatus === "SB" ||
						sReqHead.HStatus === "RW" || sReqHead.HStatus === "AS") {
						this.oRouter.navTo("RenewRequest", {
							reqNo: sReqHead.ReqNo,
							action: "REN-DR"
						});
					} else {
						this.onRequestPricModelView(sReqHead);
					}
				}
				if (sReqHead.ReqTypDesc === "Legacy") {
					if (sReqHead.PriceModel === "AC") {
						if (sReqHead.HStatus === "DR" || sReqHead.HStatus === "RT" || sReqHead.HStatus === "SB" ||
							sReqHead.HStatus === "RW" || sReqHead.HStatus === "AS") {
							this.oRouter.navTo("AppendRequest", {
								reqId: sReqHead.ReqNo,
								action: "EDIT"
							});
						} else {
							this.onRequestPricModelView(sReqHead);
						}
					} else {
						this.onRequestPricModelView(sReqHead);
					}
				}
			} else {
				if (sReqHead.ReqTypDesc === "New") {
					if (sReqHead.HStatus === "DR" || sReqHead.HStatus === "RT" || sReqHead.HStatus === "SB" ||
						sReqHead.HStatus === "RW" || sReqHead.HStatus === "AS") {
						if (sReqHead.EffDate === "00/00/0000") {
							this.onRequestCreDispView(sReqHead.ReqNo, "DIS");
						} else {
							this.oRouter.navTo("AppendRequest", {
								reqId: sReqHead.ReqNo,
								action: "DIS"
							});
						}
					} else {
						this.onRequestPricModelView(sReqHead);
					}
				}
				if (sReqHead.ReqTypDesc === "Update") {
					if (sReqHead.PriceModel === "CM" || sReqHead.PriceModel === "DS" || sReqHead.PriceModel === "FC" || sReqHead.PriceModel === "AC") {
						if (sReqHead.HStatus === "DR" || sReqHead.HStatus === "RT" || sReqHead.HStatus === "SB" ||
							sReqHead.HStatus === "RW" || sReqHead.HStatus === "AS") {
							this.oRouter.navTo("UpdateRequest", {
								reqId: sReqHead.ReqNo,
								action: "DIS"
							});
						} else {
							this.onRequestPricModelView(sReqHead);
						}
					}
				}
				if (sReqHead.ReqTypDesc === "Renewal") {
					if (sReqHead.HStatus === "DR" || sReqHead.HStatus === "RT" || sReqHead.HStatus === "SB" ||
						sReqHead.HStatus === "RW" || sReqHead.HStatus === "AS") {
						this.oRouter.navTo("RenewRequest", {
							reqNo: sReqHead.ReqNo,
							action: "DIS"
						});
					} else {
						this.onRequestPricModelView(sReqHead);
					}
				}
				if (sReqHead.ReqTypDesc === "Legacy") {
					if (sReqHead.PriceModel === "AC") {
						if (sReqHead.HStatus === "DR" || sReqHead.HStatus === "RT" || sReqHead.HStatus === "SB" ||
							sReqHead.HStatus === "RW" || sReqHead.HStatus === "AS") {
							this.oRouter.navTo("AppendRequest", {
								reqId: sReqHead.ReqNo,
								action: "DIS"
							});
						} else {
							this.onRequestPricModelView(sReqHead);
						}
					} else {
						this.onRequestPricModelView(sReqHead);
					}
				}
			}
		},
		onRequestCreDispView: function (reqNo, action) {
			this.initializeModels();
			var createRequestModel = this.getView().getModel("createRequestModel");
			createRequestModel.setData(null);
			var strengthsModel = this.getView().getModel("strengthsModel");
			strengthsModel.setProperty("/strengths", null);
			var marketsModel = this.getView().getModel("marketsModel");
			marketsModel.setProperty("/market", null);
			var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
			ficPricGrpModel.setProperty("/grpprice", null);
			var fileAttachmentModel = this.getView().getModel("fileAttachmentModel");
			fileAttachmentModel.setProperty("/attachments", null);
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			oModel.read("/ReqCreateSet(ReqNo='" + reqNo + "')", {
				urlParameters: {
					"$expand": ["StrengthsSet", "MarketsSet", "FICPricingSet", "AttachmentsSet"]
				},
				success: function (oData) {
					createRequestModel.setData(oData);
					if (oData.StrengthsSet.results.length > 0) {
						strengthsModel.setProperty("/strengths", oData.StrengthsSet.results);
						that.getView().setModel(strengthsModel, "strengthsModel");
					}
					if (oData.MarketsSet.results.length > 0) {
						marketsModel.setProperty("/market", oData.MarketsSet.results);
						that.getView().setModel(marketsModel, "marketsModel");
					}
					if (oData.FICPricingSet.results.length > 0) {
						ficPricGrpModel.setProperty("/grpprice", oData.FICPricingSet.results);
						that.getView().setModel(ficPricGrpModel, "ficPricGrpModel");
					}
					if (oData.AttachmentsSet.results.length > 0) {
						fileAttachmentModel.setProperty("/attachments", oData.AttachmentsSet.results);
						that.getView().setModel(fileAttachmentModel, "fileAttachmentModel");
					}
					delete createRequestModel.getData().AttachmentsSet;
					var prodTitle = "Product: " + createRequestModel.getData().ProdName + "";
					createRequestModel.setProperty("/ProdTitle", prodTitle);
					that.oRouter.navTo("CreateRequest", {
						reqNo: createRequestModel.getData().ReqNo,
						action: action
					});
				},
				error: function () {}
			});
		},
		onRequestPricModelView: function (sReqHead) {
			if (sReqHead.PriceModel === "CM") {
				this.oRouter.navTo("ValuationComp", {
					reqId: sReqHead.ReqNo,
					priceModel: sReqHead.PriceModelDesc,
					action: "DIS"
				});
			}
			if (sReqHead.PriceModel === "AC") {
				this.oRouter.navTo("ValuationActual", {
					reqId: sReqHead.ReqNo,
					priceModel: sReqHead.PriceModelDesc,
					action: "DIS"
				});
			}
			if (sReqHead.PriceModel === "CP") {
				this.oRouter.navTo("ValuationCostPlus", {
					reqId: sReqHead.ReqNo,
					priceModel: sReqHead.PriceModelDesc,
					action: "DIS"
				});
			}
			if (sReqHead.PriceModel === "FC") {
				this.oRouter.navTo("ValuationFirstInClass", {
					reqId: sReqHead.ReqNo,
					priceModel: sReqHead.PriceModelDesc,
					action: "DIS"
				});
			}
			if (sReqHead.PriceModel === "DS") {
				this.oRouter.navTo("ValuationDiscovery", {
					reqId: sReqHead.ReqNo,
					priceModel: sReqHead.PriceModelDesc,
					action: "DIS"
				});
			}
		},
		onDataExport: function () {
			var f = [];
			if (this.getView().byId("reqNo").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, this.getView().byId("reqNo").getParent().getProperty(
					"filterValue")));
			}
			if (this.getView().byId("reqTypDesc").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("ReqTypDesc", sap.ui.model.FilterOperator.EQ, this.getView().byId("reqTypDesc").getParent().getProperty(
					"filterValue")));
			}
			if (this.getView().byId("destTypDesc").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("DestTypDesd", sap.ui.model.FilterOperator.EQ, this.getView().byId("destTypDesc").getParent().getProperty(
					"filterValue")));
			}
			if (this.getView().byId("prodName").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("ProdName", sap.ui.model.FilterOperator.EQ, this.getView().byId("prodName").getParent().getProperty(
					"filterValue")));
			}
			if (this.getView().byId("otherName").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("OtherNames", sap.ui.model.FilterOperator.EQ, this.getView().byId("otherName").getParent().getProperty(
					"filterValue")));
			}
			if (this.getView().byId("phaseDesc").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("PhaseDesc", sap.ui.model.FilterOperator.EQ, this.getView().byId("phaseDesc").getParent().getProperty(
					"filterValue")));
			}
			if (this.getView().byId("prodTypDesc").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("ProdTypDesc", sap.ui.model.FilterOperator.EQ, this.getView().byId("prodTypDesc").getParent().getProperty(
					"filterValue")));
			}
			if (this.getView().byId("hStatDesc").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("HStatDesc", sap.ui.model.FilterOperator.EQ, this.getView().byId("hStatDesc").getParent().getProperty(
					"filterValue")));
			}
			if (this.getView().byId("expDate").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("ExpiryDt", sap.ui.model.FilterOperator.EQ, this.getView().byId("expDate").getParent().getProperty(
					"filterValue")));
			}
			var oExport = new Export({
				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new ExportTypeCSV({
					separatorChar: ","
				}),
				// Pass in the model created above
				models: this.getOwnerComponent().getModel('srchHeadModel'),
				// binding information for the rows aggregation
				rows: {
					path: "/",
					filters: f
				},
				// column definitions with column name and binding info for the content
				columns: [{
					name: "Request No",
					template: {
						content: "{ReqNo}"
					}
				}, {
					name: "Status",
					template: {
						content: "{HStatDesc}"
					}
				}, {
					name: "Destination Type",
					template: {
						content: "{DestTypDesd}"
					}
				}, {
					name: "Pricing Model",
					template: {
						content: "{PriceModelDesc}"
					}
				}, {
					name: "Product Name",
					template: {
						content: "{ProdName}"
					}
				}, {
					name: "Other Names",
					template: {
						content: "{OtherNames}"
					}
				}, {
					name: "Phase",
					template: {
						content: "{PhaseDesc}"
					}
				}, {
					name: "Product Type",
					template: {
						content: "{ProdTypDesc}"
					}
				}, {
					name: "Expiration Date",
					template: {
						content: "{ExpiryDt}"
					}
				}, {
					name: "Request Type",
					template: {
						content: "{ReqTypDesc}"
					}
				}]
			});
			// download exported file
			oExport.saveFile().catch(function (oError) {
				sap.m.MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},
		onHome: function (oEvent) {
			this.oRouter.navTo("MainView", true);
			this.onReturnToHome();
			this.clearAllFilters();
		},
		onNavBack: function () {
			this.setRaisedEvent("NAVBACK");
			this.clearAllFilters();
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.oRouter.navTo("SearchandReport", {}, true);
			}
		}

	});
});