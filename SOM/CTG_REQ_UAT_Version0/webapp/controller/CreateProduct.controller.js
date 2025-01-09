sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"com/pfizer/ctg/CTG_REQ/model/formatter",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, Formatter, History, MessageToast, MessageBox) {
	"use strict";

	var dataSaved;
	var saveExpected;
	var oAction;

	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.CreateProduct", {

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
			if (oEvent.getParameters().name !== "CreateProduct") {
				return;
			}
			//var oTable = this.getView().byId("otherNamesTab");

			var aCreateProduct = {};
			var aOtherNames = [];
			var sOtherNames = {};
			var i = 0;
			var x = 0;
			dataSaved = null;
			saveExpected = null;
			this.getView().byId("othNames").setValueState('None');
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			var oTable = this.getView().byId("otherNamesTab");
			//var i = 0;
			for (i = 0; i < oTable.getItems().length; i++) {
				oTable.getItems()[i].getCells()[1].setValueState(sap.ui.core.ValueState.None);
			}
			var otherNamesModel = this.getView().getModel("otherNamesModel");
			var createProductModel = this.getView().getModel("createProductModel");
			oAction = oEvent.getParameters("CreateProduct").arguments.action;
			if (oAction === "C") {
				//New Product
				if (oEvent.getParameters("CreateProduct").arguments.prodName !== " ") {
					aCreateProduct.ProdName = oEvent.getParameters("CreateProduct").arguments.prodName.toUpperCase();
					this.getView().byId("pfCompName").setEditable(true); //Lets keep the field editable.
				} else {
					aCreateProduct.ProdName = "";
					this.getView().byId("pfCompName").setEditable(true);
				}
				this.getView().byId("pfCompName").setValue(aCreateProduct.ProdName);
				this.ProdId = "00000000";
				sOtherNames.ProdId = this.ProdId;
				sOtherNames.Qualifier = "";
				sOtherNames.ProdName = aCreateProduct.ProdName;
				aOtherNames.push(sOtherNames);
				otherNamesModel.setProperty("/Names", aOtherNames);
				this.getView().setModel(otherNamesModel, "otherNamesModel");

				aCreateProduct.ProdId = this.ProdId;
				aCreateProduct.MechActTyp = "DM";
				aCreateProduct.Ddose = "";
				aCreateProduct.ProdSrc = "P";
				aCreateProduct.ProdStat = "D";
				if (this.getView().byId("biologic").getState()) {
					aCreateProduct.Biologic = "X";
				} else {
					aCreateProduct.Biologic = "";
				}
				if (this.getView().byId("biosim").getState()) {
					aCreateProduct.Biosimilar = "X";
				} else {
					aCreateProduct.Biosimilar = "";
				}
				if (this.getView().byId("reachedPOC").getState()) {
					aCreateProduct.POCInd = "X";
				} else {
					aCreateProduct.POCInd = "";
				}
				if (this.getView().byId("firstInClass").getState()) {
					aCreateProduct.FirstClass = "X";
				} else {
					aCreateProduct.FirstClass = "";
				}
				createProductModel.setProperty("/newProduct", aCreateProduct);
				this.getView().setModel(createProductModel, "createProductModel");
				this.getView().byId("devPhase").setEditable(true);
				this.getView().byId("priInd").setEditable(true);
				this.getView().byId("actionMech").setEditable(true);
				this.getView().byId("MOAType").setEditable(true);
				this.getView().byId("dDose").setEditable(true);
				this.getView().byId("biologic").setEnabled(true);
				this.getView().byId("biosim").setEnabled(true);
				this.getView().byId("firstInClass").setEnabled(true);
				this.getView().byId("prodSource").setEditable(true);
				this.getView().byId("cancelProd").setVisible(true);
				this.getView().byId("saveProd").setVisible(true);
				this.getView().byId("editProd").setVisible(false);
				this.getView().byId("bAddRow").setEnabled(true);
				if (this.getTileRole() === "ADMIN" || userInfoModel.getData().AdminSet.Product === "X") {
					this.getView().byId("prodActv").setEnabled(true);
					this.getView().byId("prodActv").setVisible(true);
				} else {
					this.getView().byId("prodActv").setEnabled(false);
					this.getView().byId("prodActv").setVisible(false);
				}
				for (i = 0; i < oTable.getItems().length; i++) {

					for (x = 0; x < oTable.getItems()[i].getCells().length; x++) {
						if (x === 1) {
							oTable.getItems()[i].getCells()[x].setEditable(true);
						} else {
							oTable.getItems()[i].getCells()[x].setEnabled(true);
						}
					}
				}
			} else {
				//Update Product
				this.getView().byId("prodCreaMain").setText("Display Product");
				this.getView().byId("devPhase").setEditable(false);
				this.getView().byId("priInd").setEditable(false);
				this.getView().byId("actionMech").setEditable(false);
				this.getView().byId("MOAType").setEditable(false);
				this.getView().byId("dDose").setEditable(false);
				this.getView().byId("biologic").setEnabled(false);
				this.getView().byId("biosim").setEnabled(false);
				this.getView().byId("firstInClass").setEnabled(false);
				this.getView().byId("reachedPOC").setEnabled(false);
				this.getView().byId("prodSource").setEditable(false);
				this.getView().byId("cancelProd").setVisible(false);
				this.getView().byId("saveProd").setVisible(false);
				this.getView().byId("bAddRow").setEnabled(false);
				if (userInfoModel.getData().AdminSet.Product) {
					this.getView().byId("editProd").setVisible(true);
				} else {
					this.getView().byId("editProd").setVisible(false);
				}
				var prodId = oEvent.getParameters("CreateProduct").arguments.prodId;
				var prodName = oEvent.getParameters("CreateProduct").arguments.prodName.toUpperCase();
				this.ProdId = prodId;
				var that = this;
				var oModel = this.getOwnerComponent().getModel();
				oModel.read("/ProductCreateSet(ProdId='" + prodId + "',ProdName='" + prodName + "')", {
					urlParameters: {
						"$expand": "ProdNamesCreateSet"
					},
					success: function (oData) {
						for (i = 0; i < oData.ProdNamesCreateSet.results.length; i++) {
							sOtherNames = {};
							sOtherNames.ProdId = oData.ProdNamesCreateSet.results[i].ProdId;
							sOtherNames.Qualifier = oData.ProdNamesCreateSet.results[i].Qualifier;
							sOtherNames.ProdName = oData.ProdNamesCreateSet.results[i].ProdName;
							aOtherNames.push(sOtherNames);
						}
						otherNamesModel.setProperty("/Names", aOtherNames);
						that.getView().setModel(otherNamesModel, "otherNamesModel");
						that.formatOtherNamesAfterSave();
						that.ProdName = "";
						i = 0;
						for (i = 0; i < oTable.getItems().length; i++) {
							for (x = 0; x < oTable.getItems()[i].getCells().length; x++) {
								if (x === 1) {
									oTable.getItems()[i].getCells()[x].setEditable(false);
								} else {
									oTable.getItems()[i].getCells()[x].setEnabled(false);
								}
								if (oTable.getItems()[i].getCells()[0].getValue() === "PC") {
									that.ProdName = oTable.getItems()[i].getCells()[1].getValue();
								} else {
									if (oTable.getItems()[i].getCells()[0].getValue() === "OC") {
										that.ProdName = oTable.getItems()[i].getCells()[1].getValue();
									} else {
										that.ProdName = oTable.getItems()[i].getCells()[1].getValue();
									}
								}
							}
						}
						createProductModel.setProperty("/newProduct", oData);
						createProductModel.getData().newProduct.ProdName = that.ProdName;
						that.getView().setModel(createProductModel, "createProductModel");
						that.getView().byId("devPhase").setSelectedKey(createProductModel.getData().newProduct.DevPhase);
						var aPriInd = that.getView().getModel("dropDownModel").getData().primaryInd;
						aPriInd.filter(function (arr) {
							if (arr.Value === createProductModel.getData().newProduct.PriInd) {
								that.getView().byId("priInd").setValue(arr.Desc);
							}
						});
						that.getView().byId("actionMech").setSelectedKey(createProductModel.getData().newProduct.ActionMech);
						if (createProductModel.getData().newProduct.MechActTyp === "DM") {
							that.getView().byId("MOAType").setSelectedIndex(0);
						} else {
							that.getView().byId("MOAType").setSelectedIndex(1);
						}
						that.getView().byId("dDose").setValue(createProductModel.getData().newProduct.Ddose);
						if (createProductModel.getData().newProduct.DevPhase !== "CM") {
							that.getView().byId("ficIndE").setVisible(true);
							that.getView().byId("ficIndL").setRequired(true);
						} else {
							that.getView().byId("ficIndE").setVisible(false);
							that.getView().byId("ficIndL").setRequired(false);
						}
						if (createProductModel.getData().newProduct.Biologic) {
							that.getView().byId("biologic").setState(true);
						} else {
							that.getView().byId("biologic").setState(false);
						}
						if (createProductModel.getData().newProduct.DevPhase === "P2" && createProductModel.getData().newProduct.Biologic === " " ||
							createProductModel.getData().newProduct.DevPhase === "P3" && createProductModel.getData().newProduct.Biologic === " " ||
							createProductModel.getData().newProduct.DevPhase === "CM" && createProductModel.getData().newProduct.Biologic === " ") {
							that.getView().byId("pocIndE").setVisible(true);
						} else {
							that.getView().byId("pocIndE").setVisible(false);
						}
						if (createProductModel.getData().newProduct.Biosimilar) {
							that.getView().byId("biosim").setState(true);
						} else {
							that.getView().byId("biosim").setState(false);
						}
						if (createProductModel.getData().newProduct.FirstClass) {
							that.getView().byId("firstInClass").setState(true);
						} else {
							that.getView().byId("firstInClass").setState(false);
						}
						if (createProductModel.getData().newProduct.POCInd) {
							that.getView().byId("reachedPOC").setState(true);
						} else {
							that.getView().byId("reachedPOC").setState(false);
						}
						if (createProductModel.getData().newProduct.ProdSrc === "P") {
							that.getView().byId("prodSource").setSelectedIndex(0);
						} else {
							that.getView().byId("prodSource").setSelectedIndex(1);
						}
						if (createProductModel.getData().newProduct.ProdStat !== "A") {
							that.getView().byId("prodActv").setSelected(false);
							that.getView().byId("deleteProd").setVisible(true);
						} else {
							that.getView().byId("prodActv").setSelected(true);
							that.getView().byId("deleteProd").setVisible(false);
						}
					},
					error: function () {}
				});
			}
		},

		onEditProd: function () {
			var createProductModel = this.getView().getModel("createProductModel");
			if (this.getTileRole() === "ADMIN") {
				this.getView().byId("pfCompName").setEditable(true);
				if (createProductModel.getData().newProduct.ProdStat === "A") {
					this.getView().byId("saveProd").setText("Save");
				} else {
					this.getView().byId("saveProd").setText("Save & Approve");
				}
			} else {
				this.getView().byId("pfCompName").setEditable(true); //let's keep the field editable
				this.getView().byId("saveProd").setText("Submit");
			}
			this.getView().byId("prodCreaMain").setText("Edit Product");
			this.getView().byId("cancelProd").setVisible(true);
			this.getView().byId("saveProd").setVisible(true);
			this.getView().byId("editProd").setVisible(false);
			this.getView().byId("bAddRow").setEnabled(true);
			this.getView().byId("devPhase").setEditable(true);
			this.getView().byId("priInd").setEditable(true);
			this.getView().byId("actionMech").setEditable(true);
			this.getView().byId("MOAType").setEditable(true);
			this.getView().byId("dDose").setEditable(true);
			this.getView().byId("biologic").setEnabled(true);
			this.getView().byId("biosim").setEnabled(true);
			this.getView().byId("firstInClass").setEnabled(true);
			this.getView().byId("reachedPOC").setEnabled(true);
			this.getView().byId("prodSource").setEditable(true);
			this.getView().byId("prodActv").setEnabled(true);
			var oTable = this.getView().byId("otherNamesTab");
			var i = 0;
			for (i = 0; i < oTable.getItems().length; i++) {
				var x = 0;
				for (x = 0; x < oTable.getItems()[i].getCells().length; x++) {
					if (x === 1) {
						oTable.getItems()[i].getCells()[x].setEditable(true);
					} else {
						oTable.getItems()[i].getCells()[x].setEnabled(true);
					}
				}
			}
		},

		onCancelProd: function () {
			this.getView().byId("prodCreaMain").setText("Display Product");
			this.getView().byId("pfCompName").setEditable(false);
			this.getView().byId("cancelProd").setVisible(false);
			this.getView().byId("saveProd").setVisible(false);
			this.getView().byId("editProd").setVisible(true);
			this.getView().byId("bAddRow").setEnabled(false);
			this.getView().byId("devPhase").setEditable(false);
			this.getView().byId("priInd").setEditable(false);
			this.getView().byId("actionMech").setEditable(false);
			this.getView().byId("MOAType").setEditable(false);
			this.getView().byId("dDose").setEditable(false);
			this.getView().byId("biologic").setEnabled(false);
			this.getView().byId("biosim").setEnabled(false);
			this.getView().byId("firstInClass").setEnabled(false);
			this.getView().byId("reachedPOC").setEnabled(false);
			this.getView().byId("prodSource").setEditable(false);
			this.getView().byId("prodActv").setEnabled(false);
			var oTable = this.getView().byId("otherNamesTab");
			var i = 0;
			for (i = 0; i < oTable.getItems().length; i++) {
				var x = 0;
				for (x = 0; x < oTable.getItems()[i].getCells().length; x++) {
					if (x === 1) {
						oTable.getItems()[i].getCells()[x].setEditable(false);
					} else {
						oTable.getItems()[i].getCells()[x].setEnabled(false);
					}
				}
			}
		},

		onValueHelpClick: function (oEvent) {
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
				},
				error: function () {}
			});

			var sInputValue = oEvent.getSource().getValue();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = new sap.ui.xmlfragment(
					"primIndicatorFrag",
					"com.pfizer.ctg.CTG_REQ.view.fragments.PrimaryIndicator",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}
			this._valueHelpDialog.open(sInputValue);
		},

		onPriIndValueChange: function (oEvent) {
			var priIndHierValue;
			var createProductModel = this.getView().getModel("createProductModel");
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
				createProductModel.getData().newProduct.PriInd = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getSelectedKey();
				this.getView().setModel(createProductModel, "createProductModel");
				this.getView().byId("priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				this.getView().byId("priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				createProductModel.getData().newProduct.PriIndHier = priIndHierValue;
				this.getView().byId("priIndHier").setText(priIndHierValue);
				this._valueHelpDialog.close();
			}
		},

		onFragClose: function () {
			var priIndHierValue;
			var createProductModel = this.getView().getModel("createProductModel");
			if (sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue()) {
				createProductModel.getData().newProduct.PriInd = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getSelectedKey();
				this.getView().setModel(createProductModel, "createProductModel");
				this.getView().byId("priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				this.getView().byId("priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl3").getValue());
				createProductModel.getData().newProduct.PriIndHier = priIndHierValue;
				this.getView().byId("priIndHier").setText(priIndHierValue);
				this._valueHelpDialog.close();
				return;
			}
			if (sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue()) {
				createProductModel.getData().newProduct.PriInd = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getSelectedKey();
				this.getView().setModel(createProductModel, "createProductModel");
				this.getView().byId("priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				this.getView().byId("priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				priIndHierValue = priIndHierValue.concat(" > ", sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl2").getValue());
				createProductModel.getData().newProduct.PriIndHier = priIndHierValue;
				this.getView().byId("priIndHier").setText(priIndHierValue);
				this._valueHelpDialog.close();
				return;
			}
			if (sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue()) {
				createProductModel.getData().newProduct.PriInd = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getSelectedKey();
				this.getView().setModel(createProductModel, "createProductModel");
				this.getView().byId("priInd").setValue(sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue());
				this.getView().byId("priInd").setValueState(sap.ui.core.ValueState.None);
				priIndHierValue = sap.ui.core.Fragment.byId("primIndicatorFrag", "priIndLvl1").getValue();
				createProductModel.getData().newProduct.PriIndHier = priIndHierValue;
				this.getView().byId("priIndHier").setText(priIndHierValue);
				this._valueHelpDialog.close();
				return;
			}
			this._valueHelpDialog.close();
		},

		onValueChange: function (oEvent) {
			saveExpected = true;
			var createProductModel = this.getView().getModel("createProductModel");
			if (oEvent.getParameters().id.indexOf("pfCompName") >= 1) {
				createProductModel.getData().newProduct.ProdName = this.getView().byId("pfCompName").getValue();
				this.getView().byId("pfCompName").setValueState(sap.ui.core.ValueState.None);
			}
			if (oEvent.getParameters().id.indexOf("devPhase") >= 1) {
				createProductModel.getData().newProduct.DevPhase = this.getView().byId("devPhase").getSelectedKey();
				this.getView().byId("devPhase").setValueState(sap.ui.core.ValueState.None);
				if (createProductModel.getData().newProduct.DevPhase !== "CM") {
					this.getView().byId("ficIndE").setVisible(true);
				} else {
					this.getView().byId("ficIndE").setVisible(false);
				}
				if (createProductModel.getData().newProduct.DevPhase === "P2") {
					if (this.getView().byId("biologic").getState()) {
						this.getView().byId("pocIndE").setVisible(false);
						this.getView().byId("reachedPOC").setEnabled(false);
					} else {
						this.getView().byId("pocIndE").setVisible(true);
						this.getView().byId("reachedPOC").setEnabled(true);
					}
				} else {
					this.getView().byId("pocIndE").setVisible(false);
					this.getView().byId("reachedPOC").setEnabled(false);
				}
			}
			if (oEvent.getParameters().id.indexOf("priInd") >= 1) {
				createProductModel.getData().newProduct.PriInd = this.getView().byId("priInd").getValue();
				this.getView().byId("priInd").setValueState(sap.ui.core.ValueState.None);
			}
			if (oEvent.getParameters().id.indexOf("actionMech") >= 1) {
				createProductModel.getData().newProduct.ActionMech = this.getView().byId("actionMech").getSelectedKey();
				this.getView().byId("actionMech").setValueState(sap.ui.core.ValueState.None);
			}
			if (oEvent.getParameters().id.indexOf("MOAType") >= 1) {
				if (this.getView().byId("MOAType").getSelectedButton().getText() === "Desease Modifier") {
					createProductModel.getData().newProduct.MechActTyp = "DM";
				} else {
					createProductModel.getData().newProduct.MechActTyp = "TS";
				}
			}
			if (oEvent.getParameters().id.indexOf("dDose") >= 1) {
				createProductModel.getData().newProduct.Ddose = this.getView().byId("dDose").getValue();
			}
			if (oEvent.getParameters().id.indexOf("biologic") >= 1) {
				if (this.getView().byId("biologic").getState()) {
					createProductModel.getData().newProduct.Biologic = "X";
					this.getView().byId("pocIndE").setVisible(false);
					this.getView().byId("reachedPOC").setEnabled(false);
				} else {
					createProductModel.getData().newProduct.Biologic = "";
					if (createProductModel.getData().newProduct.DevPhase === "P2") {
						this.getView().byId("pocIndE").setVisible(true);
						this.getView().byId("reachedPOC").setEnabled(true);
					} else {
						this.getView().byId("pocIndE").setVisible(false);
						this.getView().byId("reachedPOC").setEnabled(false);
					}
				}
			}
			if (oEvent.getParameters().id.indexOf("biosim") >= 1) {
				if (this.getView().byId("biosim").getState()) {
					createProductModel.getData().newProduct.Biosimilar = "X";
				} else {
					createProductModel.getData().newProduct.Biosimilar = "";
				}
			}
			if (oEvent.getParameters().id.indexOf("firstInClass") >= 1) {
				if (this.getView().byId("firstInClass").getState()) {
					createProductModel.getData().newProduct.FirstClass = "X";
				} else {
					createProductModel.getData().newProduct.FirstClass = "";
				}
			}
			if (oEvent.getParameters().id.indexOf("reachedPOC") >= 1) {
				if (this.getView().byId("reachedPOC").getState()) {
					createProductModel.getData().newProduct.POCInd = "X";
				} else {
					createProductModel.getData().newProduct.POCInd = "";
				}
			}
			if (oEvent.getParameters().id.indexOf("prodSource") >= 1) {
				if (this.getView().byId("prodSource").getSelectedButton().getText() === "Pfizer") {
					createProductModel.getData().newProduct.ProdSrc = "P";
				} else {
					createProductModel.getData().newProduct.ProdSrc = "E";
				}
			}
			if (oEvent.getParameters().id.indexOf("othNames") >= 1) {

				var oTable = this.getView().byId("otherNamesTab");
				var i = 0;
				for (i = 0; i < oTable.getItems().length; i++) {
					oTable.getItems()[i].getCells()[1].setValueState(sap.ui.core.ValueState.None);
					if (oTable.getItems()[i].getCells()[0].getSelectedKey() === "PC") {
						oTable.getItems()[i].getCells()[1].setValue(oTable.getItems()[i].getCells()[1].getValue().toUpperCase());
						createProductModel.getData().newProduct.ProdName = oTable.getItems()[i].getCells()[1].getValue();
						this.onProdQualChange(oEvent);
						break;
					} else {
						if (oTable.getItems()[i].getCells()[0].getSelectedKey() === "OC") {
							createProductModel.getData().newProduct.ProdName = oTable.getItems()[i].getCells()[1].getValue();
							break;
						}
					}
					//New Condition by DOGIPA to give a pop-up if underscore is entered

					var value = oTable.getItems()[i].getCells()[1].getValue();
					if (value.indexOf('_') > -1 && value.indexOf('_') < 3) {
						sap.m.MessageBox.show("Invalid Character in this field", sap.m.MessageBox.Icon.ERROR, "Alert", [sap.m.MessageBox.Action
							.OK
						]);
						oTable.getItems()[i].getCells()[1].setValueState(sap.ui.core.ValueState.Error);
					} else {
						oTable.getItems()[i].getCells()[1].setValueState(sap.ui.core.ValueState.None);
					}
				}
				//Change all names to Upper Case
				for (i = 0; i < oTable.getItems().length; i++) {
					oTable.getItems()[i].getCells()[1].setValue(oTable.getItems()[i].getCells()[1].getValue().toUpperCase());
				}
				if (createProductModel.getData().newProduct.ProdName === "") {
					createProductModel.getData().newProduct.ProdName = oTable.getItems()[0].getCells()[1].getValue();
				}

			}
			if (oEvent.getParameters().id.indexOf("prodActv") >= 1) {
				if (this.getView().byId("prodActv").getSelected()) {
					createProductModel.getData().newProduct.ProdStat = "A";
				} else {
					if (createProductModel.getData().newProduct.ProdId !== "00000000") {
						var that = this;
						MessageBox.confirm("Are you sure you want to De-Activate this product ?", {
							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							onClose: function (action) {
								if (action === "YES") {
									createProductModel.getData().newProduct.ProdStat = "I";
								}
								if (action === "NO") {
									that.getView().byId("prodActv").setSelected(true);
								}
							}
						});
					} else {
						createProductModel.getData().newProduct.ProdStat = "D";
					}
				}
			}
			this.getView().setModel(createProductModel, "createProductModel");
		},

		onAddTabRow: function (oEvent) {
			var otherNamesModel = this.getView().getModel("otherNamesModel");
			var oNames = otherNamesModel.getData().Names;
			oNames.push({
				ProdId: this.ProdId,
				Qualifier: "",
				ProdName: ""
			});
			otherNamesModel.refresh();
			saveExpected = true;
		},

		onDelTabRow: function (oEvent) {
			var oDeleteRowId = oEvent.getSource().getId();
			var otherNamesModel = this.getView().getModel("otherNamesModel");
			var i = 0;
			for (i = 0; i < otherNamesModel.getData().Names.length; i++) {
				if (oDeleteRowId.indexOf(i) >= 1) {
					otherNamesModel.getData().Names.splice(i, 1);
					otherNamesModel.refresh();
					saveExpected = true;
					break;
				}
			}
		},

		onProdQualChange: function (oEvent) {
			//Check for Duplicate Product.
			var createProductModel = this.getView().getModel("createProductModel");
			var prodName;
			if (oEvent.getParameter("value").indexOf("Pfizer") >= 0) {
				prodName = createProductModel.getData().newProduct.ProdName;
			}
			if (oEvent.getParameters().id.indexOf("othNames") >= 1) {
				prodName = oEvent.getParameters("value").value;
			}
			if (prodName) {
				prodName = prodName.toUpperCase();
				if (oEvent.getParameter("value").indexOf("Pfizer") >= 0 || oEvent.getParameters().id.indexOf("othNames") >= 1) {
					if (createProductModel.getData().newProduct.ProdId === "00000000" &&
						createProductModel.getData().newProduct.ProdName !== "") {
						var that = this;
						var oModel = this.getOwnerComponent().getModel();
						oModel.callFunction("/CheckProduct", {
							method: "GET",
							urlParameters: {
								"ProdName": prodName
							},
							success: function (oData) {
								if (oData.results.length > 0) {
									if (oData.results[0].ProdId) {
										MessageBox.error("Product with Pfizer Compound Name already exists");
										that.duplicateProduct = "X";
									}
								}
							},
							error: function () {}
						});
					}
				}
			}
		},

		onValidateFields: function () {
			var createProductModel = this.getView().getModel("createProductModel");
			var error;
			var oTable = this.getView().byId("otherNamesTab");
			var compNameFound = "";
			var i = 0;
			if (this.getView().byId("prodSource").getSelectedButton().getText() === "Pfizer") {
				for (i = 0; i < oTable.getItems().length; i++) {
					if (oTable.getItems()[i].getCells()[0].getValue() === "PC") {
						compNameFound = "X";
						if (oTable.getItems()[i].getCells()[1].getValue() === "") {
							error = "X";
							break;
						}
					}
				}
				if (error === "X" || compNameFound === "") {
					MessageBox.error("Please provide Pfizer Compound Name.");
					error = "X";
					return error;
				}
			} else {
				for (i = 0; i < oTable.getItems().length; i++) {
					if (oTable.getItems()[i].getCells()[1].getValue() === "") {
						error = "X";
						break;
					}
				}
				if (error === "X") {
					MessageBox.error("Please provide Other Compound/API/Trade Name.");
					return error;
				}
			}
			if (createProductModel.getData().newProduct.ProdSrc === "P" && this.duplicateProduct === "X") {
				MessageBox.error("Product with Pfizer Compound Name already exists.");
				return error;
			}
			if (!createProductModel.getData().newProduct.DevPhase) {
				this.getView().byId("devPhase").focus();
				this.getView().byId("devPhase").setValueState(sap.ui.core.ValueState.Error);
				error = "X";
			}
			if (!createProductModel.getData().newProduct.PriInd) {
				this.getView().byId("priInd").focus();
				this.getView().byId("priInd").setValueState(sap.ui.core.ValueState.Error);
				error = "X";
			}
			if (!createProductModel.getData().newProduct.ActionMech) {
				this.getView().byId("actionMech").focus();
				this.getView().byId("actionMech").setValueState(sap.ui.core.ValueState.Error);
				error = "X";
			}
			return error;
		},

		onSaveProd: function () {
			this.formatOtherNamesBeforeSave();
			var error = this.onValidateFields();
			if (!error || error !== "X") {
				var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
				var createProductModel = this.getView().getModel("createProductModel");
				createProductModel.getData().newProduct.ProdName.replace(/\s/g, '_');
				var otherNamesModel = this.getView().getModel("otherNamesModel");
				var createProdPayLoad = {};
				createProdPayLoad = createProductModel.getData().newProduct;
				createProdPayLoad.ProdNamesCreateSet = otherNamesModel.getData().Names;
				if (createProdPayLoad.ProdId === "00000000") {
					createProdPayLoad.Action = "C";
				} else {
					createProdPayLoad.Action = "U";
				}
				if (createProdPayLoad.Ddose === "") {
					createProdPayLoad.Ddose = "0.0000";
				}
				if (this.getTileRole() !== "ADMIN" && userInfoModel.getData().AdminSet.Product !== "X") {
					createProdPayLoad.ProdStat = "D"; //Draft Status
				}
				createProdPayLoad.PriceModel = "";
				createProdPayLoad.ProdTyp = "";
				var that = this;
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/ProductCreateSet", createProdPayLoad, {
					method: "POST",
					success: function (oData) {
						dataSaved = "X";
						saveExpected = null;
						that.duplicateProduct = "";
						that.formatOtherNamesAfterSave();
						var msg = "Product ";
						if (userInfoModel.getData().AdminSet.Product === "X") {
							if (createProdPayLoad.ProdStat === "D") {
								msg = msg.concat(createProdPayLoad.ProdName, " Saved as Draft.");
							}
							if (createProdPayLoad.ProdStat === "A") {
								msg = msg.concat(createProdPayLoad.ProdName, " Saved & Active.");
							}
							if (createProdPayLoad.ProdStat === "I") {
								msg = msg.concat(createProdPayLoad.ProdName, " Saved & InActive.");
							}
						} else {
							msg = msg.concat(createProdPayLoad.ProdName, " Submitted for Admin Approval.");
							if (createProdPayLoad.ProdStat === "D") {
								that.getView().byId("deleteProd").setVisible(true);
							}
						}
						if (createProdPayLoad.Action === "C") {
							that.ProdId = oData.ProdId;
							createProductModel.getData().newProduct.ProdId = oData.ProdId;
							that.getView().setModel(createProductModel, "createProductModel");
						}
						MessageToast.show(msg, {
							duration: 4000,
							width: "25em",
							at: "center",
							onClose: function () {
								if (that.getTileRole() === "ADMIN") {
									if (createProdPayLoad.Action === "C") {
										that.onOkToNavBack();
									}
								}
							}
						});
					},
					error: function () {}
				});
			}
		},

		formatOtherNamesBeforeSave: function () {
			var otherNamesModel = this.getView().getModel("otherNamesModel");
			var aQualifier = this.getView().getModel("dropDownModel").getData().prodQualifier;
			var i = 0;
			for (i = 0; i < otherNamesModel.getData().Names.length; i++) {
				aQualifier.filter(function (arr) {
					if (arr.Desc === otherNamesModel.getData().Names[i].Qualifier) {
						otherNamesModel.getData().Names[i].Qualifier = arr.Value;
					}
				});
			}
			this.getView().setModel(otherNamesModel, "otherNamesModel");
			var oTable = this.getView().byId("otherNamesTab");
			var oTemplate = oTable.getBindingInfo("items").template;
			oTable.unbindAggregation("items");
			oTable.bindAggregation("items", {
				path: "otherNamesModel>/Names",
				template: oTemplate
			});
		},

		formatOtherNamesAfterSave: function () {
			var otherNamesModel = this.getView().getModel("otherNamesModel");
			var aQualifier = this.getView().getModel("dropDownModel").getData().prodQualifier;
			var i = 0;
			for (i = 0; i < otherNamesModel.getData().Names.length; i++) {
				aQualifier.filter(function (arr) {
					if (arr.Value === otherNamesModel.getData().Names[i].Qualifier) {
						otherNamesModel.getData().Names[i].Qualifier = arr.Desc;
					}
				});
			}
			this.getView().setModel(otherNamesModel, "otherNamesModel");
			var oTable = this.getView().byId("otherNamesTab");
			var oTemplate = oTable.getBindingInfo("items").template;
			oTable.unbindAggregation("items");
			oTable.bindAggregation("items", {
				path: "otherNamesModel>/Names",
				template: oTemplate
			});
		},

		onDeleteProd: function (oEvent) {
			var createProductModel = this.getView().getModel("createProductModel");
			var prodId = createProductModel.getData().newProduct.ProdId;
			var prodName = createProductModel.getData().newProduct.ProdName;
			if (createProductModel.getData().newProduct.ProdStat === "A") {
				MessageToast.show("Active Product cannot be deleted", {
					duration: 4000,
					width: "25em",
					at: "center"
				});
				return;
			}
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.remove("/ProductCreateSet(ProdId='" + prodId + "',ProdName='" + prodName + "')", {
				method: "DELETE",
				success: function (oData) {
					var msg = "Product ";
					msg = msg.concat(createProductModel.getData().newProduct.ProdName, " has been Deleted.");
					MessageToast.show(msg, {
						duration: 4000,
						width: "25em",
						at: "center",
						onClose: function () {
							that.onEditProd();
							that.getView().byId("pfCompName").setValue(null);
							that.getView().byId("devPhase").setSelectedKey("");
							that.getView().byId("biologic").setState(false);
							that.getView().byId("biosim").setState(false);
							that.getView().byId("firstInClass").setState(false);
							that.getView().byId("reachedPOC").setState(false);
							that.getView().byId("dDose").setValue(null);
							that.getView().byId("priInd").setSelectedKey("");
							that.getView().byId("actionMech").setSelectedKey("");
							that.getView().byId("ficIndE").setVisible(false);
							that.getView().byId("pocIndE").setVisible(false);
							that.getView().byId("prodCreaMain").setText("Create Product");
							that.getView().byId("deleteProd").setVisible(false);
							oAction = "C";
							that.initializeModels();
							var oTable = that.getView().byId("otherNamesTab");
							var oTemplate = oTable.getBindingInfo("items").template;
							oTable.unbindAggregation("items");
							oTable.bindAggregation("items", {
								path: "otherNamesModel>/Names",
								template: oTemplate
							});
						}
					});
				},
				error: function () {}
			});
		},

		onNavBack: function () {
			if (dataSaved === null && saveExpected === true) {
				var that = this;
				MessageBox.confirm("Data not saved. Do you still want to exit ?", {
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function (action) {
						if (action === "YES") {
							that.onOkToNavBack();
						} else {
							return;
						}
					}
				});
			} else {
				this.onOkToNavBack();
			}
		},

		onOkToNavBack: function () {
			this.onRefreshView();
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				if (this.getTileRole() === "PRDSRC") {
					this.setRaisedEvent("NAVBACK");
				}
				window.history.go(-1);
			} else {
				this.oRouter.navTo("MainView", true);
			}
		},

		onRefreshView: function () {
			dataSaved = null;
			saveExpected = null;
			this.ProdId = "";
			this.ProdName = "";
			this.duplicateProduct = "";
			this.getView().byId("pfCompName").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("devPhase").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("priInd").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("actionMech").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("devPhase").setSelectedKey(null);
			this.getView().byId("priInd").setSelectedKey(null);
			this.getView().byId("actionMech").setSelectedKey(null);
			this.getView().byId("MOAType").setSelectedIndex(0);
			this.getView().byId("prodSource").setSelectedIndex(0);
			this.getView().byId("prodActv").setEnabled(false);
			this.getView().byId("prodActv").setSelected(null);
			this.getView().byId("biologic").setState(false);
			this.getView().byId("biosim").setState(false);
			this.getView().byId("firstInClass").setState(false);
			this.getView().byId("reachedPOC").setState(false);
			this.getView().byId("cancelProd").setVisible(false);
			this.getView().byId("saveProd").setVisible(false);
			this.getView().byId("editProd").setVisible(false);
			this.getView().byId("priInd").setValue("");
			if (this._valueHelpDialog !== undefined) {
				this._valueHelpDialog.getContent()[0].getContent()[1].setSelectedKey(null);
				this._valueHelpDialog.getContent()[0].getContent()[3].setSelectedKey(null);
				this._valueHelpDialog.getContent()[0].getContent()[5].setSelectedKey(null);
			}
			var createProductModel = this.getView().getModel("createProductModel");
			createProductModel.setProperty("/newProduct", "");
			this.initializeModels();
		},

		onHome: function () {
			this.onRefreshView();
			this.onReturnToHome();
		}
	});
});