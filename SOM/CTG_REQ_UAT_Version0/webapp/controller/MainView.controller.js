sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	var fragSrchReportAdded = "";
	var userId;
	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.MainView", {

		onInit: function () {
			var oFilter = new sap.ui.model.Filter("TabName", sap.ui.model.FilterOperator.EQ, " ");
			var aFilter = [oFilter];
			var oModel;
			if (this.getOwnerComponent()) {
				oModel = this.getOwnerComponent().getModel();
			} else {
				oModel = new sap.ui.model.json.JSONModel();
			}
			var that = this;
			oModel.read("/SrchHelpDropDnSet", {
				filters: aFilter,
				success: function (oData) {
					var aDevPhase = [];
					var aProdType = [];
					var aProdTypeFilter = [];
					var aFiniGoodsForm = [];
					var aProdSource = [];
					var aPrimaryInd = [];
					var aMechOfAction = [];
					var aDestMarkets = [];
					var aUOMValues = [];
					var aProcureType = [];
					var aDestType = [];
					var aPricing = [];
					var aReqGrp = [];
					var aFICGrp = [];
					var aProdQualifier = [];
					var aReqTyp = [];
					var aReqStatus = [];
					var aMrktGrp = [];
					var i = 0;
					for (i = 0; i < oData.results.length; i++) {
						if (oData.results[i].TabName === "ZCTGPHSE1") {
							aDevPhase.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGPRODTY") {
							aProdType.push(oData.results[i]);
							aProdTypeFilter.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGFRM1") {
							aFiniGoodsForm.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGSOURCE") {
							aProdSource.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGINDI1") {
							aPrimaryInd.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGMCHA1") {
							aMechOfAction.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGMKT1") {
							aDestMarkets.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGUOM") {
							aUOMValues.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGPROC") {
							aProcureType.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGDTYPE") {
							aDestType.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGMODEL") {
							aPricing.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGRQGRP") {
							aReqGrp.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGFICGRP") {
							aFICGrp.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGQUAL") {
							aProdQualifier.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGREQTY") {
							aReqTyp.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGHSTA") {
							aReqStatus.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGGROUP") {
							aMrktGrp.push(oData.results[i]);
						}
					}
					var dropDownModel = that.getView().getModel("dropDownModel");
					dropDownModel.setProperty("/devPhase", aDevPhase);
					dropDownModel.setProperty("/prodType", aProdType);
					dropDownModel.setProperty("/finiGoodsForm", aFiniGoodsForm);
					dropDownModel.setProperty("/prodSource", aProdSource);
					dropDownModel.setProperty("/primaryInd", aPrimaryInd);
					dropDownModel.setProperty("/mechOfAction", aMechOfAction);
					dropDownModel.setProperty("/destMarkets", aDestMarkets);
					dropDownModel.setProperty("/uomValues", aUOMValues);
					dropDownModel.setProperty("/procureType", aProcureType);
					dropDownModel.setProperty("/destType", aDestType);
					dropDownModel.setProperty("/pricing", aPricing);
					dropDownModel.setProperty("/reqGrp", aReqGrp);
					dropDownModel.setProperty("/ficGrp", aFICGrp);
					dropDownModel.setProperty("/prodQualifier", aProdQualifier);
					dropDownModel.setProperty("/reqTyp", aReqTyp);
					dropDownModel.setProperty("/reqStat", aReqStatus);
					dropDownModel.setProperty("/mrktGrp", aMrktGrp);
					that.getView().setModel(dropDownModel, "dropDownModel");
					i = 0;
					for (i = 0; i < aProdTypeFilter.length; i++) {
						if (aProdTypeFilter[i].Value === "AFS") {
							aProdTypeFilter.splice(i, 1);
							break;
						}
					}
					var prodTypeModel = that.getModel("prodTypeModel");
					prodTypeModel.setProperty("/myData", aProdTypeFilter);
				},
				error: function () {}
			});

			//Get Router Object instance and store it in Global Variable.
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._onObjectMatched, this);

			var oViewModel = new sap.ui.model.json.JSONModel({
				"UserInfoWrklistItems": {
					"Unit": "Work Items",
					"Footer": "Pending",
					"ReqWrkItem": "0",
					"VFCMgrWrkItem": "0",
					"SPInptWrkItem": "0",
					"ApprvWrkItem": "0"
				}
			});
			this.getView().setModel(oViewModel);
		},

		_onObjectMatched: function (oEvent) {
			var targetName = oEvent.getParameters("target").name;
			if (targetName !== "MainView") {
				return;
			}
			if (this.getRaisedEvent() === "NAVBACK") {
				this.setRaisedEvent(null);
			}
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			var oUser = new sap.ushell.services.UserInfo();
			var iUserId = oUser.getId();
			userId = iUserId;
			if (userId) {
				var oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, userId);
				var aFilter = [oFilter];
				oModel.read("/UserInfoSet", {
					filters: aFilter,
					success: function (oData) {
						that.updateViewModels(oData);
					},
					error: function () {
						// MessageBox.error("Error calling OData.");
					}
				});
			}
		},

		updateViewModels: function (oData) {
			var oViewModel = this.getView().getModel();
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			userId = "";
			var oFragment;
			var role;
			var oPage = this.byId("mainpage");
			var oFrag = oPage.getContent();
			this.setUserName(oData.results[0].UserId, oData.results[0].UserName);
			this.byId("idUserName").setText(this.getUserName());
			var i;
			for (i = 0; i < oData.results.length; i++) {
				if (!userId) {
					userId = oData.results[0].UserId;
				}
				role = oData.results[i].Role;
				if (role === "") {
					oFragment = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.Tile7SrchReprt", this);
					oPage.addContent(oFragment);
					fragSrchReportAdded = "X";
				}
				if (role === "CREATOR") {
					userInfoModel.setProperty("/ReqstorSet", oData.results[i]);
					oViewModel.setProperty("/UserInfoWrklistItems/ReqWrkItem", oData.results[i].WrkItmCnt);
					if (oFrag.length === 0) {
						if (oData.results[i].Create === "X") {
							oFragment = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.Tile1SrchCreateReq", this);
							oPage.addContent(oFragment);
						}
						oFragment = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.Tile2MyReqReq", this);
						oPage.addContent(oFragment);
						if (fragSrchReportAdded === "") {
							oFragment = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.Tile7SrchReprt", this);
							oPage.addContent(oFragment);
							fragSrchReportAdded = "X";
						}
					}
				}
				if (role === "VALUATOR") {
					userInfoModel.setProperty("/VFCMgrSet", oData.results[i]);
					oViewModel.setProperty("/UserInfoWrklistItems/VFCMgrWrkItem", oData.results[i].WrkItmCnt);
					if (oFrag.length === 0) {
						if (oData.results[i].Valuate === "X") {
							oFragment = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.Tile3MyReqVFCMgr", this);
							oPage.addContent(oFragment);
						}
						if (fragSrchReportAdded === "") {
							oFragment = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.Tile7SrchReprt", this);
							oPage.addContent(oFragment);
							fragSrchReportAdded = "X";
						}
					}
				}
				if (role === "SPINPUTTER") {
					userInfoModel.setProperty("/SPInputSet", oData.results[i]);
					oViewModel.setProperty("/UserInfoWrklistItems/SPInptWrkItem", oData.results[i].WrkItmCnt);
					if (oFrag.length === 0) {
						if (oData.results[i].SPInput === "X") {
							oFragment = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.Tile4MyReqSPIP", this);
							oPage.addContent(oFragment);
						}
						if (fragSrchReportAdded === "") {
							oFragment = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.Tile7SrchReprt", this);
							oPage.addContent(oFragment);
							fragSrchReportAdded = "X";
						}
					}
				}
				if (role === "APPROVER") {
					userInfoModel.setProperty("/ApprvSet", oData.results[i]);
					oViewModel.setProperty("/UserInfoWrklistItems/ApprvWrkItem", oData.results[i].WrkItmCnt);
					if (oFrag.length === 0) {
						if (oData.results[i].Approve === "X") {
							oFragment = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.Tile5MyReqApprv", this);
							oPage.addContent(oFragment);
						}
						if (fragSrchReportAdded === "") {
							oFragment = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.Tile7SrchReprt", this);
							oPage.addContent(oFragment);
							fragSrchReportAdded = "X";
						}
					}
				}
				if (role === "ADMIN") {
					userInfoModel.setProperty("/AdminSet", oData.results[i]);
					if (oFrag.length === 0) {
						if (oData.results[i].Admin === "X") {
							oFragment = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.Tile6Admin", this);
							oPage.addContent(oFragment);
						}
						if (fragSrchReportAdded === "") {
							oFragment = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.Tile7SrchReprt", this);
							oPage.addContent(oFragment);
							fragSrchReportAdded = "X";
						}
					}
				}
				if (role === "REPORTING") {
					userInfoModel.setProperty("/SrchReptSet", oData.results[i]);
				}
			}
			this.getView().setModel(userInfoModel, "userInfoModel");
		},

		onManageReqstrReq: function (oEvent) {
			this.setTileRole("REQSTR");
			this.oRouter.navTo("WorkListRequestor", {
				userId: userId,
				statTab: "DR"
			});
		},

		onManageVFCMgrReq: function (oEvent) {
			this.setTileRole("VFCMGR");
			this.oRouter.navTo("WorkListVFCMgr", {
				userId: userId
			});
		},

		onManageSPIReq: function (oEvent) {
			this.setTileRole("SPINPT");
			this.oRouter.navTo("WorkListSPInput", {
				userId: userId
			});
		},

		onManageAprvorReq: function (oEvent) {
			this.setTileRole("APPRVR");
			this.oRouter.navTo("WorkListApprover", {
				userId: userId
			});
		},

		onSrchCreateRequest: function (oEvent) {
			this.setTileRole("PRDSRC");
			this.oRouter.navTo("ProductSearch");
		},

		onManageProdAdmin: function (oEvent) {
			this.setTileRole("ADMIN");
			this.oRouter.navTo("WorkListProducts", {
				action: "C"
			});
		},

		onSearchandReportPress: function (oEvent) {
			this.setTileRole("SRCHREPT");
			this.oRouter.navTo("SearchandReport", {
				userId: userId
			});
		}

	});
});