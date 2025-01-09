sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"sap/ui/core/routing/History",
	"com/pfizer/ctg/CTG_REQ/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"./RenewReqCtrlExtn",
	"sap/m/UploadCollectionParameter"
], function (Controller, History, Formatter, MessageToast, MessageBox, RReqCtrlExtn, UploadCollectionParameter) {
	"use strict";

	// Action Legend
	// DIS	- Display	CRE	- Create    UPD	- Update
	// DEL	- Delete	CAN	- Cancel	SAV	- Save
	// SUB	- Submit	APD	- Append	EXT	- Extend
	// REN	- Renew		

	var userAction;
	var oReqCtrlExtn;
	this.odataupdatecall = "";
	var aAttachments = [];

	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.RenewRequest", {

		formatter: Formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._onObjectMatched, this);
			oReqCtrlExtn = new RReqCtrlExtn(this.getView());
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
			var oPage = this.getView().byId("RenewReqPage");
			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},

		_onObjectMatched: function (oEvent) {
			if (oEvent.getParameters().name !== "RenewRequest") {
				return;
			}
			this.odataupdatecall = undefined;
			aAttachments = [];
			this.attmntSaved = "";
			var oExpand = [];
			var reqNo = oEvent.getParameters("RenewRequest").arguments.reqNo;
			userAction = oEvent.getParameters("RenewRequest").arguments.action;
			if (userAction === "DIS") {
				this._showFormFragment("DispRenewReq");
				this._CurrentFragName = "DispRenewReq";
				oExpand = ["StrengthsSet", "MarketsSet", "FICPricingSet", "AttachmentsSet"];
			}
			if (userAction === "REN") {
				this._showFormFragment("RenewRequest");
				this._CurrentFragName = "RenewRequest";
				reqNo = reqNo.concat("R");
				oExpand = ["StrengthsSet", "MarketsSet", "FICPricingSet"];
			}
			if (userAction === "REN-DR") {
				this._showFormFragment("RenewRequest");
				this._CurrentFragName = "RenewRequest";
				oExpand = ["StrengthsSet", "MarketsSet", "FICPricingSet", "AttachmentsSet"];
			}
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
					"$expand": oExpand
				},
				success: function (oData) {
					createRequestModel.setData(oData);
					if (userAction === "REN") {
						createRequestModel.getData().RefReqNo = createRequestModel.getData().ReqNo.concat(); //New Array Ref
						createRequestModel.getData().ReqNo = "";
					}
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
						oReqCtrlExtn.oUpdateFICGrpPriceAfterSave();
					}
					if (oData.AttachmentsSet.results) {
						fileAttachmentModel.setProperty("/attachments", oData.AttachmentsSet.results);
						that.getView().setModel(fileAttachmentModel, "fileAttachmentModel");
					}
					delete createRequestModel.getData().AttachmentsSet;
					createRequestModel.setProperty("/ProdName", createRequestModel.getData().ProdName);
					var prodTitle = "Product: " + createRequestModel.getData().ProdName + "";
					createRequestModel.setProperty("/ProdTitle", prodTitle);
					createRequestModel.setProperty("/ProdTyp", createRequestModel.getData().ProdTyp);
					createRequestModel.setProperty("/ProdNames", createRequestModel.getData().OtherNames);
					that.getView().setModel(createRequestModel, "createRequestModel");
					if (userAction === "DIS") {
						that.prepareDisplayRequest();
						if (sap.ui.core.Fragment.byId("DispRenewReq", "shipDetailsSection").getVisible()) {
							oReqCtrlExtn.presetMarkets();
							oReqCtrlExtn.setStrenUoMKeys();
							sap.ui.core.Fragment.byId("DispRenewReq", "selectedMrkts").setValue(createRequestModel.getData().Markets);
							if (createRequestModel.getData().PriceModel === "CP") {
								createRequestModel.getData().Markets = "All";
								sap.ui.core.Fragment.byId("DispRenewReq", "markets").setSelectedKeys(null);
								sap.ui.core.Fragment.byId("DispRenewReq", "selectedMrkts").setValue("All");
							}
						}
						that.getView().byId("deleteReq").setVisible(false);
						that.getView().byId("cancelReq").setVisible(false);
						that.getView().byId("editReq").setVisible(false);
						that.getView().byId("saveReq").setVisible(false);
						that.getView().byId("submitReq").setVisible(false);
						if (!createRequestModel.getData().ReqNo) {
							that.getView().byId("submitReq").setEnabled(false);
						} else {
							that.getView().byId("submitReq").setEnabled(true);
						}
						if (createRequestModel.getData().RefReqNo) {
							sap.ui.core.Fragment.byId("DispRenewReq", "refReqE").setVisible(true);
							sap.ui.core.Fragment.byId("DispRenewReq", "refReqE").setEnabled(true);
							sap.ui.core.Fragment.byId("DispRenewReq", "refReqE").setText(createRequestModel.getData().RefReqNo);
						}
					}
					if (userAction === "REN" || userAction === "REN-DR") {
						//	var selectedDesKeys = sap.ui.core.Fragment.byId("RenewRequest", "markets").getSelectedKeys();
						that.prepareCreateRequest();
						if (sap.ui.core.Fragment.byId("RenewRequest", "shipDetailsSection").getVisible()) {
							oReqCtrlExtn.presetMarkets();
							//Remove Active Flag
							var i = 0;
							if (createRequestModel.getData().PriceModel !== "CP") {
								for (i = 0; i < marketsModel.getData().market.length; i++) {
									marketsModel.getData().market[i].Active = "";
								}
							}
							oReqCtrlExtn.setStrenUoMKeys();
							//Remove Active Flag
							if (strengthsModel.getData().strengths !== null) {
								for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
									strengthsModel.getData().strengths[i].Active = "";
								}
							}
							if (createRequestModel.getData().PriceModel === "CP") {
								createRequestModel.getData().Markets = "All";
								sap.ui.core.Fragment.byId("RenewRequest", "markets").setSelectedKeys(null);
								sap.ui.core.Fragment.byId("RenewRequest", "selectedMrkts").setValue("All");
							} else {
								//New code by DOGIPA to give space after comma for Renew Requests
								var marketssplit = createRequestModel.getData().Markets;
								marketssplit = marketssplit.split(",");
								var marketSplitSpace = marketssplit.join(", ");
								//	sap.ui.core.Fragment.byId("RenewRequest", "selectedMrkts").setValue(createRequestModel.getData().Markets);
								sap.ui.core.Fragment.byId("RenewRequest", "selectedMrkts").setValue(marketSplitSpace);
							}
						}
						if (sap.ui.core.Fragment.byId("RenewRequest", "firstInClassSection").getVisible()) {
							//Remove Active Flag
							for (i = 0; i < ficPricGrpModel.getData().grpprice.length; i++) {
								ficPricGrpModel.getData().grpprice[i].Active = "";
							}
						}
						that.getView().byId("deleteReq").setVisible(true);
						that.getView().byId("cancelReq").setVisible(true);
						that.getView().byId("editReq").setVisible(false);
						if (createRequestModel.getData().HStat === "SB") {
							that.getView().byId("saveReq").setVisible(false);
						} else {
							that.getView().byId("saveReq").setVisible(true);
						}
						that.getView().byId("submitReq").setVisible(true);
						if (!createRequestModel.getData().ReqNo) {
							that.getView().byId("submitReq").setEnabled(false);
						} else {
							that.getView().byId("submitReq").setEnabled(true);
						}
					}
				},
				error: function () {}
			});
		},

		prepareDisplayRequest: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			sap.ui.core.Fragment.byId("DispRenewReq", "refReqE").setVisible(true);
			if (createRequestModel.getData().ReqNo === "") {
				sap.ui.core.Fragment.byId("DispRenewReq", "refReqE").setEnabled(false);
			} else {
				sap.ui.core.Fragment.byId("DispRenewReq", "refReqE").setEnabled(true);
			}
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			sap.ui.core.Fragment.byId("DispRenewReq", "dynamicPageId").getTitle().getHeading().setText(oResourceBundle.getText(
				"DisplayReqTitle").toString());
			sap.ui.core.Fragment.byId("DispRenewReq", "otherNames").setText(createRequestModel.getData().OtherNames);
			sap.ui.core.Fragment.byId("DispRenewReq", "prodType").setSelectedKey(createRequestModel.getData().ProdTyp);
			sap.ui.core.Fragment.byId("DispRenewReq", "reqGrp").setSelectedKey(createRequestModel.getData().ReqGrp);
			sap.ui.core.Fragment.byId("DispRenewReq", "devPhase").setSelectedKey(createRequestModel.getData().DevPhase);
			sap.ui.core.Fragment.byId("DispRenewReq", "destination").setSelectedKey(createRequestModel.getData().DestShip);
			if (createRequestModel.getData().ProdSrc === "P") {
				sap.ui.core.Fragment.byId("DispRenewReq", "prodSource").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("DispRenewReq", "prodSource").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("DispRenewReq", "prodSource").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("DispRenewReq", "prodSource").getButtons()[1].setSelected(true);
			}
			if (!createRequestModel.getData().Biologic) {
				sap.ui.core.Fragment.byId("DispRenewReq", "biologic").setState(false);
			} else {
				sap.ui.core.Fragment.byId("DispRenewReq", "biologic").setState(true);
			}
			if (!createRequestModel.getData().Biosimilar) {
				sap.ui.core.Fragment.byId("DispRenewReq", "biosim").setState(false);
			} else {
				sap.ui.core.Fragment.byId("DispRenewReq", "biosim").setState(true);
			}
			if (!createRequestModel.getData().POCInd) {
				sap.ui.core.Fragment.byId("DispRenewReq", "reachedPOC").setState(false);
			} else {
				sap.ui.core.Fragment.byId("DispRenewReq", "reachedPOC").setState(true);
			}
			if (!createRequestModel.getData().FirstClass) {
				sap.ui.core.Fragment.byId("DispRenewReq", "firstInClass").setState(false);
			} else {
				sap.ui.core.Fragment.byId("DispRenewReq", "firstInClass").setState(true);
			}

			var aPrimaryInd = this.getView().getModel("dropDownModel").getData().primaryInd;
			aPrimaryInd.filter(function (arr) {
				if (arr.Value === createRequestModel.getData().PriInd) {
					sap.ui.core.Fragment.byId("DispRenewReq", "priInd").setValue(arr.Desc);
				}
			});

			sap.ui.core.Fragment.byId("DispRenewReq", "actionMech").setSelectedKey(createRequestModel.getData().ActionMech);
			if (createRequestModel.getData().MechActTyp === "DM") {
				sap.ui.core.Fragment.byId("DispRenewReq", "MOAType").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("DispRenewReq", "MOAType").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("DispRenewReq", "MOAType").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("DispRenewReq", "MOAType").getButtons()[1].setSelected(true);
			}
			if (createRequestModel.getData().ProcmntTyp === "P") {
				sap.ui.core.Fragment.byId("DispRenewReq", "ProcmntTyp").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("DispRenewReq", "ProcmntTyp").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("DispRenewReq", "ProcmntTyp").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("DispRenewReq", "ProcmntTyp").getButtons()[1].setSelected(true);
			}
			//Setting Visibility for Finished Goods 
			if (createRequestModel.getData().ProdTyp === "FGD") {
				sap.ui.core.Fragment.byId("DispRenewReq", "finiGoodsForm").setVisible(true);
			} else {
				sap.ui.core.Fragment.byId("DispRenewReq", "finiGoodsForm").setVisible(false);
			}
			sap.ui.core.Fragment.byId("DispRenewReq", "finiGoodsForm").setSelectedKey(createRequestModel.getData().FiniGoodsFrm);

			if (createRequestModel.getData().DevPhase === "CM") {
				sap.ui.core.Fragment.byId("DispRenewReq", "firstInClass").setVisible(false);
			} else {
				sap.ui.core.Fragment.byId("DispRenewReq", "firstInClass").setVisible(true);
			}
			if (createRequestModel.getData().PriceModel === "FC" && createRequestModel.getData().DevPhase !== "CM") {
				sap.ui.core.Fragment.byId("DispRenewReq", "firstInClassSection").setVisible(true);
				oReqCtrlExtn.presetFICgrpPrice();
				var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
				sap.ui.core.Fragment.byId("DispRenewReq", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
			} else {
				sap.ui.core.Fragment.byId("DispRenewReq", "firstInClassSection").setVisible(false);
			}
			if (createRequestModel.getData().PriceModel === "DS") {
				sap.ui.core.Fragment.byId("DispRenewReq", "apiValu").setVisible(true);
				sap.ui.core.Fragment.byId("DispRenewReq", "apiValuTxt").setVisible(true);
				sap.ui.core.Fragment.byId("DispRenewReq", "apiValu").setValue(createRequestModel.getData().APIValue);
			} else {
				sap.ui.core.Fragment.byId("DispRenewReq", "apiValu").setVisible(false);
				sap.ui.core.Fragment.byId("DispRenewReq", "apiValuTxt").setVisible(false);
			}
			if (createRequestModel.getData().DevPhase === "CM") {
				sap.ui.core.Fragment.byId("DispRenewReq", "shipDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("DispRenewReq", "prodDetailsSection").setVisible(false);
				if (createRequestModel.getData().ProdSrc === "E") {
					sap.ui.core.Fragment.byId("DispRenewReq", "purchDetailsSection").setVisible(true);
				} else {
					sap.ui.core.Fragment.byId("DispRenewReq", "purchDetailsSection").setVisible(false);
				}
			} else {
				sap.ui.core.Fragment.byId("DispRenewReq", "prodDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("DispRenewReq", "shipDetailsSection").setVisible(false);
				sap.ui.core.Fragment.byId("DispRenewReq", "purchDetailsSection").setVisible(false);
			}
			if (sap.ui.core.Fragment.byId("DispRenewReq", "shipDetailsSection").getVisible()) {
				oReqCtrlExtn.presetMarkets();
				sap.ui.core.Fragment.byId("DispRenewReq", "selectedMrkts").setValue(createRequestModel.getData().Markets);
			}
			if (createRequestModel.getData().PriceModel === "CP") {
				createRequestModel.getData().Markets = "All";
				sap.ui.core.Fragment.byId("DispRenewReq", "markets").setSelectedKeys(null);
				sap.ui.core.Fragment.byId("DispRenewReq", "selectedMrkts").setValue("All");
			}
			sap.ui.core.Fragment.byId("DispRenewReq", "uomValue").setValue(createRequestModel.getData().QtyUOM);
			this.getView().setModel(createRequestModel, "createRequestModel");

			if (userAction === "REN") {
				sap.ui.core.Fragment.byId("DispRenewReq", "devPhase").setEditable(false);
				sap.ui.core.Fragment.byId("DispRenewReq", "reachedPOC").setEnabled(false);
				sap.ui.core.Fragment.byId("DispRenewReq", "firstInClass").setEnabled(false);
				sap.ui.core.Fragment.byId("DispRenewReq", "refReqE").setVisible(true);
				sap.ui.core.Fragment.byId("DispRenewReq", "refReqE").setEnabled(false);
				sap.ui.core.Fragment.byId("DispRenewReq", "refReqE").setText(createRequestModel.getData().RefReqNo);
			}
			if (createRequestModel.getData().DevPhase === "CM") {
				sap.ui.core.Fragment.byId("DispRenewReq", "prodSource").setVisible(false);
				sap.ui.core.Fragment.byId("DispRenewReq", "prodType").setEditable(false);
				sap.ui.core.Fragment.byId("DispRenewReq", "reachedPOC").setVisible(false);
				//FGF should only be visible when ProdTyp is FGD
				if(sap.ui.core.Fragment.byId("DispRenewReq", "prodType").getSelectedKey() === "FGD"){
					sap.ui.core.Fragment.byId("DispRenewReq", "finiGoodsForm").setVisible(true);
				} else {
					sap.ui.core.Fragment.byId("DispRenewReq", "finiGoodsForm").setVisible(false);
				}
				sap.ui.core.Fragment.byId("DispRenewReq", "finiGoodsForm").setEditable(false);
				sap.ui.core.Fragment.byId("DispRenewReq", "destination").setVisible(true);
				sap.ui.core.Fragment.byId("DispRenewReq", "destination").setEditable(false);
			}
		},

		prepareCreateRequest: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			sap.ui.core.Fragment.byId("RenewRequest", "refReqE").setVisible(true);
			if (createRequestModel.getData().ReqNo === "") {
				sap.ui.core.Fragment.byId("RenewRequest", "refReqE").setEnabled(false);
			} else {
				sap.ui.core.Fragment.byId("RenewRequest", "refReqE").setEnabled(true);
			}
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			sap.ui.core.Fragment.byId("RenewRequest", "dynamicPageId").getTitle().getHeading().setText(oResourceBundle.getText("RenewReqTitle")
				.toString());
			sap.ui.core.Fragment.byId("RenewRequest", "otherNames").setText(createRequestModel.getData().OtherNames);
			sap.ui.core.Fragment.byId("RenewRequest", "prodType").setSelectedKey(createRequestModel.getData().ProdTyp);
			sap.ui.core.Fragment.byId("RenewRequest", "reqGrp").setSelectedKey(createRequestModel.getData().ReqGrp);
			sap.ui.core.Fragment.byId("RenewRequest", "devPhase").setSelectedKey(createRequestModel.getData().DevPhase);
			//New Condition DOGIPA
			sap.ui.core.Fragment.byId("RenewRequest", "destination").setSelectedKey(createRequestModel.getData().DestShip);
			sap.ui.core.Fragment.byId("RenewRequest", "reqGrp").setEditable(true);
			if (createRequestModel.getData().ProdSrc === "P") {
				sap.ui.core.Fragment.byId("RenewRequest", "prodSource").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("RenewRequest", "prodSource").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("RenewRequest", "prodSource").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("RenewRequest", "prodSource").getButtons()[1].setSelected(true);
			}
			if (!createRequestModel.getData().Biologic) {
				sap.ui.core.Fragment.byId("RenewRequest", "biologic").setState(false);
			} else {
				sap.ui.core.Fragment.byId("RenewRequest", "biologic").setState(true);
			}
			if (!createRequestModel.getData().Biosimilar) {
				sap.ui.core.Fragment.byId("RenewRequest", "biosim").setState(false);
			} else {
				sap.ui.core.Fragment.byId("RenewRequest", "biosim").setState(true);
			}
			if (!createRequestModel.getData().POCInd) {
				sap.ui.core.Fragment.byId("RenewRequest", "reachedPOC").setState(false);
			} else {
				sap.ui.core.Fragment.byId("RenewRequest", "reachedPOC").setState(true);
			}
			if (!createRequestModel.getData().FirstClass) {
				sap.ui.core.Fragment.byId("RenewRequest", "firstInClass").setState(false);
			} else {
				sap.ui.core.Fragment.byId("RenewRequest", "firstInClass").setState(true);
			}

			var aPrimaryInd = this.getView().getModel("dropDownModel").getData().primaryInd;
			aPrimaryInd.filter(function (arr) {
				if (arr.Value === createRequestModel.getData().PriInd) {
					sap.ui.core.Fragment.byId("RenewRequest", "priInd").setValue(arr.Desc);
				}
			});

			sap.ui.core.Fragment.byId("RenewRequest", "actionMech").setSelectedKey(createRequestModel.getData().ActionMech);
			if (createRequestModel.getData().MechActTyp === "DM") {
				sap.ui.core.Fragment.byId("RenewRequest", "MOAType").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("RenewRequest", "MOAType").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("RenewRequest", "MOAType").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("RenewRequest", "MOAType").getButtons()[1].setSelected(true);
			}
			if (createRequestModel.getData().ProcmntTyp === "P") {
				sap.ui.core.Fragment.byId("RenewRequest", "ProcmntTyp").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("RenewRequest", "ProcmntTyp").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("RenewRequest", "ProcmntTyp").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("RenewRequest", "ProcmntTyp").getButtons()[1].setSelected(true);
			}
			if (createRequestModel.getData().ProdTyp === "FGF") {
				sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setVisible(true);
			} else {
				sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setVisible(false);
			}
			sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setSelectedKey(createRequestModel.getData().FiniGoodsFrm);

			if (createRequestModel.getData().DevPhase === "CM") {
				sap.ui.core.Fragment.byId("RenewRequest", "firstInClass").setVisible(false);
			} else {
				sap.ui.core.Fragment.byId("RenewRequest", "firstInClass").setVisible(true);
			}
			if (createRequestModel.getData().PriceModel === "DS") {
				sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "apiValuTxt").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setValue(createRequestModel.getData().APIValue);
			} else {
				sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setVisible(false);
				sap.ui.core.Fragment.byId("RenewRequest", "apiValuTxt").setVisible(false);
			}
			if (createRequestModel.getData().PriceModel === "FC" && createRequestModel.getData().DevPhase !== "CM") {
				sap.ui.core.Fragment.byId("RenewRequest", "firstInClassSection").setVisible(true);
				oReqCtrlExtn.presetFICgrpPrice();
			} else {
				sap.ui.core.Fragment.byId("RenewRequest", "firstInClassSection").setVisible(false);
			}
			if (createRequestModel.getData().DevPhase === "CM") {
				sap.ui.core.Fragment.byId("RenewRequest", "shipDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "prodDetailsSection").setVisible(false);
				if (createRequestModel.getData().ProdSrc === "E") {
					sap.ui.core.Fragment.byId("RenewRequest", "purchDetailsSection").setVisible(true);
				} else {
					sap.ui.core.Fragment.byId("RenewRequest", "purchDetailsSection").setVisible(false);
				}
			} else {
				sap.ui.core.Fragment.byId("RenewRequest", "prodDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "shipDetailsSection").setVisible(false);
				sap.ui.core.Fragment.byId("RenewRequest", "purchDetailsSection").setVisible(false);
			}
			if (sap.ui.core.Fragment.byId("RenewRequest", "shipDetailsSection").getVisible()) {
				oReqCtrlExtn.presetMarkets();
				if (createRequestModel.getData().PriceModel === "CP") {
					createRequestModel.getData().Markets = "All";
					sap.ui.core.Fragment.byId("RenewRequest", "selectedMrkts").setValue("All");
				} else {
					sap.ui.core.Fragment.byId("RenewRequest", "selectedMrkts").setValue(createRequestModel.getData().Markets);
				}
			}
			sap.ui.core.Fragment.byId("RenewRequest", "uomValue").setValue(createRequestModel.getData().QtyUOM);
			this.getView().setModel(createRequestModel, "createRequestModel");

			var oTable = sap.ui.core.Fragment.byId("RenewRequest", "qtyStrnTab");
			var i = 0;
			if (createRequestModel.getData().PriceModel === "CP") {
				oTable.getHeaderToolbar().getContent()[1].setEnabled(false);
				for (i = 0; i < oTable.getItems().length; i++) {
					oTable.getItems()[i].getCells()[6].setEnabled(false);
				}
				sap.ui.core.Fragment.byId("RenewRequest", "markets").setEnabled(false);
			} else {
				oTable.getHeaderToolbar().getContent()[1].setEnabled(true);
				for (i = 0; i < oTable.getItems().length; i++) {
					oTable.getItems()[i].getCells()[6].setEnabled(true);
				}
				sap.ui.core.Fragment.byId("RenewRequest", "markets").setEnabled(true);
			}

			if (userAction === "REN") {
				// For Renew Action - Open up below fields for Edits
				sap.ui.core.Fragment.byId("RenewRequest", "devPhase").setEditable(true);
				sap.ui.core.Fragment.byId("RenewRequest", "reachedPOC").setEnabled(true);
				sap.ui.core.Fragment.byId("RenewRequest", "firstInClass").setEnabled(true);
				sap.ui.core.Fragment.byId("RenewRequest", "refReqE").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "refReqE").setEnabled(false);
				sap.ui.core.Fragment.byId("RenewRequest", "refReqE").setText(createRequestModel.getData().RefReqNo);
			}
			if (createRequestModel.getData().DevPhase !== "CM") {
				sap.ui.core.Fragment.byId("RenewRequest", "devPhase").setEditable(true);
				sap.ui.core.Fragment.byId("RenewRequest", "prodSource").setVisible(false);
				sap.ui.core.Fragment.byId("RenewRequest", "prodType").setEditable(true);
				sap.ui.core.Fragment.byId("RenewRequest", "reachedPOC").setVisible(false);
				sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setEditable(true);
				sap.ui.core.Fragment.byId("RenewRequest", "destination").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "destination").setEditable(true);
				sap.ui.core.Fragment.byId("RenewRequest", "reqGrp").setEditable(true);
				if(sap.ui.core.Fragment.byId("RenewRequest", "prodType").getSelectedKey() === "FGD"){
					sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setVisible(true);
				} else {
					sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setVisible(false);
				}				
			} else {
				sap.ui.core.Fragment.byId("RenewRequest", "devPhase").setEditable(false);
				sap.ui.core.Fragment.byId("RenewRequest", "prodSource").setVisible(false);
				sap.ui.core.Fragment.byId("RenewRequest", "prodType").setEditable(false);
				sap.ui.core.Fragment.byId("RenewRequest", "reachedPOC").setVisible(false);
				sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setEditable(false);
				sap.ui.core.Fragment.byId("RenewRequest", "destination").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "destination").setEditable(false);
				sap.ui.core.Fragment.byId("RenewRequest", "reqGrp").setEditable(false);
				if(sap.ui.core.Fragment.byId("RenewRequest", "prodType").getSelectedKey() === "FGD"){
					sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setVisible(true);
				} else {
					sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setVisible(false);
				}				
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
				sap.ui.core.Fragment.byId("RenewRequest", "priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				sap.ui.core.Fragment.byId("RenewRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				createRequestModel.getData().PriIndHier = priIndHierValue;
				sap.ui.core.Fragment.byId("RenewRequest", "priIndHier").setText(priIndHierValue);
				this._valueHelpDialog.close();
			}
		},

		onFragClose: function () {
			var priIndHierValue;
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue()) {
				createRequestModel.getData().PriInd = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getSelectedKey();
				this.getView().setModel(createRequestModel, "createRequestModel");
				sap.ui.core.Fragment.byId("RenewRequest", "priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				sap.ui.core.Fragment.byId("RenewRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				createRequestModel.getData().PriIndHier = priIndHierValue;
				sap.ui.core.Fragment.byId("RenewRequest", "priIndHier").setText(priIndHierValue);
				this._valueHelpDialog.close();
				return;
			}
			if (sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue()) {
				createRequestModel.getData().PriInd = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getSelectedKey();
				this.getView().setModel(createRequestModel, "createRequestModel");
				sap.ui.core.Fragment.byId("RenewRequest", "priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				sap.ui.core.Fragment.byId("RenewRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				createRequestModel.getData().PriIndHier = priIndHierValue;
				sap.ui.core.Fragment.byId("RenewRequest", "priIndHier").setText(priIndHierValue);
				this._valueHelpDialog.close();
				return;
			}
			if (sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue()) {
				createRequestModel.getData().PriInd = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getSelectedKey();
				this.getView().setModel(createRequestModel, "createRequestModel");
				sap.ui.core.Fragment.byId("RenewRequest", "priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue());
				sap.ui.core.Fragment.byId("RenewRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				createRequestModel.getData().PriIndHier = priIndHierValue;
				sap.ui.core.Fragment.byId("RenewRequest", "priIndHier").setText(priIndHierValue);
				this._valueHelpDialog.close();
				return;
			}
			this._valueHelpDialog.close();
		},

		onIconTabSelect: function (oEvent) {
			if (oEvent.getSource().getSelectedKey().indexOf("firstInClassSection") >= 0) {
				var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
				if (this._CurrentFragName === "RenewRequest") {
					sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
				}
				if (this._CurrentFragName === "DispRenewReq") {
					sap.ui.core.Fragment.byId("DispRenewReq", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
				}
			}
		},

		onFICUoMChange: function (oEvent) {
			var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
			ficPricGrpModel.UOM1 = oEvent.getParameter("value");
			this.getView().setModel(ficPricGrpModel, "ficPricGrpModel");
			if (ficPricGrpModel.UOM1) {
				sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").setValueState(sap.ui.core.ValueState.None);
			}
		},

		onDeleteFICGrp: function (oEvent) {
			oReqCtrlExtn.onDeleteFICGrp(oEvent);
		},

		onMarketSelect: function (oEvent) {
			/*eslint-disable sap-ui5-no-private-prop */
			sap.ui.core.Fragment.byId("RenewRequest", "markets")._sOldValue = "";
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
			sap.ui.core.Fragment.byId("RenewRequest", "selectedMrkts").setValue(oMarkets);
			sap.ui.core.Fragment.byId("RenewRequest", "markets").setValueState(sap.ui.core.ValueState.None);
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
				sap.ui.core.Fragment.byId("RenewRequest", "phseChngDt").setValue(phseChngDt);
			}
		},

		onEditReq: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			var oSelectedTabKey = sap.ui.core.Fragment.byId("DispRenewReq", "iTabBarDispReq").getSelectedKey();
			oSelectedTabKey = oSelectedTabKey.replace("Display", "Renew");
			this._showFormFragment("RenewRequest");
			this._CurrentFragName = "RenewRequest";
			this.prepareCreateRequest();
			sap.ui.core.Fragment.byId("RenewRequest", "iTabBarCreaReq").setSelectedKey(oSelectedTabKey);
			this.getView().byId("deleteReq").setVisible(true);
			this.getView().byId("cancelReq").setVisible(true);
			this.getView().byId("editReq").setVisible(false);
			if (createRequestModel.getData().HStat === "SB") {
				this.getView().byId("saveReq").setVisible(false);
			} else {
				this.getView().byId("saveReq").setVisible(true);
			}
			this.getView().byId("submitReq").setVisible(true);
			if (!createRequestModel.getData().ReqNo) {
				this.getView().byId("submitReq").setEnabled(false);
			} else {
				this.getView().byId("submitReq").setEnabled(true);
			}
			var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
			sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
			if (userAction === "REN" && createRequestModel.getData().DevPhase !== "CM") {
				// For Renew Action - Open up below fields for Edits
				sap.ui.core.Fragment.byId("RenewRequest", "devPhase").setEditable(true);
				sap.ui.core.Fragment.byId("RenewRequest", "reachedPOC").setEnabled(true);
				sap.ui.core.Fragment.byId("RenewRequest", "firstInClass").setEnabled(true);
			}
		},

		onCancelReq: function () {
			this.resetErrorState();
			var oSelectedTabKey = sap.ui.core.Fragment.byId("RenewRequest", "iTabBarCreaReq").getSelectedKey();
			oSelectedTabKey = oSelectedTabKey.replace("Renew", "Display");
			this._showFormFragment("DispRenewReq");
			this._CurrentFragName = "DispRenewReq";
			this.prepareDisplayRequest();
			sap.ui.core.Fragment.byId("DispRenewReq", "iTabBarDispReq").setSelectedKey(oSelectedTabKey);
			this.getView().byId("deleteReq").setVisible(true);
			this.getView().byId("cancelReq").setVisible(false);
			this.getView().byId("editReq").setVisible(true);
			this.getView().byId("saveReq").setVisible(false);
			this.getView().byId("submitReq").setVisible(false);
			var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
			sap.ui.core.Fragment.byId("DispRenewReq", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
			if (userAction === "REN") {
				sap.ui.core.Fragment.byId("RenewRequest", "devPhase").setEditable(false);
				sap.ui.core.Fragment.byId("RenewRequest", "reachedPOC").setEnabled(false);
				sap.ui.core.Fragment.byId("RenewRequest", "firstInClass").setEnabled(false);
			}
		},

		onSubmitReq: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (!createRequestModel.getData().ReqNo) {
				createRequestModel.getData().ReqNo = "0000000000";
			}
			createRequestModel.getData().Action = "SUBMIT";
			var error = oReqCtrlExtn.validateFields(aAttachments);
			if (error === " ") {
				if (sap.ui.core.Fragment.byId("RenewRequest", "shipDetailsSection").getVisible()) {
					oReqCtrlExtn.oUpdateStrnKeysBeforeSave();
				}
				if (sap.ui.core.Fragment.byId("RenewRequest", "firstInClassSection").getVisible()) {
					oReqCtrlExtn.oUpdateFICGrpPriceBeforeSave();
				}
				this.saveRequest(createRequestModel);
			}
		},

		onSaveReq: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (!createRequestModel.getData().ReqNo) {
				createRequestModel.getData().ReqNo = "0000000000";
				if (userAction === "REN" || userAction === "REN-DR") {
					createRequestModel.getData().Action = "RENEW";
				}
			} else {
				createRequestModel.getData().Action = "SAVE";
			}
			if (sap.ui.core.Fragment.byId("RenewRequest", "shipDetailsSection").getVisible()) {
				oReqCtrlExtn.oUpdateStrnKeysBeforeSave();
			}
			if (sap.ui.core.Fragment.byId("RenewRequest", "firstInClassSection").getVisible()) {
				oReqCtrlExtn.oUpdateFICGrpPriceBeforeSave();
			}
			this.saveRequest(createRequestModel);
		},

		saveRequest: function (createRequestModel) {
			var createPayload = createRequestModel.getData();
			if (sap.ui.core.Fragment.byId("RenewRequest", "shipDetailsSection").getVisible()) {
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
			if (sap.ui.core.Fragment.byId("RenewRequest", "firstInClassSection").getVisible()) {
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
					if (aAttachments.length > 0) {
						that.attmntSaved = "X";
						aAttachments = [];
						createPayload.ReqAttachmentSet = aAttachments;
					}
					createRequestModel.setData(createPayload);
					that.getView().setModel(createRequestModel, "createRequestModel");
					sap.ui.core.Fragment.byId("RenewRequest", "prodType").setSelectedKey(createRequestModel.getData().ProdTyp);
					sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setValue(createRequestModel.getData().APIValue);
					sap.ui.core.Fragment.byId("RenewRequest", "reqNo").setText(oData.ReqNo);
					if (sap.ui.core.Fragment.byId("RenewRequest", "shipDetailsSection").getVisible()) {
						oReqCtrlExtn.oUpdateStrnKeysAfterSave();
					}
					if (sap.ui.core.Fragment.byId("RenewRequest", "firstInClassSection").getVisible()) {
						oReqCtrlExtn.oUpdateFICGrpPriceAfterSave();
					}
					that.getView().byId("deleteReq").setVisible(true);
					that.getView().byId("cancelReq").setVisible(true);
					that.getView().byId("editReq").setVisible(false);
					that.getView().byId("submitReq").setVisible(true);
					that.getView().byId("saveReq").setVisible(true);
					
					//Modify current hash after request save
					var newHash = "RenewRequest/";
					newHash = newHash.concat(oData.ReqNo, "/REN-DR");
					that.oRouter.oHashChanger.replaceHash(newHash);					
					
					var msg = "Contego Request ";
					if (createPayload.Action === "SAVE") {
						if (oData.RetMsgType === "E") {
							msg = oData.RetMsg;
						} else {
							msg = msg.concat(oData.ReqNo, " has been Saved.");
						}
						MessageToast.show(msg, {
							duration: 4000,
							width: "25em",
							at: "center",
							onClose: function () {
								if (userAction === "CRE") {
									userAction = "REN-DR";
								}
							}
						});
					}
					if (createPayload.Action === "RENEW") {
						if (oData.RetMsgType === "E") {
							msg = oData.RetMsg;
						} else {
							msg = msg.concat(oData.ReqNo, " has been Saved.");
						}
						MessageToast.show(msg, {
							duration: 4000,
							width: "25em",
							at: "center",
							onClose: function () {
								if (userAction === "REN") {
									userAction = "REN-DR";
									sap.ui.core.Fragment.byId("RenewRequest", "refReqE").setEnabled(true);
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
								if (userAction === "CRE") {
									userAction = "REN-DR";
								}
								if (userAction === "REN") {
									userAction = "REN-DR";
									sap.ui.core.Fragment.byId("RenewRequest", "refReqE").setEnabled(true);
								}
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
			if (this._CurrentFragName === "RenewRequest") {
				sap.ui.core.Fragment.byId("RenewRequest", "prodDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "shipDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "purchDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "firstInClassSection").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "notessuggestSection").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "refReqE").setVisible(false);
				sap.ui.core.Fragment.byId("RenewRequest", "iTabBarCreaReq").setSelectedKey(null);
				sap.ui.core.Fragment.byId("RenewRequest", "devPhase").setValue(null);
				sap.ui.core.Fragment.byId("RenewRequest", "reqGrp").setValue(null);
				sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setValue(null);
				sap.ui.core.Fragment.byId("RenewRequest", "priInd").setValue(null);
				sap.ui.core.Fragment.byId("RenewRequest", "actionMech").setValue(null);
				sap.ui.core.Fragment.byId("RenewRequest", "selectedMrkts").setValue("");
				sap.ui.core.Fragment.byId("RenewRequest", "markets").setSelectedKeys(null);
				sap.ui.core.Fragment.byId("RenewRequest", "uomValue").setValue(null);
				sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").setValue(null);
				sap.ui.core.Fragment.byId("RenewRequest", "prodType").setEditable(false);
				sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setVisible(false);
				sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setEditable(false);
				sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setSelectedKey(null);
				sap.ui.core.Fragment.byId("RenewRequest", "destination").setVisible(false); // Show Destination
				sap.ui.core.Fragment.byId("RenewRequest", "destination").setEditable(false);
				sap.ui.core.Fragment.byId("RenewRequest", "destination").setSelectedKey(null);
				sap.ui.core.Fragment.byId("RenewRequest", "prodSource").setVisible(true);
				sap.ui.core.Fragment.byId("RenewRequest", "fileUploader").setValue("");
				this.resetErrorState();
			}
			this.attmntSaved = "";
			this.initializeModels();
		},

		resetErrorState: function () {
			sap.ui.core.Fragment.byId("RenewRequest", "prodType").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("RenewRequest", "reqGrp").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("RenewRequest", "devPhase").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("RenewRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("RenewRequest", "dDose").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("RenewRequest", "actionMech").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("RenewRequest", "markets").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("RenewRequest", "purchCost").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("RenewRequest", "purchQty").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("RenewRequest", "uomValue").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("RenewRequest", "reqsterNotes").setValueState(sap.ui.core.ValueState.None);
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

		onRefReqNoClick: function (oEvent) {
			var createRequestModel = this.getView().getModel("createRequestModel");
			var reqNo = createRequestModel.getData().RefReqNo;
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/ReqHeadExtnSet(ReqNo='" + reqNo + "')", {
				success: function (oData) {
					if (oData.PriceModel === "CM") {
						that.oRouter.navTo("ValuationComp", {
							reqId: oData.ReqNo,
							priceModel: "Comparator",
							action: "DIS"
						});
					}
					if (oData.PriceModel === "AC") {
						that.oRouter.navTo("ValuationActual", {
							reqId: oData.ReqNo,
							priceModel: "Actual",
							action: "DIS"
						});
					}
					if (oData.PriceModel === "CP") {
						that.oRouter.navTo("ValuationCostPlus", {
							reqId: oData.ReqNo,
							priceModel: "Cost Plus",
							action: "DIS"
						});
					}
					if (oData.PriceModel === "FC") {
						that.oRouter.navTo("ValuationFirstInClass", {
							reqId: oData.ReqNo,
							priceModel: "First In Class",
							action: "DIS"
						});
					}
					if (oData.PriceModel === "DS") {
						that.oRouter.navTo("ValuationDiscovery", {
							reqId: oData.ReqNo,
							priceModel: "Discovery",
							action: "DIS"
						});
					}
				},
				error: function () {}
			});
		},

		onSelectUploadFile: function (oEvent) {
			this.attmntSaved = "";
			var fileAttachmentModel = this.getView().getModel("fileAttachmentModel");
			var aAttchmntTab = this.getView().getModel("fileAttachmentModel").getData().attachments;
			var createRequestModel = this.getView().getModel("createRequestModel");
			var oFileUploader = sap.ui.core.Fragment.byId("RenewRequest", "fileUploader");
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
				var oTable = sap.ui.core.Fragment.byId("RenewRequest", "attachmentTab");
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
			var oTable = sap.ui.core.Fragment.byId("RenewRequest", "attachmentTab");
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
			sap.ui.core.Fragment.byId("RenewRequest", "fileUploader").setValue("");
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
				if (userAction === "REN" || userAction === "REN-DR") {
					if (this.getTileRole() === "REQSTR") {
						this.setRaisedEvent(null);
						this.setTileRole("REQSTR");
						this.oRouter.navTo("WorkListRequestor", {
							userId: this.getUserId(),
							statTab: "DR"
						});
					}
					if (this.getTileRole() === "PRDSRC") {
						this.setRaisedEvent("NAVBACK");
						this.setTileRole("PRDSRC");
						this.oRouter.navTo("ProductSearch", {
							userId: this.getUserId()
						});
					}
					if (this.getTileRole() === "SRCHREPT") {
						window.history.go(-1);
					}
				}
				if (userAction === "DIS") {
					if (this.getTileRole() === "REQSTR") {
						this.setTileRole("REQSTR");
						this.oRouter.navTo("WorkListRequestor", {
							userId: this.getUserId(),
							statTab: "DR"
						});
					}
					if (this.getTileRole() === "VFCMGR") {
						this.setTileRole("VFCMGR");
						this.oRouter.navTo("WorkListVFCMgr", {
							userId: this.getUserId()
						});
					}
					if (this.getTileRole() === "SPINPT") {
						this.setTileRole("SPINPT");
						this.oRouter.navTo("WorkListSPInput", {
							userId: this.getUserId()
						});
					}
					if (this.getTileRole() === "APPRVR") {
						this.setTileRole("APPRVR");
						this.oRouter.navTo("WorkListApprover", {
							userId: this.getUserId()
						});
					}
					if (this.getTileRole() === "PRDSRC") {
						this.setTileRole("PRDSRC");
						this.oRouter.navTo("ProductSearch", {
							userId: this.getUserId()
						});
					}
					if (this.getTileRole() === "SRCHREPT") {
						window.history.go(-1);
					}
				}
			} else {
				this.oRouter.navTo("MainView", true);
			}
		},

		onHome: function () {
			this.refreshViewModel();
			this.onReturnToHome();
		}
	});
});