sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"sap/ui/core/routing/History",
	"com/pfizer/ctg/CTG_REQ/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"./CreateReqCtrlExtn",
	"sap/m/UploadCollectionParameter"
], function (Controller, History, Formatter, MessageToast, MessageBox, CReqCtrlExtn, UploadCollectionParameter) {
	"use strict";

	// Action Legend
	// DIS	- Display	CRE	- Create    UPD	- Update
	// DEL	- Delete	CAN	- Cancel	SAV	- Save
	// SUB	- Submit	APD	- Append	EXT	- Extend

	var userAction;
	var oReqCtrlExtn;
	this.odataupdatecall = "";
	var aAttachments = [];

	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.CreateRequest", {

		formatter: Formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._onObjectMatched, this);
			oReqCtrlExtn = new CReqCtrlExtn(this.getView());
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

		_formFragments: {},

		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];
			if (oFormFragment) {
				return oFormFragment;
			}
			oFormFragment = sap.ui.xmlfragment(sFragmentName, "com.pfizer.ctg.CTG_REQ.view.fragments." + sFragmentName, this);
			var myFragment = (this._formFragments[sFragmentName] = oFormFragment);
			return myFragment;
		},

		_showFormFragment: function (sFragmentName) {
			var oPage = this.getView().byId("CreateReqPage");
			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},

		_onObjectMatched: function (oEvent) {
			if (oEvent.getParameters().name !== "CreateRequest") {
				return;
			}
			this.odataupdatecall = undefined;
			aAttachments = [];
			this.attmntSaved = "";
			var createRequestModel = this.getView().getModel("createRequestModel");
			userAction = oEvent.getParameters("CreateRequest").arguments.action;
			if (userAction === "DIS") {
				this._showFormFragment("DisplayRequest");
				this._CurrentFragName = "DisplayRequest";
				this._prepareDisplayRequest();
				if (sap.ui.core.Fragment.byId("DisplayRequest", "shipDetailsSection").getVisible()) {
					oReqCtrlExtn.presetMarkets();
					oReqCtrlExtn.setStrenUoMKeys();
					//New condition by DOGIPA to divide the strings with space after comma 
					var marketssplit = createRequestModel.getData().Markets;
					marketssplit = marketssplit.split(",");
					var marketSplitSpace = marketssplit.join(", ");
					// sap.ui.core.Fragment.byId("DisplayRequest", "selectedMrkts").setValue(createRequestModel.getData().Markets);
					sap.ui.core.Fragment.byId("DisplayRequest", "selectedMrkts").setValue(marketSplitSpace);
					//
				}
				this.getView().byId("deleteReq").setVisible(false);
				this.getView().byId("cancelReq").setVisible(false);
				this.getView().byId("editReq").setVisible(false);
				this.getView().byId("saveReq").setVisible(false);
				this.getView().byId("submitReq").setVisible(false);
			}
			if (userAction === "CRE") {
				this._showFormFragment("CreateRequest");
				this._CurrentFragName = "CreateRequest";
				this._prepareCreateRequest();
				if (sap.ui.core.Fragment.byId("CreateRequest", "shipDetailsSection").getVisible()) {
					oReqCtrlExtn.presetMarkets();
					oReqCtrlExtn.setStrenUoMKeys();
					sap.ui.core.Fragment.byId("CreateRequest", "selectedMrkts").setValue(createRequestModel.getData().Markets);
				}
				this.getView().byId("deleteReq").setVisible(false);
				this.getView().byId("cancelReq").setVisible(false);
				this.getView().byId("editReq").setVisible(false);
				this.getView().byId("saveReq").setVisible(true);
				this.getView().byId("submitReq").setVisible(true);
			}
			if (userAction === "UPD-DR") {
				this._showFormFragment("CreateRequest");
				this._CurrentFragName = "CreateRequest";
				this._prepareCreateRequest();
				if (sap.ui.core.Fragment.byId("CreateRequest", "shipDetailsSection").getVisible()) {
					oReqCtrlExtn.presetMarkets();
					oReqCtrlExtn.setStrenUoMKeys();
					sap.ui.core.Fragment.byId("CreateRequest", "selectedMrkts").setValue(createRequestModel.getData().Markets);
				}
				this.getView().byId("deleteReq").setVisible(true);
				this.getView().byId("cancelReq").setVisible(true);
				this.getView().byId("editReq").setVisible(false);
				this.getView().byId("saveReq").setVisible(true);
				this.getView().byId("submitReq").setVisible(true);
			}
			if (userAction === "UPD-SB") {
				this._showFormFragment("DisplayRequest");
				this._CurrentFragName = "DisplayRequest";
				this._prepareDisplayRequest();
				if (sap.ui.core.Fragment.byId("DisplayRequest", "shipDetailsSection").getVisible()) {
					oReqCtrlExtn.presetMarkets();
					oReqCtrlExtn.setStrenUoMKeys();
					//New condition by DOGIPA to divide the strings with space after comma 
					var marketssplitSb = createRequestModel.getData().Markets;
					marketssplitSb = marketssplitSb.split(",");
					var marketSplitSpaceSb = marketssplitSb.join(", ");
					// sap.ui.core.Fragment.byId("DisplayRequest", "selectedMrkts").setValue(createRequestModel.getData().Markets);
					sap.ui.core.Fragment.byId("DisplayRequest", "selectedMrkts").setValue(marketSplitSpaceSb);
					//
					//sap.ui.core.Fragment.byId("DisplayRequest", "selectedMrkts").setValue(createRequestModel.getData().Markets);
				}
				this.getView().byId("deleteReq").setVisible(true);
				this.getView().byId("cancelReq").setVisible(false);
				this.getView().byId("editReq").setVisible(true);
				this.getView().byId("saveReq").setVisible(false);
				this.getView().byId("submitReq").setVisible(false);
			}
			if (userAction === "APD") {
				this._showFormFragment("DisplayRequest");
				this._CurrentFragName = "DisplayRequest";
				this._prepareDisplayRequest();
				if (sap.ui.core.Fragment.byId("DisplayRequest", "shipDetailsSection").getVisible()) {
					oReqCtrlExtn.presetMarkets();
					oReqCtrlExtn.setStrenUoMKeys();
					//New condition by DOGIPA to divide the strings with space after comma 
					var marketssplitApd = createRequestModel.getData().Markets;
					marketssplitApd = marketssplitSb.split(",");
					var marketSplitSpaceApd = marketssplitApd.join(", ");
					// sap.ui.core.Fragment.byId("DisplayRequest", "selectedMrkts").setValue(createRequestModel.getData().Markets);
					sap.ui.core.Fragment.byId("DisplayRequest", "selectedMrkts").setValue(marketSplitSpaceApd);
					//
					//sap.ui.core.Fragment.byId("DisplayRequest", "selectedMrkts").setValue(createRequestModel.getData().Markets);
				}
				this.getView().byId("deleteReq").setVisible(false);
				this.getView().byId("cancelReq").setVisible(false);
				this.getView().byId("editReq").setVisible(true);
				this.getView().byId("saveReq").setVisible(false);
				this.getView().byId("submitReq").setVisible(false);
			}
		},

		_prepareDisplayRequest: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			sap.ui.core.Fragment.byId("DisplayRequest", "otherNames").setText(createRequestModel.getData().OtherNames);
			sap.ui.core.Fragment.byId("DisplayRequest", "prodType").setSelectedKey(createRequestModel.getData().ProdTyp);
			sap.ui.core.Fragment.byId("DisplayRequest", "reqGrp").setSelectedKey(createRequestModel.getData().ReqGrp);
			sap.ui.core.Fragment.byId("DisplayRequest", "devPhase").setSelectedKey(createRequestModel.getData().DevPhase);
			if (createRequestModel.getData().ProdSrc === "P") {
				sap.ui.core.Fragment.byId("DisplayRequest", "prodSource").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("DisplayRequest", "prodSource").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("DisplayRequest", "prodSource").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("DisplayRequest", "prodSource").getButtons()[1].setSelected(true);
			}
			if (!createRequestModel.getData().Biologic) {
				sap.ui.core.Fragment.byId("DisplayRequest", "biologic").setState(false);
			} else {
				sap.ui.core.Fragment.byId("DisplayRequest", "biologic").setState(true);
			}
			//Urgency Flag Condition by DOGIPA
			if (createRequestModel.getData().Priority) {
				sap.ui.core.Fragment.byId("DisplayRequest", "urgencyflag").setEditable(false);
			}
			if (!createRequestModel.getData().Biosimilar) {
				sap.ui.core.Fragment.byId("DisplayRequest", "biosim").setState(false);
			} else {
				sap.ui.core.Fragment.byId("DisplayRequest", "biosim").setState(true);
			}
			if (!createRequestModel.getData().POCInd) {
				sap.ui.core.Fragment.byId("DisplayRequest", "reachedPOC").setState(false);
			} else {
				sap.ui.core.Fragment.byId("DisplayRequest", "reachedPOC").setState(true);
			}
			if (!createRequestModel.getData().FirstClass) {
				sap.ui.core.Fragment.byId("DisplayRequest", "firstInClass").setState(false);
			} else {
				sap.ui.core.Fragment.byId("DisplayRequest", "firstInClass").setState(true);
			}

			var aPrimaryInd = this.getView().getModel("dropDownModel").getData().primaryInd;
			aPrimaryInd.filter(function (arr) {
				if (arr.Value === createRequestModel.getData().PriInd) {
					sap.ui.core.Fragment.byId("DisplayRequest", "priInd").setValue(arr.Desc);
				}
			});

			sap.ui.core.Fragment.byId("DisplayRequest", "actionMech").setSelectedKey(createRequestModel.getData().ActionMech);
			if (createRequestModel.getData().MechActTyp === "DM") {
				sap.ui.core.Fragment.byId("DisplayRequest", "MOAType").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("DisplayRequest", "MOAType").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("DisplayRequest", "MOAType").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("DisplayRequest", "MOAType").getButtons()[1].setSelected(true);
			}
			if (createRequestModel.getData().ProcmntTyp === "P") {
				sap.ui.core.Fragment.byId("DisplayRequest", "ProcmntTyp").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("DisplayRequest", "ProcmntTyp").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("DisplayRequest", "ProcmntTyp").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("DisplayRequest", "ProcmntTyp").getButtons()[1].setSelected(true);
			}
			if (createRequestModel.getData().ProdTyp === "FGD") {
				sap.ui.core.Fragment.byId("DisplayRequest", "finiGoodsForm").setVisible(true);
			} else {
				sap.ui.core.Fragment.byId("DisplayRequest", "finiGoodsForm").setVisible(false);
			}
			sap.ui.core.Fragment.byId("DisplayRequest", "finiGoodsForm").setSelectedKey(createRequestModel.getData().FiniGoodsFrm);

			if (createRequestModel.getData().DevPhase === "CM") {
				sap.ui.core.Fragment.byId("DisplayRequest", "firstInClass").setVisible(false);
			} else {
				sap.ui.core.Fragment.byId("DisplayRequest", "firstInClass").setVisible(true);
			}
			if (createRequestModel.getData().PriceModel === "FC") {
				sap.ui.core.Fragment.byId("DisplayRequest", "firstInClassSection").setVisible(true);
				oReqCtrlExtn.presetFICgrpPrice();
				var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
				sap.ui.core.Fragment.byId("DisplayRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
			} else {
				sap.ui.core.Fragment.byId("DisplayRequest", "firstInClassSection").setVisible(false);
			}
			if (createRequestModel.getData().PriceModel === "DS") {
				sap.ui.core.Fragment.byId("DisplayRequest", "apiValu").setVisible(true);
				sap.ui.core.Fragment.byId("DisplayRequest", "apiValuTxt").setVisible(true);
				sap.ui.core.Fragment.byId("DisplayRequest", "apiValu").setValue(createRequestModel.getData().APIValue);
			} else {
				sap.ui.core.Fragment.byId("DisplayRequest", "apiValu").setVisible(false);
				sap.ui.core.Fragment.byId("DisplayRequest", "apiValuTxt").setVisible(false);
			}
			if (createRequestModel.getData().DevPhase === "CM") {
				sap.ui.core.Fragment.byId("DisplayRequest", "shipDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("DisplayRequest", "prodDetailsSection").setVisible(false);
				if (createRequestModel.getData().ProdSrc === "E") {
					sap.ui.core.Fragment.byId("DisplayRequest", "purchDetailsSection").setVisible(true);
				} else {
					sap.ui.core.Fragment.byId("DisplayRequest", "purchDetailsSection").setVisible(false);
				}
			} else {
				sap.ui.core.Fragment.byId("DisplayRequest", "prodDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("DisplayRequest", "shipDetailsSection").setVisible(false);
				sap.ui.core.Fragment.byId("DisplayRequest", "purchDetailsSection").setVisible(false);
			}
			if (sap.ui.core.Fragment.byId("DisplayRequest", "shipDetailsSection").getVisible()) {
				oReqCtrlExtn.presetMarkets();
				sap.ui.core.Fragment.byId("DisplayRequest", "selectedMrkts").setValue(createRequestModel.getData().Markets);
			}
			if (createRequestModel.getData().PriceModel === "CP") {
				sap.ui.core.Fragment.byId("DisplayRequest", "markets").setSelectedKeys(null);
				sap.ui.core.Fragment.byId("DisplayRequest", "selectedMrkts").setValue("All");
			}
			if (createRequestModel.getData().PriceModel === "AC") {
				sap.ui.core.Fragment.byId("DisplayRequest", "destination").setVisible(true);
			} else {
				sap.ui.core.Fragment.byId("DisplayRequest", "destination").setVisible(false);
			}
			sap.ui.core.Fragment.byId("DisplayRequest", "uomValue").setValue(createRequestModel.getData().QtyUOM);
			this.getView().setModel(createRequestModel, "createRequestModel");
		},

		_prepareCreateRequest: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			var urgencyFlag;
			if (sap.ui.core.Fragment.byId("CreateRequest", "urgencyflag").getSelected()) {
				urgencyFlag = "X";
			} else {
				urgencyFlag = "";
			}
			sap.ui.core.Fragment.byId("CreateRequest", "otherNames").setText(createRequestModel.getData().OtherNames);
			sap.ui.core.Fragment.byId("CreateRequest", "prodType").setSelectedKey(createRequestModel.getData().ProdTyp);
			sap.ui.core.Fragment.byId("CreateRequest", "reqGrp").setSelectedKey(createRequestModel.getData().ReqGrp);
			sap.ui.core.Fragment.byId("CreateRequest", "devPhase").setSelectedKey(createRequestModel.getData().DevPhase);
			if (userAction === "APD") {
				sap.ui.core.Fragment.byId("CreateRequest", "reqGrp").setEditable(false);
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "reqGrp").setEditable(true);
			}
			if (createRequestModel.getData().ProdSrc === "P") {
				sap.ui.core.Fragment.byId("CreateRequest", "prodSource").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("CreateRequest", "prodSource").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "prodSource").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("CreateRequest", "prodSource").getButtons()[1].setSelected(true);
			}
			if (!createRequestModel.getData().Biologic) {
				sap.ui.core.Fragment.byId("CreateRequest", "biologic").setState(false);
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "biologic").setState(true);
			}
			if (!createRequestModel.getData().Biosimilar) {
				sap.ui.core.Fragment.byId("CreateRequest", "biosim").setState(false);
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "biosim").setState(true);
			}
			if (!createRequestModel.getData().POCInd) {
				sap.ui.core.Fragment.byId("CreateRequest", "reachedPOC").setState(false);
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "reachedPOC").setState(true);
			}
			if (!createRequestModel.getData().FirstClass) {
				sap.ui.core.Fragment.byId("CreateRequest", "firstInClass").setState(false);
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "firstInClass").setState(true);
			}

			var aPrimaryInd = this.getView().getModel("dropDownModel").getData().primaryInd;
			aPrimaryInd.filter(function (arr) {
				if (arr.Value === createRequestModel.getData().PriInd) {
					sap.ui.core.Fragment.byId("CreateRequest", "priInd").setValue(arr.Desc);
				}
			});

			sap.ui.core.Fragment.byId("CreateRequest", "actionMech").setSelectedKey(createRequestModel.getData().ActionMech);
			if (createRequestModel.getData().MechActTyp === "DM") {
				sap.ui.core.Fragment.byId("CreateRequest", "MOAType").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("CreateRequest", "MOAType").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "MOAType").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("CreateRequest", "MOAType").getButtons()[1].setSelected(true);
			}
			if (createRequestModel.getData().ProcmntTyp === "P") {
				sap.ui.core.Fragment.byId("CreateRequest", "ProcmntTyp").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("CreateRequest", "ProcmntTyp").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "ProcmntTyp").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("CreateRequest", "ProcmntTyp").getButtons()[1].setSelected(true);
			}
			if (createRequestModel.getData().ProdTyp === "FGD") {
				sap.ui.core.Fragment.byId("CreateRequest", "finiGoodsForm").setVisible(true);
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "finiGoodsForm").setVisible(false);
			}
			sap.ui.core.Fragment.byId("CreateRequest", "finiGoodsForm").setSelectedKey(createRequestModel.getData().FiniGoodsFrm);

			if (createRequestModel.getData().DevPhase === "CM") {
				sap.ui.core.Fragment.byId("CreateRequest", "firstInClass").setVisible(false);
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "firstInClass").setVisible(true);
			}
			if (createRequestModel.getData().PriceModel === "DS") {
				sap.ui.core.Fragment.byId("CreateRequest", "apiValu").setVisible(true);
				sap.ui.core.Fragment.byId("CreateRequest", "apiValuTxt").setVisible(true);
				sap.ui.core.Fragment.byId("CreateRequest", "apiValu").setValue(createRequestModel.getData().APIValue);
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "apiValu").setVisible(false);
				sap.ui.core.Fragment.byId("CreateRequest", "apiValuTxt").setVisible(false);
			}
			if (createRequestModel.getData().PriceModel === "FC") {
				sap.ui.core.Fragment.byId("CreateRequest", "firstInClassSection").setVisible(true);
				oReqCtrlExtn.presetFICgrpPrice();
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "firstInClassSection").setVisible(false);
			}
			if (createRequestModel.getData().DevPhase === "CM") {
				sap.ui.core.Fragment.byId("CreateRequest", "shipDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("CreateRequest", "prodDetailsSection").setVisible(false);
				if (createRequestModel.getData().ProdSrc === "E") {
					sap.ui.core.Fragment.byId("CreateRequest", "purchDetailsSection").setVisible(true);
				} else {
					sap.ui.core.Fragment.byId("CreateRequest", "purchDetailsSection").setVisible(false);
				}
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "prodDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("CreateRequest", "shipDetailsSection").setVisible(false);
				sap.ui.core.Fragment.byId("CreateRequest", "purchDetailsSection").setVisible(false);
			}
			if (sap.ui.core.Fragment.byId("CreateRequest", "shipDetailsSection").getVisible()) {
				oReqCtrlExtn.presetMarkets();
				sap.ui.core.Fragment.byId("CreateRequest", "selectedMrkts").setValue(createRequestModel.getData().Markets);
			}
			sap.ui.core.Fragment.byId("CreateRequest", "uomValue").setValue(createRequestModel.getData().QtyUOM);
			this.getView().setModel(createRequestModel, "createRequestModel");

			var oTable = sap.ui.core.Fragment.byId("CreateRequest", "qtyStrnTab");
			var i = 0;
			if (createRequestModel.getData().PriceModel === "CP") {
				oTable.getHeaderToolbar().getContent()[1].setEnabled(false);
				for (i = 0; i < oTable.getItems().length; i++) {
					oTable.getItems()[i].getCells()[6].setEnabled(false);
				}
				sap.ui.core.Fragment.byId("CreateRequest", "markets").setSelectedKeys(null);
				sap.ui.core.Fragment.byId("CreateRequest", "markets").setEnabled(false);
				sap.ui.core.Fragment.byId("CreateRequest", "selectedMrkts").setValue("All");
			} else {
				oTable.getHeaderToolbar().getContent()[1].setEnabled(true);
				for (i = 0; i < oTable.getItems().length; i++) {
					oTable.getItems()[i].getCells()[6].setEnabled(true);
				}
				sap.ui.core.Fragment.byId("CreateRequest", "markets").setEnabled(true);
			}
			if (createRequestModel.getData().PriceModel === "AC") {
				sap.ui.core.Fragment.byId("CreateRequest", "destination").setVisible(true);
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "destination").setVisible(false);
			}
		},

		addStrenTabRow: function (oEvent) {
			var strengthsModel = this.getView().getModel("strengthsModel");
			var oStrnData = strengthsModel.getData().strengths;
			oStrnData.push({
				Strn1: "",
				SUoM1: "",
				Strn2: "",
				SUoM2: "",
				Strn3: "",
				SUoM3: ""
			});
			strengthsModel.refresh();
		},

		deleteStrenTabRow: function (oEvent) {
			var oDeleteRowId = oEvent.getSource().getId();
			var strengthsModel = this.getView().getModel("strengthsModel");
			var i = 0;
			for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
				if (oDeleteRowId.indexOf(i) >= 1) {
					strengthsModel.getData().strengths.splice(i, 1);
					strengthsModel.refresh();
					break;
				}
			}
		},

		onDropDownValueChange: function (oEvent) {
			oReqCtrlExtn.onDropDownValueChange(oEvent);
			//Icon Visisbility for Urgency Flag
			if (sap.ui.core.Fragment.byId("CreateRequest", "urgencyflag").getSelected()) {
				sap.ui.core.Fragment.byId("CreateRequest", "urgecyIconId").setVisible(true);
			} else {
				sap.ui.core.Fragment.byId("CreateRequest", "urgecyIconId").setVisible(false);
			}
		},

		onValueHelpClick: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.callFunction("/GetDomainValues", {
				method: "GET",
				urlParameters: {
					"DomName": "ZCTGINDI1",
					"PriIndCode": " "
				},
				success: function (oData) {
					var priIndHierModel = that.getView().getModel("priIndHierModel");
					priIndHierModel.setProperty("/priIndLevel1", oData.results);
					that.getView().setModel(priIndHierModel, "priIndHierModel");
					// create value help dialog
					if (!that._valueHelpDialog) {
						that._valueHelpDialog = new sap.ui.xmlfragment(
							"primIndicatorFrag",
							"com.pfizer.ctg.CTG_REQ.view.fragments.PrimaryIndicator",
							that
						);
						that.getView().addDependent(that._valueHelpDialog);
					}
					that._valueHelpDialog.open(sInputValue);
				},
				error: function () {}
			});
		},

		onPriIndValueChange: function (oEvent) {
			var priIndHierValue;
			var createRequestModel = this.getView().getModel("createRequestModel");
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			if (oEvent.getParameters().id.indexOf("priIndLvl1") >= 1) {
				oModel.callFunction("/GetDomainValues", {
					method: "GET",
					urlParameters: {
						"DomName": "ZCTGINDI1",
						"PriIndCode": sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getSelectedKey()
					},
					success: function (oData) {
						var priIndHierModel = that.getView().getModel("priIndHierModel");
						priIndHierModel.setProperty("/priIndLevel2", oData.results);
						priIndHierModel.setProperty("/priIndLevel3", "");
						that.getView().setModel(priIndHierModel, "priIndHierModel");
						sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").setEditable(true);
					},
					error: function () {}
				});
			}
			if (oEvent.getParameters().id.indexOf("priIndLvl2") >= 1) {
				oModel.callFunction("/GetDomainValues", {
					method: "GET",
					urlParameters: {
						"DomName": "ZCTGINDI1",
						"PriIndCode": sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getSelectedKey()
					},
					success: function (oData) {
						var priIndHierModel = that.getView().getModel("priIndHierModel");
						priIndHierModel.setProperty("/priIndLevel3", oData.results);
						that.getView().setModel(priIndHierModel, "priIndHierModel");
						sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").setEditable(true);
					},
					error: function () {}
				});
			}
			if (oEvent.getParameters().id.indexOf("priIndLvl3") >= 1) {
				createRequestModel.getData().PriInd = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getSelectedKey();
				this.getView().setModel(createRequestModel, "createRequestModel");
				sap.ui.core.Fragment.byId("CreateRequest", "priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				sap.ui.core.Fragment.byId("CreateRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				createRequestModel.getData().PriIndHier = priIndHierValue;
				sap.ui.core.Fragment.byId("CreateRequest", "priIndHier").setText(priIndHierValue);
				this._valueHelpDialog.close();
			}
		},

		onFragClose: function () {
			var priIndHierValue;
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue()) {
				createRequestModel.getData().PriInd = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getSelectedKey();
				this.getView().setModel(createRequestModel, "createRequestModel");
				sap.ui.core.Fragment.byId("CreateRequest", "priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				sap.ui.core.Fragment.byId("CreateRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				createRequestModel.getData().PriIndHier = priIndHierValue;
				sap.ui.core.Fragment.byId("CreateRequest", "priIndHier").setText(priIndHierValue);
				this._valueHelpDialog.close();
				return;
			}
			if (sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue()) {
				createRequestModel.getData().PriInd = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getSelectedKey();
				this.getView().setModel(createRequestModel, "createRequestModel");
				sap.ui.core.Fragment.byId("CreateRequest", "priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				sap.ui.core.Fragment.byId("CreateRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				createRequestModel.getData().PriIndHier = priIndHierValue;
				sap.ui.core.Fragment.byId("CreateRequest", "priIndHier").setText(priIndHierValue);
				this._valueHelpDialog.close();
				return;
			}
			if (sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue()) {
				createRequestModel.getData().PriInd = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getSelectedKey();
				this.getView().setModel(createRequestModel, "createRequestModel");
				sap.ui.core.Fragment.byId("CreateRequest", "priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue());
				sap.ui.core.Fragment.byId("CreateRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				createRequestModel.getData().PriIndHier = priIndHierValue;
				sap.ui.core.Fragment.byId("CreateRequest", "priIndHier").setText(priIndHierValue);
				this._valueHelpDialog.close();
				return;
			}
			this._valueHelpDialog.close();
		},

		onIconTabSelect: function (oEvent) {
			if (oEvent.getSource().getSelectedKey().indexOf("firstInClassSection") >= 0) {
				var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
				if (this._CurrentFragName === "CreateRequest") {
					sap.ui.core.Fragment.byId("CreateRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
				}
				if (this._CurrentFragName === "DisplayRequest") {
					sap.ui.core.Fragment.byId("DisplayRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
				}
			}
		},

		onFICUoMChange: function (oEvent) {
			var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
			ficPricGrpModel.UOM1 = oEvent.getParameter("value");
			this.getView().setModel(ficPricGrpModel, "ficPricGrpModel");
			if (ficPricGrpModel.UOM1) {
				sap.ui.core.Fragment.byId("CreateRequest", "uomValuFIC").setValueState(sap.ui.core.ValueState.None);
			}
		},

		onDeleteFICGrp: function (oEvent) {
			oReqCtrlExtn.onDeleteFICGrp(oEvent);
		},

		onMarketSelect: function (oEvent) {
			/*eslint-disable sap-ui5-no-private-prop */
			sap.ui.core.Fragment.byId("CreateRequest", "markets")._sOldValue = "";
			/*eslint-enable sap-ui5-no-private-prop */
		},

		onMrktSelectionClosed: function (oEvent) {
			var oMarkets;
			var marketsModel = this.getView().getModel("marketsModel");
			var aMarkets = [];
			var i = 0;
			for (i = 0; i < oEvent.getParameters().selectedItems.length; i++) {
				var sMarket = {};
				oEvent.getParameters().selectedItems[i].getText();
				if (!oMarkets) {
					oMarkets = oEvent.getParameters().selectedItems[i].getText();
					sMarket.Land1 = oEvent.getParameters().selectedItems[i].getKey();
				} else {
					oMarkets = oMarkets.concat(", ", oEvent.getParameters().selectedItems[i].getText());
					sMarket.Land1 = oEvent.getParameters().selectedItems[i].getKey();
				}
				var createRequestModel = this.getView().getModel("createRequestModel");
				if (!createRequestModel.getData().ReqNo) {
					sMarket.ReqNo = "0000000000";
				} else {
					sMarket.ReqNo = createRequestModel.getData().ReqNo;
				}
				aMarkets.push(sMarket);
			}
			marketsModel.setProperty("/market", aMarkets);
			this.getView().setModel("marketsModel", marketsModel);
			sap.ui.core.Fragment.byId("CreateRequest", "selectedMrkts").setValue(oMarkets);
			sap.ui.core.Fragment.byId("CreateRequest", "markets").setValueState(sap.ui.core.ValueState.None);
		},

		onPhaseDateChange: function (oEvent) {
			var currentDate = new Date();
			var selectedDate = new Date(oEvent.getParameter("value"));
			if (selectedDate < currentDate) {
				oEvent.getSource().setValue(null);
				MessageBox.error("Past Date cannot be selected");
				return;
			}
			if(selectedDate.toDateString() === "Invalid Date"){
				oEvent.getSource().setValue(null);
				return;
			}
			if (selectedDate.toString().length > 10) {
				var twoDigitMonth = ((selectedDate.getMonth() + 1) >= 10) ? (selectedDate.getMonth() + 1) : "0" + (selectedDate.getMonth() + 1);
				var twoDigitDate = ((selectedDate.getDate()) >= 10) ? (selectedDate.getDate()) : "0" + (selectedDate.getDate());
				var fullYear = selectedDate.getFullYear();
				var phseChngDt = twoDigitMonth + "/" + twoDigitDate + "/" + fullYear;
				sap.ui.core.Fragment.byId("CreateRequest", "phseChngDt").setValue(phseChngDt);
			}
		},

		onEditReq: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			var oSelectedTabKey = sap.ui.core.Fragment.byId("DisplayRequest", "iTabBarDispReq").getSelectedKey();
			oSelectedTabKey = oSelectedTabKey.replace("Display", "Create");
			this._showFormFragment("CreateRequest");
			this._CurrentFragName = "CreateRequest";
			this._prepareCreateRequest();
			sap.ui.core.Fragment.byId("CreateRequest", "iTabBarCreaReq").setSelectedKey(oSelectedTabKey);
			this.getView().byId("deleteReq").setVisible(true);
			this.getView().byId("cancelReq").setVisible(true);
			this.getView().byId("editReq").setVisible(false);
			if (createRequestModel.getData().HStat === "SB") {
				this.getView().byId("saveReq").setVisible(false);
			} else {
				this.getView().byId("saveReq").setVisible(true);
			}
			this.getView().byId("submitReq").setVisible(true);
			var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
			sap.ui.core.Fragment.byId("CreateRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
		},

		onCancelReq: function () {
			this.resetErrorState();
			var oSelectedTabKey = sap.ui.core.Fragment.byId("CreateRequest", "iTabBarCreaReq").getSelectedKey();
			oSelectedTabKey = oSelectedTabKey.replace("Create", "Display");
			this._showFormFragment("DisplayRequest");
			this._CurrentFragName = "DisplayRequest";
			this._prepareDisplayRequest();
			sap.ui.core.Fragment.byId("DisplayRequest", "iTabBarDispReq").setSelectedKey(oSelectedTabKey);
			this.getView().byId("deleteReq").setVisible(true);
			this.getView().byId("cancelReq").setVisible(false);
			this.getView().byId("editReq").setVisible(true);
			this.getView().byId("saveReq").setVisible(false);
			this.getView().byId("submitReq").setVisible(false);
			var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
			sap.ui.core.Fragment.byId("DisplayRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
		},

		onSubmitReq: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (!createRequestModel.getData().ReqNo) {
				createRequestModel.getData().ReqNo = "0000000000";
			}
			createRequestModel.getData().Action = "SUBMIT";
			var error = oReqCtrlExtn.validateFields(aAttachments);
			if (error === " ") {
				if (sap.ui.core.Fragment.byId("CreateRequest", "shipDetailsSection").getVisible()) {
					oReqCtrlExtn.oUpdateStrnKeysBeforeSave();
				}
				if (sap.ui.core.Fragment.byId("CreateRequest", "firstInClassSection").getVisible()) {
					oReqCtrlExtn.oUpdateFICGrpPriceBeforeSave();
				}
				this.saveRequest(createRequestModel);
			}
		},

		onSaveReq: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (!createRequestModel.getData().ReqNo) {
				createRequestModel.getData().ReqNo = "0000000000";
			}
			createRequestModel.getData().Action = "SAVE";
			if (sap.ui.core.Fragment.byId("CreateRequest", "shipDetailsSection").getVisible()) {
				oReqCtrlExtn.oUpdateStrnKeysBeforeSave();
			}
			if (sap.ui.core.Fragment.byId("CreateRequest", "firstInClassSection").getVisible()) {
				oReqCtrlExtn.oUpdateFICGrpPriceBeforeSave();
			}
			this.saveRequest(createRequestModel);
		},

		saveRequest: function (createRequestModel) {
			var createPayload = createRequestModel.getData();
			var urgencyFlag;
			if (sap.ui.core.Fragment.byId("CreateRequest", "urgencyflag").getSelected()) {
				urgencyFlag = "X";
			} else {
				urgencyFlag = "";
			}
			if (sap.ui.core.Fragment.byId("CreateRequest", "shipDetailsSection").getVisible()) {
				var strengthsModel = this.getView().getModel("strengthsModel");
				createPayload.StrengthsSet = strengthsModel.getData().strengths;
				if (createPayload.PriceModel !== "CP") {
					var marketsModel = this.getView().getModel("marketsModel");
					if (marketsModel.getData().market) {
						if (marketsModel.getData().market.length > 0) {
							createPayload.MarketsSet = marketsModel.getData().market;
						} else {
							delete createPayload.MarketsSet;
						}
					} else {
						delete createPayload.MarketsSet;
					}
				}
			} else {
				delete createPayload.StrengthsSet;
				delete createPayload.MarketsSet;
			}
			if (sap.ui.core.Fragment.byId("CreateRequest", "firstInClassSection").getVisible()) {
				var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
				createPayload.FICPricingSet = ficPricGrpModel.getData().grpprice;
			} else {
				delete createPayload.FICPricingSet;
			}
			if (aAttachments.length > 0) {
				createPayload.ReqAttachmentSet = aAttachments;
			} else {
				delete createPayload.ReqAttachmentSet;
			}
			this._ProdTitle = createPayload.ProdTitle;
			this._ProdNames = createPayload.ProdNames;
			this._ProdStat = createPayload.ProdStat;
			this._Markets = createPayload.Markets;
			delete createPayload.ProdTitle;
			delete createPayload.ProdNames;
			delete createPayload.ProdStat;
			delete createPayload.Markets;
			delete createPayload.VFCNotes;
			delete createPayload.__metadata;
			this.getView().byId("saveReq").setEnabled(false);
			this.getView().byId("submitReq").setEnabled(false);
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			oModel.create("/ReqCreateSet", createPayload, {
				method: "POST",
				success: function (oData) {
					that.getView().byId("saveReq").setEnabled(true);
					that.getView().byId("submitReq").setEnabled(true);
					that.odataupdatecall = "X";
					createPayload.ReqNo = oData.ReqNo;
					createPayload.ProdTitle = that._ProdTitle;
					createPayload.ProdNames = that._ProdNames;
					createPayload.ProdStat = that._ProdStat;
					createPayload.Markets = that._Markets;
					createPayload.ProdTyp = oData.ProdTyp;
					createPayload.Priority = urgencyFlag;
					//	oData.Priority = urgencyFlag;
					if (aAttachments.length > 0) {
						that.attmntSaved = "X";
						aAttachments = [];
						createPayload.ReqAttachmentSet = aAttachments;
					}
					createRequestModel.setData(createPayload);
					that.getView().setModel(createRequestModel, "createRequestModel");
					sap.ui.core.Fragment.byId("CreateRequest", "prodType").setSelectedKey(createRequestModel.getData().ProdTyp);
					sap.ui.core.Fragment.byId("CreateRequest", "apiValu").setValue(createRequestModel.getData().APIValue);
					sap.ui.core.Fragment.byId("CreateRequest", "reqNo").setText(oData.ReqNo);
					if (sap.ui.core.Fragment.byId("CreateRequest", "shipDetailsSection").getVisible()) {
						oReqCtrlExtn.oUpdateStrnKeysAfterSave();
					}
					if (sap.ui.core.Fragment.byId("CreateRequest", "firstInClassSection").getVisible()) {
						oReqCtrlExtn.oUpdateFICGrpPriceAfterSave();
					}
					that.getView().byId("deleteReq").setVisible(true);
					that.getView().byId("cancelReq").setVisible(true);
					that.getView().byId("editReq").setVisible(false);
					that.getView().byId("submitReq").setVisible(true);
					that.getView().byId("saveReq").setVisible(true);
					var msg = "Contego Request ";
					if (createPayload.Action === "SAVE") {
						if (oData.RetMsgType === "E") {
							msg = oData.RetMsg;
						} else {
							msg = msg.concat(oData.ReqNo, " has been Saved.");
						}
						MessageToast.show(msg, {
							duration: 5000,
							width: "25em",
							at: "center",
							onClose: function () {
								if (userAction === "CRE") {
									userAction = "UPD-DR";
								}
							}
						});
					}
					if (createPayload.Action === "SUBMIT") {
						that.getView().byId("saveReq").setVisible(false);
						if (oData.RetMsgType === "E") {
							msg = oData.RetMsg;
						} else {
							msg = msg.concat(oData.ReqNo, " has been Submitted.");
						}
						MessageToast.show(msg, {
							duration: 4000,
							width: "25em",
							at: "center",
							onClose: function () {
								that.refreshViewModel();
								that.oRouter.navTo("WorkListRequestor", {
									userId: that.getUserId(),
									statTab: "SB"
								});
							}
						});
					}
				},
				error: function () {}
			});
		},

		refreshViewModel: function () {
			this.getView().byId("saveReq").setEnabled(true);
			this.getView().byId("submitReq").setEnabled(true);
			if (this._CurrentFragName === "CreateRequest") {
				sap.ui.core.Fragment.byId("CreateRequest", "prodDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("CreateRequest", "shipDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("CreateRequest", "purchDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("CreateRequest", "firstInClassSection").setVisible(true);
				sap.ui.core.Fragment.byId("CreateRequest", "notessuggestSection").setVisible(true);
				sap.ui.core.Fragment.byId("CreateRequest", "iTabBarCreaReq").setSelectedKey(null);
				sap.ui.core.Fragment.byId("CreateRequest", "devPhase").setValue(null);
				sap.ui.core.Fragment.byId("CreateRequest", "reqGrp").setValue(null);
				sap.ui.core.Fragment.byId("CreateRequest", "finiGoodsForm").setValue(null);
				sap.ui.core.Fragment.byId("CreateRequest", "priInd").setValue(null);
				sap.ui.core.Fragment.byId("CreateRequest", "actionMech").setValue(null);
				sap.ui.core.Fragment.byId("CreateRequest", "selectedMrkts").setValue("");
				sap.ui.core.Fragment.byId("CreateRequest", "markets").setSelectedKeys(null);
				sap.ui.core.Fragment.byId("CreateRequest", "uomValue").setValue(null);
				sap.ui.core.Fragment.byId("CreateRequest", "uomValuFIC").setValue(null);
				sap.ui.core.Fragment.byId("CreateRequest", "fileUploader").setValue("");
				this.resetErrorState();
			}
			this.attmntSaved = "";
			this.initializeModels();
		},

		resetErrorState: function () {
			sap.ui.core.Fragment.byId("CreateRequest", "prodType").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("CreateRequest", "reqGrp").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("CreateRequest", "devPhase").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("CreateRequest", "finiGoodsForm").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("CreateRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("CreateRequest", "dDose").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("CreateRequest", "actionMech").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("CreateRequest", "apiValu").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("CreateRequest", "markets").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("CreateRequest", "purchCost").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("CreateRequest", "purchQty").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("CreateRequest", "uomValue").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("CreateRequest", "uomValuFIC").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("CreateRequest", "reqsterNotes").setValueState(sap.ui.core.ValueState.None);
		},

		onDeleteReq: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			oModel.remove("/ReqCreateSet(ReqNo='" + createRequestModel.getData().ReqNo + "')", {
				method: "DELETE",
				success: function (oData) {
					that.odataupdatecall = "X";
					var oHistory = History.getInstance();
					var msg = "Contego Request ";
					msg = msg.concat(createRequestModel.getData().ReqNo, " has been Deleted.");
					MessageToast.show(msg, {
						duration: 4000,
						width: "25em",
						at: "center",
						onClose: function () {
							that.refreshViewModel();
							var sPreviousHash = oHistory.getPreviousHash();
							if (sPreviousHash !== undefined) {
								window.history.go(-1);
							} else {
								that.oRouter.navTo("ProductSearch", true);
							}
						}
					});
				},
				error: function () {}
			});
		},

		onSelectUploadFile: function (oEvent) {
			this.attmntSaved = "";
			var fileAttachmentModel = this.getView().getModel("fileAttachmentModel");
			var aAttchmntTab = this.getView().getModel("fileAttachmentModel").getData().attachments;
			var createRequestModel = this.getView().getModel("createRequestModel");
			var oFileUploader = sap.ui.core.Fragment.byId("CreateRequest", "fileUploader");
			var domRef = oFileUploader.getFocusDomRef();
			if (domRef.files.length <= 0) {
				return;
			}
			var file = domRef.files[0];
			this.fileName = oEvent.getParameter("files")[0].name;
			this.fileType = oEvent.getParameter("files")[0].type;
			if (this.fileType === "") {
				this.fileType = "application/octet-stream";
			}
			if (aAttchmntTab !== null) {
				for (var i = 0; i < aAttchmntTab.length; i++) {
					if (aAttchmntTab[i].FileName === this.fileName) {
						MessageBox.error("Duplicate files cannot be uploaded");
						return;
					}
				}
			}
			var that = this;
			var reader = new FileReader();
			reader.readAsDataURL(file); //Automatically reads the data in Base64 format.			
			reader.onload = function (event) {
				var content = {};
				content.ReqNo = createRequestModel.getData().ReqNo;
				content.FileName = that.fileName;
				if (aAttchmntTab) {
					aAttchmntTab.push(content);
				} else {
					/*eslint no-array-constructor:*/
					aAttchmntTab = new Array();
					aAttchmntTab[0] = content;
				}
				fileAttachmentModel.setProperty("/attachments", aAttchmntTab);
				that.getView().setModel(fileAttachmentModel, "fileAttachmentModel");
				var oTable = sap.ui.core.Fragment.byId("CreateRequest", "attachmentTab");
				var oTemplate = oTable.getBindingInfo("items").template;
				oTable.unbindAggregation("items");
				oTable.bindAggregation("items", {
					path: "fileAttachmentModel>/attachments",
					template: oTemplate
				});
				content.Action = "C"; //Create
				content.AttchTyp = "REQSTR";
				content.FileType = that.fileType;
				var base64Content;
				if (file.type !== "") {
					base64Content = event.target.result.replace("data:" + file.type + ";base64,", "");
				} else {
					base64Content = event.target.result.replace("data:" + that.fileType + ";base64,", "");
				}
				content.Content = base64Content; //Pure base64 Content
				aAttachments.push(content);
			};
		},

		onDeleteAttachment: function (oEvent) {
			this.attmntSaved = "";
			var fileAttachmentModel = this.getView().getModel("fileAttachmentModel");
			var oTable = sap.ui.core.Fragment.byId("CreateRequest", "attachmentTab");
			var i = 0;
			for (i = 0; i < oTable.getItems().length; i++) {
				if (oTable.getItems()[i].getSelected()) {
					fileAttachmentModel.getData().attachments[i].Action = "D";
					var oFound = aAttachments.filter(function (arr) {
						if (arr.FileName === oTable.getItems()[i].getCells()[0].getText()) {
							arr.Action = "D";
							return arr;
						}
					});
					if (oFound.length === 0) {
						var sAttFile = {};
						sAttFile.ReqNo = fileAttachmentModel.getData().attachments[i].ReqNo;
						sAttFile.FileName = fileAttachmentModel.getData().attachments[i].FileName;
						sAttFile.FileType = fileAttachmentModel.getData().attachments[i].FileType;
						sAttFile.Action = "D"; //Delete
						sAttFile.AttchTyp = "REQSTR";
						sAttFile.Content = ""; //Remove content
						aAttachments.push(sAttFile);
					}
				}
			}
			i = 0;
			for (i = aAttachments.length - 1; i >= 0; i--) {
				if (aAttachments[i].Action === "D" && aAttachments[i].Content !== "") {
					aAttachments.splice(i, 1);
				}
			}
			i = 0;
			for (i = fileAttachmentModel.getData().attachments.length - 1; i >= 0; i--) {
				if (fileAttachmentModel.getData().attachments[i].Action === "D") {
					fileAttachmentModel.getData().attachments.splice(i, 1);
				}
			}
			fileAttachmentModel.refresh();
			oEvent.getSource().getParent().getParent().removeSelections();
			sap.ui.core.Fragment.byId("CreateRequest", "fileUploader").setValue("");
		},

		onFileDownload: function (oEvent) {
			var attachType = "REQSTR";
			var createRequestModel = this.getView().getModel("createRequestModel");
			var reqNo = createRequestModel.getData().ReqNo;
			this.onFileDownloadClick(oEvent, aAttachments, attachType, reqNo);
		},

		onNavBack: function () {
			this.refreshViewModel();
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				if (this.odataupdatecall === undefined) {
					this.setRaisedEvent("NAVBACK");
				}
				window.history.go(-1);
			} else {
				this.oRouter.navTo("MainView", true);
			}
		},

		onHome: function () {
			this.refreshViewModel();
			this.initializeModels();
			this.oRouter.navTo("MainView", null, true);
		}
	});
});