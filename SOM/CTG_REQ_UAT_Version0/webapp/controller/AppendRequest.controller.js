sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"sap/ui/core/routing/History",
	"com/pfizer/ctg/CTG_REQ/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/UploadCollectionParameter"
], function (Controller, History, Formatter, MessageToast, MessageBox, UploadCollectionParameter) {
	"use strict";

	// Action Legend
	// DIS	- Display	CRE	- Create    UPD	- Update
	// DEL	- Delete	CAN	- Cancel	SAV	- Save
	// SUB	- Submit	APD	- Append	EXT	- Extend

	var userAction;
	this.odataupdatecall = "";
	var aAttachments = [];

	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.AppendRequest", {

		formatter: Formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._onObjectMatched, this);
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

		_onObjectMatched: function (oEvent) {
			if (oEvent.getParameters().name !== "AppendRequest") {
				return;
			}
			this.odataupdatecall = undefined;
			aAttachments = [];
			this.attmntSaved = "";
			userAction = oEvent.getParameters("AppendRequest").arguments.action;
			var createRequestModel = this.getView().getModel("createRequestModel");
			createRequestModel.setData(null);
			var strengthsModel = this.getView().getModel("strengthsModel");
			strengthsModel.setProperty("/strengths", null);
			var marketsModel = this.getView().getModel("marketsModel");
			marketsModel.setProperty("/market", null);
			var fileAttachmentModel = this.getView().getModel("fileAttachmentModel");
			fileAttachmentModel.setProperty("/attachments", null);
			var reqNo = oEvent.getParameters("AppendRequest").arguments.reqId;
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			oModel.read("/ReqCreateSet(ReqNo='" + reqNo + "')", {
				urlParameters: {
					"$expand": ["StrengthsSet", "MarketsSet", "AttachmentsSet"]
				},
				success: function (oData) {
					createRequestModel.setData(oData);
					if (oData.StrengthsSet.results.length > 0) {
						var aStrenData = [];
						var i = 0;
						for (i = 0; i < oData.StrengthsSet.results.length; i++) {
							aStrenData.push(oData.StrengthsSet.results[i]);
						}
						var aStrnIdent = [];
						for (i = 0; i < aStrenData.length; i++) {
							var sData = {};
							sData = aStrenData[i];
							sData.RowId = "";
							aStrnIdent.push(sData);
						}
						strengthsModel.setProperty("/strengths", aStrnIdent);
						that.getView().setModel(strengthsModel, "strengthsModel");
						that.oUpdateStrnKeysAfterSave();
					}
					if (oData.MarketsSet.results.length > 0) {
						marketsModel.setProperty("/market", oData.MarketsSet.results);
						that.getView().setModel(marketsModel, "marketsModel");
					}
					if (oData.AttachmentsSet.results) {
						fileAttachmentModel.setProperty("/attachments", oData.AttachmentsSet.results);
						that.getView().setModel(fileAttachmentModel, "fileAttachmentModel");
					}
					delete createRequestModel.getData().FICPricingSet;
					delete createRequestModel.getData().AttachmentsSet;
					createRequestModel.setProperty("/ProdName", createRequestModel.getData().ProdName);
					var prodTitle = "Product: " + createRequestModel.getData().ProdName + "";
					createRequestModel.setProperty("/ProdTitle", prodTitle);
					createRequestModel.setProperty("/ProdTyp", createRequestModel.getData().ProdTyp);
					createRequestModel.setProperty("/ProdNames", createRequestModel.getData().OtherNames);

					that.getView().byId("prodType").setSelectedKey(createRequestModel.getData().ProdTyp);
					that.getView().byId("reqGrp").setSelectedKey(createRequestModel.getData().ReqGrp);
					that.getView().byId("devPhase").setSelectedKey(createRequestModel.getData().DevPhase);
					if (createRequestModel.getData().ProdSrc === "P") {
						that.getView().byId("prodSource").getButtons()[0].setSelected(true);
						that.getView().byId("prodSource").getButtons()[1].setSelected(false);
					} else {
						that.getView().byId("prodSource").getButtons()[0].setSelected(false);
						that.getView().byId("prodSource").getButtons()[1].setSelected(true);
					}
					if (!createRequestModel.getData().Biologic) {
						that.getView().byId("biologic").setState(false);
					} else {
						that.getView().byId("biologic").setState(true);
					}
					if (!createRequestModel.getData().Biosimilar) {
						that.getView().byId("biosim").setState(false);
					} else {
						that.getView().byId("biosim").setState(true);
					}
					if (!createRequestModel.getData().POCInd) {
						that.getView().byId("reachedPOC").setState(false);
					} else {
						that.getView().byId("reachedPOC").setState(true);
					}
					if (that.getView().byId("shipDetailsSection").getVisible()) {
						that.presetMarkets();
						//New code by DOGIPA to give space after comma for Renew Requests
						var marketssplit = createRequestModel.getData().Markets;
						marketssplit = marketssplit.split(",");
						var marketSplitSpace = marketssplit.join(", ");
						//	that.getView().byId("selectedMrkts").setValue(createRequestModel.getData().Markets);
						that.getView().byId("selectedMrkts").setValue(marketSplitSpace);
					}
				},
				error: function () {}
			});
			if (oEvent.getParameters("AppendRequest").arguments.action === "DIS") {
				this.getView().byId("editReq").setVisible(false);
			} else {
				this.getView().byId("editReq").setVisible(true);
			}
			this.getView().byId("cancelReq").setVisible(false);
			this.getView().byId("submitReq").setVisible(false);
			this.getView().byId("fileUploader").setEnabled(false);
			this.getView().byId("bDelAttmnt").setEnabled(false);
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
				SUoM3: "",
				RowId: "N"
			});
			strengthsModel.refresh();
			this.getView().setModel(strengthsModel, "strengthsModel");
			var oTable = this.getView().byId("qtyStrnTab");
			oTable.getHeaderToolbar().getContent()[1].setVisible(true);
			var i = 0;
			for (i = 0; i < oTable.getItems().length; i++) {
				if (oTable.getItems()[i].getCells()[7].getValue() === "N") {
					oTable.getItems()[i].getCells()[0].setEditable(true);
					oTable.getItems()[i].getCells()[1].setEditable(true);
					oTable.getItems()[i].getCells()[2].setEditable(true);
					oTable.getItems()[i].getCells()[3].setEditable(true);
					oTable.getItems()[i].getCells()[4].setEditable(true);
					oTable.getItems()[i].getCells()[5].setEditable(true);
					oTable.getItems()[i].getCells()[6].setVisible(true);
				}
			}
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
			var oError;
			var strengthsModel = this.getView().getModel("strengthsModel");
			var i = 0;
			if (strengthsModel.getData().strengths !== null) {
				var rowAdded;
				for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
					if (strengthsModel.getData().strengths[i].RowId === "N") {
						rowAdded = "X";
						if (strengthsModel.getData().strengths[i].Strn1 === "") {
							this.getView().byId("qtyStrnTab").getItems()[i].focus();
							this.getView().byId("qtyStrnTab").getItems()[i].getCells()[0].setValueState(sap.ui.core.ValueState.Error);
							oError = "X";
							break;
						}
						if (strengthsModel.getData().strengths[i].SUoM1 === "") {
							this.getView().byId("qtyStrnTab").getItems()[i].focus();
							this.getView().byId("qtyStrnTab").getItems()[i].getCells()[1].setValueState(sap.ui.core.ValueState.Error);
							oError = "X";
							break;
						}
					}
				}
				if (rowAdded === "X" && oError === "X") {
					MessageBox.error("Please fill new formulation Values and Units.");
					oError = "X";
				}
				if (!this.newMarkets && !rowAdded) {
					MessageBox.error("Please add new Markets and/or Formulations.");
					oError = "X";
				}
			}
			if (!oError) {
				oError = " ";
			}
			return oError;
		},

		onDropDownValueChange: function (oEvent) {
			var i = 0;
			var strengthsModel = this.getView().getModel("strengthsModel");
			if (oEvent.getParameters().id.indexOf("strn1") >= 1) {
				i = 0;
				for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
					if (strengthsModel.getData().strengths[i].Strn1 !== "") {
						this.getView().byId("qtyStrnTab").getItems()[i].getCells()[0].setValueState(sap.ui.core.ValueState.None);
					}
				}
			}
			if (oEvent.getParameters().id.indexOf("sUoM1") >= 1) {
				i = 0;
				for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
					if (strengthsModel.getData().strengths[i].SUoM1 !== "") {
						this.getView().byId("qtyStrnTab").getItems()[i].getCells()[1].setValueState(sap.ui.core.ValueState.None);
					}
				}
			}
		},

		onMarketSelect: function (oEvent) {
			/*eslint-disable sap-ui5-no-private-prop */
			sap.ui.core.Fragment.byId("AppendRequest", "markets")._sOldValue = "";
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
			this.getView().byId("selectedMrkts").setValue(oMarkets);
			this.newMarkets = oMarkets;
			if (oMarkets) {
				oMarkets = this.oldMarkets.concat(", ", oMarkets);
				this.getView().byId("selectedMrkts").setValue(oMarkets);
			} else {
				this.getView().byId("selectedMrkts").setValue(this.oldMarkets);
			}
			this.getView().byId("markets").setValueState(sap.ui.core.ValueState.None);
		},

		onEditReq: function () {
			var oSelectedTabKey = this.getView().byId("iTabBarDispReq").getSelectedKey();
			oSelectedTabKey = oSelectedTabKey.replace("Display", "Append");
			this.getView().byId("iTabBarDispReq").setSelectedKey(oSelectedTabKey);
			this.getView().byId("cancelReq").setVisible(true);
			this.getView().byId("editReq").setVisible(false);
			this.getView().byId("submitReq").setVisible(true);
			this.getView().byId("reqsterNotes").setEditable(true);
			this.getView().byId("fileUploader").setEnabled(true);
			this.getView().byId("bDelAttmnt").setEnabled(true);
			this.getView().byId("markets").setEditable(true);
			var oTable = this.getView().byId("qtyStrnTab");
			oTable.getHeaderToolbar().getContent()[1].setEnabled(true);
			var i = 0;
			for (i = 0; i < oTable.getItems().length; i++) {
				if (oTable.getItems()[i].getCells()[7].getValue() === "N") {
					oTable.getItems()[i].getCells()[0].setEditable(true);
					oTable.getItems()[i].getCells()[1].setEditable(true);
					oTable.getItems()[i].getCells()[2].setEditable(true);
					oTable.getItems()[i].getCells()[3].setEditable(true);
					oTable.getItems()[i].getCells()[4].setEditable(true);
					oTable.getItems()[i].getCells()[5].setEditable(true);
					oTable.getItems()[i].getCells()[6].setEnabled(true);
				}
			}
		},

		onCancelReq: function () {
			this.resetErrorState();
			var oSelectedTabKey = this.getView().byId("iTabBarDispReq").getSelectedKey();
			oSelectedTabKey = oSelectedTabKey.replace("Append", "Display");
			this.getView().byId("iTabBarDispReq").setSelectedKey(oSelectedTabKey);
			this.getView().byId("cancelReq").setVisible(false);
			this.getView().byId("editReq").setVisible(true);
			this.getView().byId("submitReq").setVisible(false);
			this.getView().byId("reqsterNotes").setEditable(false);
			this.getView().byId("fileUploader").setEnabled(false);
			this.getView().byId("bDelAttmnt").setEnabled(false);
			this.getView().byId("markets").setEditable(false);
			var oTable = this.getView().byId("qtyStrnTab");
			oTable.getHeaderToolbar().getContent()[1].setEnabled(false);
			var i = 0;
			for (i = 0; i < oTable.getItems().length; i++) {
				if (oTable.getItems()[i].getCells()[7].getValue() === "N") {
					oTable.getItems()[i].getCells()[0].setEditable(false);
					oTable.getItems()[i].getCells()[1].setEditable(false);
					oTable.getItems()[i].getCells()[2].setEditable(false);
					oTable.getItems()[i].getCells()[3].setEditable(false);
					oTable.getItems()[i].getCells()[4].setEditable(false);
					oTable.getItems()[i].getCells()[5].setEditable(false);
					oTable.getItems()[i].getCells()[6].setEnabled(false);
				}
			}
		},

		onSubmitReq: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			if (!createRequestModel.getData().ReqNo) {
				createRequestModel.getData().ReqNo = "0000000000";
			}
			createRequestModel.getData().Action = "SUBMIT";
			var error = " ";
			if (createRequestModel.getData().HStat === "AC") {
				error = this.validateFields();
			}
			if (error === " ") {
				if (this.getView().byId("shipDetailsSection").getVisible()) {
					this.oUpdateStrnKeysBeforeSave();
				}
				this._submitRequest(createRequestModel);
			}
		},

		_submitRequest: function (createRequestModel) {
			var createPayload = createRequestModel.getData();
			if (this.getView().byId("shipDetailsSection").getVisible()) {
				var strengthsModel = this.getView().getModel("strengthsModel");
				var aStrengths = strengthsModel.getData().strengths.concat(); //New Array Ref
				createPayload.StrengthsSet = aStrengths;
				var marketsModel = this.getView().getModel("marketsModel");
				createPayload.MarketsSet = marketsModel.getData().market;
				var i = 0;
				for (i = createPayload.StrengthsSet.length - 1; i >= 0; i--) {
					delete createPayload.StrengthsSet[i].RowId;
				}
			} else {
				delete createPayload.StrengthsSet;
				delete createPayload.MarketsSet;
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
			this.getView().byId("submitReq").setEnabled(false);
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			oModel.create("/ReqCreateSet", createPayload, {
				method: "POST",
				success: function (oData) {
					that.getView().byId("submitReq").setEnabled(true);
					that.odataupdatecall = "X";
					createPayload.ReqNo = oData.ReqNo;
					createPayload.ProdTitle = that._ProdTitle;
					createPayload.ProdNames = that._ProdNames;
					createPayload.ProdStat = that._ProdStat;
					createPayload.StrengthsSet = strengthsModel.getData().strengths;
					createPayload.Markets = that._Markets;
					createPayload.ProdTyp = oData.ProdTyp;
					if (aAttachments.length > 0) {
						that.attmntSaved = "X";
						aAttachments = [];
						createPayload.ReqAttachmentSet = aAttachments;
					}
					createRequestModel.setData(createPayload);
					that.getView().setModel(createRequestModel, "createRequestModel");
					that.getView().byId("prodType").setSelectedKey(createRequestModel.getData().ProdTyp);
					that.getView().byId("reqNo").setText(oData.ReqNo);
					if (that.getView().byId("shipDetailsSection").getVisible()) {
						that.oUpdateStrnKeysAfterSave();
					}
					that.getView().byId("cancelReq").setVisible(true);
					that.getView().byId("editReq").setVisible(false);
					that.getView().byId("submitReq").setVisible(true);
					var msg = "Contego Request ";
					if (createPayload.Action === "SAVE") {
						if (oData.RetMsgType === "E") {
							msg = oData.RetMsg;
						} else {
							msg = msg.concat(oData.ReqNo, " changes have been saved.");
						}
						MessageToast.show(msg, {
							duration: 4000,
							width: "25em",
							at: "center",
							onClose: function () {
								if (userAction === "CRE") {
									userAction = "UPD-DR";
								}
								that.refreshViewModel();
								that.oRouter.navTo("WorkListRequestor", {
									userId: that.getUserId(),
									statTab: "SB"
								});
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
								if (userAction === "CRE") {
									userAction = "UPD-DR";
								}
							}
						});
					}
				},
				error: function () {}
			});
		},

		presetMarkets: function () {
			var aDestMarkets = [];
			aDestMarkets = this.getView().getModel("dropDownModel").getData().destMarkets.concat(); //New Array Ref
			var destMrktDropDnModel = new sap.ui.model.json.JSONModel();
			destMrktDropDnModel.setSizeLimit(500);
			destMrktDropDnModel.setData({
				destMarkets: aDestMarkets
			});
			this.getView().setModel(destMrktDropDnModel, "destMrktDropDnModel");
			var marketsModel = this.getView().getModel("marketsModel");
			if (aDestMarkets && marketsModel.getData().market !== null) {
				var oValues = [];
				var oDesc;
				var i = 0;
				for (i = 0; i < marketsModel.getData().market.length; i++) {
					if (marketsModel.getData().market[i].Land1) {
						var that = this;
						var oCtry = aDestMarkets.filter(function (arr) {
							if (arr.Value === marketsModel.getData().market[i].Land1) {
								if (marketsModel.getData().market[i].Active === "X") {
									that.getView().byId("markets").getItemByKey(marketsModel.getData().market[i].Land1).setEnabled(false);
									if (!that.oldMarkets) {
										that.oldMarkets = arr.Desc;
									} else {
										that.oldMarkets = that.oldMarkets.concat(",", arr.Desc);
									}

								} else {
									oValues.push(marketsModel.getData().market[i].Land1);
								}
								return arr;
							}
						});
						if (!oDesc) {
							oDesc = oCtry[0].Desc;
						} else {
							oDesc = oDesc.concat(",", oCtry[0].Desc);
						}
					}
				}
				if (userAction !== "DIS") {
					this.getView().byId("markets").setSelectedKeys(oValues);
				}
				var createRequestModel = this.getView().getModel("createRequestModel");
				createRequestModel.getData().Markets = oDesc;
				this.getView().setModel(createRequestModel, "createRequestModel");
			}
		},

		setStrenUoMKeys: function () {
			var aUOMValues = [];
			aUOMValues = this.getView().getModel("dropDownModel").getData().uomValues;
			if (aUOMValues) {
				var oTable = this.getView().byId("qtyStrnTab");
				var i = 0;
				for (i = 0; i < oTable.getItems().length; i++) {
					oTable.getItems()[i].getCells()[1].setSelectedKey(oTable.getItems()[i].getCells()[1].getValue());
					oTable.getItems()[i].getCells()[3].setSelectedKey(oTable.getItems()[i].getCells()[3].getValue());
					oTable.getItems()[i].getCells()[5].setSelectedKey(oTable.getItems()[i].getCells()[5].getValue());
					if (oTable.getItems()[i].getCells()[2].getValue() === "0.000000") {
						oTable.getItems()[i].getCells()[2].setValue(null);
					}
					if (oTable.getItems()[i].getCells()[4].getValue() === "0.000000") {
						oTable.getItems()[i].getCells()[4].setValue(null);
					}
				}
			}
		},

		oUpdateStrnKeysBeforeSave: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			var dropDownModel = this.getView().getModel("dropDownModel");
			var strengthsModel = this.getView().getModel("strengthsModel");
			var i = 0;
			for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
				if (!strengthsModel.getData().strengths[i].Strn2) {
					strengthsModel.getData().strengths[i].Strn2 = "0";
				}
				if (!strengthsModel.getData().strengths[i].Strn3) {
					strengthsModel.getData().strengths[i].Strn3 = "0";
				}
				strengthsModel.getData().strengths[i].ReqNo = createRequestModel.getData().ReqNo;
				var x = 0;
				for (x = 0; x < dropDownModel.getData().uomValues.length; x++) {
					if (dropDownModel.getData().uomValues[x].Desc === strengthsModel.getData().strengths[i].SUoM1) {
						strengthsModel.getData().strengths[i].SUoM1 = dropDownModel.getData().uomValues[x].Value;
					}
					if (dropDownModel.getData().uomValues[x].Desc === strengthsModel.getData().strengths[i].SUoM2) {
						strengthsModel.getData().strengths[i].SUoM2 = dropDownModel.getData().uomValues[x].Value;
					}
					if (dropDownModel.getData().uomValues[x].Desc === strengthsModel.getData().strengths[i].SUoM3) {
						strengthsModel.getData().strengths[i].SUoM3 = dropDownModel.getData().uomValues[x].Value;
					}
				}
			}
			this.getView().setModel(strengthsModel, "strengthsModel");
			var oTable = this.getView().byId("qtyStrnTab");
			var oTemplate = oTable.getBindingInfo("items").template;
			oTable.unbindAggregation("items");
			oTable.bindAggregation("items", {
				path: "strengthsModel>/strengths",
				template: oTemplate
			});
		},

		oUpdateStrnKeysAfterSave: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			var dropDownModel = this.getView().getModel("dropDownModel");
			var strengthsModel = this.getView().getModel("strengthsModel");
			var i = 0;
			for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
				if (strengthsModel.getData().strengths[i].Strn2 === "0") {
					strengthsModel.getData().strengths[i].Strn2 = "";
				}
				if (strengthsModel.getData().strengths[i].Strn3 === "0") {
					strengthsModel.getData().strengths[i].Strn3 = "";
				}
				strengthsModel.getData().strengths[i].ReqNo = createRequestModel.getData().ReqNo;
				var x = 0;
				for (x = 0; x < dropDownModel.getData().uomValues.length; x++) {
					if (dropDownModel.getData().uomValues[x].Value === strengthsModel.getData().strengths[i].SUoM1) {
						strengthsModel.getData().strengths[i].SUoM1 = dropDownModel.getData().uomValues[x].Desc;
					}
					if (dropDownModel.getData().uomValues[x].Value === strengthsModel.getData().strengths[i].SUoM2) {
						strengthsModel.getData().strengths[i].SUoM2 = dropDownModel.getData().uomValues[x].Desc;
					}
					if (dropDownModel.getData().uomValues[x].Value === strengthsModel.getData().strengths[i].SUoM3) {
						strengthsModel.getData().strengths[i].SUoM3 = dropDownModel.getData().uomValues[x].Desc;
					}
				}
			}
			this.getView().setModel(strengthsModel, "strengthsModel");
			var oTable = this.getView().byId("qtyStrnTab");
			var oTemplate = oTable.getBindingInfo("items").template;
			oTable.unbindAggregation("items");
			oTable.bindAggregation("items", {
				path: "strengthsModel>/strengths",
				template: oTemplate
			});
		},

		refreshViewModel: function () {
			this.getView().byId("shipDetailsSection").setVisible(true);
			this.getView().byId("notessuggestSection").setVisible(true);
			this.getView().byId("iTabBarDispReq").setSelectedKey(null);
			this.getView().byId("markets").setSelectedKeys(null);
			this.getView().byId("markets").setEditable(false);
			this.getView().byId("selectedMrkts").setValue("");
			this.getView().byId("fileUploader").setValue("");
			var oTable = this.getView().byId("qtyStrnTab");
			oTable.getHeaderToolbar().getContent()[1].setEnabled(false);
			this.oldMarkets = "";
			this.newMarkets = "";
			this.attmntSaved = "";
			this.resetErrorState();
			this.initializeModels();
		},

		resetErrorState: function () {
			this.getView().byId("markets").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("reqsterNotes").setValueState(sap.ui.core.ValueState.None);
		},

		onSelectUploadFile: function (oEvent) {
			this.attmntSaved = "";
			var fileAttachmentModel = this.getView().getModel("fileAttachmentModel");
			var aAttchmntTab = this.getView().getModel("fileAttachmentModel").getData().attachments;
			var createRequestModel = this.getView().getModel("createRequestModel");
			var oFileUploader = this.getView().byId("fileUploader");
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
				var oTable = that.getView().byId("attachmentTab");
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
			var oTable = this.getView().byId("attachmentTab");
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
			this.getView().byId("fileUploader").setValue("");
		},

		onFileDownload: function (oEvent) {
			var attachType = "REQSTR";
			var createRequestModel = this.getView().getModel("createRequestModel");
			var reqNo = createRequestModel.getData().ReqNo;
			this.onFileDownloadClick(oEvent, aAttachments, attachType, reqNo);
		},

		onAttachRowSelect: function (oEvent) {
			var sPath = oEvent.getSource().getSelectedContextPaths();
			var fileAttachmentModel = this.getView().getModel("fileAttachmentModel");
			var sData = fileAttachmentModel.getProperty(sPath[0]);
			if (sData.Content === "") {
				MessageBox.error("Attachements on Active Request cannot be deleted.");
				oEvent.getSource().removeSelections();
			}
		},

		onNavBack: function () {
			this.refreshViewModel();
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				if (this.odataupdatecall === undefined) {
					this.setRaisedEvent("NAVBACK");
				}
				if (this.getTileRole() === "SRCHREPT") {
					//To resolve defect 38 partially. Take user again to reporting screen.
					this.oRouter.navTo("SearchandReport", {
						userId: this.getUserId()
					});
				} else {
					window.history.go(-1);					
				}
			} else {
				this.oRouter.navTo("MainView", true);
			}
		},

		onHome: function () {
			this.onCancelReq();
			this.refreshViewModel();
			this.onReturnToHome();
		}
	});
});