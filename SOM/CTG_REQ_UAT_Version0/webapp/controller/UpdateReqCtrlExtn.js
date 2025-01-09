sap.ui.define([
		"sap/ui/base/ManagedObject",
		"sap/m/MessageBox"
	],

	function (ManagedObject, MessageBox) {

		return ManagedObject.extend("com.pfizer.ctg.CTG_REQ.controller.UpdateRequest.UpdateReqCtrlExtn", {
			constructor: function (oView) {
				this._oView = oView;
				this._bInit = false;
			},

			validateFields: function () {
				var createRequestModel = this._oView.getModel("createRequestModel");
				var oError;
				if (sap.ui.core.Fragment.byId("UpdateRequest", "shipDetailsSection").getVisible()) {
					var marketsModel = this._oView.getModel("marketsModel");
					if (createRequestModel.getData().PriceModel !== "CP") {
						if (marketsModel.getData().market !== null) {
							if (marketsModel.getData().market[0].Land1 === "") {
								sap.ui.core.Fragment.byId("UpdateRequest", "markets").focus();
								sap.ui.core.Fragment.byId("UpdateRequest", "markets").setValueState(sap.ui.core.ValueState.Error);
								oError = "X";
							}
						}
					}
					var strengthsModel = this._oView.getModel("strengthsModel");
					var i = 0;
					if (strengthsModel.getData().strengths !== null) {
						for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
							if (strengthsModel.getData().strengths[i].Strn1 === "") {
								sap.ui.core.Fragment.byId("UpdateRequest", "qtyStrnTab").getItems()[i].focus();
								sap.ui.core.Fragment.byId("UpdateRequest", "qtyStrnTab").getItems()[i].getCells()[0].setValueState(sap.ui.core.ValueState.Error);
								oError = "X";
								break;
							}
							if (strengthsModel.getData().strengths[i].SUoM1 === "") {
								sap.ui.core.Fragment.byId("UpdateRequest", "qtyStrnTab").getItems()[i].focus();
								sap.ui.core.Fragment.byId("UpdateRequest", "qtyStrnTab").getItems()[i].getCells()[1].setValueState(sap.ui.core.ValueState.Error);
								oError = "X";
								break;
							}
						}
					}
				}
				if (sap.ui.core.Fragment.byId("UpdateRequest", "purchDetailsSection").getVisible()) {
					if (!createRequestModel.getData().PurchCost) {
						sap.ui.core.Fragment.byId("UpdateRequest", "purchCost").focus();
						sap.ui.core.Fragment.byId("UpdateRequest", "purchCost").setValueState(sap.ui.core.ValueState.Error);
						oError = "X";
					}
					if (!createRequestModel.getData().QtyPurch) {
						sap.ui.core.Fragment.byId("UpdateRequest", "purchQty").focus();
						sap.ui.core.Fragment.byId("UpdateRequest", "purchQty").setValueState(sap.ui.core.ValueState.Error);
						oError = "X";
					}
					if (!createRequestModel.getData().QtyUOM) {
						sap.ui.core.Fragment.byId("UpdateRequest", "uomValue").focus();
						sap.ui.core.Fragment.byId("UpdateRequest", "uomValue").setValueState(sap.ui.core.ValueState.Error);
						oError = "X";
					}
				}
				if (sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassSection").getVisible()) {
					var ficPricGrpModel = this._oView.getModel("ficPricGrpModel");
					if (!ficPricGrpModel.UOM1) {
						sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").focus();
						sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setValueState(sap.ui.core.ValueState.Error);
						oError = "X";
					} else {
						sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setValueState(sap.ui.core.ValueState.None);
					}
					if (oError) {
						MessageBox.error("Please fill Unit of Measure.");
						return "X";
					}
					for (i = 0; i < ficPricGrpModel.getData().grpprice.length; i++) {
						if (!ficPricGrpModel.getData().grpprice[i].SellingPrice.match(/[1-9]/g) ||
							ficPricGrpModel.getData().grpprice[i].SellingPrice === "") {
							oError = "X";
							break;
						}
					}
					if (oError) {
						MessageBox.error("Please fill FIC prices. If price is not available remove the group");
						return "X";
					}
				}
				if (oError) {
					MessageBox.error("Please fill all the required fields");
					return "X";
				}
				if (oError) {
					return "X";
				}
				return " ";
			},

			onDropDownValueChange: function (oEvent) {
				var createRequestModel = this._oView.getModel("createRequestModel");
				var i = 0;
				var strengthsModel = this._oView.getModel("strengthsModel");
				if (oEvent.getParameters().id.indexOf("strn1") >= 1) {
					i = 0;
					for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
						if (strengthsModel.getData().strengths[i].Strn1 !== "") {
							sap.ui.core.Fragment.byId("UpdateRequest", "qtyStrnTab").getItems()[i].getCells()[0].setValueState(sap.ui.core.ValueState.None);
						}
					}
				}
				if (oEvent.getParameters().id.indexOf("sUoM1") >= 1) {
					i = 0;
					for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
						if (strengthsModel.getData().strengths[i].SUoM1 !== "") {
							sap.ui.core.Fragment.byId("UpdateRequest", "qtyStrnTab").getItems()[i].getCells()[1].setValueState(sap.ui.core.ValueState.None);
						}
					}
				}
				if (oEvent.getParameters().id.indexOf("ProcmntTyp") >= 1) {
					if (sap.ui.core.Fragment.byId("UpdateRequest", "ProcmntTyp").getSelectedButton().getText() === "Purchased") {
						createRequestModel.getData().ProcmntTyp = "P";
					} else {
						createRequestModel.getData().ProcmntTyp = "F";
					}
				}
				if (oEvent.getParameters().id.indexOf("purchCost") >= 1) {
					if (createRequestModel.getData().PurchCost) {
						sap.ui.core.Fragment.byId("UpdateRequest", "purchCost").setValueState(sap.ui.core.ValueState.None);
					}
				}
				if (oEvent.getParameters().id.indexOf("purchQty") >= 1) {
					if (createRequestModel.getData().QtyPurch) {
						sap.ui.core.Fragment.byId("UpdateRequest", "purchQty").setValueState(sap.ui.core.ValueState.None);
					}
				}
				if (oEvent.getParameters().id.indexOf("uomValue") >= 1) {
					createRequestModel.getData().QtyUOM = sap.ui.core.Fragment.byId("UpdateRequest", "uomValue").getValue();
					sap.ui.core.Fragment.byId("UpdateRequest", "uomValue").setValueState(sap.ui.core.ValueState.None);
				}
				if (createRequestModel.getData().PriceModel === "FC") {
					if (oEvent.getParameters().id.indexOf("uomValuFIC") >= 1) {
						var ficPricGrpModel = this._oView.getModel("ficPricGrpModel");
						ficPricGrpModel.getData().UOM1 = sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").getSelectedKey();
						sap.ui.core.Fragment.byId("UpdateRequest", "uomValuFIC").setValueState(sap.ui.core.ValueState.None);
					}
				}
				if (oEvent.getParameters().id.indexOf("prodType") >= 1) {
					createRequestModel.getData().ProdTyp = sap.ui.core.Fragment.byId("UpdateRequest", "prodType").getSelectedKey();
					sap.ui.core.Fragment.byId("UpdateRequest", "prodType").setValueState(sap.ui.core.ValueState.None);
				}
				if (oEvent.getParameters().id.indexOf("finiGoodsForm") >= 1) {
					createRequestModel.getData().FiniGoodsFrm = sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").getSelectedKey();
					sap.ui.core.Fragment.byId("UpdateRequest", "finiGoodsForm").setValueState(sap.ui.core.ValueState.None);
				}
				if (oEvent.getParameters().id.indexOf("destination") >= 1) {
					createRequestModel.getData().DestShip = sap.ui.core.Fragment.byId("UpdateRequest", "destination").getSelectedKey();
					sap.ui.core.Fragment.byId("UpdateRequest", "destination").setValueState(sap.ui.core.ValueState.None);
				}
			},

			onDeleteFICGrp: function (oEvent) {
				var oDeleteRowId = oEvent.getSource().getParent().getBindingContextPath();
				var ficPricGrpModel = this._oView.getModel("ficPricGrpModel");
				var i = 0;
				for (i = 0; i < ficPricGrpModel.getData().grpprice.length; i++) {
					if (oDeleteRowId.indexOf(i) >= 1) {
						ficPricGrpModel.getData().grpprice.splice(i, 1);
						ficPricGrpModel.refresh();
						break;
					}
				}
			},

			presetFICgrpPrice: function () {
				var createRequestModel = this._oView.getModel("createRequestModel");
				var dropDownModel = this._oView.getModel("dropDownModel");
				var ficPricGrpModel = this._oView.getModel("ficPricGrpModel");
				var aFICgrpPrice = [];
				var aFICGrpData;
				if (createRequestModel.getData().ReqNo === "") {
					var i = 0;
					for (i = 0; i < dropDownModel.getData().ficGrp.length; i++) {
						var ficgrpprc = {};
						ficgrpprc.ReqNo = "";
						ficgrpprc.FICGrp = dropDownModel.getData().ficGrp[i].Desc;
						ficgrpprc.SellingPrice = "0";
						aFICgrpPrice.push(ficgrpprc);
					}
					aFICGrpData = ficPricGrpModel.getData().grpprice;
					var j = 0;
					if (aFICGrpData) {
						for (j = 0; j < aFICgrpPrice.length; j++) {
							aFICGrpData.filter(function (arr) {
								if (arr.FICGrp === aFICgrpPrice[j].FICGrp) {
									aFICgrpPrice[j].SellingPrice = arr.SellingPrice;
								}
							});
						}
					}
				} else {
					aFICgrpPrice = ficPricGrpModel.getData().grpprice;
				}
				if (!ficPricGrpModel.getData().grpprice === null || !ficPricGrpModel.getData().grpprice === undefined) {
					ficPricGrpModel.UOM1 = ficPricGrpModel.getData().grpprice[0].UOM1;
				}
				ficPricGrpModel.setProperty("/grpprice", aFICgrpPrice);
				this._oView.setModel(ficPricGrpModel, "ficPricGrpModel");
				var oTable;
				oTable = sap.ui.core.Fragment.byId("UpdateRequest", "firstInClassTab");
				var oTemplate = oTable.getBindingInfo("items").template;
				oTable.unbindAggregation("items");
				oTable.bindAggregation("items", {
					path: "ficPricGrpModel>/grpprice",
					template: oTemplate
				});
			},

			presetMarkets: function () {
				var aDestMarkets = [];
				aDestMarkets = this._oView.getModel("dropDownModel").getData().destMarkets;
				var marketsModel = this._oView.getModel("marketsModel");
				if (aDestMarkets && marketsModel.getData().market !== null) {
					var oValues = [];
					var oDesc;
					var i = 0;
					for (i = 0; i < marketsModel.getData().market.length; i++) {
						if (marketsModel.getData().market[i].Land1) {
							var oCtry = aDestMarkets.filter(function (arr) {
								if (arr.Value === marketsModel.getData().market[i].Land1) {
									oValues.push(marketsModel.getData().market[i].Land1);
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
					sap.ui.core.Fragment.byId("UpdateRequest", "markets").setSelectedKeys(oValues);
					var createRequestModel = this._oView.getModel("createRequestModel");
					createRequestModel.getData().Markets = oDesc;
					this._oView.setModel(createRequestModel, "createRequestModel");
				}
			},

			setStrenUoMKeys: function () {
				var aUOMValues = [];
				aUOMValues = this._oView.getModel("dropDownModel").getData().uomValues;
				if (aUOMValues) {
					var oTable = sap.ui.core.Fragment.byId("UpdateRequest", "qtyStrnTab");
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
				var createRequestModel = this._oView.getModel("createRequestModel");
				var dropDownModel = this._oView.getModel("dropDownModel");
				var strengthsModel = this._oView.getModel("strengthsModel");
				var i = 0;
				for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
					if (!strengthsModel.getData().strengths[i].Strn1) {
						strengthsModel.getData().strengths[i].Strn1 = "0";
					}
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
				this._oView.setModel(strengthsModel, "strengthsModel");
				var oTable = sap.ui.core.Fragment.byId("UpdateRequest", "qtyStrnTab");
				var oTemplate = oTable.getBindingInfo("items").template;
				oTable.unbindAggregation("items");
				oTable.bindAggregation("items", {
					path: "strengthsModel>/strengths",
					template: oTemplate
				});
			},

			oUpdateStrnKeysAfterSave: function () {
				var createRequestModel = this._oView.getModel("createRequestModel");
				var dropDownModel = this._oView.getModel("dropDownModel");
				var strengthsModel = this._oView.getModel("strengthsModel");
				var i = 0;
				for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
					if (strengthsModel.getData().strengths[i].Strn1 === "0") {
						strengthsModel.getData().strengths[i].Strn1 = "";
					}
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
				this._oView.setModel(strengthsModel, "strengthsModel");
				var oTable = sap.ui.core.Fragment.byId("UpdateRequest", "qtyStrnTab");
				var oTemplate = oTable.getBindingInfo("items").template;
				oTable.unbindAggregation("items");
				oTable.bindAggregation("items", {
					path: "strengthsModel>/strengths",
					template: oTemplate
				});
				if (createRequestModel.getData().PriceModel === "CP") {
					oTable.getHeaderToolbar().getContent()[1].setEnabled(false);
					for (i = 0; i < oTable.getItems().length; i++) {
						oTable.getItems()[i].getCells()[6].setEnabled(false);
					}
				} else {
					oTable.getHeaderToolbar().getContent()[1].setEnabled(true);
					for (i = 0; i < oTable.getItems().length; i++) {
						oTable.getItems()[i].getCells()[6].setEnabled(true);
					}
				}
			},

			oUpdateFICGrpPriceBeforeSave: function () {
				var createRequestModel = this._oView.getModel("createRequestModel");
				var aFICGrpPrc = this._oView.getModel("dropDownModel").getData().ficGrp;
				var ficPricGrpModel = this._oView.getModel("ficPricGrpModel");
				var i = 0;
				for (i = 0; i < ficPricGrpModel.getData().grpprice.length; i++) {
					ficPricGrpModel.getData().grpprice[i].ReqNo = createRequestModel.getData().ReqNo;
					if (ficPricGrpModel.getData().grpprice[i].SellingPrice === "") {
						ficPricGrpModel.getData().grpprice[i].SellingPrice = "0";
					}
					ficPricGrpModel.getData().grpprice[i].UOM1 = ficPricGrpModel.UOM1;
					aFICGrpPrc.filter(function (arr) {
						if (arr.Desc === ficPricGrpModel.getData().grpprice[i].FICGrp) {
							ficPricGrpModel.getData().grpprice[i].FICGrp = arr.Value;
							return arr;
						}
					});
				}
				this._oView.setModel(ficPricGrpModel, "ficPricGrpModel");
			},

			oUpdateFICGrpPriceAfterSave: function () {
				var createRequestModel = this._oView.getModel("createRequestModel");
				var aFICGrpPrc = this._oView.getModel("dropDownModel").getData().ficGrp;
				var ficPricGrpModel = this._oView.getModel("ficPricGrpModel");
				var i = 0;
				for (i = 0; i < ficPricGrpModel.getData().grpprice.length; i++) {
					ficPricGrpModel.getData().grpprice[i].ReqNo = createRequestModel.getData().ReqNo;
					ficPricGrpModel.UOM1 = ficPricGrpModel.getData().grpprice[i].UOM1;
					aFICGrpPrc.filter(function (arr) {
						if (arr.Value === ficPricGrpModel.getData().grpprice[i].FICGrp) {
							ficPricGrpModel.getData().grpprice[i].FICGrp = arr.Desc;
							return arr;
						}
					});
				}
			}

		});
	});