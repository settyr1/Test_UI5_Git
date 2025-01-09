sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"sap/ui/core/routing/History",
	"com/pfizer/ctg/CTG_REQ/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"./UpdateReqCtrlExtn",
	"sap/m/UploadCollectionParameter"
], function (Controller, History, Formatter, MessageToast, MessageBox, UReqCtrlExtn, UploadCollectionParameter) {
	"use strict";

	var userAction;
	var oReqCtrlExtn;
	this.odataupdatecall = "";
	var aAttachments = [];
	var aFICGrpBuffer = [];

	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.UpdateRequest", {

		formatter: Formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._onObjectMatched, this);
			oReqCtrlExtn = new UReqCtrlExtn(this.getView());
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
			var oPage = this.getView().byId("UpdateReqPage");
			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},

		_onObjectMatched: function (oEvent) {
			if (oEvent.getParameters().name !== "UpdateRequest") {
				return;
			}
			this.odataupdatecall = undefined;
			aAttachments = [];
			this.attmntSaved = "";
			this.isChanged = "";
			this._showFormFragment("UpdateRequest");
			sap.ui.core.Fragment.byId("UpdateRequest", "viewTitle").setText("Update Contego Request");
			var reqNo = oEvent.getParameters("UpdateRequest").arguments.reqId;
			userAction = oEvent.getParameters("UpdateRequest").arguments.action;
			if (userAction === "UPDT" || userAction === "UPDT-DR") {
				if (this.editEvent === undefined) {
					this.getView().byId("deleteReq").setVisible(false);
					this.getView().byId("cancelReq").setVisible(false);
					this.getView().byId("editReq").setVisible(true);
					this.getView().byId("saveReq").setVisible(false);
					this.getView().byId("submitReq").setVisible(false);
				}
			} else {
				// Display only view.
				this.getView().byId("editReq").setVisible(false);
			}

			var oExpand = [];
			if (userAction === "UPDT") {
				reqNo = reqNo.concat("U");
				oExpand = ["StrengthsSet", "MarketsSet", "FICPricingSet"];
			} else {
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
					if (userAction === "UPDT") {
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
						aFICGrpBuffer = oData.FICPricingSet.results.concat(); //New Array Ref
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
					that._prepareUpdateRequest();
					if (sap.ui.core.Fragment.byId("UpdateRequest", "shipDetailsSection").getVisible()) {
						oReqCtrlExtn.presetMarkets();
						oReqCtrlExtn.setStrenUoMKeys();
						sap.ui.core.Fragment.byId("UpdateRequest", "selectedMrkts").setValue(createRequestModel.getData().Markets);
					}
				},
				error: function () {}
			});
		},

		onGetRefReq: function () {
			// Get Reference request information to check attribute changed??
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (createRequestModel.getData().RefReqNo && !this.oRefReqModel) {
				var oRefReqModel = this.getOwnerComponent().getModel();
				var that = this;
				oRefReqModel.read("/ReqCreateSet(ReqNo='" + createRequestModel.getData().RefReqNo + "')", {
					success: function (oData) {
						that.oRefReqModel = oData;
					},
					error: function () {}
				});
			}
		},

		_prepareUpdateRequest: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			sap.ui.core.Fragment.byId("UpdateRequest", "refReqE").setVisible(true);
			if (createRequestModel.getData().ReqNo === "") {
				sap.ui.core.Fragment.byId("UpdateRequest", "refReqE").setEnabled(false);
			} else {
				sap.ui.core.Fragment.byId("UpdateRequest", "refReqE").setEnabled(true);
			}
			sap.ui.core.Fragment.byId("UpdateRequest", "otherNames").setText(createRequestModel.getData().OtherNames);
			sap.ui.core.Fragment.byId("UpdateRequest", "prodType").setSelectedKey(createRequestModel.getData().ProdTyp);
			sap.ui.core.Fragment.byId("UpdateRequest", "reqGrp").setSelectedKey(createRequestModel.getData().ReqGrp);
			sap.ui.core.Fragment.byId("UpdateRequest", "devPhase").setSelectedKey(createRequestModel.getData().DevPhase);
			if (createRequestModel.getData().ProdSrc === "P") {
				sap.ui.core.Fragment.byId("UpdateRequest", "prodSource").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "prodSource").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("UpdateRequest", "prodSource").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "prodSource").getButtons()[1].setSelected(true);
			}
			if (!createRequestModel.getData().Biologic) {
				sap.ui.core.Fragment.byId("UpdateRequest", "biologic").setState(false);
			} else {
				sap.ui.core.Fragment.byId("UpdateRequest", "biologic").setState(true);
			}
			if (!createRequestModel.getData().Biosimilar) {
				sap.ui.core.Fragment.byId("UpdateRequest", "biosim").setState(false);
			} else {
				sap.ui.core.Fragment.byId("UpdateRequest", "biosim").setState(true);
			}
			if (!createRequestModel.getData().POCInd) {
				sap.ui.core.Fragment.byId("UpdateRequest", "reachedPOC").setState(false);
			} else {
				sap.ui.core.Fragment.byId("UpdateRequest", "reachedPOC").setState(true);
			}
			if (!createRequestModel.getData().FirstClass) {
				sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").setState(false);
			} else {
				sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").setState(true);
			}

			var aPrimaryInd = this.getView().getModel("dropDownModel").getData().primaryInd;
			aPrimaryInd.filter(function (arr) {
				if (arr.Value === createRequestModel.getData().PriInd) {
					sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setValue(arr.Desc);
				}
			});

			sap.ui.core.Fragment.byId("UpdateRequest", "actionMech").setSelectedKey(createRequestModel.getData().ActionMech);
			if (createRequestModel.getData().MechActTyp === "DM") {
				sap.ui.core.Fragment.byId("UpdateRequest", "MOAType").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "MOAType").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("UpdateRequest", "MOAType").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "MOAType").getButtons()[1].setSelected(true);
			}
			if (createRequestModel.getData().ProcmntTyp === "P") {
				sap.ui.core.Fragment.byId("UpdateRequest", "ProcmntTyp").getButtons()[0].setSelected(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "ProcmntTyp").getButtons()[1].setSelected(false);
			} else {
				sap.ui.core.Fragment.byId("UpdateRequest", "ProcmntTyp").getButtons()[0].setSelected(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "ProcmntTyp").getButtons()[1].setSelected(true);
			}
			if (createRequestModel.getData().ProdTyp === "FGD") {
				sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").setVisible(true);
			} else {
				sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").setVisible(false);
			}
			sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").setSelectedKey(createRequestModel.getData().FiniGoodsFrm);

			if (createRequestModel.getData().DevPhase === "CM") {
				sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").setVisible(false);
			} else {
				sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").setVisible(true);
			}

			if (createRequestModel.getData().PriceModel === "FC") {
				sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").setVisible(true);
				oReqCtrlExtn.presetFICgrpPrice();
				var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
				var aFICPriceData = [];
				aFICPriceData = ficPricGrpModel.getData().grpprice.concat();
				var i = 0;
				for (i = 0; i < aFICPriceData.length; i++) {
					var j = 0;
					var newGroup = "X";
					for (j = 0; j < aFICGrpBuffer.length; j++) {
						if (aFICGrpBuffer[j].FICGrp === aFICPriceData[i].FICGrp) {
							newGroup = " ";
							break;
						}
					}
					if (newGroup === "X") {
						var sFICData = {};
						sFICData.ReqNo = "";
						sFICData.FICGrp = aFICPriceData[i].FICGrp;
						sFICData.SellingPrice = "0";
						aFICGrpBuffer.push(sFICData);
					}
				}
				sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
			} else {
				sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").setVisible(false);
			}

			if (createRequestModel.getData().PriceModel === "DS") {
				sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setVisible(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "apiValuTxt").setVisible(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setValue(createRequestModel.getData().APIValue);
			} else {
				sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setVisible(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "apiValuTxt").setVisible(false);
			}
			if (createRequestModel.getData().DevPhase === "CM") {
				sap.ui.core.Fragment.byId("UpdateRequest", "shipDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "prodDetailsSection").setVisible(false);
				if (createRequestModel.getData().ProdSrc === "E") {
					sap.ui.core.Fragment.byId("UpdateRequest", "purchDetailsSection").setVisible(true);
				} else {
					sap.ui.core.Fragment.byId("UpdateRequest", "purchDetailsSection").setVisible(false);
				}
			} else {
				sap.ui.core.Fragment.byId("UpdateRequest", "prodDetailsSection").setVisible(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "shipDetailsSection").setVisible(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "purchDetailsSection").setVisible(false);
			}
			if (sap.ui.core.Fragment.byId("UpdateRequest", "shipDetailsSection").getVisible()) {
				oReqCtrlExtn.presetMarkets();
				sap.ui.core.Fragment.byId("UpdateRequest", "selectedMrkts").setValue(createRequestModel.getData().Markets);
			}
			sap.ui.core.Fragment.byId("UpdateRequest", "uomValue").setValue(createRequestModel.getData().QtyUOM);
			this.getView().setModel(createRequestModel, "createRequestModel");
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
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				createRequestModel.getData().PriIndHier = priIndHierValue;
				sap.ui.core.Fragment.byId("UpdateRequest", "priIndHier").setText(priIndHierValue);
				this.isChanged = "X";
				this._valueHelpDialog.close();
			}
		},

		onFragClose: function () {
			var priIndHierValue;
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue()) {
				createRequestModel.getData().PriInd = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getSelectedKey();
				this.getView().setModel(createRequestModel, "createRequestModel");
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				createRequestModel.getData().PriIndHier = priIndHierValue;
				sap.ui.core.Fragment.byId("UpdateRequest", "priIndHier").setText(priIndHierValue);
				this.isChanged = "X";
				this._valueHelpDialog.close();
				return;
			}
			if (sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue()) {
				createRequestModel.getData().PriInd = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getSelectedKey();
				this.getView().setModel(createRequestModel, "createRequestModel");
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				createRequestModel.getData().PriIndHier = priIndHierValue;
				sap.ui.core.Fragment.byId("UpdateRequest", "priIndHier").setText(priIndHierValue);
				this.isChanged = "X";
				this._valueHelpDialog.close();
				return;
			}
			if (sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue()) {
				createRequestModel.getData().PriInd = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getSelectedKey();
				this.getView().setModel(createRequestModel, "createRequestModel");
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue());
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				createRequestModel.getData().PriIndHier = priIndHierValue;
				sap.ui.core.Fragment.byId("UpdateRequest", "priIndHier").setText(priIndHierValue);
				this.isChanged = "X";
				this._valueHelpDialog.close();
				return;
			}
			this._valueHelpDialog.close();
		},

		onDropDownValueChange: function (oEvent) {
			oReqCtrlExtn.onDropDownValueChange(oEvent);
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (oEvent.getParameters().id.indexOf("devPhase") >= 1) {
				createRequestModel.getData().DevPhase = sap.ui.core.Fragment.byId("UpdateRequest", "devPhase").getSelectedKey();
				sap.ui.core.Fragment.byId("UpdateRequest", "devPhase").setValueState(sap.ui.core.ValueState.None);
				this.isChanged = "X";
				if (createRequestModel.getData().DevPhase === "PC" ||
					createRequestModel.getData().DevPhase === "P1" ||
					createRequestModel.getData().DevPhase === "P2") {
					sap.ui.core.Fragment.byId("UpdateRequest", "reachedPOC").setVisible(true);
				} else {
					sap.ui.core.Fragment.byId("UpdateRequest", "reachedPOC").setVisible(false);
				}
				if (createRequestModel.getData().DevPhase === "CM") {
					sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").setVisible(false);
				} else {
					sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").setVisible(true);
				}
				if (createRequestModel.getData().DevPhase === "CM") {
					sap.ui.core.Fragment.byId("UpdateRequest", "iTabBarDispReq").getItems()[0].setVisible(false); //Prod Details
					sap.ui.core.Fragment.byId("UpdateRequest", "iTabBarDispReq").getItems()[1].setVisible(true); //Shipment Details
					sap.ui.core.Fragment.byId("UpdateRequest", "iTabBarDispReq").getItems()[3].setVisible(false); //FIC 
					if (createRequestModel.getData().ProdSrc === "E") {
						sap.ui.core.Fragment.byId("UpdateRequest", "iTabBarDispReq").getItems()[2].setVisible(true); //Purchase
					} else {
						sap.ui.core.Fragment.byId("UpdateRequest", "iTabBarDispReq").getItems()[2].setVisible(false);
					}
					sap.ui.core.Fragment.byId("UpdateRequest", "prodType").setEditable(true);
					sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").setVisible(true);
					sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").setEditable(true);
					sap.ui.core.Fragment.byId("UpdateRequest", "destination").setVisible(true); // Show Destination
					sap.ui.core.Fragment.byId("UpdateRequest", "destination").setEditable(true);
					sap.ui.core.Fragment.byId("UpdateRequest", "prodSource").setVisible(false); //Hide Prod Source
					sap.ui.core.Fragment.byId("UpdateRequest", "markets").setEditable(true);
					sap.ui.core.Fragment.byId("UpdateRequest", "bAddRow").setVisible(true);
					var strengthsModel = this.getView().getModel("strengthsModel");
					delete strengthsModel.getData().strengths;
					strengthsModel.setData({
						strengths: [{
							Strn1: "",
							SUoM1: "",
							Strn2: "",
							SUoM2: "",
							Strn3: "",
							SUoM3: ""
						}]
					});
					this.getView().setModel(strengthsModel, "strengthsModel");
					var oTable = sap.ui.core.Fragment.byId("UpdateRequest", "qtyStrnTab");
					var oTemplate = oTable.getBindingInfo("items").template;
					oTable.unbindAggregation("items");
					oTable.bindAggregation("items", {
						path: "strengthsModel>/strengths",
						template: oTemplate
					});
				} else {
					sap.ui.core.Fragment.byId("UpdateRequest", "prodType").setEditable(false);
					sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").setVisible(false);
					sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").setEditable(false);
					sap.ui.core.Fragment.byId("UpdateRequest", "destination").setVisible(false); // Show Destination
					sap.ui.core.Fragment.byId("UpdateRequest", "destination").setEditable(false);
					sap.ui.core.Fragment.byId("UpdateRequest", "prodSource").setVisible(true);
					sap.ui.core.Fragment.byId("UpdateRequest", "iTabBarDispReq").getItems()[0].setVisible(true);
					sap.ui.core.Fragment.byId("UpdateRequest", "iTabBarDispReq").getItems()[1].setVisible(false);
					sap.ui.core.Fragment.byId("UpdateRequest", "iTabBarDispReq").getItems()[2].setVisible(false);
				}
			}
			var oFICTable;
			var q = 0;
			var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
			if (oEvent.getParameters().id.indexOf("firstInClass") >= 1) {
				if (sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").getState()) {
					createRequestModel.getData().FirstClass = "X";
					if (sap.ui.core.Fragment.byId("UpdateRequest", "reachedPOC").getState()) {
						sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").setVisible(true);
						oReqCtrlExtn.presetFICgrpPrice();
						sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
						oFICTable = sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassTab");
						for (q = 0; q < oFICTable.getItems().length; q++) {
							oFICTable.getItems()[q].getCells()[0].setEnabled(true);
							oFICTable.getItems()[q].getCells()[2].setEditable(true);
						}
						sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setEditable(true);
						sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setVisible(false);
						sap.ui.core.Fragment.byId("UpdateRequest", "apiValuTxt").setVisible(false);
					}
				} else {
					createRequestModel.getData().FirstClass = "";
					sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").setVisible(false);
					oFICTable = sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassTab");
					for (q = 0; q < oFICTable.getItems().length; q++) {
						oFICTable.getItems()[q].getCells()[0].setEnabled(false);
						oFICTable.getItems()[q].getCells()[2].setEditable(false);
					}
					sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setEditable(false);
					if (createRequestModel.getData().PriceModel === "CM" || createRequestModel.getData().PriceModel === "DS") {
						sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setVisible(true);
						sap.ui.core.Fragment.byId("UpdateRequest", "apiValuTxt").setVisible(true);
					}
				}
				this.isChanged = "X";
			}
			if (oEvent.getParameters().id.indexOf("reachedPOC") >= 1) {
				if (sap.ui.core.Fragment.byId("UpdateRequest", "reachedPOC").getState()) {
					createRequestModel.getData().POCInd = "X";
					if (sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").getState()) {
						sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").setVisible(true);
						oReqCtrlExtn.presetFICgrpPrice();
						sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
						oFICTable = sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassTab");
						for (q = 0; q < oFICTable.getItems().length; q++) {
							oFICTable.getItems()[q].getCells()[0].setEnabled(true);
							oFICTable.getItems()[q].getCells()[2].setEditable(true);
						}
						sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setEditable(true);
						sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setVisible(false);
						sap.ui.core.Fragment.byId("UpdateRequest", "apiValuTxt").setVisible(false);
					}
				} else {
					createRequestModel.getData().POCInd = "";
					sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").setVisible(false);
					oFICTable = sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassTab");
					for (q = 0; q < oFICTable.getItems().length; q++) {
						oFICTable.getItems()[q].getCells()[0].setEnabled(false);
						oFICTable.getItems()[q].getCells()[2].setEditable(false);
					}
					sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setEditable(false);
					if (createRequestModel.getData().PriceModel === "CM" || createRequestModel.getData().PriceModel === "DS") {
						sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setVisible(true);
						sap.ui.core.Fragment.byId("UpdateRequest", "apiValuTxt").setVisible(true);
					}
				}
				this.isChanged = "X";
			}
			//Price Model change logic
			if (!this.priceModelBeforeChange) {
				this.priceModelBeforeChange = sap.ui.core.Fragment.byId("UpdateRequest", "priceModDesc").getText();
			}
			if (oEvent.getParameters().id.indexOf("reachedPOC") >= 1) {
				if (sap.ui.core.Fragment.byId("UpdateRequest", "reachedPOC").getState()) {
					// Set Price Model Comparator
					sap.ui.core.Fragment.byId("UpdateRequest", "priceModDesc").setText("Comparator");
					sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setVisible(false);
					sap.ui.core.Fragment.byId("UpdateRequest", "apiValuTxt").setVisible(false);
					if (sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").getState()) {
						// Set Price Model First In Class
						sap.ui.core.Fragment.byId("UpdateRequest", "priceModDesc").setText("First In Class");
					} else {
						// Reset Price Model to Comparator
						sap.ui.core.Fragment.byId("UpdateRequest", "priceModDesc").setText("Comparator");
					}
				} else {
					// Reset Price Model to Original
					if (this.priceModelBeforeChange) {
						sap.ui.core.Fragment.byId("UpdateRequest", "priceModDesc").setText(this.priceModelBeforeChange);
						sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setVisible(true);
						sap.ui.core.Fragment.byId("UpdateRequest", "apiValuTxt").setVisible(true);
					}
				}
			}
			if (oEvent.getParameters().id.indexOf("firstInClass") >= 1) {
				if (sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").getState()) {
					if (sap.ui.core.Fragment.byId("UpdateRequest", "reachedPOC").getState()) {
						// Set Price Model First In Class
						sap.ui.core.Fragment.byId("UpdateRequest", "priceModDesc").setText("First In Class");
						sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setVisible(false);
						sap.ui.core.Fragment.byId("UpdateRequest", "apiValuTxt").setVisible(false);
					} else {
						// Reset Price Model to Original
						if (this.priceModelBeforeChange) {
							sap.ui.core.Fragment.byId("UpdateRequest", "priceModDesc").setText(this.priceModelBeforeChange);
							sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setVisible(true);
							sap.ui.core.Fragment.byId("UpdateRequest", "apiValuTxt").setVisible(true);
						}
					}
				} else {
					// Reset Price Model to Original 
					if (this.priceModelBeforeChange) {
						sap.ui.core.Fragment.byId("UpdateRequest", "priceModDesc").setText(this.priceModelBeforeChange);
						sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setVisible(true);
					}
				}
			}

			if (oEvent.getParameters().id.indexOf("priInd") >= 1) {
				createRequestModel.getData().PriInd = sap.ui.core.Fragment.byId("UpdateRequest", "priInd").getValue();
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
				this.isChanged = "X";
			}
			if (oEvent.getParameters().id.indexOf("dDose") >= 1) {
				if (createRequestModel.getData().Ddose) {
					sap.ui.core.Fragment.byId("UpdateRequest", "dDose").setValueState(sap.ui.core.ValueState.None);
					this.isChanged = "X";
				}
			}
			if (oEvent.getParameters().id.indexOf("apiValu") >= 1) {
				if (createRequestModel.getData().APIValue) {
					sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setValueState(sap.ui.core.ValueState.None);
					this.isChanged = "X";
				}
			}
			this.getView().setModel(createRequestModel, "createRequestModel");
		},

		onMarketSelect: function (oEvent) {
			/*eslint-disable sap-ui5-no-private-prop */
			sap.ui.core.Fragment.byId("UpdateRequest", "markets")._sOldValue = "";
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
			sap.ui.core.Fragment.byId("UpdateRequest", "selectedMrkts").setValue(oMarkets);
			sap.ui.core.Fragment.byId("UpdateRequest", "markets").setValueState(sap.ui.core.ValueState.None);
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

		validateFields: function () {
			var oError = oReqCtrlExtn.validateFields();
			if (oError === "X") {
				return oError;
			}
			var createRequestModel = this.getView().getModel("createRequestModel");
			// Validate if required fields are blank.
			if (!createRequestModel.getData().DevPhase) {
				sap.ui.core.Fragment.byId("UpdateRequest", "devPhase").focus();
				sap.ui.core.Fragment.byId("UpdateRequest", "devPhase").setValueState(sap.ui.core.ValueState.Error);
				MessageBox.error("Please select Dev Phase");
				return "X";
			}
			if (!createRequestModel.getData().PriInd) {
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").focus();
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setValueState(sap.ui.core.ValueState.Error);
				MessageBox.error("Please select Primary Indication");
				return "X";
			}
			if (!createRequestModel.getData().Ddose) {
				sap.ui.core.Fragment.byId("UpdateRequest", "dDose").focus();
				sap.ui.core.Fragment.byId("UpdateRequest", "dDose").setValueState(sap.ui.core.ValueState.Error);
				MessageBox.error("Please specify Daily Dose");
				return "X";
			}
			if (createRequestModel.getData().PriceModel === "DS") {
				if (!createRequestModel.getData().APIValue.match(/[1-9]/g)) {
					sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").focus();
					sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setValueState(sap.ui.core.ValueState.Error);
					MessageBox.error("Please specify API Value");
					return "X";
				}
			}
			if (createRequestModel.getData().ProdU === "2" && this.attmntSaved === "") {
				var fileCount = 0;
				if (this.getView().getModel("fileAttachmentModel").getData().attachments) {
					fileCount = this.getView().getModel("fileAttachmentModel").getData().attachments.length;
				}
				if (createRequestModel.getData().PriceModel === "DS" && createRequestModel.getData().POCInd === "") {
					if (fileCount === 0) {
						MessageBox.error("Please attach proof of changes.");
						return "X";
					}
				}
				if (createRequestModel.getData().PriceModel === "FC") {
					if (fileCount === 0) {
						MessageBox.error("Please attach proof of changes.");
						return "X";
					}
				}
				if (createRequestModel.getData().PriceModel === "CM") {
					if (fileCount === 0) {
						MessageBox.error("Please attach proof of changes.");
						return "X";
					}
				}
			}
			return " ";
		},

		onIconTabSelect: function (oEvent) {
			if (oEvent.getSource().getSelectedKey().indexOf("firstInClassSection") >= 0) {
				var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
				sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
				var oFICTable = sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassTab");
				var q = 0;
				if (this.getView().byId("editReq").getVisible()) {
					for (q = 0; q < oFICTable.getItems().length; q++) {
						oFICTable.getItems()[q].getCells()[0].setEnabled(false);
						oFICTable.getItems()[q].getCells()[2].setEditable(false);
					}
					sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setEditable(false);
				} else {
					for (q = 0; q < oFICTable.getItems().length; q++) {
						oFICTable.getItems()[q].getCells()[0].setEnabled(true);
						oFICTable.getItems()[q].getCells()[2].setEditable(true);
					}
					sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setEditable(true);
				}
			}
		},

		onFICUoMChange: function (oEvent) {
			var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
			ficPricGrpModel.UOM1 = oEvent.getParameter("value");
			this.getView().setModel(ficPricGrpModel, "ficPricGrpModel");
			this.isChanged = "X";
			if (ficPricGrpModel.UOM1) {
				sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setValueState(sap.ui.core.ValueState.None);
			}
		},

		onDeleteFICGrp: function (oEvent) {
			oReqCtrlExtn.onDeleteFICGrp(oEvent);
			this.isChanged = "X";
		},

		isFICGrpPriceChanged: function () {
			var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
			var that = this;
			var i = 0;
			for (i = 0; i < ficPricGrpModel.getData().grpprice.length; i++) {
				aFICGrpBuffer.filter(function (arr) {
					if (arr.FICGrp === ficPricGrpModel.getData().grpprice[i].FICGrp) {
						if (arr.SellingPrice !== ficPricGrpModel.getData().grpprice[i].SellingPrice) {
							that.isChanged = "X";
							return;
						}
					}
				});
			}
		},

		onPhaseDateChange: function (oEvent) {
			var currentDate = new Date();
			var selectedDate = new Date(oEvent.getParameter("value"));
			if (selectedDate < currentDate) {
				oEvent.getSource().setValue(null);
				MessageBox.error("Past Date cannot be selected");
				return;
			}
			if (selectedDate.toDateString() === "Invalid Date") {
				oEvent.getSource().setValue(null);
				return;
			}
			if (selectedDate.toString().length > 10) {
				var twoDigitMonth = ((selectedDate.getMonth() + 1) >= 10) ? (selectedDate.getMonth() + 1) : "0" + (selectedDate.getMonth() + 1);
				var twoDigitDate = ((selectedDate.getDate()) >= 10) ? (selectedDate.getDate()) : "0" + (selectedDate.getDate());
				var fullYear = selectedDate.getFullYear();
				var phseChngDt = twoDigitMonth + "/" + twoDigitDate + "/" + fullYear;
				sap.ui.core.Fragment.byId("UpdateRequest", "phseChngDt").setValue(phseChngDt);
			}
		},

		onEditReq: function () {
			this.onGetRefReq();
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (createRequestModel.getData().PriceModel === "FC") {
				sap.ui.core.Fragment.byId("UpdateRequest", "devPhase").setEditable(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setEditable(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "dDose").setEditable(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").setEnabled(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "howAdmin").setEditable(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "howOfnAdmin").setEditable(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setEditable(true);
				var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
				sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
			}
			if (createRequestModel.getData().PriceModel === "DS" || createRequestModel.getData().PriceModel === "CM") {
				sap.ui.core.Fragment.byId("UpdateRequest", "devPhase").setEditable(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").setEnabled(true);
				if (createRequestModel.getData().POCInd === "") {
					sap.ui.core.Fragment.byId("UpdateRequest", "reachedPOC").setEnabled(true);
				}
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setEditable(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "dDose").setEditable(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "howAdmin").setEditable(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "howOfnAdmin").setEditable(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setEditable(true);
			}
			if (createRequestModel.getData().DevPhase === "CM") {
				sap.ui.core.Fragment.byId("UpdateRequest", "prodType").setEditable(true);
			}
			if (sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").getVisible()) {
				sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").setEditable(true);
			}
			if (sap.ui.core.Fragment.byId("UpdateRequest", "destination").getVisible()) { // Show Destination
				sap.ui.core.Fragment.byId("UpdateRequest", "destination").setEditable(true);
			}
			sap.ui.core.Fragment.byId("UpdateRequest", "reqsterNotes").setEditable(true);
			sap.ui.core.Fragment.byId("UpdateRequest", "fileUploader").setVisible(true);
			sap.ui.core.Fragment.byId("UpdateRequest", "bDelAttmnt").setVisible(true);
			var oSelectedTabKey = sap.ui.core.Fragment.byId("UpdateRequest", "iTabBarDispReq").getSelectedKey();
			oSelectedTabKey = oSelectedTabKey.replace("Display", "Update");
			sap.ui.core.Fragment.byId("UpdateRequest", "iTabBarDispReq").setSelectedKey(oSelectedTabKey);
			sap.ui.core.Fragment.byId("UpdateRequest", "phseChngDt").setEnabled(true);
			this.getView().byId("deleteReq").setVisible(true);
			this.getView().byId("cancelReq").setVisible(true);
			this.getView().byId("editReq").setVisible(false);
			this.getView().byId("saveReq").setVisible(true);
			this.getView().byId("submitReq").setVisible(true);
			this.editEvent = "ON";
			if (!createRequestModel.getData().ReqNo) {
				this.getView().byId("submitReq").setEnabled(false);
			} else {
				this.getView().byId("submitReq").setEnabled(true);
			}
			if (sap.ui.core.Fragment.byId("UpdateRequest", "shipDetailsSection").getVisible()) {
				sap.ui.core.Fragment.byId("UpdateRequest", "markets").setEditable(true);
				sap.ui.core.Fragment.byId("UpdateRequest", "bAddRow").setVisible(true);
				var oTable = sap.ui.core.Fragment.byId("UpdateRequest", "qtyStrnTab");
				var i = 0;
				for (i = 0; i < oTable.getItems().length; i++) {
					for (var j = 0; j < oTable.getItems()[i].getCells().length; j++) {
						if (j === 6) {
							oTable.getItems()[i].getCells()[j].setEnabled(true);
						} else {
							oTable.getItems()[i].getCells()[j].setEditable(true);
						}
					}
				}
			}
			if (sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").getVisible()) {
				var oFICTable = sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassTab");
				var q = 0;
				for (q = 0; q < oFICTable.getItems().length; q++) {
					oFICTable.getItems()[q].getCells()[0].setEnabled(true);
					oFICTable.getItems()[q].getCells()[2].setEditable(true);
				}
				sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setEditable(true);
			}
		},

		onCancelReq: function () {
			this.resetErrorState();
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (createRequestModel.getData().PriceModel === "FC") {
				sap.ui.core.Fragment.byId("UpdateRequest", "devPhase").setEditable(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setEditable(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "dDose").setEditable(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "howAdmin").setEditable(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "howOfnAdmin").setEditable(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setEditable(false);
			}
			if (createRequestModel.getData().PriceModel === "DS" || createRequestModel.getData().PriceModel === "CM") {
				sap.ui.core.Fragment.byId("UpdateRequest", "devPhase").setEditable(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").setEnabled(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "reachedPOC").setEnabled(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setEditable(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "dDose").setEditable(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "howAdmin").setEditable(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "howOfnAdmin").setEditable(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setEditable(false);
			}
			if (createRequestModel.getData().DevPhase === "CM") {
				sap.ui.core.Fragment.byId("UpdateRequest", "prodType").setEditable(false);
			}
			if (sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").getVisible()) {
				sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").setEditable(false);
			}
			if (sap.ui.core.Fragment.byId("UpdateRequest", "destination").getVisible()) { // Show Destination
				sap.ui.core.Fragment.byId("UpdateRequest", "destination").setEditable(false);
			}
			sap.ui.core.Fragment.byId("UpdateRequest", "reqsterNotes").setEditable(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "fileUploader").setVisible(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "bDelAttmnt").setVisible(false);
			var oSelectedTabKey = sap.ui.core.Fragment.byId("UpdateRequest", "iTabBarDispReq").getSelectedKey();
			oSelectedTabKey = oSelectedTabKey.replace("Update", "Display");
			sap.ui.core.Fragment.byId("UpdateRequest", "iTabBarDispReq").setSelectedKey(oSelectedTabKey);
			sap.ui.core.Fragment.byId("UpdateRequest", "phseChngDt").setEnabled(false);
			this.getView().byId("deleteReq").setVisible(true);
			this.getView().byId("cancelReq").setVisible(false);
			this.getView().byId("editReq").setVisible(true);
			this.getView().byId("saveReq").setVisible(false);
			this.getView().byId("submitReq").setVisible(false);
			this.editEvent = "OFF";
			var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
			sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);

			if (sap.ui.core.Fragment.byId("UpdateRequest", "shipDetailsSection").getVisible()) {
				sap.ui.core.Fragment.byId("UpdateRequest", "markets").setEditable(false);
				sap.ui.core.Fragment.byId("UpdateRequest", "bAddRow").setVisible(false);
				var oTable = sap.ui.core.Fragment.byId("UpdateRequest", "qtyStrnTab");
				var i = 0;
				for (i = 0; i < oTable.getItems().length; i++) {
					for (var j = 0; j < oTable.getItems()[i].getCells().length; j++) {
						if (j === 6) {
							oTable.getItems()[i].getCells()[j].setEnabled(false);
						} else {
							oTable.getItems()[i].getCells()[j].setEditable(false);
						}
					}
				}
			}
			if (sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").getVisible()) {
				var oFICTable = sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassTab");
				var q = 0;
				for (q = 0; q < oFICTable.getItems().length; q++) {
					oFICTable.getItems()[q].getCells()[0].setEnabled(false);
					oFICTable.getItems()[q].getCells()[2].setEditable(false);
				}
				sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setEditable(false);
			}
		},

		onSubmitReq: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (!createRequestModel.getData().ReqNo) {
				createRequestModel.getData().ReqNo = "0000000000";
			}
			createRequestModel.getData().Action = "SUBMIT";
			if (sap.ui.core.Fragment.byId("UpdateRequest", "shipDetailsSection").getVisible()) {
				oReqCtrlExtn.oUpdateStrnKeysBeforeSave();
			}
			if (sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").getVisible()) {
				oReqCtrlExtn.oUpdateFICGrpPriceBeforeSave();
			}
			var error = this.validateFields(aAttachments);
			this.compareAttrWithRefReq();
			if (!this.isChanged) {
				//Neither Product master Type 1 fields nor Type 2 fields are changed - Display error.
				MessageBox.error("Request Updates should only be performed for Product Master changes.");
				return;
			}
			if (error === " " && this.isChanged === "X") {
				this.saveRequest(createRequestModel);
			}
		},

		compareAttrWithRefReq: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (createRequestModel.getData().DevPhase === this.oRefReqModel.DevPhase &&
				createRequestModel.getData().PriInd === this.oRefReqModel.PriInd &&
				createRequestModel.getData().Ddose === this.oRefReqModel.Ddose &&
				createRequestModel.getData().POCInd === this.oRefReqModel.POCInd &&
				createRequestModel.getData().FirstClass === this.oRefReqModel.FirstClass) {
				this.isChanged = "";
			} else {
				this.isChanged = "X";
			}
		},

		onSaveReq: function () {
			this.compareAttrWithRefReq();
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").getVisible()) {
				if (!this.isChanged) {
					this.isFICGrpPriceChanged();
					if (!createRequestModel.getData().ProdU && !this.isChanged) {
						//Neither Product master Type 1 fields nor Type 2 fields are changed - Display error.
						MessageBox.error("Request Updates should only be performed for Product Master or Group price changes.");
						return;
					}
				}
			} else {
				if (!this.isChanged) {
					if (!createRequestModel.getData().ProdU && !this.isChanged) {
						//Neither Product master Type 1 fields nor Type 2 fields are changed - Display error.
						MessageBox.error("Request Updates should only be performed for Product Master changes.");
						return;
					}
				}
			}
			if (!createRequestModel.getData().ReqNo) {
				createRequestModel.getData().ReqNo = "0000000000";
				createRequestModel.getData().Action = "UPDATE";
			} else {
				createRequestModel.getData().Action = "SAVE";
			}
			if (sap.ui.core.Fragment.byId("UpdateRequest", "shipDetailsSection").getVisible()) {
				oReqCtrlExtn.oUpdateStrnKeysBeforeSave();
			}
			if (sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").getVisible()) {
				oReqCtrlExtn.oUpdateFICGrpPriceBeforeSave();
			}
			this.saveRequest(createRequestModel);
		},

		saveRequest: function (createRequestModel) {
			var createPayload = createRequestModel.getData();
			if (sap.ui.core.Fragment.byId("UpdateRequest", "shipDetailsSection").getVisible()) {
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
			if (sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").getVisible()) {
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
					that.isChanged = "";
					createPayload.ReqNo = oData.ReqNo;
					createPayload.ProdTitle = that._ProdTitle;
					createPayload.ProdNames = that._ProdNames;
					createPayload.ProdStat = that._ProdStat;
					createPayload.Markets = that._Markets;
					createPayload.ProdTyp = oData.ProdTyp;
					//New line of code by DOGIPA for Changing ProdU for the Pop-up to be displayed
					createPayload.ProdU = oData.ProdU;
					if (aAttachments.length > 0) {
						that.attmntSaved = "X";
						aAttachments = [];
						createPayload.ReqAttachmentSet = aAttachments;
					}
					createRequestModel.setData(createPayload);
					that.getView().setModel(createRequestModel, "createRequestModel");
					sap.ui.core.Fragment.byId("UpdateRequest", "prodType").setSelectedKey(createRequestModel.getData().ProdTyp);
					sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setValue(createRequestModel.getData().APIValue);
					sap.ui.core.Fragment.byId("UpdateRequest", "reqNo").setText(oData.ReqNo);
					if (sap.ui.core.Fragment.byId("UpdateRequest", "shipDetailsSection").getVisible()) {
						oReqCtrlExtn.oUpdateStrnKeysAfterSave();
					}
					if (sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").getVisible()) {
						oReqCtrlExtn.oUpdateFICGrpPriceAfterSave();
					}
					that.getView().byId("deleteReq").setVisible(true);
					that.getView().byId("cancelReq").setVisible(true);
					that.getView().byId("editReq").setVisible(false);
					that.getView().byId("saveReq").setVisible(true);
					that.getView().byId("submitReq").setVisible(true);

					//Modify current hash after request save
					var newHash = "UpdateRequest/";
					newHash = newHash.concat(oData.ReqNo, "/UPDT-DR");
					that.oRouter.oHashChanger.replaceHash(newHash);

					var msg = "Contego Request ";
					if (createPayload.Action === "UPDATE" || createPayload.Action === "SAVE") {
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
								sap.ui.core.Fragment.byId("UpdateRequest", "refReqE").setEnabled(true);
							}
						});
					}
					if (createPayload.Action === "SUBMIT") {
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
								sap.ui.core.Fragment.byId("UpdateRequest", "refReqE").setEnabled(true);
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
			delete this.editEvent;
			delete this.oRefReqModel;
			this.getView().byId("saveReq").setEnabled(true);
			this.getView().byId("submitReq").setEnabled(true);
			sap.ui.core.Fragment.byId("UpdateRequest", "prodDetailsSection").setVisible(true);
			sap.ui.core.Fragment.byId("UpdateRequest", "shipDetailsSection").setVisible(true);
			sap.ui.core.Fragment.byId("UpdateRequest", "purchDetailsSection").setVisible(true);
			sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").setVisible(true);
			sap.ui.core.Fragment.byId("UpdateRequest", "notessuggestSection").setVisible(true);
			sap.ui.core.Fragment.byId("UpdateRequest", "iTabBarDispReq").setSelectedKey(null);
			sap.ui.core.Fragment.byId("UpdateRequest", "devPhase").setValue(null);
			sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setValue(null);
			sap.ui.core.Fragment.byId("UpdateRequest", "devPhase").setEditable(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setEditable(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "dDose").setEditable(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").setEnabled(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "reachedPOC").setEnabled(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setValue(null);
			sap.ui.core.Fragment.byId("UpdateRequest", "prodType").setEditable(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").setVisible(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").setEditable(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").setSelectedKey(null);
			sap.ui.core.Fragment.byId("UpdateRequest", "destination").setVisible(false); // Show Destination
			sap.ui.core.Fragment.byId("UpdateRequest", "destination").setEditable(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "destination").setSelectedKey(null);
			sap.ui.core.Fragment.byId("UpdateRequest", "prodSource").setVisible(true);
			sap.ui.core.Fragment.byId("UpdateRequest", "howAdmin").setEditable(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "howOfnAdmin").setEditable(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "phseChngDt").setEnabled(false);
			this.resetErrorState();
			this.attmntSaved = "";
			this.initializeModels();
		},

		resetErrorState: function () {
			sap.ui.core.Fragment.byId("UpdateRequest", "devPhase").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("UpdateRequest", "dDose").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("UpdateRequest", "apiValu").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("UpdateRequest", "reqsterNotes").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setValueState(sap.ui.core.ValueState.None);
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
			sap.ui.core.Fragment.byId("UpdateRequest", "devPhase").setEditable(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "priInd").setEditable(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "dDose").setEditable(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "firstInClass").setEnabled(false);
			sap.ui.core.Fragment.byId("UpdateRequest", "reachedPOC").setEnabled(false);
			var createRequestModel = this.getView().getModel("createRequestModel");
			var sReqHead = createRequestModel.getData();
			if (sReqHead.PriceModel === "CM") {
				this.oRouter.navTo("ValuationComp", {
					reqId: sReqHead.RefReqNo,
					priceModel: sReqHead.PricModDesc,
					action: "DIS"
				});
			}
			if (sReqHead.PriceModel === "FC") {
				this.oRouter.navTo("ValuationFirstInClass", {
					reqId: sReqHead.RefReqNo,
					priceModel: sReqHead.PricModDesc,
					action: "DIS"
				});
			}
			if (sReqHead.PriceModel === "DS") {
				this.oRouter.navTo("ValuationDiscovery", {
					reqId: sReqHead.RefReqNo,
					priceModel: sReqHead.PricModDesc,
					action: "DIS"
				});
			}
		},

		onSelectUploadFile: function (oEvent) {
			this.attmntSaved = "";
			var fileAttachmentModel = this.getView().getModel("fileAttachmentModel");
			var aAttchmntTab = this.getView().getModel("fileAttachmentModel").getData().attachments;
			var createRequestModel = this.getView().getModel("createRequestModel");
			var oFileUploader = sap.ui.core.Fragment.byId("UpdateRequest", "fileUploader");
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
				var oTable = sap.ui.core.Fragment.byId("UpdateRequest", "attachmentTab");
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
			var oTable = sap.ui.core.Fragment.byId("UpdateRequest", "attachmentTab");
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
			sap.ui.core.Fragment.byId("UpdateRequest", "fileUploader").setValue("");
		},

		onFileDownload: function (oEvent) {
			var attachType = "REQSTR";
			var createRequestModel = this.getView().getModel("createRequestModel");
			var reqNo = createRequestModel.getData().ReqNo;
			this.onFileDownloadClick(oEvent, aAttachments, attachType, reqNo);
		},

		onNavBack: function () {
			if (this.odataupdatecall) {
				this.setODataCall(this.odataupdatecall);
			}
			this.refreshViewModel();
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				if (this.getODataCall()) {
					this.setRaisedEvent(null);
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
				} else {
					this.setRaisedEvent("NAVBACK");
					window.history.go(-1);
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