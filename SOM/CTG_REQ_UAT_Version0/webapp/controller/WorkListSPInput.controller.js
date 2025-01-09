sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"sap/m/MessageBox",
	"jquery.sap.global",
	"sap/m/TablePersoController",
	"com/pfizer/ctg/CTG_REQ/model/wrkListPersoServ",
	"com/pfizer/ctg/CTG_REQ/model/formatter",
	"sap/ui/core/routing/History"
], function (Controller, MessageBox, jQuery, TablePersoController, wrkListPersoServ, Formatter, History) {
	"use strict";

	var aDataAwaitInpt = [];
	var aDataPriorInpt = [];
	var selectedSortItemId;

	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.WorkListSPInput", {

		formatter: Formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._onObjectMatched, this);

			// init and activate controller
			this._oTPC = new TablePersoController({
				table: this.byId("wrkListCommerTab"),
				componentName: "commercialPersServ",
				persoService: wrkListPersoServ
			}).activate();
		},

		onFilter: function (oEvent) {
			var elementId = oEvent.getSource().getId();
			var pos = elementId.indexOf("filterCommercial");
			if (pos >= 0) {
				this._oTPC.openDialog();
			}
		},

		onTablePersoRefresh: function () {
			wrkListPersoServ.resetPersData();
			this._oTPC.refresh();
		},

		onSearch: function (oEvent) {
			var oTable;
			var aFilter;
			var srchStr = oEvent.getParameter("query");
			if (!srchStr) {
				srchStr = oEvent.getParameter("newValue");
			}
			if (!srchStr) {
				oTable = this.getView().byId("wrkListCommerTab");
				oTable.getBinding("items").filter(aFilter);
				return;
			}
			var oReqNo = new sap.ui.model.Filter(
				"ReqNo",
				sap.ui.model.FilterOperator.Contains, srchStr);
			var oReqTyp = new sap.ui.model.Filter(
				"ReqTyp",
				sap.ui.model.FilterOperator.Contains, srchStr);
			var oProdName = new sap.ui.model.Filter(
				"ProdName",
				sap.ui.model.FilterOperator.Contains, srchStr);
			var oProdId = new sap.ui.model.Filter(
				"ProdId",
				sap.ui.model.FilterOperator.Contains, srchStr);
			var oReqName = new sap.ui.model.Filter(
				"ValuName",
				sap.ui.model.FilterOperator.Contains, srchStr);
			var oDevPhDesc = new sap.ui.model.Filter(
				"DevPhDesc",
				sap.ui.model.FilterOperator.Contains, srchStr);
			var oHStatus = new sap.ui.model.Filter(
				"HeadStatus",
				sap.ui.model.FilterOperator.Contains, srchStr);
			var oSubmitDate = new sap.ui.model.Filter(
				"SubmitDate",
				sap.ui.model.FilterOperator.Contains, srchStr);
			var oEffectvDate = new sap.ui.model.Filter(
				"EffectvDate",
				sap.ui.model.FilterOperator.Contains, srchStr);
			var oExpiryDate = new sap.ui.model.Filter(
				"ExpiryDate",
				sap.ui.model.FilterOperator.Contains, srchStr);
			var oRequstName = new sap.ui.model.Filter(
				"RequstName",
				sap.ui.model.FilterOperator.Contains, srchStr);
			var oSPInptName = new sap.ui.model.Filter(
				"SPInptName",
				sap.ui.model.FilterOperator.Contains, srchStr);
			var oApprvName = new sap.ui.model.Filter(
				"ApprvName",
				sap.ui.model.FilterOperator.Contains, srchStr);
			var oLineItems = new sap.ui.model.Filter(
				"ALLPosnr",
				sap.ui.model.FilterOperator.Contains, srchStr);

			var oFilter = new sap.ui.model.Filter(
				[oReqNo, oReqTyp, oProdName, oProdId, oReqName, oDevPhDesc, oHStatus, oSubmitDate, oEffectvDate, oExpiryDate,
					oRequstName, oSPInptName, oApprvName, oLineItems
				]
			);
			aFilter = [oFilter];
			oTable = this.getView().byId("wrkListCommerTab");
			oTable.getBinding("items").filter(aFilter);
		},

		onSort: function (oEvent) {
			var i;
			var pos;
			var elementId = oEvent.getSource().getId();
			pos = elementId.indexOf("sortCommercial");
			if (pos >= 0) {
				var oTPC = this._oTPC;
				var aColumns = oTPC.getPersoService()._oBundle.aColumns;
				var oDataCol = oTPC.getPersoService().getData();
				var oSortFragment = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.WrkListSortFilter", this);
				for (i = 0; i < aColumns.length; i++) {
					if (aColumns[i].visible) {
						oSortFragment.addSortItem(new sap.m.ViewSettingsItem({
							text: aColumns[i].text,
							key: oDataCol.aColumns[i].id
						}));
						if (selectedSortItemId === oDataCol.aColumns[i].id) {
							oSortFragment.setSelectedSortItem(oSortFragment.getSortItems()[i]);
							var sortItemSet = "X";
						}
					}
				}
				if (!sortItemSet) {
					oSortFragment.setSelectedSortItem(oSortFragment.getSortItems()[0]);
				}
				this._oDialog = oSortFragment;
				this._oDialog.open();
			}
		},

		onConfirm: function (oEvent) {
			var oTable;
			var oView = this.getView();
			oTable = oView.byId("wrkListCommerTab");
			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");
			var aSorters = [];
			var sPath = mParams.sortItem.getKey();
			selectedSortItemId = sPath;
			var bDescending = mParams.sortDescending;
			aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
		},

		onAwaitIPClick: function (oEvent) {
			var oButton = oEvent.getSource();
			oButton.setType("Emphasized");
			this.byId("bPriorSPInpt").setType("Transparent");

			var reqHeadModel = this.getView().getModel("reqHeadModel");
			reqHeadModel.setProperty("/ReqHeadSet", aDataAwaitInpt);
			this.getView().setModel(reqHeadModel, "reqHeadModel");
			this.byId("bAwaitSPInpt").setText("Awaiting Input (" + aDataAwaitInpt.length.toString() + ")");
			this.byId("titleId").setText("Requests (" + aDataAwaitInpt.length.toString() + ")");
			var oTable = this.byId("wrkListCommerTab");
			var oColl = oTable.getColumns();
			var i = 0;
			for (i = 0; i < oColl.length; i++) {
				if (oColl[i].getId().indexOf("HeadStatus") >= 0) {
					oColl[i].setVisible(false);
				}
			}
		},

		onPriorIPClick: function (oEvent) {
			var oButton = oEvent.getSource();
			oButton.setType("Emphasized");
			this.byId("bAwaitSPInpt").setType("Transparent");
			var reqHeadModel = this.getView().getModel("reqHeadModel");
			reqHeadModel.setProperty("/ReqHeadSet", aDataPriorInpt);
			this.getView().setModel(reqHeadModel, "reqHeadModel");

			this.byId("bPriorSPInpt").setText("Previous Input (" + aDataPriorInpt.length.toString() + ")");
			this.byId("titleId").setText("Requests (" + aDataPriorInpt.length.toString() + ")");
			var oTable = this.byId("wrkListCommerTab");
			var oColl = oTable.getColumns();
			var i = 0;
			for (i = 0; i < oColl.length; i++) {
				if (oColl[i].getId().indexOf("HeadStatus") >= 0) {
					oColl[i].setVisible(true);
				}
			}
		},

		_onObjectMatched: function (oEvent) {
			if (oEvent.getParameters().name !== "WorkListSPInput") {
				return;
			}
			var i = 0;
			var reqHeadModel = this.getView().getModel("reqHeadModel");
			var that = this;
			var pUserId = oEvent.getParameters("WorkList").arguments.userId;
			if (pUserId) {
				var oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, pUserId);
				var oFilter1 = new sap.ui.model.Filter("UserRole", sap.ui.model.FilterOperator.EQ, "SPINPUTTER");
				var aFilter = [oFilter, oFilter1];
				var oModel = this.getOwnerComponent().getModel();

				oModel.read("/ReqHeadSet", {
					filters: aFilter,
					success: function (oData) {
						if (oData.results.length === 0) {
							that.byId("bAwaitSPInpt").setText("Awaiting Input (0)");
						}

						i = 0;
						aDataAwaitInpt = [];
						aDataPriorInpt = [];

						for (i = 0; i < oData.results.length; i++) {
							if (oData.results[i].HStatus === "BU") {
								oData.results[i].ApprvName = oData.results[i].ValName;
								aDataAwaitInpt.push(oData.results[i]);
							}
						}
						for (i = 0; i < oData.results.length; i++) {
							if (oData.results[i].PriceModel === "CM") {
								if (oData.results[i].SPInptName !== "") {
									if (oData.results[i].HStatus === "IP" || oData.results[i].HStatus === "AI" ||
										oData.results[i].HStatus === "AP" || oData.results[i].HStatus === "AA" ||
										oData.results[i].HStatus === "AC") {
										oData.results[i].ApprvName = oData.results[i].ValName;
										aDataPriorInpt.push(oData.results[i]);
									}
								}
							}
						}
						var oTable = that.byId("wrkListCommerTab");
						var oColl = oTable.getColumns();
						var j = 0;
						if (that.byId("bAwaitSPInpt").getType() === "Emphasized") {
							reqHeadModel.setProperty("/ReqHeadSet", aDataAwaitInpt);
							that.getView().setModel(reqHeadModel, "reqHeadModel");
							for (j = 0; j < oColl.length; j++) {
								if (oColl[j].getId().indexOf("HeadStatus") >= 0) {
									oColl[j].setVisible(false);
								}
							}							
						}
						if (that.byId("bPriorSPInpt").getType() === "Emphasized") {
							reqHeadModel.setProperty("/ReqHeadSet", aDataPriorInpt);
							that.getView().setModel(reqHeadModel, "reqHeadModel");
							for (j = 0; j < oColl.length; j++) {
								if (oColl[j].getId().indexOf("HeadStatus") >= 0) {
									oColl[j].setVisible(true);
								}
							}
						}

						that.byId("bAwaitSPInpt").setText("Awaiting Input (" + aDataAwaitInpt.length.toString() + ")");
						that.byId("titleId").setText("Requests (" + aDataAwaitInpt.length.toString() + ")");
						that.byId("bPriorSPInpt").setText("Previous Input (" + aDataPriorInpt.length.toString() + ")");
					},
					error: function () {}
				});
			}
		},

		onAfterRendering: function () {
			if (this.getUserName() === undefined) {
				var oModel = this.getOwnerComponent().getModel();
				var that = this;
				var oUser = new sap.ushell.services.UserInfo();
				var iUserId = oUser.getId();
				if (iUserId) {
					var oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, iUserId);
					var aFilter = [oFilter];
					oModel.read("/UserInfoSet", {
						filters: aFilter,
						success: function (oData) {
							that.setUserName(oData.results[0].UserId, oData.results[0].UserName);
							that.byId("idUserName").setText(that.getUserName());
						},
						error: function () {}
					});
				}
			} else {
				this.byId("idUserName").setText(this.getUserName());
			}
		},

		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				this.setRaisedEvent("NAVBACK");
				window.history.go(-1);
			} else {
				this.oRouter.navTo("MainView", true);
			}
		},

		onReqNoClick: function (oEvent) {
			var sReqHead;
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			var reqHeadModel = this.getView().getModel("reqHeadModel");
			sReqHead = reqHeadModel.getProperty(sPath);
			if (this.byId("bAwaitSPInpt").getType() === "Emphasized") {
				if (sReqHead.PriceModel === "CM") {
					this.oRouter.navTo("ValuationComp", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "UPD-SP"
					});
				}
				if (sReqHead.PriceModel === "AC") {
					this.oRouter.navTo("ValuationActual", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "UPD-SP"
					});
				}
				if (sReqHead.PriceModel === "CP") {
					this.oRouter.navTo("ValuationCostPlus", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "UPD-SP"
					});
				}
				if (sReqHead.PriceModel === "FC") {
					this.oRouter.navTo("ValuationFirstInClass", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "UPD-SP"
					});
				}
				if (sReqHead.PriceModel === "DS") {
					this.oRouter.navTo("ValuationDiscovery", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "UPD-SP"
					});
				}
			}
			if (this.byId("bPriorSPInpt").getType() === "Emphasized") {
				if (sReqHead.PriceModel === "CM") {
					this.oRouter.navTo("ValuationComp", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "DIS-SP"
					});
				}
				if (sReqHead.PriceModel === "AC") {
					this.oRouter.navTo("ValuationActual", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "DIS-SP"
					});
				}
				if (sReqHead.PriceModel === "CP") {
					this.oRouter.navTo("ValuationCostPlus", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "DIS-SP"
					});
				}
				if (sReqHead.PriceModel === "FC") {
					this.oRouter.navTo("ValuationFirstInClass", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "DIS-SP"
					});
				}
				if (sReqHead.PriceModel === "DS") {
					this.oRouter.navTo("ValuationDiscovery", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "DIS-SP"
					});
				}
			}
		},
		onNameClick: function () {
			this.onShareEmailPress();
		},

		onHome: function () {
			this.onReturnToHome();
		}

	});
});