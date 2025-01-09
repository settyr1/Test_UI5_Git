sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"sap/m/MessageToast",
	"jquery.sap.global",
	"sap/m/TablePersoController",
	"com/pfizer/ctg/CTG_REQ/model/wrkListPersoServ",
	"com/pfizer/ctg/CTG_REQ/model/formatter"
], function (Controller, MessageToast, jQuery, TablePersoController, wrkListPersoServ, Formatter) {
	"use strict";
	var aDataDraft = [];
	var aDataSubmit = [];
	var aDataRet = [];
	var aDataInprog = [];
	var aDataAppend = [];
	var aDataAct = [];
	var selectedSortItemId;
	var userId;
	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.WorkListRequestor", {
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
			var oPricModl = new sap.ui.model.Filter(
				"PricModl",
				sap.ui.model.FilterOperator.Contains, srchStr);
			var oFilter = new sap.ui.model.Filter(
				[oReqNo, oReqTyp, oProdName, oProdId, oReqName, oDevPhDesc, oHStatus, oSubmitDate, oEffectvDate, oExpiryDate,
					oRequstName, oSPInptName, oApprvName, oLineItems, oPricModl
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

		onDraftClick: function (oEvent) {
			var oButton = oEvent.getSource();
			oButton.setType("Emphasized");
			this.onDraft();
		},

		onDraft: function () {
			this.byId("bSubmit").setType("Transparent");
			this.byId("bReturn").setType("Transparent");
			this.byId("bProgress").setType("Transparent");
			this.byId("bAppended").setType("Transparent");
			this.byId("bActive").setType("Transparent");

			var reqHeadModel = this.getView().getModel("reqHeadModel");
			reqHeadModel.setProperty("/ReqHeadSet", aDataDraft);
			this.getView().setModel(reqHeadModel, "reqHeadModel");

			this.byId("bDraft").setText("My Drafts (" + aDataDraft.length.toString() + ")");
			this.byId("titleId").setText("Requests (" + aDataDraft.length.toString() + ")");

			var oTable = this.getView().byId("wrkListCommerTab");
			var oColl = oTable.getColumns();
			var i = 0;
			for (i = 0; i < oColl.length; i++) {
				if (oColl[i].getId().indexOf("EffectvDate") >= 0 ||
					oColl[i].getId().indexOf("ExpiryDate") >= 0 ||
					oColl[i].getId().indexOf("ValName") >= 0 ||
					oColl[i].getId().indexOf("SPInptName") >= 0 ||
					oColl[i].getId().indexOf("ALLPosnr") >= 0 ||
					oColl[i].getId().indexOf("HeadStatus") >= 0 ||
					oColl[i].getId().indexOf("PricModl") >= 0 ||
					oColl[i].getId().indexOf("ApprvName") >= 0) {
					oTable.getColumns()[i].setVisible(false);
				} else {
					oTable.getColumns()[i].setVisible(true);
				}
				if (oColl[i].getId().indexOf("SubmitDate") >= 0) {
					oTable.getColumns()[i].getHeader().setText("Date Created");
				}
			}
		},

		onSubmitClick: function (oEvent) {
			var oButton = oEvent.getSource();
			oButton.setType("Emphasized");
			this.onSubmit();
		},

		onSubmit: function () {
			this.byId("bDraft").setType("Transparent");
			this.byId("bReturn").setType("Transparent");
			this.byId("bProgress").setType("Transparent");
			this.byId("bAppended").setType("Transparent");
			this.byId("bActive").setType("Transparent");

			var reqHeadModel = this.getView().getModel("reqHeadModel");
			reqHeadModel.setProperty("/ReqHeadSet", aDataSubmit);
			this.getView().setModel(reqHeadModel, "reqHeadModel");

			this.byId("bSubmit").setText("Submitted (" + aDataSubmit.length.toString() + ")");
			this.byId("titleId").setText("Requests (" + aDataSubmit.length.toString() + ")");

			var oTable = this.getView().byId("wrkListCommerTab");
			var oColl = oTable.getColumns();
			var i = 0;
			for (i = 0; i < oColl.length; i++) {
				if (oColl[i].getId().indexOf("EffectvDate") >= 0 ||
					oColl[i].getId().indexOf("ExpiryDate") >= 0 ||
					oColl[i].getId().indexOf("ValName") >= 0 ||
					oColl[i].getId().indexOf("SPInptName") >= 0 ||
					oColl[i].getId().indexOf("ALLPosnr") >= 0 ||
					oColl[i].getId().indexOf("PricModl") >= 0 ||
					oColl[i].getId().indexOf("ApprvName") >= 0) {
					oTable.getColumns()[i].setVisible(false);
				} else {
					oTable.getColumns()[i].setVisible(true);
				}
				if (oColl[i].getId().indexOf("SubmitDate") >= 0) {
					oTable.getColumns()[i].getHeader().setText("Date Submitted");
				}
			}
		},

		onReturnClick: function (oEvent) {
			var oButton = oEvent.getSource();
			oButton.setType("Emphasized");
			this.onReturn();
		},

		onReturn: function () {
			this.byId("bDraft").setType("Transparent");
			this.byId("bSubmit").setType("Transparent");
			this.byId("bProgress").setType("Transparent");
			this.byId("bAppended").setType("Transparent");
			this.byId("bActive").setType("Transparent");

			var reqHeadModel = this.getView().getModel("reqHeadModel");
			reqHeadModel.setProperty("/ReqHeadSet", aDataRet);
			this.getView().setModel(reqHeadModel, "reqHeadModel");

			this.byId("bReturn").setText("Returned (" + aDataRet.length.toString() + ")");
			this.byId("titleId").setText("Requests (" + aDataRet.length.toString() + ")");

			var oTable = this.getView().byId("wrkListCommerTab");
			var oColl = oTable.getColumns();
			var i = 0;
			for (i = 0; i < oColl.length; i++) {
				if (oColl[i].getId().indexOf("EffectvDate") >= 0 ||
					oColl[i].getId().indexOf("ExpiryDate") >= 0 ||
					oColl[i].getId().indexOf("SPInptName") >= 0 ||
					oColl[i].getId().indexOf("ALLPosnr") >= 0 ||
					oColl[i].getId().indexOf("HeadStatus") >= 0 ||
					oColl[i].getId().indexOf("PricModl") >= 0 ||
					oColl[i].getId().indexOf("ValName") >= 0 ||
					oColl[i].getId().indexOf("ApprvName") >= 0) {
					oTable.getColumns()[i].setVisible(false);
				} else {
					oTable.getColumns()[i].setVisible(true);
				}
				if (oColl[i].getId().indexOf("SubmitDate") >= 0) {
					oTable.getColumns()[i].getHeader().setText("Date Submitted");
				}
			}
		},

		onProgressClick: function (oEvent) {
			var oButton = oEvent.getSource();
			oButton.setType("Emphasized");
			this.onProgress();
		},

		onProgress: function () {
			this.byId("bDraft").setType("Transparent");
			this.byId("bSubmit").setType("Transparent");
			this.byId("bReturn").setType("Transparent");
			this.byId("bAppended").setType("Transparent");
			this.byId("bActive").setType("Transparent");

			var reqHeadModel = this.getView().getModel("reqHeadModel");
			reqHeadModel.setProperty("/ReqHeadSet", aDataInprog);
			this.getView().setModel(reqHeadModel, "reqHeadModel");

			this.byId("bProgress").setText("In-progress (" + aDataInprog.length.toString() + ")");
			this.byId("titleId").setText("Requests (" + aDataInprog.length.toString() + ")");

			var oTable = this.getView().byId("wrkListCommerTab");
			var oColl = oTable.getColumns();
			var i = 0;
			for (i = 0; i < oColl.length; i++) {
				if (oColl[i].getId().indexOf("EffectvDate") >= 0 ||
					oColl[i].getId().indexOf("ExpiryDate") >= 0 ||
					oColl[i].getId().indexOf("ApprvName") >= 0 ||
					oColl[i].getId().indexOf("ALLPosnr") >= 0 ||
					oColl[i].getId().indexOf("RequstName") >= 0) {
					oTable.getColumns()[i].setVisible(false);
				} else {
					oTable.getColumns()[i].setVisible(true);
				}
				if (oColl[i].getId().indexOf("SubmitDate") >= 0) {
					oTable.getColumns()[i].getHeader().setText("Set to In-Progress Date");
				}
			}
		},

		onAppendClick: function (oEvent) {
			var oButton = oEvent.getSource();
			oButton.setType("Emphasized");
			this.onAppend();
		},

		onAppend: function () {
			this.byId("bDraft").setType("Transparent");
			this.byId("bSubmit").setType("Transparent");
			this.byId("bReturn").setType("Transparent");
			this.byId("bProgress").setType("Transparent");
			this.byId("bActive").setType("Transparent");

			var reqHeadModel = this.getView().getModel("reqHeadModel");
			reqHeadModel.setProperty("/ReqHeadSet", aDataAppend);
			this.getView().setModel(reqHeadModel, "reqHeadModel");

			this.byId("bAppended").setText("Appended (" + aDataAppend.length.toString() + ")");
			this.byId("titleId").setText("Requests (" + aDataAppend.length.toString() + ")");

			var oTable = this.getView().byId("wrkListCommerTab");
			var oColl = oTable.getColumns();
			var i = 0;
			for (i = 0; i < oColl.length; i++) {
				if (oColl[i].getId().indexOf("RequstName") >= 0 ||
					oColl[i].getId().indexOf("ValName") >= 0 ||
					oColl[i].getId().indexOf("SPInptName") >= 0 ||
					oColl[i].getId().indexOf("EffectvDate") >= 0 ||
					oColl[i].getId().indexOf("PricModl") >= 0 ||
					oColl[i].getId().indexOf("ApprvName") >= 0) {
					oTable.getColumns()[i].setVisible(false);
				} else {
					oTable.getColumns()[i].setVisible(true);
				}
				if (oColl[i].getId().indexOf("SubmitDate") >= 0) {
					oTable.getColumns()[i].getHeader().setText("Date Appended");
				}
			}
		},

		onActiveClick: function (oEvent) {
			var oButton = oEvent.getSource();
			oButton.setType("Emphasized");
			this.onActive();
		},

		onActive: function () {
			this.byId("bDraft").setType("Transparent");
			this.byId("bSubmit").setType("Transparent");
			this.byId("bReturn").setType("Transparent");
			this.byId("bAppended").setType("Transparent");
			this.byId("bProgress").setType("Transparent");

			var reqHeadModel = this.getView().getModel("reqHeadModel");
			reqHeadModel.setProperty("/ReqHeadSet", aDataAct);
			this.getView().setModel(reqHeadModel, "reqHeadModel");

			this.byId("bActive").setText("Active (" + aDataAct.length.toString() + ")");
			this.byId("titleId").setText("Requests (" + aDataAct.length.toString() + ")");

			var oTable = this.getView().byId("wrkListCommerTab");
			var oColl = oTable.getColumns();
			var i = 0;
			for (i = 0; i < oColl.length; i++) {
				if (oColl[i].getId().indexOf("RequstName") >= 0 ||
					oColl[i].getId().indexOf("ValName") >= 0 ||
					oColl[i].getId().indexOf("SPInptName") >= 0 ||
					oColl[i].getId().indexOf("ALLPosnr") >= 0 ||
					oColl[i].getId().indexOf("SubmitDate") >= 0 ||
					oColl[i].getId().indexOf("ApprvName") >= 0) {
					oTable.getColumns()[i].setVisible(false);
				} else {
					oTable.getColumns()[i].setVisible(true);
				}
				if (oColl[i].getId().indexOf("SubmitDate") >= 0) {
					oTable.getColumns()[i].getHeader().setText("Date Submitted");
				}
			}
		},

		_onObjectMatched: function (oEvent) {
			if (oEvent.getParameters().name !== "WorkListRequestor") {
				return;
			}
			if (this.getRaisedEvent() === "NAVBACK") {
				this.setRaisedEvent(null);
				return;
			}
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			if (userInfoModel.getData().ReqstorSet.Create === "") {
				this.byId("createReqCM").setVisible(false);
			}

			var oTable = this.getView().byId("wrkListCommerTab");
			var oColl = oTable.getColumns();
			var i = 0;
			for (i = 0; i < oColl.length; i++) {
				if (oColl[i].getId().indexOf("EffectvDate") >= 0 ||
					oColl[i].getId().indexOf("ExpiryDate") >= 0 ||
					oColl[i].getId().indexOf("ValName") >= 0 ||
					oColl[i].getId().indexOf("SPInptName") >= 0 ||
					oColl[i].getId().indexOf("ALLPosnr") >= 0 ||
					oColl[i].getId().indexOf("HeadStatus") >= 0 ||
					oColl[i].getId().indexOf("PricModl") >= 0 ||
					oColl[i].getId().indexOf("ApprvName") >= 0) {
					oTable.getColumns()[i].setVisible(false);
				} else {
					if (oColl[i].getId().indexOf("SubmitDate") >= 0) {
						oTable.getColumns()[i].getHeader().setText("Date Created");
					}
				}
			}
			var naviToTab = oEvent.getParameters("WorkList").arguments.statTab;
			if (naviToTab === "DR") {
				this.byId("bDraft").setType("Emphasized");
			} else if (naviToTab === "SB") {
				this.byId("bSubmit").setType("Emphasized");
			}
			var reqHeadModel = this.getView().getModel("reqHeadModel");
			var that = this;
			var pUserId = oEvent.getParameters("WorkList").arguments.userId;
			if (pUserId) {
				var oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, pUserId);
				var oFilter1 = new sap.ui.model.Filter("UserRole", sap.ui.model.FilterOperator.EQ, "CREATOR");
				var aFilter = [oFilter, oFilter1];
				var oModel = this.getOwnerComponent().getModel();
				oModel.read("/ReqHeadSet", {
					filters: aFilter,
					success: function (oData) {
						i = 0;
						aDataDraft = [];
						aDataSubmit = [];
						aDataRet = [];
						aDataInprog = [];
						aDataAct = [];
						aDataAppend = [];

						for (i = 0; i < oData.results.length; i++) {
							if (oData.results[i].HStatus === "DR") {
								aDataDraft.push(oData.results[i]);
							}
							if (oData.results[i].HStatus === "SB" ||
								oData.results[i].HStatus === "RW" || //Re-Submitted
								oData.results[i].HStatus === "AS") { //Active (Submitted)
								aDataSubmit.push(oData.results[i]);
							}
							if (oData.results[i].HStatus === "RT") {
								aDataRet.push(oData.results[i]);
							}
							if (oData.results[i].HStatus === "IP" ||
								oData.results[i].HStatus === "AI" ||
								oData.results[i].HStatus === "BU" ||
								oData.results[i].HStatus === "AP" ||
								oData.results[i].HStatus === "AA") {
								aDataInprog.push(oData.results[i]);
							}
							if (oData.results[i].HStatus === "AS" ||
								oData.results[i].HStatus === "AI" ||
								oData.results[i].HStatus === "AA") { //Appended
								aDataAppend.push(oData.results[i]);
							}
							if (oData.results[i].HStatus === "AC") {
								aDataAct.push(oData.results[i]);
							}
						}
						if (that.byId("bDraft").getType() === "Emphasized") {
							reqHeadModel.setProperty("/ReqHeadSet", aDataDraft);
							that.getView().setModel(reqHeadModel, "reqHeadModel");
							that.onDraft();
						}
						if (that.byId("bSubmit").getType() === "Emphasized") {
							reqHeadModel.setProperty("/ReqHeadSet", aDataSubmit);
							that.getView().setModel(reqHeadModel, "reqHeadModel");
							that.onSubmit();
						}
						if (that.byId("bReturn").getType() === "Emphasized") {
							reqHeadModel.setProperty("/ReqHeadSet", aDataRet);
							that.getView().setModel(reqHeadModel, "reqHeadModel");
							that.onReturn();
						}
						if (that.byId("bProgress").getType() === "Emphasized") {
							reqHeadModel.setProperty("/ReqHeadSet", aDataInprog);
							that.getView().setModel(reqHeadModel, "reqHeadModel");
							that.onProgress();
						}
						if (that.byId("bAppended").getType() === "Emphasized") {
							reqHeadModel.setProperty("/ReqHeadSet", aDataAppend);
							that.getView().setModel(reqHeadModel, "reqHeadModel");
							that.onAppend();
						}
						if (that.byId("bActive").getType() === "Emphasized") {
							reqHeadModel.setProperty("/ReqHeadSet", aDataAct);
							that.getView().setModel(reqHeadModel, "reqHeadModel");
							that.onActive();
						}

						that.byId("bDraft").setText("My Drafts (" + aDataDraft.length.toString() + ")");
						that.byId("bSubmit").setText("Submitted (" + aDataSubmit.length.toString() + ")");
						that.byId("bReturn").setText("Returned (" + aDataRet.length.toString() + ")");
						that.byId("bProgress").setText("In-progress (" + aDataInprog.length.toString() + ")");
						that.byId("bAppended").setText("Appended (" + aDataAppend.length.toString() + ")");
						that.byId("bActive").setText("Active (" + aDataAct.length.toString() + ")");
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
							that.updateViewModels(oData);
						},
						error: function () {}
					});
				}
			} else {
				this.byId("idUserName").setText(this.getUserName());
			}
		},
		updateViewModels: function (oData) {
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			userId = "";
			var i;
			var role;
			for (i = 0; i < oData.results.length; i++) {
				if (!userId) {
					userId = oData.results[0].UserId;
				}
				role = oData.results[i].Role;
				if (role === "CREATOR") {
					userInfoModel.setProperty("/ReqstorSet", oData.results[i]);
				}
				if (role === "VALUATOR") {
					userInfoModel.setProperty("/VFCMgrSet", oData.results[i]);
				}
				if (role === "SPINPUTTER") {
					userInfoModel.setProperty("/SPInputSet", oData.results[i]);
				}
				if (role === "APPROVER") {
					userInfoModel.setProperty("/ApprvSet", oData.results[i]);
				}
				if (role === "ADMIN") {
					userInfoModel.setProperty("/AdminSet", oData.results[i]);
				}
			}
			this.getView().setModel(userInfoModel, "userInfoModel");
		},
		onNavBack: function () {
			this.byId("bDraft").setType("Emphasized");
			this.byId("bSubmit").setType("Transparent");
			this.byId("bReturn").setType("Transparent");
			this.byId("bProgress").setType("Transparent");
			this.byId("bAppended").setType("Transparent");
			this.byId("bActive").setType("Transparent");
			this.initializeModels();
			this.oRouter.navTo("MainView", true);
		},

		onCreateReq: function () {
			this.oRouter.navTo("ProductSearch");
		},

		onReqNoLinkClick: function (oEvent) {
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			var reqHeadModel = this.getView().getModel("reqHeadModel");
			var sReqHead = reqHeadModel.getProperty(sPath);
			if (this.byId("bDraft").getType() === "Emphasized" && sReqHead.ReqTyp === "New" ||
				this.byId("bReturn").getType() === "Emphasized" && sReqHead.ReqTyp === "New" ||
				this.byId("bSubmit").getType() === "Emphasized" && sReqHead.ReqTyp === "New") {
				if (sReqHead.EffDate === "") {
					this.onPrepareCreateRequest(sReqHead.ReqNo, "UPD-DR");
				}
			}
			if (this.byId("bDraft").getType() === "Emphasized" && sReqHead.ReqTyp === "Update" ||
				this.byId("bReturn").getType() === "Emphasized" && sReqHead.ReqTyp === "Update" ||
				this.byId("bSubmit").getType() === "Emphasized" && sReqHead.ReqTyp === "Update") {
				if (sReqHead.PriceModel === "CM" || sReqHead.PriceModel === "DS" ||
					sReqHead.PriceModel === "FC" || sReqHead.PriceModel === "AC") {
					this.oRouter.navTo("UpdateRequest", {
						reqId: sReqHead.ReqNo,
						action: "UPDT-DR"
					});
				}
			}
			if (this.byId("bDraft").getType() === "Emphasized" && sReqHead.ReqTyp === "Renewal" ||
				this.byId("bReturn").getType() === "Emphasized" && sReqHead.ReqTyp === "Renewal" ||
				this.byId("bSubmit").getType() === "Emphasized" && sReqHead.ReqTyp === "Renewal") {
				this.oRouter.navTo("RenewRequest", {
					reqNo: sReqHead.ReqNo,
					action: "REN-DR"
				});
			}
			if (this.byId("bReturn").getType() === "Emphasized" && sReqHead.EffDate !== "") {
				if (sReqHead.PriceModel === "AC") {
					this.oRouter.navTo("AppendRequest", {
						reqId: sReqHead.ReqNo,
						action: "EDIT"
					});
				}
			}
			if (this.byId("bSubmit").getType() === "Emphasized" && sReqHead.EffDate !== "") {
				if (sReqHead.PriceModel === "AC") {
					this.oRouter.navTo("AppendRequest", {
						reqId: sReqHead.ReqNo,
						action: "EDIT"
					});
				}
			}
			if (this.byId("bProgress").getType() === "Emphasized" ||
				this.byId("bActive").getType() === "Emphasized" ||
				this.byId("bAppended").getType() === "Emphasized") {
				if (sReqHead.PriceModel === "CM") {
					this.oRouter.navTo("ValuationComp", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "DIS"
					});
				}
				if (sReqHead.PriceModel === "AC") {
					this.oRouter.navTo("ValuationActual", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "DIS"
					});
				}
				if (sReqHead.PriceModel === "CP") {
					this.oRouter.navTo("ValuationCostPlus", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "DIS"
					});
				}
				if (sReqHead.PriceModel === "FC") {
					this.oRouter.navTo("ValuationFirstInClass", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "DIS"
					});
				}
				if (sReqHead.PriceModel === "DS") {
					this.oRouter.navTo("ValuationDiscovery", {
						reqId: sReqHead.ReqNo,
						priceModel: sReqHead.PricModDesc,
						action: "DIS"
					});
				}
			}
		},

		onPrepareCreateRequest: function (reqNo, action) {
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
						that.oUpdateFICGrpPriceAfterSave();
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

		oUpdateFICGrpPriceAfterSave: function () {
			var aFICGrpPrc = this.getView().getModel("dropDownModel").getData().ficGrp;
			var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
			var i = 0;
			for (i = 0; i < ficPricGrpModel.getData().grpprice.length; i++) {
				ficPricGrpModel.getData().UOM1 = ficPricGrpModel.getData().grpprice[i].UOM1;
				aFICGrpPrc.filter(function (arr) {
					if (arr.Value === ficPricGrpModel.getData().grpprice[i].FICGrp) {
						ficPricGrpModel.getData().grpprice[i].FICGrp = arr.Desc;
						return arr;
					}
				});
			}
			this.getView().setModel(ficPricGrpModel, "ficPricGrpModel");
		},

		onNameClick: function () {
			this.onShareEmailPress();
		},

		onHome: function () {
			this.byId("bDraft").setType("Emphasized");
			this.byId("bSubmit").setType("Transparent");
			this.byId("bReturn").setType("Transparent");
			this.byId("bProgress").setType("Transparent");
			this.byId("bAppended").setType("Transparent");
			this.byId("bActive").setType("Transparent");
			this.initializeModels();
			this.onReturnToHome();
		}

	});
});