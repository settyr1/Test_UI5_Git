sap.ui.define([
		"sap/ui/base/ManagedObject",
		"sap/m/MessageBox"
	],

	function (ManagedObject, MessageBox) {

		return ManagedObject.extend("com.pfizer.ctg.CTG_REQ.controller.RenewRequest.RenewReqCtrlExtn", {
			constructor: function (oView) {
				this._oView = oView;
				this._bInit = false;
			},
			validateFields: function (aAttachments) {
				var createRequestModel = this._oView.getModel("createRequestModel");
				var oError;
				if (!createRequestModel.getData().ProdTyp) {
					sap.ui.core.Fragment.byId("RenewRequest", "prodType").focus();
					sap.ui.core.Fragment.byId("RenewRequest", "prodType").setValueState(sap.ui.core.ValueState.Error);
					oError = "X";
				}
				if (!createRequestModel.getData().ReqGrp) {
					sap.ui.core.Fragment.byId("RenewRequest", "reqGrp").focus();
					sap.ui.core.Fragment.byId("RenewRequest", "reqGrp").setValueState(sap.ui.core.ValueState.Error);
					oError = "X";
				}
				if (!createRequestModel.getData().DevPhase) {
					sap.ui.core.Fragment.byId("RenewRequest", "devPhase").focus();
					sap.ui.core.Fragment.byId("RenewRequest", "devPhase").setValueState(sap.ui.core.ValueState.Error);
					oError = "X";
				}
				if (sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").getVisible()) {
					if (!createRequestModel.getData().FiniGoodsFrm) {
						sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").focus();
						sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setValueState(sap.ui.core.ValueState.Error);
						oError = "X";
					}
				}
				if (sap.ui.core.Fragment.byId("RenewRequest", "prodDetailsSection").getVisible()) {
					if (!createRequestModel.getData().PriInd) {
						sap.ui.core.Fragment.byId("RenewRequest", "priInd").focus();
						sap.ui.core.Fragment.byId("RenewRequest", "priInd").setValueState(sap.ui.core.ValueState.Error);
						oError = "X";
					}
					if (!createRequestModel.getData().Ddose) {
						sap.ui.core.Fragment.byId("RenewRequest", "dDose").focus();
						sap.ui.core.Fragment.byId("RenewRequest", "dDose").setValueState(sap.ui.core.ValueState.Error);
						oError = "X";
					}
					if (!createRequestModel.getData().ActionMech) {
						sap.ui.core.Fragment.byId("RenewRequest", "actionMech").focus();
						sap.ui.core.Fragment.byId("RenewRequest", "actionMech").setValueState(sap.ui.core.ValueState.Error);
						oError = "X";
					}
					if (createRequestModel.getData().PriceModel === "DS") {
						if (!createRequestModel.getData().APIValue.match(/[1-9]/g)) {
							sap.ui.core.Fragment.byId("RenewRequest", "apiValu").focus();
							sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setValueState(sap.ui.core.ValueState.Error);
							oError = "X";
						}
					}
				}
				if (sap.ui.core.Fragment.byId("RenewRequest", "shipDetailsSection").getVisible()) {
					var marketsModel = this._oView.getModel("marketsModel");
					if (createRequestModel.getData().PriceModel !== "CP") {
						if (marketsModel.getData().market !== null) {
							if (marketsModel.getData().market[0].Land1 === "") {
								sap.ui.core.Fragment.byId("RenewRequest", "markets").focus();
								sap.ui.core.Fragment.byId("RenewRequest", "markets").setValueState(sap.ui.core.ValueState.Error);
								oError = "X";
							}
						}
					}
					var strengthsModel = this._oView.getModel("strengthsModel");
					var i = 0;
					if (strengthsModel.getData().strengths !== null) {
						for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
							if (strengthsModel.getData().strengths[i].Strn1 === "") {
								sap.ui.core.Fragment.byId("RenewRequest", "qtyStrnTab").getItems()[i].focus();
								sap.ui.core.Fragment.byId("RenewRequest", "qtyStrnTab").getItems()[i].getCells()[0].setValueState(sap.ui.core.ValueState.Error);
								oError = "X";
								break;
							}
							if (strengthsModel.getData().strengths[i].SUoM1 === "") {
								sap.ui.core.Fragment.byId("RenewRequest", "qtyStrnTab").getItems()[i].focus();
								sap.ui.core.Fragment.byId("RenewRequest", "qtyStrnTab").getItems()[i].getCells()[1].setValueState(sap.ui.core.ValueState.Error);
								oError = "X";
								break;
							}
						}
					}
				}
				if (sap.ui.core.Fragment.byId("RenewRequest", "purchDetailsSection").getVisible()) {
					if (!createRequestModel.getData().PurchCost) {
						sap.ui.core.Fragment.byId("RenewRequest", "purchCost").focus();
						sap.ui.core.Fragment.byId("RenewRequest", "purchCost").setValueState(sap.ui.core.ValueState.Error);
						oError = "X";
					}
					if (!createRequestModel.getData().QtyPurch) {
						sap.ui.core.Fragment.byId("RenewRequest", "purchQty").focus();
						sap.ui.core.Fragment.byId("RenewRequest", "purchQty").setValueState(sap.ui.core.ValueState.Error);
						oError = "X";
					}
					if (!createRequestModel.getData().QtyUOM) {
						sap.ui.core.Fragment.byId("RenewRequest", "uomValue").focus();
						sap.ui.core.Fragment.byId("RenewRequest", "uomValue").setValueState(sap.ui.core.ValueState.Error);
						oError = "X";
					}
				}
				if (sap.ui.core.Fragment.byId("RenewRequest", "firstInClassSection").getVisible()) {
					var ficPricGrpModel = this._oView.getModel("ficPricGrpModel");
					if (!ficPricGrpModel.UOM1) {
						sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").focus();
						sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").setValueState(sap.ui.core.ValueState.Error);
						oError = "X";
					} else {
						//	sap.ui.core.Fragment.byId("CreateRequest", "uomValuFIC").setValueState(sap.ui.core.ValueState.None);
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
				if (this._oView.getController().attmntSaved === "") {
					var fileCount = 0;
					if (this._oView.getModel("fileAttachmentModel").getData().attachments) {
						fileCount = this._oView.getModel("fileAttachmentModel").getData().attachments.length;
					}
					if (createRequestModel.getData().PriceModel === "DS" && createRequestModel.getData().POCInd === "") {
						if (fileCount === 0) {
							oError = "X";
							MessageBox.error("Please use Discovery formula and attach the result sheet.");
						}
					}
					if (createRequestModel.getData().PriceModel === "FC") {
						if (fileCount === 0) {
							oError = "X";
							MessageBox.error("Please attach pricing sheet for First-in-Class product.");
						}
					}
					if (createRequestModel.getData().PriceModel === "CP" && createRequestModel.getData().ProcmntTyp === "P") {
						if (fileCount === 0) {
							oError = "X";
							MessageBox.error("Please attach a purchase order to verify the details.");
						}
					}
				}
				if (oError) {
					return "X";
				}
				return " ";
			},

			onDropDownValueChange: function (oEvent) {
				var createRequestModel = this._oView.getModel("createRequestModel");
				var strengthsModel = this._oView.getModel("strengthsModel");
				if (oEvent.getParameters().id.indexOf("prodType") >= 1) {
					createRequestModel.getData().ProdTyp = sap.ui.core.Fragment.byId("RenewRequest", "prodType").getSelectedKey();
					sap.ui.core.Fragment.byId("RenewRequest", "prodType").setValueState(sap.ui.core.ValueState.None);

					if (createRequestModel.getData().ProdTyp === "FGD") {
						sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setVisible(true);
					} else {
						sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setVisible(false);
					}
				}
				if (oEvent.getParameters().id.indexOf("reqGrp") >= 1) {
					createRequestModel.getData().ReqGrp = sap.ui.core.Fragment.byId("RenewRequest", "reqGrp").getSelectedKey();
					sap.ui.core.Fragment.byId("RenewRequest", "reqGrp").setValueState(sap.ui.core.ValueState.None);
				}
				if (oEvent.getParameters().id.indexOf("finiGoodsForm") >= 1) {
					createRequestModel.getData().FiniGoodsFrm = sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").getSelectedKey();
					sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setValueState(sap.ui.core.ValueState.None);
				}
				if (oEvent.getParameters().id.indexOf("devPhase") >= 1) {
					createRequestModel.getData().DevPhase = sap.ui.core.Fragment.byId("RenewRequest", "devPhase").getSelectedKey();
					sap.ui.core.Fragment.byId("RenewRequest", "devPhase").setValueState(sap.ui.core.ValueState.None);
					if (createRequestModel.getData().DevPhase === "PC" ||
						createRequestModel.getData().DevPhase === "P1" ||
						createRequestModel.getData().DevPhase === "P2") {
						sap.ui.core.Fragment.byId("RenewRequest", "reachedPOC").setVisible(true);
					} else {
						sap.ui.core.Fragment.byId("RenewRequest", "reachedPOC").setVisible(false);
					}
					if (createRequestModel.getData().DevPhase === "CM") {
						sap.ui.core.Fragment.byId("RenewRequest", "firstInClass").setVisible(false);
					} else {
						sap.ui.core.Fragment.byId("RenewRequest", "firstInClass").setVisible(true);
					}
					if (createRequestModel.getData().DevPhase === "CM") {
						sap.ui.core.Fragment.byId("RenewRequest", "iTabBarCreaReq").getItems()[0].setVisible(false); //Prod Details
						sap.ui.core.Fragment.byId("RenewRequest", "iTabBarCreaReq").getItems()[1].setVisible(true); //Shipment Details
						sap.ui.core.Fragment.byId("RenewRequest", "iTabBarCreaReq").getItems()[3].setVisible(false); //FIC 
						if (createRequestModel.getData().ProdSrc === "E") {
							sap.ui.core.Fragment.byId("RenewRequest", "iTabBarCreaReq").getItems()[2].setVisible(true); //Purchase
						} else {
							sap.ui.core.Fragment.byId("RenewRequest", "iTabBarCreaReq").getItems()[2].setVisible(false);
						}
						sap.ui.core.Fragment.byId("RenewRequest", "prodType").setEditable(true);
						sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setVisible(true);
						sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setEditable(true);
						sap.ui.core.Fragment.byId("RenewRequest", "destination").setVisible(true); // Show Destination
						sap.ui.core.Fragment.byId("RenewRequest", "destination").setEditable(true);
						sap.ui.core.Fragment.byId("RenewRequest", "prodSource").setVisible(false); //Hide Prod Source
						sap.ui.core.Fragment.byId("RenewRequest", "markets").setEditable(true);
						sap.ui.core.Fragment.byId("RenewRequest", "bAddRow").setVisible(true);
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
						this._oView.setModel(strengthsModel, "strengthsModel");
						var oTable = sap.ui.core.Fragment.byId("RenewRequest", "qtyStrnTab");
						var oTemplate = oTable.getBindingInfo("items").template;
						oTable.unbindAggregation("items");
						oTable.bindAggregation("items", {
							path: "strengthsModel>/strengths",
							template: oTemplate
						});
					} else {
						sap.ui.core.Fragment.byId("RenewRequest", "prodType").setEditable(false);
						sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setVisible(false);
						sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setEditable(false);
						sap.ui.core.Fragment.byId("RenewRequest", "destination").setVisible(false); // Show Destination
						sap.ui.core.Fragment.byId("RenewRequest", "destination").setEditable(false);
						sap.ui.core.Fragment.byId("RenewRequest", "prodSource").setVisible(true);
						sap.ui.core.Fragment.byId("RenewRequest", "iTabBarCreaReq").getItems()[0].setVisible(true);
						sap.ui.core.Fragment.byId("RenewRequest", "iTabBarCreaReq").getItems()[1].setVisible(false);
						sap.ui.core.Fragment.byId("RenewRequest", "iTabBarCreaReq").getItems()[2].setVisible(false);
					}

				}
				if (oEvent.getParameters().id.indexOf("biologic") >= 1) {
					if (sap.ui.core.Fragment.byId("RenewRequest", "biologic").getState()) {
						createRequestModel.getData().Biologic = "X";
					} else {
						createRequestModel.getData().Biologic = "";
					}
				}
				if (oEvent.getParameters().id.indexOf("biosim") >= 1) {
					if (sap.ui.core.Fragment.byId("RenewRequest", "biosim").getState()) {
						createRequestModel.getData().Biosimilar = "X";
					} else {
						createRequestModel.getData().Biosimilar = "";
					}
				}
				var oFICTable;
				var q = 0;
				var ficPricGrpModel = this._oView.getModel("ficPricGrpModel");
				if (oEvent.getParameters().id.indexOf("firstInClass") >= 1) {
					if (sap.ui.core.Fragment.byId("RenewRequest", "firstInClass").getState()) {
						createRequestModel.getData().FirstClass = "X";
						if (sap.ui.core.Fragment.byId("RenewRequest", "reachedPOC").getState()) {
							sap.ui.core.Fragment.byId("RenewRequest", "firstInClassSection").setVisible(true);
							this.presetFICgrpPrice();
							sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
							oFICTable = sap.ui.core.Fragment.byId("RenewRequest", "firstInClassTab");
							for (q = 0; q < oFICTable.getItems().length; q++) {
								oFICTable.getItems()[q].getCells()[0].setEnabled(true);
								oFICTable.getItems()[q].getCells()[2].setEditable(true);
							}
							sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").setEditable(true);
							sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setVisible(false);
							sap.ui.core.Fragment.byId("RenewRequest", "apiValuTxt").setVisible(false);
						}
					} else {
						createRequestModel.getData().FirstClass = "";
						sap.ui.core.Fragment.byId("RenewRequest", "firstInClassSection").setVisible(false);
						oFICTable = sap.ui.core.Fragment.byId("RenewRequest", "firstInClassTab");
						for (q = 0; q < oFICTable.getItems().length; q++) {
							oFICTable.getItems()[q].getCells()[0].setEnabled(false);
							oFICTable.getItems()[q].getCells()[2].setEditable(false);
						}
						sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").setEditable(false);
						if (createRequestModel.getData().PriceModel === "CM" || createRequestModel.getData().PriceModel === "DS") {
							sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setVisible(true);
							sap.ui.core.Fragment.byId("RenewRequest", "apiValuTxt").setVisible(true);
						}
					}
				}
				if (oEvent.getParameters().id.indexOf("reachedPOC") >= 1) {
					if (sap.ui.core.Fragment.byId("RenewRequest", "reachedPOC").getState()) {
						createRequestModel.getData().POCInd = "X";
						if (sap.ui.core.Fragment.byId("RenewRequest", "firstInClass").getState()) {
							sap.ui.core.Fragment.byId("RenewRequest", "firstInClassSection").setVisible(true);
							this.presetFICgrpPrice();
							sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").setValue(ficPricGrpModel.UOM1);
							oFICTable = sap.ui.core.Fragment.byId("RenewRequest", "firstInClassTab");
							for (q = 0; q < oFICTable.getItems().length; q++) {
								oFICTable.getItems()[q].getCells()[0].setEnabled(true);
								oFICTable.getItems()[q].getCells()[2].setEditable(true);
							}
							sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").setEditable(true);
							sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setVisible(false);
							sap.ui.core.Fragment.byId("RenewRequest", "apiValuTxt").setVisible(false);
						}
					} else {
						createRequestModel.getData().POCInd = "";
						sap.ui.core.Fragment.byId("RenewRequest", "firstInClassSection").setVisible(false);
						oFICTable = sap.ui.core.Fragment.byId("RenewRequest", "firstInClassTab");
						for (q = 0; q < oFICTable.getItems().length; q++) {
							oFICTable.getItems()[q].getCells()[0].setEnabled(false);
							oFICTable.getItems()[q].getCells()[2].setEditable(false);
						}
						sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").setEditable(false);
						if (createRequestModel.getData().PriceModel === "CM" || createRequestModel.getData().PriceModel === "DS") {
							sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setVisible(true);
							sap.ui.core.Fragment.byId("RenewRequest", "apiValuTxt").setVisible(true);
						}
					}
				}
				//Price Model change logic
				if (!this.priceModelBeforeChange) {
					this.priceModelBeforeChange = sap.ui.core.Fragment.byId("RenewRequest", "priceModDesc").getText();
				}
				if (oEvent.getParameters().id.indexOf("reachedPOC") >= 1) {
					if (sap.ui.core.Fragment.byId("RenewRequest", "reachedPOC").getState()) {
						// Set Price Model Comparator
						sap.ui.core.Fragment.byId("RenewRequest", "priceModDesc").setText("Comparator");
						sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setVisible(false);
						sap.ui.core.Fragment.byId("RenewRequest", "apiValuTxt").setVisible(false);
						if (sap.ui.core.Fragment.byId("RenewRequest", "firstInClass").getState()) {
							// Set Price Model First In Class
							sap.ui.core.Fragment.byId("RenewRequest", "priceModDesc").setText("First In Class");
						} else {
							// Reset Price Model to Comparator
							sap.ui.core.Fragment.byId("RenewRequest", "priceModDesc").setText("Comparator");
						}
					} else {
						// Reset Price Model to Original
						if (this.priceModelBeforeChange) {
							sap.ui.core.Fragment.byId("RenewRequest", "priceModDesc").setText(this.priceModelBeforeChange);
							sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setVisible(true);
							sap.ui.core.Fragment.byId("RenewRequest", "apiValuTxt").setVisible(true);
						}
					}
				}
				if (oEvent.getParameters().id.indexOf("firstInClass") >= 1) {
					if (sap.ui.core.Fragment.byId("RenewRequest", "firstInClass").getState()) {
						if (sap.ui.core.Fragment.byId("RenewRequest", "reachedPOC").getState()) {
							// Set Price Model First In Class
							sap.ui.core.Fragment.byId("RenewRequest", "priceModDesc").setText("First In Class");
							sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setVisible(false);
							sap.ui.core.Fragment.byId("RenewRequest", "apiValuTxt").setVisible(false);
						} else {
							// Reset Price Model to Original
							if (this.priceModelBeforeChange) {
								sap.ui.core.Fragment.byId("RenewRequest", "priceModDesc").setText(this.priceModelBeforeChange);
								sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setVisible(true);
								sap.ui.core.Fragment.byId("RenewRequest", "apiValuTxt").setVisible(true);
							}
						}
					} else {
						// Reset Price Model to Original 
						if (this.priceModelBeforeChange) {
							sap.ui.core.Fragment.byId("RenewRequest", "priceModDesc").setText(this.priceModelBeforeChange);
							sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setVisible(true);
						}
					}
				}

				if (oEvent.getParameters().id.indexOf("prodSource") >= 1) {
					if (sap.ui.core.Fragment.byId("RenewRequest", "prodSource").getSelectedButton().getText() === "Pfizer") {
						createRequestModel.getData().ProdSrc = "P";
					} else {
						createRequestModel.getData().ProdSrc = "E";
					}
				}
				if (oEvent.getParameters().id.indexOf("priInd") >= 1) {
					createRequestModel.getData().PriInd = sap.ui.core.Fragment.byId("RenewRequest", "priInd").getValue();
					sap.ui.core.Fragment.byId("RenewRequest", "priInd").setValueState(sap.ui.core.ValueState.None);
				}
				if (oEvent.getParameters().id.indexOf("dDose") >= 1) {
					if (createRequestModel.getData().Ddose) {
						sap.ui.core.Fragment.byId("RenewRequest", "dDose").setValueState(sap.ui.core.ValueState.None);
					}
				}
				if (oEvent.getParameters().id.indexOf("actionMech") >= 1) {
					createRequestModel.getData().ActionMech = sap.ui.core.Fragment.byId("RenewRequest", "actionMech").getSelectedKey();
					sap.ui.core.Fragment.byId("RenewRequest", "actionMech").setValueState(sap.ui.core.ValueState.None);
				}
				if (oEvent.getParameters().id.indexOf("MOAType") >= 1) {
					if (sap.ui.core.Fragment.byId("RenewRequest", "MOAType").getSelectedButton().getText() === "Disease Modifier") {
						createRequestModel.getData().MechActTyp = "DM";
					} else {
						createRequestModel.getData().MechActTyp = "TS";
					}
				}
				if (oEvent.getParameters().id.indexOf("apiValu") >= 1) {
					if (createRequestModel.getData().APIValue) {
						sap.ui.core.Fragment.byId("RenewRequest", "apiValu").setValueState(sap.ui.core.ValueState.None);
					}
				}
				var i = 0;
				if (oEvent.getParameters().id.indexOf("strn1") >= 1) {
					for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
						if (strengthsModel.getData().strengths[i].Strn1 !== "") {
							sap.ui.core.Fragment.byId("RenewRequest", "qtyStrnTab").getItems()[i].getCells()[0].setValueState(sap.ui.core.ValueState.None);
						}
					}
				}
				if (oEvent.getParameters().id.indexOf("sUoM1") >= 1) {
					if (strengthsModel.getData().strengths !== null) {
						for (i = 0; i < strengthsModel.getData().strengths.length; i++) {
							if (strengthsModel.getData().strengths[i].SUoM1 !== "") {
								sap.ui.core.Fragment.byId("RenewRequest", "qtyStrnTab").getItems()[i].getCells()[1].setValueState(sap.ui.core.ValueState.None);
							}
						}
					}
				}
				if (oEvent.getParameters().id.indexOf("ProcmntTyp") >= 1) {
					if (sap.ui.core.Fragment.byId("RenewRequest", "ProcmntTyp").getSelectedButton().getText() === "Purchased") {
						createRequestModel.getData().ProcmntTyp = "P";
					} else {
						createRequestModel.getData().ProcmntTyp = "F";
					}
				}
				if (oEvent.getParameters().id.indexOf("purchCost") >= 1) {
					if (createRequestModel.getData().PurchCost) {
						sap.ui.core.Fragment.byId("RenewRequest", "purchCost").setValueState(sap.ui.core.ValueState.None);
					}
				}
				if (oEvent.getParameters().id.indexOf("purchQty") >= 1) {
					if (createRequestModel.getData().QtyPurch) {
						sap.ui.core.Fragment.byId("RenewRequest", "purchQty").setValueState(sap.ui.core.ValueState.None);
					}
				}
				if (oEvent.getParameters().id.indexOf("uomValue") >= 1) {
					createRequestModel.getData().QtyUOM = sap.ui.core.Fragment.byId("RenewRequest", "uomValue").getValue();
					sap.ui.core.Fragment.byId("RenewRequest", "uomValue").setValueState(sap.ui.core.ValueState.None);
				}
				ficPricGrpModel = this._oView.getModel("ficPricGrpModel");
				if (createRequestModel.getData().PriceModel === "FC") {
					if (oEvent.getParameters().id.indexOf("uomValuFIC") >= 1) {
						ficPricGrpModel.getData().UOM1 = sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").getSelectedKey();
						sap.ui.core.Fragment.byId("RenewRequest", "uomValuFIC").setValueState(sap.ui.core.ValueState.None);
					}
				}
				if (oEvent.getParameters().id.indexOf("prodType") >= 1) {
					createRequestModel.getData().ProdTyp = sap.ui.core.Fragment.byId("RenewRequest", "prodType").getSelectedKey();
					sap.ui.core.Fragment.byId("RenewRequest", "prodType").setValueState(sap.ui.core.ValueState.None);
				}
				if (oEvent.getParameters().id.indexOf("finiGoodsForm") >= 1) {
					createRequestModel.getData().FiniGoodsFrm = sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").getSelectedKey();
					sap.ui.core.Fragment.byId("RenewRequest", "finiGoodsForm").setValueState(sap.ui.core.ValueState.None);
				}
				if (oEvent.getParameters().id.indexOf("destination") >= 1) {
					createRequestModel.getData().DestShip = sap.ui.core.Fragment.byId("RenewRequest", "destination").getSelectedKey();
					sap.ui.core.Fragment.byId("RenewRequest", "destination").setValueState(sap.ui.core.ValueState.None);
				}
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
					if (this._oView.getController()._CurrentFragName === "DispRenewReq") {
						sap.ui.core.Fragment.byId("DispRenewReq", "markets").setSelectedKeys(oValues);
					} else {
						sap.ui.core.Fragment.byId("RenewRequest", "markets").setSelectedKeys(oValues);
					}
					var createRequestModel = this._oView.getModel("createRequestModel");
					createRequestModel.getData().Markets = oDesc;
					this._oView.setModel(createRequestModel, "createRequestModel");
				}
			},

			setStrenUoMKeys: function () {
				var aUOMValues = [];
				aUOMValues = this._oView.getModel("dropDownModel").getData().uomValues;
				if (aUOMValues) {
					var oTable;
					if (this._oView.getController()._CurrentFragName === "DispRenewReq") {
						oTable = sap.ui.core.Fragment.byId("DispRenewReq", "qtyStrnTab");
					} else {
						oTable = sap.ui.core.Fragment.byId("RenewRequest", "qtyStrnTab");
					}
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
				if (strengthsModel.getData().strengths !== null) {
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
				}
				this._oView.setModel(strengthsModel, "strengthsModel");
				var oTable;
				if (this._oView.getController()._CurrentFragName === "DispRenewReq") {
					oTable = sap.ui.core.Fragment.byId("DispRenewReq", "qtyStrnTab");
				} else {
					oTable = sap.ui.core.Fragment.byId("RenewRequest", "qtyStrnTab");
				}
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
				if (strengthsModel.getData().strengths !== null) {
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
				}
				this._oView.setModel(strengthsModel, "strengthsModel");
				var oTable;
				if (this._oView.getController()._CurrentFragName === "DispRenewReq") {
					oTable = sap.ui.core.Fragment.byId("DispRenewReq", "qtyStrnTab");
				} else {
					oTable = sap.ui.core.Fragment.byId("RenewRequest", "qtyStrnTab");
				}
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
				this._oView.setModel(ficPricGrpModel, "ficPricGrpModel");
				var oTable;
				if (this._oView.getController()._CurrentFragName === "DispRenewReq") {
					oTable = sap.ui.core.Fragment.byId("DispRenewReq", "firstInClassTab");
				} else {
					oTable = sap.ui.core.Fragment.byId("RenewRequest", "firstInClassTab");
				}
				var oTemplate = oTable.getBindingInfo("items").template;
				oTable.unbindAggregation("items");
				oTable.bindAggregation("items", {
					path: "ficPricGrpModel>/grpprice",
					template: oTemplate
				});
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
				var oTable;
				if (this._oView.getController()._CurrentFragName === "DispRenewReq") {
					oTable = sap.ui.core.Fragment.byId("DispRenewReq", "firstInClassTab");
				} else {
					oTable = sap.ui.core.Fragment.byId("RenewRequest", "firstInClassTab");
				}
				var oTemplate = oTable.getBindingInfo("items").template;
				oTable.unbindAggregation("items");
				oTable.bindAggregation("items", {
					path: "ficPricGrpModel>/grpprice",
					template: oTemplate
				});
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
				this._oView.setModel(ficPricGrpModel, "ficPricGrpModel");
				var oTable;
				if (this._oView.getController()._CurrentFragName === "DispRenewReq") {
					oTable = sap.ui.core.Fragment.byId("DispRenewReq", "firstInClassTab");
				} else {
					oTable = sap.ui.core.Fragment.byId("RenewRequest", "firstInClassTab");
				}
				var oTemplate = oTable.getBindingInfo("items").template;
				oTable.unbindAggregation("items");
				oTable.bindAggregation("items", {
					path: "ficPricGrpModel>/grpprice",
					template: oTemplate
				});
			}

		});
	});