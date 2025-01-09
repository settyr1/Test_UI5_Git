sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"com/pfizer/ctg/CTG_REQ/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, Formatter, MessageToast, MessageBox) {
	"use strict";

	var prodSelected;
	var prodTypeSelected;
	var purchOrdChange;
	var reqSearched;
	var selectedProd;

	// Action Legend
	// DIS	- Display	CRE	- Create    UPD	- Update
	// DEL	- Delete	CAN	- Cancel	SAV	- Save
	// SUB	- Submit	APD	- Append	EXT	- Extend

	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.ProductSearch", {

		formatter: Formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			if (oEvent.getParameters().name !== "ProductSearch") {
				return;
			}
			if (this.getRaisedEvent() === "NAVBACK") {
				this.getView().byId("bReqCreate").setVisible(false);
				this.setRaisedEvent(null);
				return;
			}
			this.suggestionItemClicked = "";
			this.getView().byId("bReqCreate").setVisible(false);
			this.getView().byId("srchProduct").setValue("");
			this.getView().byId("selectedProd").setText("");
			this.getView().byId("selectedProdNames").setText("");
			this.getView().byId("prodType").setValue("");
			//Begin of change - GODBOV01 - New issue after Defect 63 fix. 
			this.getView().byId("devPhase").setText("");
			this.getView().byId("prodType").setSelectedKey(null);
			this.getView().byId("finiGoodsForm").setSelectedKey("");
			this.getView().byId("finiGoodsFormE").setVisible(false);
			this.getView().byId("destShip").setSelectedIndex(0);
			this.getView().byId("destShipE").setVisible(false);
			this.getView().byId("purchOrd").setValue("");
			this.getView().byId("purchOrdE").setVisible(false);
			this.getView().byId("prodTypeE").setVisible(false);
			var selectedProdModel = this.getView().getModel("selectedProdModel");
			selectedProdModel.setProperty("/matchedItems", "");
			// End of change - GODBOV01
			var prodSrchWrkListModel = this.getView().getModel("prodSrchWrkListModel");
			prodSrchWrkListModel.setProperty("/ProdReqItems", null);
			this.getView().setModel(prodSrchWrkListModel, "prodSrchWrkListModel");
			var oModel = this.getOwnerComponent().getModel();
			var suggestedProd = " ";
			var oFilter = new sap.ui.model.Filter("ProdName", sap.ui.model.FilterOperator.EQ, suggestedProd);
			var aFilter = [oFilter];
			var that = this;
			oModel.read("/ProductCollectionSet", {
				filters: aFilter,
				success: function (oData) {
					var aProducts = [];
					aProducts = oData.results;
					var prodSrchModel = that.getView().getModel("prodSrchModel");
					prodSrchModel.setProperty("/products", aProducts);
					that.getView().setModel(prodSrchModel, "prodSrchModel");
				},
				error: function () {}
			});
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

		onEnterSearch: function (oEvent) {
			this.onSearch(oEvent);
		},

		onSearch: function (oEvent) {
			var sInputValue;
			if (oEvent.getId() === "suggestionItemSelected") {
				sInputValue = oEvent.getParameters().selectedItem.getText();
			} else if (oEvent.getId() === "press") {
				sInputValue = this.getView().byId("srchProduct").getValue();
			} else {
				sInputValue = oEvent.getSource().getValue();
			}
			this.getView().byId("bReqCreate").setVisible(false);
			var oModel = this.getOwnerComponent().getModel();
			var suggestedProd = sInputValue;
			var oFilter = new sap.ui.model.Filter("ProdName", sap.ui.model.FilterOperator.EQ, suggestedProd);
			var aFilter = [oFilter];
			var that = this;
			oModel.read("/ProductCollectionSet", {
				filters: aFilter,
				success: function (oData) {
					if (oData.results.length > 0) {
						var selectedProdModel = that.getView().getModel("selectedProdModel");
						selectedProdModel.setProperty("/matchedItems", oData.results);
						that.getView().setModel(selectedProdModel, "selectedProdModel");
						if (!that._valueHelpDialog) {
							that._valueHelpDialog = new sap.ui.xmlfragment(
								"com.pfizer.ctg.CTG_REQ.view.fragments.SearchProduct",
								that
							);
							that.getView().addDependent(that._valueHelpDialog);
						}
						if (oData.results.length < 2) {
							that._valueHelpDialog.setContentHeight("12%");
						} else if (oData.results.length > 1 && oData.results.length < 3) {
							that._valueHelpDialog.setContentHeight("30%");
						} else if (oData.results.length > 2 && oData.results.length < 5) {
							that._valueHelpDialog.setContentHeight("60%");
						} else if (oData.results.length > 4) {
							that._valueHelpDialog.setContentHeight("100%");
						}
						that._valueHelpDialog.open(sInputValue);
					} else {
						MessageBox.confirm("Product not found. Do you want to create ?", {
							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							onClose: function (action) {
								if (action === "YES") {
									that.oRouter.navTo("CreateProduct", {
										prodName: suggestedProd,
										prodId: " ",
										action: "C"
									});
								}
							}
						});
					}
				},
				error: function () {}
			});
		},

		onFragVHelpSearch: function (oEvent) {
			var srchStr = oEvent.getParameters("value").value;
			if (!srchStr) {
				srchStr = oEvent.getParameter("newValue");
				var prodName = new sap.ui.model.Filter(
					"ProdName",
					sap.ui.model.FilterOperator.Contains, srchStr);
				var prodDesc = new sap.ui.model.Filter(
					"ProdDesc",
					sap.ui.model.FilterOperator.Contains, srchStr);
				var devPhase = new sap.ui.model.Filter(
					"DevPhase",
					sap.ui.model.FilterOperator.Contains, srchStr);
				var oFilter = new sap.ui.model.Filter(
					[prodName, prodDesc, devPhase]
				);
				var aFilter = [oFilter];
			}
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);
			oBinding.filter(aFilter);
		},

		onProductLink: function () {
			var selectedProdModel = this.getView().getModel("selectedProdModel");
			var prodId = selectedProdModel.getData("matchedItems").matchedItems[0].ProdId;
			this.oRouter.navTo("CreateProduct", {
				prodName: this.getView().byId("selectedProd").getText(),
				prodId: prodId,
				action: "R"
			});
		},

		onProdSelect: function (oEvent) {
			prodSelected = "X";
			reqSearched = "";
			this.getView().byId("srchProduct").setValue(oEvent.getParameters().selectedItems[0].getTitle());
			this.getView().byId("selectedProd").setText(oEvent.getParameters().selectedItems[0].getTitle());
			this.getView().byId("selectedProdNames").setText(oEvent.getParameters().selectedItems[0].getDescription());
			this.getView().byId("devPhase").setText(oEvent.getParameters().selectedItems[0].getInfo());
			var sPath = oEvent.getParameters().selectedItems[0].getBindingContextPath();
			var selectedProdModel = this.getView().getModel("selectedProdModel");
			selectedProd = selectedProdModel.getProperty(sPath);
			if (oEvent.getParameters().selectedItems[0].getInfo() === "Commercial") {
				if (this.getView().getModel("selectedProdModel").getProperty(sPath).ProdSrc === "P") {
					this.getView().byId("destShipE").setVisible(true);
					this.getView().byId("purchOrdE").setVisible(false);
				} else {
					this.getView().byId("destShipE").setVisible(false);
					this.getView().byId("purchOrdE").setVisible(true);
				}
				this.getView().byId("prodTypeE").setVisible(true);
				this.getView().byId("finiGoodsFormE").setVisible(false);
			} else {
				this.getView().byId("prodType").setSelectedKey("");
				this.getView().byId("finiGoodsForm").setSelectedKey("");
				this.getView().byId("destShip").setSelectedIndex(0);
				this.getView().byId("purchOrd").setValue("");
				this.getView().byId("prodTypeE").setVisible(false);
				this.getView().byId("prodType").setValue("");
				this.getView().byId("finiGoodsFormE").setVisible(false);
				this.getView().byId("finiGoodsForm").setValue("");
				this.getView().byId("destShipE").setVisible(false);
				this.getView().byId("purchOrdE").setVisible(false);
				this.getView().byId("purchOrd").setValue("");
			}
		},

		onItemSelected: function (oEvent) {
			if (oEvent.getParameters().selectedItem) {
				this.getView().byId("srchProduct").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("prodType").setValueState(sap.ui.core.ValueState.None);
				this.onSearch(oEvent);
			} else {
				this.getView().byId("selectedProd").setText("");
				this.getView().byId("selectedProdNames").setText("");
				this.getView().byId("devPhase").setText("");
			}
		},

		onProdTypeSelected: function (oEvent) {
			prodTypeSelected = "X";
			reqSearched = "";
			if (oEvent.getSource().getSelectedKey() === "FGD") {
				this.getView().byId("finiGoodsFormE").setVisible(true);
			} else {
				this.getView().byId("finiGoodsFormE").setVisible(false);
			}
			this.getView().byId("prodType").setValueState(sap.ui.core.ValueState.None);
		},

		onProdSelectionCancel: function () {
			this.getView().byId("srchProduct").setValue("");
		},

		onFiniGoodsFrmSelect: function (oEvent) {
			if (oEvent.getSource().getSelectedKey()) {
				this.getView().byId("finiGoodsForm").setValueState(sap.ui.core.ValueState.None);
			}
		},

		onPurchOrdChange: function (oEvent) {
			purchOrdChange = "X";
			reqSearched = "";
			this.getView().byId("purchOrd").setValueState(sap.ui.core.ValueState.None);
		},

		onProdSrceSelect: function (oEvent) {},

		onRequestCreate: function (oEvent) {
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			if (userInfoModel.getData().ReqstorSet.Create !== "X") {
				MessageToast.show("No Authorization to Create New Request", {
					duration: 4000,
					width: "25em",
					at: "center"
				});
				return;
			}
			var error = this.validateFields();
			if (prodSelected === "X" && prodTypeSelected === "X" && purchOrdChange === "X" && reqSearched === "") {
				error = "X";
				MessageToast.show("Selection changed. Please execute Request Search again!", {
					duration: 4000,
					width: "25em",
					at: "center"
				});
			}
			if (error === " ") {
				prodSelected = "";
				prodTypeSelected = "";
				purchOrdChange = "";
				reqSearched = "";
				var marketsModel = this.getView().getModel("marketsModel");
				marketsModel.setProperty("/market", null);
				var createRequestModel = this.getView().getModel("createRequestModel");
				var selectedProdModel = this.getView().getModel("selectedProdModel");
				if (createRequestModel.getData().ProdName !== selectedProdModel.getData("matchedItems").matchedItems[0].ProdName) {
					createRequestModel.getData().ProdName = selectedProdModel.getData("matchedItems").matchedItems[0].ProdName;
				}
				if (createRequestModel.getData().OtherNames !== selectedProdModel.getData("matchedItems").matchedItems[0].ProdDesc) {
					createRequestModel.getData().OtherNames = selectedProdModel.getData("matchedItems").matchedItems[0].ProdDesc;
				}
				this.getView().setModel(createRequestModel, "createRequestModel");

				this.oRouter.navTo("CreateRequest", {
					reqNo: " ",
					action: "CRE" //Create
				});
			}
		},

		validateFields: function (error) {
			var oError;
			var srchProd = this.getView().byId("srchProduct").getValue();
			if (!srchProd) {
				this.getView().byId("srchProduct").focus();
				this.getView().byId("srchProduct").setValueState(sap.ui.core.ValueState.Error);
				oError = "X";
			}
			var prodId = this.getView().byId("selectedProd").getText();
			if (!prodId) {
				MessageBox.error("Product not searched or selected");
				oError = "X";
			}
			if (this.getView().byId("prodTypeE").getVisible()) {
				var prodType = this.getView().byId("prodType").getSelectedKey();
				if (!prodType) {
					this.getView().byId("prodType").focus();
					this.getView().byId("prodType").setValueState(sap.ui.core.ValueState.Error);
					oError = "X";
				}
			}
			if (this.getView().byId("finiGoodsFormE").getVisible()) {
				var finiGoodsForm = this.getView().byId("finiGoodsForm").getSelectedKey();
				if (!finiGoodsForm) {
					this.getView().byId("finiGoodsForm").focus();
					this.getView().byId("finiGoodsForm").setValueState(sap.ui.core.ValueState.Error);
					oError = "X";
				}
			}
			if (this.getView().byId("purchOrdE").getVisible()) {
				var purchOrd = this.getView().byId("purchOrd").getValue();
				if (!purchOrd) {
					this.getView().byId("purchOrd").focus();
					this.getView().byId("purchOrd").setValueState(sap.ui.core.ValueState.Error);
					oError = "X";
				}
			}
			if (selectedProd.ProdStat === "D") {
				MessageBox.error("Product in Draft Status. Please contact Admin for further details.");
				oError = "X";
			}
			if (selectedProd.ProdStat === "I") {
				MessageBox.error("Product is In-Active. Please contact Admin for further details.");
				oError = "X";
			}
			if (!oError) {
				return " ";
			} else {
				return "X";
			}
		},

		onRequestSearch: function (oEvent) {
			var error = this.validateFields();
			if (error === " ") {
				var prodType;
				if (this.getView().byId("prodTypeE").getVisible()) {
					prodType = this.getView().byId("prodType").getSelectedKey();
				} else {
					prodType = "0";
				}
				var prodId = selectedProd.ProdId;
				var prodName = selectedProd.ProdName;
				var otherNames = selectedProd.ProdDesc;
				this.initializeModels();
				var createRequestModel = this.getView().getModel("createRequestModel");
				var prodSrchWrkListModel = this.getView().getModel("prodSrchWrkListModel");
				prodSrchWrkListModel.setProperty("/ProdReqItems", null);
				this.getView().setModel(prodSrchWrkListModel, "prodSrchWrkListModel");
				var finiGoodsFrm = "00";
				var destShip = "0";
				var purchOrder = "0";
				if (this.getView().byId("finiGoodsFormE").getVisible()) {
					finiGoodsFrm = this.getView().byId("finiGoodsForm").getSelectedKey();
				}
				if (this.getView().byId("destShipE").getVisible()) {
					if (this.getView().byId("destShip").getSelectedButton().getText() === "Pfizer") {
						destShip = "P";
					} else {
						destShip = "3";
					}
				}
				if (this.getView().byId("purchOrdE").getVisible()) {
					purchOrder = this.getView().byId("purchOrd").getValue();
				}
				var that = this;
				reqSearched = "X";
				var oModel = this.getOwnerComponent().getModel();
				oModel.read("/ProductHeadSet(ProdId='" + prodId + "',ProdTyp='" + prodType + "',FiniGoodsFrm='" + finiGoodsFrm + "',DestShip='" +
					destShip + "',PurchOrder='" + purchOrder + "')", {
						urlParameters: {
							"$expand": "ProductItemSet",
							"$filter": "ProdId eq '" + prodId + "'"
						},
						success: function (oData) {
							if (oData.ProductItemSet.results.length === 0) {
								createRequestModel.setData(oData);
								delete createRequestModel.getData().ProductItemSet;
								createRequestModel.getData().ProdId = prodId;
								createRequestModel.setProperty("/ProdName", prodName);
								var prodTitle = "Product: " + prodName + "";
								createRequestModel.setProperty("/ProdTitle", prodTitle);
								createRequestModel.setProperty("/ProdTyp", prodType);
								createRequestModel.setProperty("/ProdNames", otherNames);
								if (that.getView().byId("finiGoodsFormE").getVisible()) {
									createRequestModel.getData().FiniGoodsFrm = that.getView().byId("finiGoodsForm").getSelectedKey();
								}
								if (that.getView().byId("purchOrdE").getVisible()) {
									createRequestModel.getData().PurchOrder = purchOrder;
								}
								if (that.getView().byId("destShipE").getVisible()) {
									if (that.getView().byId("destShip").getSelectedButton().getText() === "Pfizer") {
										createRequestModel.getData().DestShip = "P";
									} else {
										createRequestModel.getData().DestShip = "3";
									}
								}
								if (createRequestModel.getData().DestShip === "0") {
									if (createRequestModel.getData().PriceModel === "DS") {
										createRequestModel.getData().DestShip = "P";
									}
									if (createRequestModel.getData().PriceModel === "FC" ||
										createRequestModel.getData().PriceModel === "CM" ||
										createRequestModel.getData().PriceModel === "CP") {
										createRequestModel.getData().DestShip = "B";
									}
								}
								// MessageBox.confirm("No Request Found for the Product. Do you want to create ?", {
								// 	actions: [MessageBox.Action.YES, MessageBox.Action.NO],
								// 	onClose: function (action) {
								// 		if (action === "YES") {
								// 			that.onRequestCreate();
								// 		}
								// 	}
								// });
								var dialog = new sap.m.Dialog({
									title: "Confirmation",
									type: "Message",
									content: new sap.m.Text({
										text: "No Request Found for the Product. Do you want to create ?"
									}),
									beginButton: new sap.m.Button({
										type: "Emphasized",
										text: "Yes",
										press: function () {
											that.onRequestCreate();
											dialog.close();
										}
									}),
									endButton: new sap.m.Button({
										type: "Emphasized",
										text: "No",
										press: function () {
											dialog.close();
										}
									}),
									afterClose: function () {
										dialog.destroy();
									}
								});
								dialog.open();
							} else {
								that.getView().byId("bReqCreate").setVisible(false);
								var aResults = oData.ProductItemSet.results.concat(); //New Array Ref
								//Actions Button Logic
								var aProdReqItems = [];
								var i = 0;
								for (i = 0; i < aResults.length; i++) {
									var sData = {};
									sData = aResults[i];
									if (sData.HStatus === "AC") {
										that.actionDetermination(sData);
									} else {
										if (sData.RequstName === that.getUserName()) {
											that.actionDetermination(sData);
										} else {
											sData.RowAction = " ";
										}
									}
									aProdReqItems.push(sData);
								}
								prodSrchWrkListModel.setProperty("/ProdReqItems", aProdReqItems);
								that.getView().setModel(prodSrchWrkListModel, "prodSrchWrkListModel");
								var oTable = that.getView().byId("prodReqItemTab");
								oTable.setVisibleRowCount(aProdReqItems.length);
								var oTemplate = oTable.getBindingInfo("rows").template;
								oTable.unbindAggregation("rows");
								oTable.bindAggregation("rows", {
									path: "prodSrchWrkListModel>/ProdReqItems",
									template: oTemplate
								});
								var oRows = that.getView().byId("prodReqItemTab").getRows();
								for (i = 0; i < oRows.length; i++) {
									var oItem = oRows[i].getCells()[0].getBindingInfo("text").binding.getModel().getData().ProdReqItems[i];
									if (oItem) {
										if (oItem.RowAction === "A") {
											oRows[i].getCells()[9].getItems()[1].setVisible(true);
											oRows[i].getCells()[9].getItems()[2].setVisible(false);
											oRows[i].getCells()[9].getItems()[3].setVisible(false);
											oRows[i].getCells()[9].getItems()[4].setVisible(false);
										}
										if (oItem.RowAction === "U") {
											oRows[i].getCells()[9].getItems()[1].setVisible(false);
											oRows[i].getCells()[9].getItems()[2].setVisible(true);
											oRows[i].getCells()[9].getItems()[3].setVisible(false);
											oRows[i].getCells()[9].getItems()[4].setVisible(false);
										}
										if (oItem.RowAction === "R") {
											oRows[i].getCells()[9].getItems()[1].setVisible(false);
											oRows[i].getCells()[9].getItems()[2].setVisible(false);
											oRows[i].getCells()[9].getItems()[3].setVisible(true);
											oRows[i].getCells()[9].getItems()[4].setVisible(false);
										}
										if (oItem.RowAction === "E") {
											oRows[i].getCells()[9].getItems()[1].setVisible(false);
											oRows[i].getCells()[9].getItems()[2].setVisible(false);
											oRows[i].getCells()[9].getItems()[3].setVisible(false);
											oRows[i].getCells()[9].getItems()[4].setVisible(true);
										}
										if (oItem.RowAction === "ER") {
											oRows[i].getCells()[9].getItems()[1].setVisible(false);
											oRows[i].getCells()[9].getItems()[2].setVisible(false);
											oRows[i].getCells()[9].getItems()[3].setVisible(true);
											oRows[i].getCells()[9].getItems()[4].setVisible(true);
										}
										if (oItem.RowAction === " ") {
											oRows[i].getCells()[9].getItems()[0].setVisible(false);
											oRows[i].getCells()[9].getItems()[1].setVisible(false);
											oRows[i].getCells()[9].getItems()[2].setVisible(false);
											oRows[i].getCells()[9].getItems()[3].setVisible(false);
											oRows[i].getCells()[9].getItems()[4].setVisible(false);
										}
									}
								}
							}
						},
						error: function () {}
					});
			}
		},

		actionDetermination: function (sData) {
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			var expDate = sData.ExpDateYMD;
			if (expDate.length > 10) {
				expDate = expDate.substr(0, expDate.length - 2);
			}
			var expiryDate = new Date(expDate);
			expiryDate.setDate(expiryDate.getDate() - 30);
			var futureDate = new Date(expDate);
			futureDate.setDate(futureDate.getDate() + 30);
			var currentDate = new Date();
			if (sData.PriceModel === "AC") {
				if (currentDate >= expiryDate) {
					//We are in 30 day window of expiration
					if (userInfoModel.getData().ReqstorSet.Renew === "X") {
						sData.RowAction = "R"; //Renew
					}
				}
				if (currentDate < expiryDate) {
					//Expiry date is more than 30 days
					if (userInfoModel.getData().ReqstorSet.Append === "X") {
						sData.RowAction = "A"; //Append
					}
				}
			}
			if (sData.PriceModel === "CM" || sData.PriceModel === "DS" || sData.PriceModel === "FC") {
				if (currentDate >= expiryDate) {
					if (currentDate >= futureDate) {
						//We are over +30 days past expiration. Cannot Extend. Just Renew.
					} else {
						//We are in 30 day window of expiration
						if (userInfoModel.getData().ReqstorSet.Extend === "X" || userInfoModel.getData().VFCMgrSet.Extend === "X") {
							sData.RowAction = "E"; //Extend
						}
					}
					if (userInfoModel.getData().ReqstorSet.Renew === "X") {
						if (sData.RowAction === "E") {
							sData.RowAction = "ER"; //Renew
						} else {
							sData.RowAction = "R"; //Renew
						}
					}
				}
				if (currentDate < expiryDate) {
					//Expiry date is more than 30 days
					if (userInfoModel.getData().ReqstorSet.Update === "X") {
						sData.RowAction = "U"; //Update
					}
				}
			}
			if (sData.PriceModel === "CP") {
				if (currentDate >= expiryDate) {
					//We are in 30 day window of expiration
					if (currentDate >= futureDate) {
						//We are over +30 days past expiration. Cannot Extend. Just Renew.
					} else {
						if (userInfoModel.getData().ReqstorSet.Extend === "X" || userInfoModel.getData().VFCMgrSet.Extend === "X") {
							sData.RowAction = "E"; //Extend
						}
					}
					if (userInfoModel.getData().ReqstorSet.Renew === "X") {
						sData.RowAction = "R"; //Renew
					}
				}
			}
			if (sData.RowAction === undefined) {
				sData.RowAction = " ";
			}
		},

		onActionAppend: function (oEvent) {
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			var oRow = oEvent.getParameter("row");
			var sPath = oRow.getBindingContext("prodSrchWrkListModel").sPath;
			var sReqHead = this.getView().getModel("prodSrchWrkListModel").getProperty(sPath);
			var expDate = sReqHead.ExpDateYMD;
			if (expDate.length > 10) {
				expDate = expDate.substr(0, expDate.length - 2);
			}
			var expiryDate = new Date(expDate);
			expiryDate.setDate(expiryDate.getDate() - 30);
			var futureDate = new Date(expDate);
			futureDate.setDate(futureDate.getDate() + 30);
			var currentDate = new Date();
			if (sReqHead.PriceModel === "AC") {
				if (currentDate < expiryDate) {
					//Expiry date is more than 30 days
					if (userInfoModel.getData().ReqstorSet.Append === "X") {
						this.oRouter.navTo("AppendRequest", {
							reqId: sReqHead.ReqNo,
							action: "EDIT"
						});
					}
				}
			}
		},

		onActionExtend: function (oEvent) {
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			var oRow = oEvent.getParameter("row");
			var sPath = oRow.getBindingContext("prodSrchWrkListModel").sPath;
			var sReqHead = this.getView().getModel("prodSrchWrkListModel").getProperty(sPath);
			var expDate = sReqHead.ExpDateYMD;
			if (expDate.length > 10) {
				expDate = expDate.substr(0, expDate.length - 2);
			}
			var expiryDate = new Date(expDate);
			expiryDate.setDate(expiryDate.getDate() - 30);
			var futureDate = new Date(expDate);
			futureDate.setDate(futureDate.getDate() + 30);
			var currentDate = new Date();
			if (userInfoModel.getData().ReqstorSet.Extend === "X" || userInfoModel.getData().VFCMgrSet.Extend === "X") {
				if (sReqHead.PriceModel === "CM" || sReqHead.PriceModel === "FC" ||
					sReqHead.PriceModel === "DS" || sReqHead.PriceModel === "CP") {
					if (currentDate >= expiryDate) {
						if (currentDate >= futureDate) {
							//We are over +30 days past expiration. Cannot Extend.
						} else {
							//We are in 30 day window of expiration
							this.onRequestPricModelView(sReqHead);
						}
					}
				}
			}
		},

		onActionUpdate: function (oEvent) {
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			var oRow = oEvent.getParameter("row");
			var sPath = oRow.getBindingContext("prodSrchWrkListModel").sPath;
			var sReqHead = this.getView().getModel("prodSrchWrkListModel").getProperty(sPath);
			var expDate = sReqHead.ExpDateYMD;
			if (expDate.length > 10) {
				expDate = expDate.substr(0, expDate.length - 2);
			}
			var expiryDate = new Date(expDate);
			expiryDate.setDate(expiryDate.getDate() - 30);
			var futureDate = new Date(expDate);
			futureDate.setDate(futureDate.getDate() + 30);
			var currentDate = new Date();
			if (sReqHead.PriceModel === "CM" || sReqHead.PriceModel === "FC" || sReqHead.PriceModel === "DS") {
				if (currentDate < expiryDate) {
					//Expiry date is more than 30 days
					if (userInfoModel.getData().ReqstorSet.Update === "X") {
						this.oRouter.navTo("UpdateRequest", {
							reqId: sReqHead.ReqNo,
							action: "UPDT"
						});
					}
				}
			}
		},

		onActionRenew: function (oEvent) {
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			var oRow = oEvent.getParameter("row");
			var sPath = oRow.getBindingContext("prodSrchWrkListModel").sPath;
			var sReqHead = this.getView().getModel("prodSrchWrkListModel").getProperty(sPath);
			var expDate = sReqHead.ExpDateYMD;
			if (expDate.length > 10) {
				expDate = expDate.substr(0, expDate.length - 2);
			}
			var expiryDate = new Date(expDate);
			expiryDate.setDate(expiryDate.getDate() - 30);
			var futureDate = new Date(expDate);
			futureDate.setDate(futureDate.getDate() + 30);
			var currentDate = new Date();
			if (currentDate >= expiryDate) {
				//We are in 30 day window of expiration
				if (userInfoModel.getData().ReqstorSet.Renew === "X") {
					this.oRouter.navTo("RenewRequest", {
						reqNo: sReqHead.ReqNo,
						action: "REN"
					});
				}
			}
		},

		onReqNoHyperlink: function (oEvent) {
			var sPath = oEvent.getSource().getParent().getBindingContext("prodSrchWrkListModel").sPath;
			var sReqHead = this.getView().getModel("prodSrchWrkListModel").getProperty(sPath);
			var userName = this.getView().getModel("prodSrchWrkListModel").getProperty(sPath).RequstName;
			if (userName === this.getUserName()) {
				if (sReqHead.ReqTyp === "New") {
					if (sReqHead.HStatus === "DR" || sReqHead.HStatus === "RT") {
						this.onRequestCreDispView(sReqHead.ReqNo, "UPD-DR");
					}
					if (sReqHead.HStatus === "SB" || sReqHead.HStatus === "RW" || sReqHead.HStatus === "AS") {
						if (sReqHead.EffDate === "") {
							this.onRequestCreDispView(sReqHead.ReqNo, "UPD-SB");
						} else {
							this.oRouter.navTo("AppendRequest", {
								reqId: sReqHead.ReqNo,
								action: "DIS"
							});
						}
					}
					if (sReqHead.HStatus === "IP" || sReqHead.HStatus === "AI" ||
						sReqHead.HStatus === "AP" || sReqHead.HStatus === "AC") {
						this.onRequestPricModelView(sReqHead);
					}
				}
				if (sReqHead.ReqTyp === "Update") {
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
				if (sReqHead.ReqTyp === "Renewal") {
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
				if (sReqHead.ReqTyp === "Legacy") {
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
			} else {
				if (sReqHead.ReqTyp === "New") {
					if (sReqHead.HStatus === "DR" || sReqHead.HStatus === "RT" || sReqHead.HStatus === "SB" ||
						sReqHead.HStatus === "RW" || sReqHead.HStatus === "AS") {
						this.onRequestCreDispView(sReqHead.ReqNo, "DIS");
					} else {
						this.onRequestPricModelView(sReqHead);
					}
				}
				if (sReqHead.ReqTyp === "Update") {
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
				if (sReqHead.ReqTyp === "Renewal") {
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
				if (sReqHead.ReqTyp === "Legacy") {
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
			prodSelected = "";
			prodTypeSelected = "";
			reqSearched = "";
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
		},

		onRefreshView: function () {
			this.getView().byId("srchProduct").setValue("");
			this.getView().byId("selectedProd").setText("");
			this.getView().byId("selectedProdNames").setText("");
			this.getView().byId("devPhase").setText("");
			this.getView().byId("prodType").setValue("");
			this.getView().byId("prodType").setSelectedKey(null);
			this.getView().byId("finiGoodsForm").setSelectedKey("");
			this.getView().byId("finiGoodsFormE").setVisible(false);
			this.getView().byId("destShip").setSelectedIndex(0);
			this.getView().byId("destShipE").setVisible(false);
			this.getView().byId("purchOrd").setValue("");
			this.getView().byId("purchOrdE").setVisible(false);
			this.getView().byId("prodTypeE").setVisible(false);
			this.getView().byId("srchProduct").setValueState(sap.ui.core.ValueState.None);
			var selectedProdModel = this.getView().getModel("selectedProdModel");
			selectedProdModel.setProperty("/matchedItems", "");
			this.initializeModels();
		},

		onNavBack: function () {
			this.onRefreshView();
			this.oRouter.navTo("MainView", true);
		},

		onHome: function () {
			this.onRefreshView();
			this.onReturnToHome();
		}
	});
});