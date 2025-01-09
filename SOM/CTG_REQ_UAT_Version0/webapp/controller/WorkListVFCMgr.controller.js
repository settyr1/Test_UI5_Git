sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"jquery.sap.global",
	"sap/m/TablePersoController",
	"com/pfizer/ctg/CTG_REQ/model/wrkListPersoServ",
	"com/pfizer/ctg/CTG_REQ/model/formatter",
	"./WorkListVFCMgrExtn"
], function (Controller, MessageBox, MessageToast, jQuery, TablePersoController, wrkListPersoServ, Formatter, VFCMgrCtrlExtn) {
	"use strict";

	this.aDataSubmit = [];
	this.aDataComm = [];
	this.aDataPreComm = [];
	this.aDataInProg = [];
	this.aDataRet = [];
	this.aDataAwaitSPInpt = [];
	this.aDataAwaitAprv = [];
	this.aDataDraft = [];

	var oVFCMgrCtrlExtn;
	var sortMyDraft;
	var oSelectedItems;
	var vPersServ;
	var pUserId;
	var selectedSortItemIdSB;
	var selectedSortItemIdCM;
	var selectedSortItemIdPC;
	var selectedSortItemIdASP;
	var selectedSortItemIdALL;

	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.WorkListVFCMgr", {

		formatter: Formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._onObjectMatched, this);
			oVFCMgrCtrlExtn = new VFCMgrCtrlExtn(this);
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.callFunction("/GetDomainValues", {
				method: "GET",
				urlParameters: {
					"DomName": "ZCTG_SPIN",
					"PriIndCode": " "
				},
				success: function (oData) {
					var SPINamesModel = that.getModel("SPINamesModel");
					SPINamesModel.setProperty("/spInptId", oData.results);
				},
				error: function () {}
			});
		},

		_formFragments: {},

		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];
			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments." + sFragmentName, this);
			var myFragment = (this._formFragments[sFragmentName] = oFormFragment);
			return myFragment;
		},

		_showFormFragment: function (sFragmentName) {
			var oPage = this.getView().byId("mainpage");
			oPage.removeContent(1);
			oPage.addContent(this._getFormFragment(sFragmentName));
		},

		onFilter: function (oEvent) {
			var oFrag;
			var elementId = oEvent.getSource().getId();
			var pos = elementId.indexOf("filterSB");
			if (pos >= 0) {
				oFrag = this._getFormFragment("WrkListVFCMgrSB").getAggregation("items")[0].getContent()[0];
				if (!oFrag._oTPCSB) {
					oFrag._oTPCSB = new TablePersoController({
						table: oFrag.getId(),
						componentName: "SBPersServ",
						persoService: wrkListPersoServ
					}).activate();
					vPersServ = "SB";
				}
				oFrag._oTPCSB.openDialog();
			}
			pos = elementId.indexOf("filterCommercial");
			if (pos >= 0) {
				oFrag = this._getFormFragment("WrkListVFCMgrIP");
				if (!oFrag._oTPCCM) {
					oFrag._oTPCCM = new TablePersoController({
						table: oFrag._getIconTabHeader().getItems()[1].getContent()[0].getId(),
						componentName: "CMPersServ",
						persoService: wrkListPersoServ
					}).activate();
					vPersServ = "CM";
				}
				oFrag._oTPCCM.openDialog();
			}
			pos = elementId.indexOf("filterPreCommercial");
			if (pos >= 0) {
				oFrag = this._getFormFragment("WrkListVFCMgrIP");
				if (!oFrag._oTPCPC) {
					oFrag._oTPCPC = new TablePersoController({
						table: oFrag._getIconTabHeader().getItems()[0].getContent()[0].getId(),
						componentName: "PCPersServ",
						persoService: wrkListPersoServ
					}).activate();
					vPersServ = "PC";
				}
				oFrag._oTPCPC.openDialog();
			}
			pos = elementId.indexOf("filterASP");
			if (pos >= 0) {
				oFrag = this._getFormFragment("WrkListVFCMgrASP");
				if (!oFrag._oTPCASP) {
					oFrag._oTPCASP = new TablePersoController({
						table: oFrag.getId(),
						componentName: "ASPPersServ",
						persoService: wrkListPersoServ
					}).activate();
					vPersServ = "ASP";
				}
				oFrag._oTPCASP.openDialog();
			}
			pos = elementId.indexOf("filterALL");
			if (pos >= 0) {
				oFrag = this._getFormFragment("WrkListVFCMgrALL");
				if (!oFrag._oTPCALL) {
					oFrag._oTPCALL = new TablePersoController({
						table: oFrag.getId(),
						componentName: "ALLPersServ",
						persoService: wrkListPersoServ
					}).activate();
					vPersServ = "ALL";
				}
				oFrag._oTPCALL.openDialog();
			}
		},

		onTablePersoRefresh: function () {
			var oFrag;
			wrkListPersoServ.resetPersData();
			if (vPersServ === "SB") {
				oFrag = this._getFormFragment("WrkListVFCMgrSB").getAggregation("items")[0].getContent()[0];
				oFrag._oTPCSB.refresh();
			}
			if (vPersServ === "CM") {
				oFrag = this._getFormFragment("WrkListVFCMgrIP");
				oFrag._oTPCCM.refresh();
			}
			if (vPersServ === "PC") {
				oFrag = this._getFormFragment("WrkListVFCMgrIP");
				oFrag._oTPCPC.refresh();
			}
			if (vPersServ === "ASP") {
				oFrag = this._getFormFragment("WrkListVFCMgrASP");
				oFrag._oTPCASP.refresh();
			}
			if (vPersServ === "ALL") {
				oFrag = this._getFormFragment("WrkListVFCMgrALL");
				oFrag._oTPCALL.refresh();
			}
		},

		onSearch: function (oEvent) {
			var aFilter;
			var srchStr = oEvent.getParameter("query");
			if (!srchStr) {
				srchStr = oEvent.getParameter("newValue");
			}
			if (srchStr) {
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
					"PricModDesc",
					sap.ui.model.FilterOperator.Contains, srchStr);
				var oFilter = new sap.ui.model.Filter(
					[oReqNo, oReqTyp, oProdName, oProdId, oReqName, oDevPhDesc, oHStatus, oSubmitDate, oEffectvDate, oExpiryDate,
						oRequstName, oSPInptName, oApprvName, oLineItems, oPricModl
					]
				);
				aFilter = [oFilter];
			}
			var oFrag;
			var elementId = oEvent.getSource().getId();
			var pos = elementId.indexOf("searchSB");
			if (pos >= 0) {
				oFrag = this._getFormFragment("WrkListVFCMgrSB").getAggregation("items")[0].getContent()[0];
				oFrag.getBinding("items").filter(aFilter);
			}
			pos = elementId.indexOf("searchEX");
			if (pos >= 0) {
				oFrag = this._getFormFragment("WrkListVFCMgrSB").getAggregation("items")[1].getContent()[0];
				oFrag.getBinding("items").filter(aFilter);
			}
			pos = elementId.indexOf("searchCommercial");
			if (pos >= 0) {
				oFrag = this._getFormFragment("WrkListVFCMgrIP");
				oFrag._getIconTabHeader().getItems()[1].getContent()[0].getBinding("items").filter(aFilter);
			}
			pos = elementId.indexOf("searchPreCommercial");
			if (pos >= 0) {
				oFrag = this._getFormFragment("WrkListVFCMgrIP");
				oFrag._getIconTabHeader().getItems()[0].getContent()[0].getBinding("items").filter(aFilter);
			}
			pos = elementId.indexOf("searchASP");
			if (pos >= 0) {
				oFrag = this._getFormFragment("WrkListVFCMgrASP");
				oFrag.getBinding("items").filter(aFilter);
			}
			pos = elementId.indexOf("searchALL");
			if (pos >= 0) {
				oFrag = this._getFormFragment("WrkListVFCMgrALL");
				oFrag.getBinding("items").filter(aFilter);
			}
		},

		onSort: function (oEvent) {
			var i;
			var pos;
			var oFrag;
			var sortItemSetSB;
			var sortItemSetCM;
			var sortItemSetPC;
			var sortItemSetASP;
			var sortItemSetALL;
			var elementId = oEvent.getSource().getId();
			pos = elementId.indexOf("sortSB");
			if (pos >= 0) {
				sortMyDraft = "SB";
				oFrag = this._getFormFragment("WrkListVFCMgrSB").getAggregation("items")[0].getContent()[0];
				if (!oFrag._oTPCSB) {
					oFrag._oTPCSB = new TablePersoController({
						table: oFrag.getId(),
						componentName: "SBPersServ",
						persoService: wrkListPersoServ
					}).activate();
					vPersServ = "SB";
				}
				var oTPCSB = oFrag._oTPCSB;
				var aColumnsSB = oTPCSB.getPersoService()._oBundle.aColumns;
				var oDataColSB = oTPCSB.getPersoService().getData();
				var oSortFragmentSB = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.WrkListSortFilter", this);
				for (i = 0; i < aColumnsSB.length; i++) {
					if (aColumnsSB[i].visible) {
						oSortFragmentSB.addSortItem(new sap.m.ViewSettingsItem({
							text: aColumnsSB[i].text,
							key: oDataColSB.aColumns[i].id
						}));
						if (selectedSortItemIdSB === oDataColSB.aColumns[i].id) {
							oSortFragmentSB.setSelectedSortItem(oSortFragmentSB.getSortItems()[i]);
							sortItemSetSB = "X";
						}
					}
				}
				if (!sortItemSetSB) {
					oSortFragmentSB.setSelectedSortItem(oSortFragmentSB.getSortItems()[0]);
				}
				oFrag._oDialog = oSortFragmentSB;
				oFrag._oDialog.open();
			}
			pos = elementId.indexOf("sortCommercial");
			if (pos >= 0) {
				sortMyDraft = "CM";
				oFrag = this._getFormFragment("WrkListVFCMgrIP");
				if (!oFrag._oTPCCM) {
					oFrag._oTPCCM = new TablePersoController({
						table: oFrag._getIconTabHeader().getItems()[1].getContent()[0].getId(),
						componentName: "CMPersServ",
						persoService: wrkListPersoServ
					}).activate();
					vPersServ = "CM";
				}
				var oTPCCM = oFrag._oTPCCM;
				var aColumnsCM = oTPCCM.getPersoService()._oBundle.aColumns;
				var oDataColCM = oTPCCM.getPersoService().getData();
				var oSortFragmentCM = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.WrkListSortFilter", this);
				for (i = 0; i < aColumnsCM.length; i++) {
					if (aColumnsCM[i].visible) {
						oSortFragmentCM.addSortItem(new sap.m.ViewSettingsItem({
							text: aColumnsCM[i].text,
							key: oDataColCM.aColumns[i].id
						}));
						if (selectedSortItemIdCM === oDataColCM.aColumns[i].id) {
							oSortFragmentCM.setSelectedSortItem(oSortFragmentCM.getSortItems()[i]);
							sortItemSetCM = "X";
						}
					}
				}
				if (!sortItemSetCM) {
					oSortFragmentCM.setSelectedSortItem(oSortFragmentCM.getSortItems()[0]);
				}
				oFrag._oDialog = oSortFragmentCM;
				oFrag._oDialog.open();
			}
			pos = elementId.indexOf("sortPreCommercial");
			if (pos >= 0) {
				sortMyDraft = "PC";
				oFrag = this._getFormFragment("WrkListVFCMgrIP");
				if (!oFrag._oTPCPC) {
					oFrag._oTPCPC = new TablePersoController({
						table: oFrag._getIconTabHeader().getItems()[0].getContent()[0].getId(),
						componentName: "PCPersServ",
						persoService: wrkListPersoServ
					}).activate();
					vPersServ = "PC";
				}
				var oTPCPC = oFrag._oTPCPC;
				var aColumnsPC = oTPCPC.getPersoService()._oBundle.aColumns;
				var oDataColPC = oTPCPC.getPersoService().getData();
				var oSortFragmentPC = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.WrkListSortFilter", this);
				for (i = 0; i < aColumnsPC.length; i++) {
					if (aColumnsPC[i].visible) {
						oSortFragmentPC.addSortItem(new sap.m.ViewSettingsItem({
							text: aColumnsPC[i].text,
							key: oDataColPC.aColumns[i].id
						}));
						if (selectedSortItemIdPC === oDataColPC.aColumns[i].id) {
							oSortFragmentPC.setSelectedSortItem(oSortFragmentPC.getSortItems()[i]);
							sortItemSetPC = "X";
						}
					}
				}
				if (!sortItemSetPC) {
					oSortFragmentPC.setSelectedSortItem(oSortFragmentPC.getSortItems()[0]);
				}
				oFrag._oDialog = oSortFragmentPC;
				oFrag._oDialog.open();
			}
			pos = elementId.indexOf("sortASP");
			if (pos >= 0) {
				sortMyDraft = "ASP";
				oFrag = this._getFormFragment("WrkListVFCMgrASP");
				if (!oFrag._oTPCASP) {
					oFrag._oTPCASP = new TablePersoController({
						table: oFrag.getId(),
						componentName: "ASPPersServ",
						persoService: wrkListPersoServ
					}).activate();
					vPersServ = "ASP";
				}
				var oTPCASP = oFrag._oTPCASP;
				var aColumnsASP = oTPCASP.getPersoService()._oBundle.aColumns;
				var oDataColASP = oTPCASP.getPersoService().getData();
				var oSortFragmentASP = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.WrkListSortFilter", this);
				for (i = 0; i < aColumnsASP.length; i++) {
					if (aColumnsASP[i].visible) {
						oSortFragmentASP.addSortItem(new sap.m.ViewSettingsItem({
							text: aColumnsASP[i].text,
							key: oDataColASP.aColumns[i].id
						}));
						if (selectedSortItemIdASP === oDataColASP.aColumns[i].id) {
							oSortFragmentASP.setSelectedSortItem(oSortFragmentASP.getSortItems()[i]);
							sortItemSetASP = "X";
						}
					}
				}
				if (!sortItemSetASP) {
					oSortFragmentASP.setSelectedSortItem(oSortFragmentASP.getSortItems()[0]);
				}
				oFrag._oDialog = oSortFragmentASP;
				oFrag._oDialog.open();
			}
			pos = elementId.indexOf("sortALL");
			if (pos >= 0) {
				sortMyDraft = "ALL";
				oFrag = this._getFormFragment("WrkListVFCMgrALL");
				if (!oFrag._oTPCALL) {
					oFrag._oTPCALL = new TablePersoController({
						table: oFrag.getId(),
						componentName: "ALLPersServ",
						persoService: wrkListPersoServ
					}).activate();
					vPersServ = "ALL";
				}
				var oTPCALL = oFrag._oTPCALL;
				var aColumnsALL = oTPCALL.getPersoService()._oBundle.aColumns;
				var oDataColALL = oTPCALL.getPersoService().getData();
				var oSortFragmentALL = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.WrkListSortFilter", this);
				for (i = 0; i < aColumnsALL.length; i++) {
					if (aColumnsALL[i].visible) {
						oSortFragmentALL.addSortItem(new sap.m.ViewSettingsItem({
							text: aColumnsALL[i].text,
							key: oDataColALL.aColumns[i].id
						}));
						if (selectedSortItemIdALL === oDataColALL.aColumns[i].id) {
							oSortFragmentALL.setSelectedSortItem(oSortFragmentALL.getSortItems()[i]);
							sortItemSetALL = "X";
						}
					}
				}
				if (!sortItemSetALL) {
					oSortFragmentALL.setSelectedSortItem(oSortFragmentALL.getSortItems()[0]);
				}
				oFrag._oDialog = oSortFragmentALL;
				oFrag._oDialog.open();
			}
		},

		onConfirm: function (oEvent) {
			var oFrag;
			var oBinding;
			var sPath;
			var mParams = oEvent.getParameters();
			if (sortMyDraft === "SB") {
				oFrag = this._getFormFragment("WrkListVFCMgrSB").getAggregation("items")[0].getContent()[0];
				oBinding = oFrag.getBinding("items");
				sPath = mParams.sortItem.getKey();
				selectedSortItemIdSB = sPath;
			}
			if (sortMyDraft === "CM") {
				oFrag = this._getFormFragment("WrkListVFCMgrIP");
				oBinding = oFrag._getIconTabHeader().getItems()[1].getContent()[0].getBinding("items");
				sPath = mParams.sortItem.getKey();
				selectedSortItemIdCM = sPath;
			}
			if (sortMyDraft === "PC") {
				oFrag = this._getFormFragment("WrkListVFCMgrIP");
				oBinding = oFrag._getIconTabHeader().getItems()[0].getContent()[0].getBinding("items");
				sPath = mParams.sortItem.getKey();
				selectedSortItemIdPC = sPath;
			}
			if (sortMyDraft === "ASP") {
				oFrag = this._getFormFragment("WrkListVFCMgrASP");
				oBinding = oFrag.getBinding("items");
				sPath = mParams.sortItem.getKey();
				selectedSortItemIdASP = sPath;
			}
			if (sortMyDraft === "ALL") {
				oFrag = this._getFormFragment("WrkListVFCMgrALL");
				oBinding = oFrag.getBinding("items");
				sPath = mParams.sortItem.getKey();
				selectedSortItemIdALL = sPath;
			}
			sortMyDraft = "";
			var aSorters = [];
			var bDescending = mParams.sortDescending;
			aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
		},

		onSubmitClick: function (oEvent) {
			var oButton = oEvent.getSource();
			oButton.setType("Emphasized");
			oVFCMgrCtrlExtn.onSubmit();
		},
		onProgressClick: function (oEvent) {
			var oButton = oEvent.getSource();
			oButton.setType("Emphasized");
			this.aDataComm = [];
			this.aDataPreComm = [];
			oVFCMgrCtrlExtn.onProgress();
		},
		onReturnClick: function (oEvent) {
			var oButton = oEvent.getSource();
			oButton.setType("Emphasized");
			oVFCMgrCtrlExtn.onReturn();
		},
		onAwaitSPIClick: function (oEvent) {
			var oButton = oEvent.getSource();
			oButton.setType("Emphasized");
			oVFCMgrCtrlExtn.onAwaitSPI();
		},
		onAwaitAprvalClick: function (oEvent) {
			var oButton = oEvent.getSource();
			oButton.setType("Emphasized");
			oVFCMgrCtrlExtn.onAwaitAprval();
		},
		onDraftClick: function (oEvent) {
			var oButton = oEvent.getSource();
			oButton.setType("Emphasized");
			oVFCMgrCtrlExtn.onDraft();
		},

		_onObjectMatched: function (oEvent) {
			if (oEvent.getParameters().name !== "WorkListVFCMgr") {
				return;
			}
			if (this.getRaisedEvent() === "NAVBACK") {
				this.setRaisedEvent(null);
				return;
			}
			this._showFormFragment("WrkListVFCMgrSB");
			var that = this;
			pUserId = oEvent.getParameters("WorkList").arguments.userId;
			if (pUserId) {
				var oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, pUserId);
				var oFilter1 = new sap.ui.model.Filter("UserRole", sap.ui.model.FilterOperator.EQ, "VALUATOR");
				var aFilter = [oFilter, oFilter1];
				var oModel = this.getOwnerComponent().getModel();
				oModel.read("/ReqHeadSet", {
					filters: aFilter,
					success: function (oData) {
						that.updateViewModels(oData);
					},
					error: function () {}
				});
			}
		},

		updateViewModels: function (oData) {
			var reqHeadModel = this.getView().getModel("reqHeadModel");
			var oFrag;
			var oColl;
			var i = 0;
			this.aDataDraft = [];
			this.aDataSubmit = [];
			this.aDataExtend = [];
			this.aDataRet = [];
			this.aDataInprog = [];
			this.aDataAwaitSPInpt = [];
			this.aDataAwaitAprv = [];

			for (i = 0; i < oData.results.length; i++) {
				if (oData.results[i].HStatus === "DR") {
					this.aDataDraft.push(oData.results[i]);
				}
				if (oData.results[i].HStatus === "SB" ||
					oData.results[i].HStatus === "RW" ||
					oData.results[i].HStatus === "AS") {
					this.aDataSubmit.push(oData.results[i]);
				}
				if (oData.results[i].HStatus === "AC") {
					this.aDataExtend.push(oData.results[i]);
				}
				if (oData.results[i].HStatus === "BU") {
					this.aDataAwaitSPInpt.push(oData.results[i]);
				}
				if (oData.results[i].HStatus === "IP" || oData.results[i].HStatus === "AI") {
					this.aDataInprog.push(oData.results[i]);
				}
				if (oData.results[i].HStatus === "AP" || oData.results[i].HStatus === "AA") {
					this.aDataAwaitAprv.push(oData.results[i]);
				}
				if (oData.results[i].HStatus === "RT") {
					this.aDataRet.push(oData.results[i]);
				}
			}

			if (this.byId("bSubmit").getType() === "Emphasized") {
				reqHeadModel.setProperty("/ReqHeadSet", this.aDataSubmit);
				reqHeadModel.setProperty("/ReqExtdSet", this.aDataExtend);
				this.getView().setModel(reqHeadModel, "reqHeadModel");
				oFrag = this._getFormFragment("WrkListVFCMgrSB").getAggregation("items")[0].getContent()[0];
				oFrag.removeSelections();
				oFrag.getHeaderToolbar().getAggregation("content")[0].setText("Requests (" + this.aDataSubmit.length.toString() + ")");
				oColl = oFrag.getColumns();
				i = 0;
				for (i = 0; i < oColl.length; i++) {
					if (oColl[i].getId().indexOf("SbmtForInptDt") >= 0 ||
						oColl[i].getId().indexOf("SbmtForApprvDt") >= 0 ||
						oColl[i].getId().indexOf("SPInptName") >= 0 ||
						oColl[i].getId().indexOf("PricModl") >= 0 ||
						oColl[i].getId().indexOf("ApprvName") >= 0) {
						oColl[i].setVisible(false);
					} else {
						oColl[i].setVisible(true);
					}
				}
				oFrag = this._getFormFragment("WrkListVFCMgrSB").getAggregation("items")[1].getContent()[0];
				oFrag.removeSelections();
				oFrag.getHeaderToolbar().getAggregation("content")[0].setText("Requests (" + this.aDataExtend.length.toString() + ")");
			}
			if (this.byId("bProgress").getType() === "Emphasized") {
				this.aDataComm = [];
				this.aDataPreComm = [];
				var reqHPreComModel = this.getView().getModel("reqHPreComModel");
				reqHPreComModel.setProperty("/ReqHPreCM", this.aDataPreComm);
				this.getView().setModel(reqHPreComModel, "reqHPreComModel");
				reqHeadModel.setProperty("/ReqHeadSet", this.aDataComm);
				this.getView().setModel(reqHeadModel, "reqHeadModel");
				i = 0;
				for (i = 0; i < this.aDataInprog.length; i++) {
					if (this.aDataInprog[i].Phase === "CM") {
						this.aDataComm.push(this.aDataInprog[i]);
					}
					if (this.aDataInprog[i].Phase === "PC") {
						this.aDataPreComm.push(this.aDataInprog[i]);
					}
				}
				reqHPreComModel.setProperty("/ReqHPreCM", this.aDataPreComm);
				this.getView().setModel(reqHPreComModel, "reqHPreComModel");
				reqHeadModel.setProperty("/ReqHeadSet", this.aDataComm);
				this.getView().setModel(reqHeadModel, "reqHeadModel");
				oFrag = this._getFormFragment("WrkListVFCMgrIP");
				oFrag._getIconTabHeader().getItems()[0].getContent()[0].removeSelections();
				oFrag._getIconTabHeader().getItems()[0].getContent()[0].getHeaderToolbar().getContent()[0].setText("Requests (" + this.aDataPreComm
					.length
					.toString() + ")");
				oColl = oFrag._getIconTabHeader().getItems()[0].getContent()[0].getColumns();
				i = 0;
				for (i = 0; i < oColl.length; i++) {
					if (oColl[i].getId().indexOf("PCSbmtForInptDt") >= 0 ||
						oColl[i].getId().indexOf("PCSbmtForApprvDt") >= 0 ||
						oColl[i].getId().indexOf("PCApprvName") >= 0 ||
						oColl[i].getId().indexOf("PCPriInd") >= 0 ||
						oColl[i].getId().indexOf("PCHeadStatus") >= 0) {
						oColl[i].setVisible(false);
					} else {
						oColl[i].setVisible(true);
					}
				}
				this.aDataComm = [];
				this.aDataPreComm = [];
				oVFCMgrCtrlExtn.onProgress();
			}
			if (this.byId("bReturn").getType() === "Emphasized") {
				reqHeadModel.setProperty("/ReqHeadSet", this.aDataRet);
				this.getView().setModel(reqHeadModel, "reqHeadModel");
			}
			if (this.byId("bAwaitSPI").getType() === "Emphasized") {
				reqHeadModel.setProperty("/ReqHeadSet", this.aDataAwaitSPInpt);
				this.getView().setModel(reqHeadModel, "reqHeadModel");
				oFrag = this._getFormFragment("WrkListVFCMgrASP");
				oFrag.removeSelections();
				oVFCMgrCtrlExtn.onAwaitSPI();
			}
			if (this.byId("bAwaitAprval").getType() === "Emphasized") {
				reqHeadModel.setProperty("/ReqHeadSet", this.aDataAwaitAprv);
				this.getView().setModel(reqHeadModel, "reqHeadModel");
			}
			if (this.byId("bDraft").getType() === "Emphasized") {
				reqHeadModel.setProperty("/ReqHeadSet", this.aDataDraft);
				this.getView().setModel(reqHeadModel, "reqHeadModel");
			}

			this.byId("bDraft").setText("All Drafts (" + this.aDataDraft.length.toString() + ")");
			this.byId("bSubmit").setText("Submitted (" + this.aDataSubmit.length.toString() + ")");
			this.byId("bAwaitSPI").setText("Awaiting SP Input (" + this.aDataAwaitSPInpt.length.toString() + ")");
			this.byId("bProgress").setText("In-progress (" + this.aDataInprog.length.toString() + ")");
			this.byId("bAwaitAprval").setText("Awaiting Approval (" + this.aDataAwaitAprv.length.toString() + ")");
			this.byId("bReturn").setText("Returned (" + this.aDataRet.length.toString() + ")");
			this.byId("idUserName").setText(this.getUserName());
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

		onSelectionChange: function (oEvent) {
			var oFrag;
			if (oEvent.getSource().getId() === "WrkListVFCMgrSB") {
				oFrag = this._getFormFragment("WrkListVFCMgrSB").getAggregation("items")[0].getContent()[0];
				oSelectedItems = oFrag.getSelectedItems();
			}
			if (oEvent.getSource().getId() === "wrkListPreCommerTab") {
				oFrag = this._getFormFragment("WrkListVFCMgrIP");
				var aSPath = oFrag._getIconTabHeader().getItems()[0].getContent()[0].getSelectedContextPaths();
				var reqHPreComModel = this.getView().getModel("reqHPreComModel");
				var sReqHead;
				var oError;
				var i = 0;
				for (i = 0; i < aSPath.length; i++) {
					sReqHead = reqHPreComModel.getProperty(aSPath[i]);
					if (sReqHead.PriceModel !== "CM") {
						oFrag._getIconTabHeader().getItems()[0].getContent()[0].removeSelections();
						oError = "X";
						break;
					}
				}
				if (oError === "X") {
					MessageBox.error("Request with only Comparator Pricing Model can be selected for SP Input");
					return;
				}
				oSelectedItems = oFrag._getIconTabHeader().getItems()[0].getContent()[0].getSelectedItems();
			}
			if (oEvent.getSource().getId() === "WrkListVFCMgrASP") {
				oFrag = this._getFormFragment("WrkListVFCMgrASP");
				oSelectedItems = oFrag.getSelectedItems();
			}
		},

		onSettoInProg: function (oEvent) {
			oVFCMgrCtrlExtn.onSetToInProg(oEvent, pUserId);
		},

		onReqSPInput: function (oEvent) {
			var oCurrentModel;
			var sReqHead;
			var sPath = oEvent.getSource().getParent().getParent()._aSelectedPaths[0];
			if (sPath.indexOf("ReqHPreCM") >= 0) {
				oCurrentModel = this.getView().getModel("reqHPreComModel");
			} else {
				oCurrentModel = this.getView().getModel("reqHeadModel");
			}
			var SPINamesData = this.getView().getModel("SPINamesModel").getData();
			var aSelectedItems = oEvent.getSource().getParent().getParent()._aSelectedPaths;
			var aFilter = [];
			var oFilter;
			var i = 0;
			for (i = 0; i < aSelectedItems.length; i++) {
				sPath = aSelectedItems[i];
				sReqHead = oCurrentModel.getProperty(sPath);
				if (!sReqHead.SPInptName) {
					MessageBox.alert("Please Select SP Inputter");
					return;
				}
				oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, sReqHead.ReqNo);
				aFilter.push(oFilter);
				var x = 0;
				for (x = 0; x < SPINamesData.spInptId.length; x++) {
					if (SPINamesData.spInptId[x].Desc === sReqHead.SPInptName) {
						break;
					}
				}
				oFilter = new sap.ui.model.Filter("SPInptName", sap.ui.model.FilterOperator.EQ, SPINamesData.spInptId[x].Value);
				aFilter.push(oFilter);
			}
			oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, pUserId);
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "BU");
			aFilter.push(oFilter);
			var that = this;
			if (pUserId) {
				var oModel = this.getOwnerComponent().getModel();
				oModel.read("/StatUpdtActionSet", {
					filters: aFilter,
					success: function (oData) {
						var msg = "Request ";
						msg = msg.concat(sReqHead.ReqNo, " sent for SP Input.");
						MessageToast.show(msg, {
							duration: 4000,
							width: "25em",
							at: "center"
						});
						that.updateViewModels(oData);
					},
					error: function () {}
				});
			}
		},

		onChangeSPInput: function (oEvent) {
			var sReqHead;
			var sPath = oEvent.getSource().getParent().getParent()._aSelectedPaths[0];
			var oCurrentModel = this.getView().getModel("reqHeadModel");
			var SPINamesData = this.getView().getModel("SPINamesModel").getData();
			var aSelectedItems = oEvent.getSource().getParent().getParent()._aSelectedPaths;
			var aFilter = [];
			var oFilter;
			var i = 0;
			for (i = 0; i < aSelectedItems.length; i++) {
				sPath = aSelectedItems[i];
				sReqHead = oCurrentModel.getProperty(sPath);
				if (!sReqHead.SPInptName) {
					MessageBox.alert("Please Select SP Inputter");
					return;
				}
				oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, sReqHead.ReqNo);
				aFilter.push(oFilter);
				var x = 0;
				for (x = 0; x < SPINamesData.spInptId.length; x++) {
					if (SPINamesData.spInptId[x].Desc === sReqHead.SPInptName) {
						break;
					}
				}
				oFilter = new sap.ui.model.Filter("SPInptName", sap.ui.model.FilterOperator.EQ, SPINamesData.spInptId[x].Value);
				aFilter.push(oFilter);
			}
			oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, pUserId);
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "BU");
			aFilter.push(oFilter);
			var that = this;
			if (pUserId) {
				var oModel = this.getOwnerComponent().getModel();
				oModel.read("/StatUpdtActionSet", {
					filters: aFilter,
					success: function (oData) {
						var msg = "Request ";
						msg = msg.concat(sReqHead.ReqNo, " assigned to SP Inputter ", sReqHead.SPInptName, ".");
						MessageToast.show(msg, {
							duration: 2000,
							width: "25em",
							at: "center"
						});
						that.updateViewModels(oData);
						var oFrag = that._getFormFragment("WrkListVFCMgrASP");
						var oTemplate = oFrag.getBindingInfo("items").template;
						oFrag.unbindAggregation("items");
						oFrag.bindAggregation("items", {
							path: "reqHeadModel>/ReqHeadSet",
							template: oTemplate
						});
					},
					error: function () {}
				});
			}
		},

		onReqNoLinkClick: function (oEvent) {
			var sReqHead;
			var action;
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			var reqHeadModel = this.getView().getModel("reqHeadModel");
			if (this.byId("bSubmit").getType() === "Emphasized" ||
				this.byId("bDraft").getType() === "Emphasized" ||
				this.byId("bReturn").getType() === "Emphasized") {
				sReqHead = reqHeadModel.getProperty(sPath);
				if (sReqHead.ReqTyp === "New" || sReqHead.ReqTyp === "Renewal") {
					if(sReqHead.ExpDate.indexOf("**") >= 0){
						this.callNavigation(sReqHead, "DIS");
					} else {
						if(sReqHead.ReqTyp === "New"){
							if(sReqHead.EffDate === ""){
								this.onPrepareDisplayRequest(sReqHead.ReqNo, sReqHead.ReqTyp, "DIS");
							} else {
								this.oRouter.navTo("AppendRequest", {
									reqId: sReqHead.ReqNo,
									action: "DIS"
								});
							}
						}
						if(sReqHead.ReqTyp === "Renewal"){
							this.oRouter.navTo("RenewRequest", {
							reqNo: sReqHead.ReqNo,
							action: "DIS"
							});
						}
					}
				} else {
					if (this._getFormFragment("WrkListVFCMgrSB").getSelectedKey() === "SB") {
						if (sReqHead.PriceModel === "AC") {
							this.oRouter.navTo("AppendRequest", {
								reqId: sReqHead.ReqNo,
								action: "DIS"
							});
						}
						if (sReqHead.PriceModel === "CM" || sReqHead.PriceModel === "DS" || sReqHead.PriceModel === "FC" ) {
							this.oRouter.navTo("UpdateRequest", {
								reqId: sReqHead.ReqNo,
								action: "UPDT-DIS"
							});
						}
					}
					if (this._getFormFragment("WrkListVFCMgrSB").getSelectedKey() === "EX") {
						action = "DIS";
						this.callNavigation(sReqHead, action);
					}
				}
			}
			if (this.byId("bProgress").getType() === "Emphasized") {
				var oCurrentModel;
				if (sPath.indexOf("ReqHPreCM") >= 0) {
					oCurrentModel = this.getView().getModel("reqHPreComModel");
				} else {
					oCurrentModel = this.getView().getModel("reqHeadModel");
				}
				sReqHead = oCurrentModel.getProperty(sPath);
				action = "UPD-VFC";
				this.callNavigation(sReqHead, action);
			}
			if (this.byId("bAwaitSPI").getType() === "Emphasized") {
				sReqHead = reqHeadModel.getProperty(sPath);
				action = "DIS";
				this.callNavigation(sReqHead, action);
			}
			if (this.byId("bAwaitAprval").getType() === "Emphasized") {
				sReqHead = reqHeadModel.getProperty(sPath);
				action = "DIS";
				this.callNavigation(sReqHead, action);
			}
		},

		callNavigation: function (sReqHead, action) {
			if (sReqHead.PriceModel === "CM") {
				this.oRouter.navTo("ValuationComp", {
					reqId: sReqHead.ReqNo,
					priceModel: sReqHead.PricModDesc,
					action: action
				});
			}
			if (sReqHead.PriceModel === "AC") {
				this.oRouter.navTo("ValuationActual", {
					reqId: sReqHead.ReqNo,
					priceModel: sReqHead.PricModDesc,
					action: action
				});
			}
			if (sReqHead.PriceModel === "CP") {
				this.oRouter.navTo("ValuationCostPlus", {
					reqId: sReqHead.ReqNo,
					priceModel: sReqHead.PricModDesc,
					action: action
				});
			}
			if (sReqHead.PriceModel === "FC") {
				this.oRouter.navTo("ValuationFirstInClass", {
					reqId: sReqHead.ReqNo,
					priceModel: sReqHead.PricModDesc,
					action: action
				});
			}
			if (sReqHead.PriceModel === "DS") {
				this.oRouter.navTo("ValuationDiscovery", {
					reqId: sReqHead.ReqNo,
					priceModel: sReqHead.PricModDesc,
					action: action
				});
			}
		},

		onPrepareDisplayRequest: function (reqNo, reqTyp, action) {
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (reqTyp === "Renewal") {
				this.oRouter.navTo("RenewRequest", {
					reqNo: reqNo,
					action: action
				});
			} else {
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
							oVFCMgrCtrlExtn.oUpdateFICGrpPriceAfterSave();
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
			}
		},

		onNameClick: function () {
			this.onShareEmailPress();
		},

		onNavBack: function () {
			this.byId("bSubmit").setType("Emphasized");
			this.byId("bProgress").setType("Transparent");
			this.byId("bReturn").setType("Transparent");
			this.byId("bAwaitSPI").setType("Transparent");
			this.byId("bAwaitAprval").setType("Transparent");
			this.byId("bDraft").setType("Transparent");
			this.initializeModels();
			this.oRouter.navTo("MainView", true);
		},

		onHome: function () {
			this.byId("bSubmit").setType("Emphasized");
			this.byId("bProgress").setType("Transparent");
			this.byId("bReturn").setType("Transparent");
			this.byId("bAwaitSPI").setType("Transparent");
			this.byId("bAwaitAprval").setType("Transparent");
			this.byId("bDraft").setType("Transparent");
			this.initializeModels();
			this.onReturnToHome();
		}
	});
});