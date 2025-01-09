sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"./ActionSheetSubFunctions",
	"sap/ui/core/routing/History",
	"com/pfizer/ctg/CTG_REQ/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, ActionSheetSubFunctions, History, Formatter, MessageToast, MessageBox) {
	"use strict";

	var aBICCompProd = [];
	var aValuCompCtry = [];
	var aValuCtryPricTab = [];
	var aAttachments = [];
	var getAttchmntCall = "";
	this.odataupdatecall = "";
	this.saveCalcComplete = "";

	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.ValuationComp", {

		formatter: Formatter,

		onInit: function () {
			var i = 0;
			var oFilter = new sap.ui.model.Filter("TabName", sap.ui.model.FilterOperator.EQ, " ");
			var aFilter = [oFilter];
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			oModel.read("/ValuationDropDnSet", {
				filters: aFilter,
				success: function (oData) {
					aBICCompProd = [];
					aValuCompCtry = [];
					i = 0;
					for (i = 0; i < oData.results.length; i++) {
						if (oData.results[i].TabName === "ZCTGBIC1") {
							aBICCompProd.push(oData.results[i]);
						}
						if (oData.results[i].TabName === "ZCTGCOMPCTRY") {
							aValuCompCtry.push(oData.results[i]);
						}
					}
					var dropDownModel = that.getView().getModel("dropDownModel");
					dropDownModel.setProperty("/bicCompProd", aBICCompProd);
					dropDownModel.setProperty("/valuCompCtry", aValuCompCtry);
					that.getView().setModel(dropDownModel, "dropDownModel");
				},
				error: function () {}
			});
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			if (oEvent.getParameters().name !== "ValuationComp") {
				return;
			}
			this.odataupdatecall = undefined;
			getAttchmntCall = "";
			aAttachments = [];
			this.attmntSaved = "";
			this.reqNo = oEvent.getParameters("ValuationComparator").arguments.reqId;
			var pad = "0000000000";
			this.reqNo = (pad + this.reqNo).slice(-pad.length);
			this.priceModel = oEvent.getParameters("ValuationComparator").arguments.priceModel;
			this.action = oEvent.getParameters("ValuationDiscovery").arguments.action;
			if (this.action === "DIS-APRV") {
				this.getView().byId("apprvReq").setVisible(true);
				this.getView().byId("rejectReq").setVisible(true);
				this.getView().byId("apprvNotes").setEditable(true);
				this.getView().byId("vfcMgrNotes").setEditable(false);
			} else {
				this.getView().byId("apprvReq").setVisible(false);
				this.getView().byId("rejectReq").setVisible(false);
				this.getView().byId("apprvNotes").setEditable(false);
			}
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/ReqHeadExtnSet(ReqNo='" + this.reqNo + "')", {
				urlParameters: {
					"$expand": "ReqDetailsSet"
				},
				success: function (oData) {
					reqHExtnModel.setProperty("/ReqHExtnSet", oData);
					that.getView().setModel(reqHExtnModel, "reqHExtnModel");
					var reqDetailsModel = that.getView().getModel("reqDetailsModel");
					reqDetailsModel.setProperty("/ReqDetailsSet", oData.ReqDetailsSet.results);
					that.getView().setModel(reqDetailsModel, "reqDetailsModel");
					that.updateViewElements();
				},
				error: function () {
					// MessageBox.show("oModel.read.Failed");
				}
			});
			this.getView().byId("cancelReq").setVisible(false);
			this.getView().byId("returnReq").setVisible(false);
			this.getView().byId("editReq").setVisible(false);
			this.getView().byId("saveReq").setVisible(false);
			this.getView().byId("submitReq").setVisible(false);
			this.getView().byId("sendToApprv").setVisible(false);
		},

		updateViewElements: function () {
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			if (reqHExtnModel.getData().ReqHExtnSet.CurrReqNo) {
				var currReqTitle = "Forwarding Request: ";
				var currReqNo = parseInt(reqHExtnModel.getData().ReqHExtnSet.CurrReqNo, 10);
				currReqTitle = currReqTitle.concat(currReqNo);
				this.getView().byId("refReqE").setText(currReqTitle);
				this.getView().byId("refReqE").setVisible(true);
			} else {
				this.getView().byId("refReqE").setVisible(false);
			}
			if (reqHExtnModel.getData().ReqHExtnSet.DevPhase === "CM") {
				this.getView().byId("shipDet").setVisible(true);
				this.getView().byId("prodDet").setVisible(false);
				if (reqHExtnModel.getData().ReqHExtnSet.ProdSrc === "P") {
					this.getView().byId("purchDet").setVisible(true);
				} else {
					this.getView().byId("purchDet").setVisible(false);
				}
			} else {
				this.getView().byId("prodDet").setVisible(true);
				this.getView().byId("shipDet").setVisible(false);
				this.getView().byId("purchDet").setVisible(false);
			}

			if (reqHExtnModel.getData().ReqHExtnSet.ProdTyp === "FGD") {
				this.getView().byId("finiGoodsForm").setVisible(true);
			} else {
				this.getView().byId("finiGoodsForm").setVisible(false);
			}

			if (reqHExtnModel.getData().ReqHExtnSet.DevPhase === "CM") {
				this.getView().byId("firstInClass").setVisible(false);
			} else {
				this.getView().byId("firstInClass").setVisible(true);
			}
			if (reqHExtnModel.getData().ReqHExtnSet.HStatus === "DR" ||
				reqHExtnModel.getData().ReqHExtnSet.HStatus === "RT" ||
				reqHExtnModel.getData().ReqHExtnSet.HStatus === "SB" ||
				reqHExtnModel.getData().ReqHExtnSet.HStatus === "RW" ||
				reqHExtnModel.getData().ReqHExtnSet.HStatus === "AS") {
				this.getView().byId("iTFCompDetls").setVisible(false);
				this.getView().byId("iTFValuPrdTyp").setVisible(false);
			} else {
				this.getView().byId("iTFCompDetls").setVisible(true);
				this.getView().byId("iTFValuPrdTyp").setVisible(true);
			}

			if (userInfoModel.getData().ApprvSet.Role === "APPROVER") {
				if (reqHExtnModel.getData().ReqHExtnSet.ProdMstrU === "2") {
					if (reqHExtnModel.getData().ReqHExtnSet.HStatus === "AP" ||
						reqHExtnModel.getData().ReqHExtnSet.HStatus === "AA") {
						this.getView().byId("prodAttrChng").setVisible(true);
					} else {
						this.getView().byId("prodAttrChng").setVisible(false);
					}
				} else {
					this.getView().byId("prodAttrChng").setVisible(false);
				}
			}

			var oElement = " ";
			oElement = oElement.concat("Request No: ", reqHExtnModel.getData().ReqHExtnSet.ReqNo);
			reqHExtnModel.setProperty("/ReqHExtnSet/AttrReqNo", oElement);
			oElement = " ";
			oElement = oElement.concat("Other Names: ", reqHExtnModel.getData().ReqHExtnSet.ProdNames);
			reqHExtnModel.setProperty("/ReqHExtnSet/AttrProdNames", oElement);
			oElement = " ";
			oElement = oElement.concat("Phase: ", reqHExtnModel.getData().ReqHExtnSet.DevPhDesc);
			reqHExtnModel.setProperty("/ReqHExtnSet/AttrPhase", oElement);
			oElement = " ";
			oElement = oElement.concat("Price Model: ", this.priceModel);
			reqHExtnModel.setProperty("/ReqHExtnSet/AttrPricModl", oElement);
			oElement = " ";
			if (reqHExtnModel.getData().ReqHExtnSet.ExpDate) {
				this.getView().byId("expDate").setVisible(true);
				oElement = oElement.concat("Expiration Date: ", reqHExtnModel.getData().ReqHExtnSet.ExpDate);
				reqHExtnModel.setProperty("/ReqHExtnSet/AttrExpDate", oElement);
			} else {
				this.getView().byId("expDate").setVisible(false);
			}
			reqHExtnModel.setProperty("/ReqHExtnSet/AttrStatus", reqHExtnModel.getData().ReqHExtnSet.HStatDesc);
			this.getView().setModel(reqHExtnModel, "reqHExtnModel");
			if (reqHExtnModel.getData().ReqHExtnSet.TherapyTyp === "X") {
				this.getView().byId("therapy").setSelectedIndex(1);
			} else {
				this.getView().byId("therapy").setSelectedIndex(0);
			}
			this.getView().byId("compDrug").setValue(reqHExtnModel.getData().ReqHExtnSet.BICComp);
			this.getView().byId("biosim").setSelected(reqHExtnModel.getData().ReqHExtnSet.BiosimComp);
			this.getView().byId("compDdose").setValue(reqHExtnModel.getData().ReqHExtnSet.CompDDose);
			this.getView().byId("dosageNotes").setValue(reqHExtnModel.getData().ReqHExtnSet.CompNotes);
			this.getView().byId("vfcMgrNotes").setValue(reqHExtnModel.getData().ReqHExtnSet.VFCNotes);
			if (reqHExtnModel.getData().ReqHExtnSet.Biosimilar === "YES") {
				this.getView().byId("biosimE").setVisible(true);
			} else {
				this.getView().byId("biosimE").setVisible(false);
			}
			var oTable = this.getView().byId("valueCtryPricTab");
			var i = 0;
			for (i = 0; i < oTable.getItems().length; i++) {
				var x = 0;
				for (x = 0; x < oTable.getItems()[i].getCells().length; x++) {
					if (x === 0) {
						oTable.getItems()[i].getCells()[x].setEditable(false);
					} else {
						oTable.getItems()[i].getCells()[x].setEnabled(false);
					}
				}
			}
			
			if (reqHExtnModel.getData().ReqHExtnSet.ProdMstrU === "2") {
				this.getView().byId("sendToApprv").setText("Send for Approval");
			} else {
				this.getView().byId("sendToApprv").setText("Approve");
			}

			if (reqHExtnModel.getData().ReqHExtnSet.HStatus === "AC" || reqHExtnModel.getData().ReqHExtnSet.HStatus === "EX") {
				if (userInfoModel.getData().ReqstorSet.Role === "CREATOR" || userInfoModel.getData().ReqstorSet.Role === "VALUATOR") {
					if (reqHExtnModel.getData().ReqHExtnSet.CurrReqNo) {
						this.getView().byId("actionsButn").setVisible(false);
					} else {
						this.getView().byId("actionsButn").setVisible(true);
					}
				}
				//New code by DOGIPA to display action button for Comparator Pricing model
				if (userInfoModel.getData().VFCMgrSet.Role === "VALUATOR") {
					if (reqHExtnModel.getData().ReqHExtnSet.CurrReqNo) {
						this.getView().byId("actionsButn").setVisible(false);
					} else {
						this.getView().byId("actionsButn").setVisible(true);
					}
				}
				//End of the new code DOGIPA
				this.getView().byId("pdfButn").setVisible(true);
			} else {
				this.getView().byId("actionsButn").setVisible(false);
				this.getView().byId("pdfButn").setVisible(false);
			}
			if (getAttchmntCall === "") {
				var that = this;
				var fileAttachmentModel = this.getView().getModel("fileAttachmentModel");
				var oAttchModel = this.getOwnerComponent().getModel();
				oAttchModel.read("/ReqCreateSet(ReqNo='" + this.reqNo + "')", {
					urlParameters: {
						"$expand": "AttachmentsSet"
					},
					success: function (oData) {
						getAttchmntCall = "X";
						if (oData.AttachmentsSet.results.length > 0) {
							fileAttachmentModel.setProperty("/attachments", oData.AttachmentsSet.results);
							that.getView().setModel(fileAttachmentModel, "fileAttachmentModel");
						}
					},
					error: function (oData) {}
				});
			}
		},

		onIconTabSelect: function (oEvent) {
			var i = 0;
			var that;
			var fileAttachmentModel = this.getView().getModel("fileAttachmentModel");
			var oAttchModel = this.getOwnerComponent().getModel();
			if (oEvent.getSource().getSelectedKey().indexOf("iTFCompDetls") >= 0) {
				if (this.action === "UPD-SP") {
					if (!this.getView().byId("compDrug").getEnabled()) {
						this.getView().byId("cancelReq").setVisible(false);
						this.getView().byId("editReq").setVisible(true);
						this.getView().byId("saveReq").setVisible(false);
						this.getView().byId("returnReq").setVisible(false);
						this.getView().byId("sendToApprv").setVisible(false);
						this.getView().byId("submitReq").setVisible(false);
					} else {
						this.getView().byId("cancelReq").setVisible(true);
						this.getView().byId("returnReq").setVisible(false);
						this.getView().byId("saveReq").setVisible(false);
						this.getView().byId("sendToApprv").setVisible(false);
						this.getView().byId("editReq").setVisible(false);
						this.getView().byId("submitReq").setVisible(true);
					}
					if (this.getView().byId("editReq").getVisible()) {
						this.getView().byId("avgPriceSave").setEnabled(false);
					} else {
						this.getView().byId("avgPriceSave").setEnabled(true);
					}
				} else {
					this.getView().byId("therapy").setEditable(false);
					this.getView().byId("compDrug").setEnabled(false);
					this.getView().byId("biosim").setEnabled(false);
					this.getView().byId("compDdose").setEnabled(false);
					this.getView().byId("dosageNotes").setEnabled(false);
					this.getView().byId("cancelReq").setVisible(false);
					this.getView().byId("returnReq").setVisible(false);
					this.getView().byId("saveReq").setVisible(false);
					this.getView().byId("sendToApprv").setVisible(false);
					this.getView().byId("editReq").setVisible(false);
					this.getView().byId("submitReq").setVisible(false);
					this.getView().byId("avgPriceSave").setEnabled(false);
				}
				var valuCtryPricModel = this.getView().getModel("valuCtryPricModel");
				if (valuCtryPricModel.getData().ValuCtryPricSet.length === 0) {
					var oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, this.reqNo);
					var aFilter = [oFilter];
					that = this;
					var oModel = this.getOwnerComponent().getModel();
					oModel.read("/ValuCtryPricSet", {
						filters: aFilter,
						success: function (oData) {
							if (oData.results.length > 0) {
								aValuCtryPricTab = [];
								i = 0;
								for (i = 0; i < oData.results.length; i++) {
									// if (oData.results[i].Price === "0.0000") {
									// oData.results[i].Price = ""; Defect 82 display zero price on view.
									// }
									if (oData.results[i].PriceDate === "00000000") {
										oData.results[i].PriceDate = null;
									} else {
										oData.results[i].PriceDate = new Date(oData.results[i].PriceDate);
									}
									aValuCtryPricTab.push(oData.results[i]);
								}
							} else {
								//Build table for Default Countries.
								var dropDownModel = that.getView().getModel("dropDownModel");
								var aDataModel = dropDownModel.getData().valuCompCtry;
								var sRow = {};
								aValuCtryPricTab = [];
								i = 0;
								for (i = 0; i < aDataModel.length; i++) {
									sRow = {};
									sRow.CtryKey = aDataModel[i].Value;
									sRow.Country = aDataModel[i].Desc;
									sRow.Price = "";
									sRow.PriceDate = null;
									sRow.Comments = "";
									aValuCtryPricTab.push(sRow);
								}
							}
							valuCtryPricModel.setProperty("/ValuCtryPricSet", aValuCtryPricTab);
							that.getView().setModel(valuCtryPricModel, "valuCtryPricModel");
							var oTable = that.getView().byId("valueCtryPricTab");
							i = 0;
							for (i = 0; i < oTable.getItems().length; i++) {
								var x = 0;
								for (x = 0; x < oTable.getItems()[i].getCells().length; x++) {
									if (x === 0) {
										oTable.getItems()[i].getCells()[x].setEditable(false);
									} else {
										oTable.getItems()[i].getCells()[x].setEnabled(false);
									}
								}
							}
						},
						error: function () {
							// MessageBox.show("oModel.read.Failed");
						}
					});
				}
			}
			if (oEvent.getSource().getSelectedKey().indexOf("iTFValuPrdTyp") >= 0) {
				if (this.action === "UPD-VFC") {
					this.getView().byId("returnReq").setVisible(true);
					this.getView().byId("sendToApprv").setVisible(true);
					this.getView().byId("saveReq").setVisible(true);
					this.getView().byId("cancelReq").setVisible(false);
					this.getView().byId("editReq").setVisible(false);
					this.getView().byId("submitReq").setVisible(false);
					this.getView().byId("avgPriceSave").setEnabled(true);
					this.getView().byId("fileUploader").setEnabled(true);
					this.getView().byId("bDelAttmnt").setEnabled(true);
					this.getView().byId("vfcMgrNotes").setEditable(true);
				} else {
					this.getView().byId("cancelReq").setVisible(false);
					this.getView().byId("returnReq").setVisible(false);
					this.getView().byId("sendToApprv").setVisible(false);
					this.getView().byId("saveReq").setVisible(false);
					this.getView().byId("editReq").setVisible(false);
					this.getView().byId("submitReq").setVisible(false);
					this.getView().byId("avgPriceSave").setEnabled(false);
					this.getView().byId("fileUploader").setEnabled(false);
					this.getView().byId("bDelAttmnt").setEnabled(false);
					this.getView().byId("vfcMgrNotes").setEditable(false);
				}
				if (this.saveCalcComplete === "X") {
					this.saveCalcComplete = "";
					that = this;
					var oDetlModel = this.getOwnerComponent().getModel();
					oDetlModel.read("/ReqHeadExtnSet(ReqNo='" + this.reqNo + "')", {
						urlParameters: {
							"$expand": "ReqDetailsSet"
						},
						success: function (oData) {
							var reqDetailsModel = that.getView().getModel("reqDetailsModel");
							reqDetailsModel.setProperty("/ReqDetailsSet", "");
							reqDetailsModel.setProperty("/ReqDetailsSet", oData.ReqDetailsSet.results);
							that.getView().setModel(reqDetailsModel, "reqDetailsModel");
							that.getView().byId("valuationTab").setVisibleRowCount(that.getView().getModel("reqDetailsModel").getData().ReqDetailsSet.length);
						},
						error: function () {
							// MessageBox.show("oModel.read.Failed");
						}
					});
				} else {
					this.getView().byId("valuationTab").setVisibleRowCount(this.getView().getModel("reqDetailsModel").getData().ReqDetailsSet.length);
				}

				if (getAttchmntCall === "") {
					that = this;
					oAttchModel.read("/ReqCreateSet(ReqNo='" + this.reqNo + "')", {
						urlParameters: {
							"$expand": "AttachmentsSet"
						},
						success: function (oData) {
							getAttchmntCall = "X";
							if (oData.AttachmentsSet.results.length > 0) {
								fileAttachmentModel.setProperty("/attachments", oData.AttachmentsSet.results);
								that.getView().setModel(fileAttachmentModel, "fileAttachmentModel");
							}
						},
						error: function (oData) {}
					});
				}
			}
			if (oEvent.getSource().getSelectedKey().indexOf("iTFReqDet") >= 0) {
				this.getView().byId("cancelReq").setVisible(false);
				this.getView().byId("returnReq").setVisible(false);
				this.getView().byId("editReq").setVisible(false);
				this.getView().byId("saveReq").setVisible(false);
				this.getView().byId("submitReq").setVisible(false);
				this.getView().byId("sendToApprv").setVisible(false);

				if (getAttchmntCall === "") {
					that = this;
					oAttchModel.read("/ReqCreateSet(ReqNo='" + this.reqNo + "')", {
						urlParameters: {
							"$expand": "AttachmentsSet"
						},
						success: function (oData) {
							getAttchmntCall = "X";
							if (oData.AttachmentsSet.results.length > 0) {
								fileAttachmentModel.setProperty("/attachments", oData.AttachmentsSet.results);
								that.getView().setModel(fileAttachmentModel, "fileAttachmentModel");
							}
						},
						error: function (oData) {}
					});
				}
			}
		},

		onActionSheet: function (oEvent) {
			var sActionsheetName = "ActionSheetSubFunctions";
			this.mActionsheets = this.mActionsheets || {};
			var oActionsheet = this.mActionsheets[sActionsheetName];

			if (!oActionsheet) {
				oActionsheet = new ActionSheetSubFunctions(this.getView());
				this.mActionsheets[sActionsheetName] = oActionsheet;
				oActionsheet.getControl().setPlacement("Bottom");
				// For navigation.
				oActionsheet.setRouter(this.oRouter);
			}
			var oSource = oEvent.getSource();
			oActionsheet.open(oSource);
		},

		onEditReq: function () {
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			var reqHExtnData = this.getView().getModel("reqHExtnModel").getData().ReqHExtnSet;
			this.getView().byId("therapy").setEditable(true);
			this.getView().byId("compDrug").setEnabled(true);
			if (userInfoModel.getData().SPInputSet.Role === "SPINPUTTER") {
				if (this.getView().byId("therapy").getSelectedButton().getText() === "Monotherapy") {
					this.getView().byId("butnCompPrice").setEnabled(true);
				} else {
					this.getView().byId("butnCompPrice").setEnabled(false);
				}
			}
			this.getView().byId("biosim").setEnabled(true);
			this.getView().byId("compDdose").setEnabled(true);
			this.getView().byId("dosageNotes").setEnabled(true);
			this.getView().byId("cancelReq").setVisible(true);
			this.getView().byId("returnReq").setVisible(false);
			this.getView().byId("saveReq").setVisible(false);
			this.getView().byId("sendToApprv").setVisible(false);
			this.getView().byId("editReq").setVisible(false);
			this.getView().byId("avgPriceSave").setEnabled(true);
			this.getView().byId("submitReq").setVisible(true);
			if (reqHExtnData.AvgWholesaleVal.match(/[1-9]/g)) {
				this.getView().byId("submitReq").setEnabled(true);
			} else {
				this.getView().byId("submitReq").setEnabled(false);
			}
			var oTable = this.getView().byId("valueCtryPricTab");
			var currentDate = new Date();
			var i = 0;
			for (i = 0; i < oTable.getItems().length; i++) {
				var x = 0;
				for (x = 0; x < oTable.getItems()[i].getCells().length; x++) {
					oTable.getItems()[i].getCells()[2].setMaxDate(currentDate);
					if (x === 0) {
						oTable.getItems()[i].getCells()[x].setEditable(false);
					} else {
						oTable.getItems()[i].getCells()[x].setEnabled(true);
					}

				}
			}
		},

		onCancelReq: function () {
			this.getView().byId("therapy").setEditable(false);
			this.getView().byId("compDrug").setEnabled(false);
			this.getView().byId("butnCompPrice").setEnabled(false);
			this.getView().byId("biosim").setEnabled(false);
			this.getView().byId("compDdose").setEnabled(false);
			this.getView().byId("dosageNotes").setEnabled(false);
			this.getView().byId("cancelReq").setVisible(false);
			this.getView().byId("returnReq").setVisible(false);
			this.getView().byId("saveReq").setVisible(false);
			this.getView().byId("sendToApprv").setVisible(false);
			this.getView().byId("editReq").setVisible(true);
			this.getView().byId("submitReq").setVisible(false);
			this.getView().byId("avgPriceSave").setEnabled(false);
			var oTable = this.getView().byId("valueCtryPricTab");
			var i = 0;
			for (i = 0; i < oTable.getItems().length; i++) {
				var x = 0;
				for (x = 0; x < oTable.getItems()[i].getCells().length; x++) {
					if (x === 0) {
						oTable.getItems()[i].getCells()[x].setEditable(false);
					} else {
						oTable.getItems()[i].getCells()[x].setEnabled(false);
					}
				}
			}
		},

		onCompPriceChange: function (oEvent) {
			var value = oEvent.getSource().getValue();
			if (value === "") {
				oEvent.getSource().setValue("0.0000");
			}
			// var val = oEvent.getSource().getValue();
			// if (val.length >= 1 && val.indexOf("-") === -1) {//val.match(/[1-9]/g)) {
			// 	oEvent.getSource().setValueState("None");
			// } else {
			// 	oEvent.getSource().setValueState("Error");
			// }				
		},

		onDateChange: function (oEvent) {
			var currentDate = new Date();
			var selectedDate = new Date(oEvent.getParameter("value"));
			if (selectedDate > currentDate) {
				oEvent.getSource().getParent().getCells()[2].setValue(null);
				MessageBox.error("Future Date cannot be selected");
				return;
			}
			var rowIndx = oEvent.getSource().getParent().getBindingContext("valuCtryPricModel").sPath.substr(length - 1, 1);
			oEvent.getSource().getParent().getParent().getItems()[rowIndx].getCells()[2].setDateValue(selectedDate);
		},

		onValueChange: function (oEvent) {
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			if (oEvent.getParameters().id.indexOf("compDrug") >= 1) {
				reqHExtnModel.getData().ReqHExtnSet.BICComp = oEvent.getParameters().value;
				this.getView().byId("compDrug").setValueState(sap.ui.core.ValueState.None);
			}
			this.getView().setModel(reqHExtnModel, "reqHExtnModel");
		},

		onValueSelection: function (oEvent) {
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			var dropDownModel = this.getView().getModel("dropDownModel");
			if (oEvent.getParameters().id.indexOf("therapy") >= 1) {
				if (this.getView().byId("therapy").getSelectedButton().getText() === "Monotherapy") {
					reqHExtnModel.getData().ReqHExtnSet.TherapyTyp = " ";
					dropDownModel.setProperty("/bicCompProd", aBICCompProd);
					this.getView().setModel(dropDownModel, "dropDownModel");
					this.getView().byId("compDrug").setShowSuggestion(true);
					if (userInfoModel.getData().SPInputSet.Role === "SPINPUTTER") {
						this.getView().byId("butnCompPrice").setEnabled(true);
					}
				} else {
					reqHExtnModel.getData().ReqHExtnSet.TherapyTyp = "X";
					dropDownModel.setProperty("/bicCompProd", null);
					this.getView().setModel(dropDownModel, "dropDownModel");
					this.getView().byId("compDrug").setShowSuggestion(false);
					if (userInfoModel.getData().SPInputSet.Role === "SPINPUTTER") {
						this.getView().byId("butnCompPrice").setEnabled(false);
					}
				}
			}
			if (oEvent.getParameters().id.indexOf("compDrug") >= 1) {
				if (oEvent.getParameters().selectedItem) {
					reqHExtnModel.getData().ReqHExtnSet.BICComp = oEvent.getParameters().selectedItem.getKey();
					this.getView().byId("compDrug").setValueState(sap.ui.core.ValueState.None);
				}
			}
			this.getView().setModel(reqHExtnModel, "reqHExtnModel");
		},

		onBiosimChecked: function (oEvent) {
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			if (oEvent.getParameters().selected) {
				reqHExtnModel.getData().ReqHExtnSet.BiosimComp = "X";
			} else {
				reqHExtnModel.getData().ReqHExtnSet.BiosimComp = "";
			}
			this.getView().setModel(reqHExtnModel, "reqHExtnModel");
		},

		onReturnToRequster: function (oEvent) {
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			if (reqHExtnModel.getData().ReqHExtnSet.VFCNotes === "") {
				MessageBox.error("Please enter reason for returning to requester");
				return;
			}
			var that = this;
			MessageBox.confirm("Are you sure you want to return to requestor ?", {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (action) {
					if (action === "YES") {
						that.returnToRequester();
					}
				}
			});
		},

		returnToRequester: function () {
			this.onSaveRequest();
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			var aFilter = [];
			var oFilter;
			oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, this.getUserId());
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "RT");
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, reqHExtnModel.getData().ReqHExtnSet.ReqNo);
			aFilter.push(oFilter);
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/StatUpdtActionSet", {
				filters: aFilter,
				success: function (oData) {
					that.getView().byId("returnReq").setEnabled(false);
					that.getView().byId("sendToApprv").setEnabled(false);
					that.getView().byId("saveReq").setEnabled(false);
					var msg = "Contego Request ";
					msg = msg.concat(reqHExtnModel.getData().ReqHExtnSet.ReqNo, " Returned to Requester.");
					MessageToast.show(msg, {
						duration: 4000,
						width: "25em",
						at: "center",
						onClose: function () {
							that.odataupdatecall = "X";
						}
					});
				},
				error: function () {}
			});
		},

		onSendToApprover: function (oEvent) {
			var error = this.onValidateData();
			if (error === "X") {
				return;
			}
			this.onSaveRequest();
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			var aFilter = [];
			var oFilter;
			oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, this.getUserId());
			aFilter.push(oFilter);
			if (reqHExtnModel.getData().ReqHExtnSet.ProdMstrU === "2") {
				oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "AP");
			} else {
				oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "AC");
			}
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, reqHExtnModel.getData().ReqHExtnSet.ReqNo);
			aFilter.push(oFilter);
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/StatUpdtActionSet", {
				filters: aFilter,
				success: function (oData) {
					that.getView().byId("returnReq").setEnabled(false);
					that.getView().byId("sendToApprv").setEnabled(false);
					that.getView().byId("saveReq").setEnabled(false);
					var msg = "Contego Request ";
					if (reqHExtnModel.getData().ReqHExtnSet.ProdMstrU === "2") {
						msg = msg.concat(reqHExtnModel.getData().ReqHExtnSet.ReqNo, " Sent for Approval.");
					} else {
						msg = msg.concat(reqHExtnModel.getData().ReqHExtnSet.ReqNo, " has been Approved.");
					}
					MessageToast.show(msg, {
						duration: 4000,
						width: "25em",
						at: "center",
						onClose: function () {
							that.odataupdatecall = "X";
						}
					});
				},
				error: function () {}
			});
		},

		onCompDoseChange: function (oEvent) {
			var result = this.getView().byId("compDdose").getValue().match(/[1-9]/g);
			if (result) {
				this.getView().byId("compDdose").setValueState(sap.ui.core.ValueState.None);
			}
		},

		onValidateData: function () {
			var error;
			var errPrice;
			var errDate;
			var errNotes;
			var errCompDrug;
			var errCompDose;
			if (this.getView().byId("compDrug").getValue() === "") {
				this.getView().byId("compDrug").setValueState(sap.ui.core.ValueState.Error);
				errCompDrug = "X";
			} else {
				this.getView().byId("compDrug").setValueState(sap.ui.core.ValueState.None);
			}
			if (errCompDrug === "X") {
				error = "X";
				MessageBox.error("Please enter Comparator Drug");
				return error;
			}

			var result = this.getView().byId("compDdose").getValue().match(/[1-9]/g);
			if (!result) {
				errCompDose = "X";
				this.getView().byId("compDdose").setValueState(sap.ui.core.ValueState.Error);
			}
			if (errCompDose === "X") {
				error = "X";
				MessageBox.error("Please enter Comparator Daily Dose.");
				return error;
			}

			var oTable = this.getView().byId("valueCtryPricTab");
			var i = 0;
			for (i = 0; i < oTable.getItems().length; i++) {
				if (oTable.getItems()[i].getCells()[1].getValue() === "") {
					errPrice = "X";
					oTable.getItems()[i].getCells()[1].setValueState(sap.ui.core.ValueState.Error);
				} else {
					oTable.getItems()[i].getCells()[1].setValueState(sap.ui.core.ValueState.None);
				}
				if (oTable.getItems()[i].getCells()[2].getValue() === "") {
					errDate = "X";
					oTable.getItems()[i].getCells()[2].setValueState(sap.ui.core.ValueState.Error);
				} else {
					oTable.getItems()[i].getCells()[2].setValueState(sap.ui.core.ValueState.None);
				}
				if (oTable.getItems()[i].getCells()[3].getValue() === "") {
					errNotes = "X";
					oTable.getItems()[i].getCells()[3].setValueState(sap.ui.core.ValueState.Error);
				} else {
					oTable.getItems()[i].getCells()[3].setValueState(sap.ui.core.ValueState.None);
				}
			}
			if (errPrice === "X" && errDate === "X" && errNotes === "X" ||
				errPrice === "X" && errDate === "X" ||
				errDate === "X" && errNotes === "X" ||
				errPrice === "X" && errNotes === "X") {
				error = "X";
				MessageBox.error("Please enter all mandatory fields.");
			} else {
				if (errPrice === "X") {
					error = "X";
					MessageBox.error("Please enter Price.");
				}
				if (errNotes === "X") {
					error = "X";
					MessageBox.error("Please enter Notes.");
				}
				if (errDate === "X") {
					error = "X";
					MessageBox.error("Please Pull Date.");
				}
			}
			return error;
		},

		onSaveCalcPrice: function () {
			var error = this.onValidateData();
			if (error === "X") {
				return;
			}
			var valuCtryPricModel = this.getView().getModel("valuCtryPricModel");
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			var valuSavePayLoad = {};
			valuSavePayLoad.ReqNo = reqHExtnModel.getData().ReqHExtnSet.ReqNo;
			valuSavePayLoad.Action = "C";
			valuSavePayLoad.TherapyTyp = reqHExtnModel.getData().ReqHExtnSet.TherapyTyp;
			valuSavePayLoad.BICComp = reqHExtnModel.getData().ReqHExtnSet.BICComp;
			valuSavePayLoad.BiosimComp = reqHExtnModel.getData().ReqHExtnSet.BiosimComp;
			valuSavePayLoad.CompDDose = reqHExtnModel.getData().ReqHExtnSet.CompDDose;
			valuSavePayLoad.CompNotes = reqHExtnModel.getData().ReqHExtnSet.CompNotes;
			valuSavePayLoad.ValuCtryPricSet = valuCtryPricModel.getData().ValuCtryPricSet;
			var i = 0;
			for (i = 0; i < valuSavePayLoad.ValuCtryPricSet.length; i++) {
				// if (valuSavePayLoad.ValuCtryPricSet[i].Price === "") {
				// 	valuSavePayLoad.ValuCtryPricSet[i].Price = "0.0000"; Defect 82 Fix to show zero price.
				// }
				valuSavePayLoad.ValuCtryPricSet[i].ReqNo = valuSavePayLoad.ReqNo;
				var currentDate = valuSavePayLoad.ValuCtryPricSet[i].PriceDate;
				if (currentDate) {
					if (currentDate.toString().length > 10) {
						var twoDigitMonth = ((currentDate.getMonth() + 1) >= 10) ? (currentDate.getMonth() + 1) : "0" + (currentDate.getMonth() + 1);
						var twoDigitDate = ((currentDate.getDate()) >= 10) ? (currentDate.getDate()) : "0" + (currentDate.getDate());
						var fullYear = currentDate.getFullYear();
						valuSavePayLoad.ValuCtryPricSet[i].PriceDate = twoDigitMonth + "/" + twoDigitDate + "/" + fullYear;
					}
				} else {
					valuSavePayLoad.ValuCtryPricSet[i].PriceDate = "00000000";
				}
			}
			this.saveCalcComplete = "";
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/ReqHeadExtnSet", valuSavePayLoad, {
				method: "POST",
				success: function (oData) {
					that.getView().byId("submitReq").setEnabled(true);
					that.getView().byId("avgPrice").setValue(oData.AvgWholesaleVal);
					reqHExtnModel.getData().ReqHExtnSet.AvgWholesaleVal = oData.AvgWholesaleVal;
					that.getView().setModel(reqHExtnModel, "reqHExtnModel");
					for (i = 0; i < valuSavePayLoad.ValuCtryPricSet.length; i++) {
						// if (valuSavePayLoad.ValuCtryPricSet[i].Price === "0.0000") {
						// 	valuSavePayLoad.ValuCtryPricSet[i].Price = ""; Defect 82 fix to show zero price.
						// }
						valuSavePayLoad.ValuCtryPricSet[i].ReqNo = valuSavePayLoad.ReqNo;
						if (valuSavePayLoad.ValuCtryPricSet[i].PriceDate === "00000000") {
							valuSavePayLoad.ValuCtryPricSet[i].PriceDate = "";
						} else {
							currentDate = valuSavePayLoad.ValuCtryPricSet[i].PriceDate;
							valuSavePayLoad.ValuCtryPricSet[i].PriceDate = new Date(currentDate);
						}
					}
					var msg = "Contego Request ";
					if (oData.RetMsgType === "E") {
						msg = oData.RetMsg;
					} else {
						that.saveCalcComplete = "X";
						msg = msg.concat(valuSavePayLoad.ReqNo, " Valuation has been Saved.");
					}
					MessageToast.show(msg, {
						duration: 4000,
						width: "25em",
						at: "center",
						onClose: function () {
							that.odataupdatecall = "X";
						}
					});
				},
				error: function () {}
			});
		},

		onSubmitReq: function (oEvent) {
			var error = this.onValidateData();
			if (error === "X") {
				return;
			}
			this.onSaveCalcPrice();
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			var aFilter = [];
			var oFilter;
			oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, this.getUserId());
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "IP");
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, reqHExtnModel.getData().ReqHExtnSet.ReqNo);
			aFilter.push(oFilter);
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/StatUpdtActionSet", {
				filters: aFilter,
				success: function (oData) {
					var msg = "Contego Request ";
					msg = msg.concat(reqHExtnModel.getData().ReqHExtnSet.ReqNo, " Valuation Submitted.");
					MessageToast.show(msg, {
						duration: 4000,
						width: "25em",
						at: "center",
						onClose: function () {
							var oHistory = History.getInstance();
							var sPreviousHash = oHistory.getPreviousHash();
							if (sPreviousHash !== undefined) {
								window.history.go(-1);
							} else {
								that.oRouter.navTo("MainView", true);
							}
						}
					});
				},
				error: function () {}
			});
		},

		onApprvReq: function () {
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			var aFilter = [];
			var oFilter;
			oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, this.getUserId());
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "AC");
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, reqHExtnModel.getData().ReqHExtnSet.ReqNo);
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("ApprvNotes", sap.ui.model.FilterOperator.EQ, reqHExtnModel.getData().ReqHExtnSet.ApprvNotes);
			aFilter.push(oFilter);
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/StatUpdtActionSet", {
				filters: aFilter,
				success: function (oData) {
					that.getView().byId("apprvReq").setEnabled(false);
					that.getView().byId("rejectReq").setEnabled(false);
					var msg = "Contego Request ";
					msg = msg.concat(reqHExtnModel.getData().ReqHExtnSet.ReqNo, " Approved.");
					MessageToast.show(msg, {
						duration: 4000,
						width: "25em",
						at: "center",
						onClose: function () {
							that.odataupdatecall = "X";
							that.onNavBack();
						}
					});
				},
				error: function () {}
			});
		},

		onRejectReq: function () {
			if (this.getView().byId("apprvNotes").getValue() === "") {
				MessageBox.error("Please fill Notes with reason for Rejection.");
				return;
			}
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			var aFilter = [];
			var oFilter;
			oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, this.getUserId());
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "RJ");
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, reqHExtnModel.getData().ReqHExtnSet.ReqNo);
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("ApprvNotes", sap.ui.model.FilterOperator.EQ, reqHExtnModel.getData().ReqHExtnSet.ApprvNotes);
			aFilter.push(oFilter);
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/StatUpdtActionSet", {
				filters: aFilter,
				success: function (oData) {
					that.getView().byId("apprvReq").setEnabled(false);
					that.getView().byId("rejectReq").setEnabled(false);
					var msg = "Contego Request ";
					msg = msg.concat(reqHExtnModel.getData().ReqHExtnSet.ReqNo, " Rejected.");
					MessageToast.show(msg, {
						duration: 4000,
						width: "25em",
						at: "center",
						onClose: function () {
							that.odataupdatecall = "X";
							that.onNavBack();
						}
					});
				},
				error: function () {}
			});
		},

		onSaveRequest: function () {
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			if (aAttachments.length > 0 || reqHExtnModel.getData().ReqHExtnSet.VFCNotes) {
				var valuSavePayLoad = {};
				valuSavePayLoad.ReqNo = reqHExtnModel.getData().ReqHExtnSet.ReqNo;
				valuSavePayLoad.Action = "S";
				valuSavePayLoad.VFCNotes = reqHExtnModel.getData().ReqHExtnSet.VFCNotes;
				if (this.getView().byId("sendToApprv").getText() === "Approve") {
					valuSavePayLoad.ApprvNotes = reqHExtnModel.getData().ReqHExtnSet.ApprvNotes;
				}
				if (aAttachments.length > 0) {
					valuSavePayLoad.ReqAttachmentSet = aAttachments;
				} else {
					valuSavePayLoad.ReqAttachmentSet = [];
				}
				var that = this;
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/ReqHeadExtnSet", valuSavePayLoad, {
					method: "POST",
					success: function (oData) {
						if (aAttachments.length > 0) {
							that.attmntSaved = "X";
							aAttachments = [];
							valuSavePayLoad.ReqAttachmentSet = aAttachments;
						}
						var msg = "Contego Request ";
						msg = msg.concat(valuSavePayLoad.ReqNo, " changes have been Saved.");
						MessageToast.show(msg, {
							duration: 4000,
							width: "25em",
							at: "center",
							onClose: function () {
								that.odataupdatecall = "X";
							}
						});
					},
					error: function (oData) {}
				});
			}
		},

		onRefReqNoClick: function (oEvent) {
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			var reqNo = reqHExtnModel.getData().ReqHExtnSet.RefReqNo;
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/ReqHeadExtnSet(ReqNo='" + reqNo + "')", {
				success: function (oData) {
					if (oData.PriceModel === "AC") {
						that.oRouter.navTo("ValuationActual", {
							reqId: oData.ReqNo,
							priceModel: "Actual",
							action: "DIS"
						});
					}
					if (oData.PriceModel === "CM") {
						that.oRouter.navTo("ValuationComp", {
							reqId: oData.ReqNo,
							priceModel: "Comparator",
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
					if (oData.PriceModel === "DS") {
						that.oRouter.navTo("ValuationDiscovery", {
							reqId: oData.ReqNo,
							priceModel: "Discovery",
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
				},
				error: function () {}
			});
		},

		onCurrReqNoClick: function (oEvent) {
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			var reqNo = reqHExtnModel.getData().ReqHExtnSet.CurrReqNo;
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/ReqHeadExtnSet(ReqNo='" + reqNo + "')", {
				success: function (oData) {
					var action;
					if (that.getTileRole() === "REQSTR" || userInfoModel.getData().ReqstorSet.Role === "CREATOR") {
						if (oData.ReqTyp === "U" && userInfoModel.getData().ReqstorSet.Update === "X") {
							action = "UPDT-DR";
						} else {
							action = "UPDT-DIS";
						}
						if (oData.ReqTyp === "R" && userInfoModel.getData().ReqstorSet.Renew === "X") {
							action = "REN-DR";
						} else {
							action = "DIS";
						}
					} else {
						if (oData.ReqTyp === "U") {
							action = "UPDT-DIS";
						}
						if (oData.ReqTyp === "R") {
							action = "DIS";
						}
					}
					if (oData.HStatus === "DR" || oData.HStatus === "RT" || oData.HStatus === "SB") {
						if (oData.ReqTyp === "U") {
							that.oRouter.navTo("UpdateRequest", {
								reqId: oData.ReqNo,
								action: action
							});
						}
						if (oData.ReqTyp === "R") {
							that.oRouter.navTo("RenewRequest", {
								reqNo: oData.ReqNo,
								action: action
							});
						}
					} else {
						if (that.getTileRole() === "APPRVR") {
							action = "DIS-APRV";
						} else {
							action = "DIS";
						}
						that.oRouter.navTo("ValuationComp", {
							reqId: oData.ReqNo,
							priceModel: "Comparator",
							action: action
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
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
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
				content.ReqNo = reqHExtnModel.getData().ReqHExtnSet.ReqNo;
				var pad = "0000000000";
				content.ReqNo = (pad + content.ReqNo).slice(-pad.length);
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
				var oTable = that.getView().byId("valuAttchTab");
				var oTemplate = oTable.getBindingInfo("items").template;
				oTable.unbindAggregation("items");
				oTable.bindAggregation("items", {
					path: "fileAttachmentModel>/attachments",
					template: oTemplate
				});
				content.Action = "C"; //Create
				content.AttchTyp = "VFCMGR";
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
			var oTable = this.getView().byId("valuAttchTab");
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
						var pad = "0000000000";
						sAttFile.ReqNo = (pad + sAttFile.ReqNo).slice(-pad.length);
						sAttFile.FileName = fileAttachmentModel.getData().attachments[i].FileName;
						sAttFile.FileType = fileAttachmentModel.getData().attachments[i].FileType;
						sAttFile.Action = "D"; //Delete
						sAttFile.AttchTyp = "VFCMGR";
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
			var attachType = "VFCMGR";
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			var reqNo = reqHExtnModel.getData().ReqHExtnSet.ReqNo;
			var pad = "0000000000";
			reqNo = (pad + reqNo).slice(-pad.length);
			this.onFileDownloadClick(oEvent, aAttachments, attachType, reqNo);
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

		onRefreshView: function () {
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			reqHExtnModel.setProperty("/ReqHExtnSet", null);
			this.getView().setModel(reqHExtnModel, "reqHExtnModel");
			var valuCtryPricModel = this.getView().getModel("valuCtryPricModel");
			aValuCtryPricTab = [];
			valuCtryPricModel.setProperty("/ValuCtryPricSet", aValuCtryPricTab);
			this.getView().setModel(valuCtryPricModel, "valuCtryPricModel");
			this.getView().byId("therapy").setEditable(false);
			this.getView().byId("compDrug").setEnabled(false);
			this.getView().byId("biosim").setEnabled(false);
			this.getView().byId("compDdose").setEnabled(false);
			this.getView().byId("dosageNotes").setEnabled(false);
			this.getView().byId("iTabBarComparator").setSelectedKey(null);
			this.getView().byId("fileUploader").setValue("");
			this.getView().byId("compDrug").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("sendToApprv").setEnabled(true);
			this.getView().byId("returnReq").setEnabled(true);
			this.getView().byId("saveReq").setEnabled(true);
			this.getView().byId("apprvReq").setEnabled(true);
			this.getView().byId("rejectReq").setEnabled(true);
			this.getView().byId("refReqE").setVisible(false);
			this.getView().byId("sendToApprv").setText("Send for Approval");
			this.attmntSaved = "";
			getAttchmntCall = "";
			if (this.mActionsheets) {
				this.mActionsheets.ActionSheetSubFunctions._oControl.getButtons()[1].setEnabled(true);
			}
			this.initializeModels();
		},

		onPDFDownload: function () {
			var reqNo = this.getView().getModel("reqHExtnModel").getData().ReqHExtnSet.ReqNo;
			this.onRequestPDFDownload(reqNo);
		},

		onGetCompDrugPrice: function () {
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			var valuCtryPricModel = this.getView().getModel("valuCtryPricModel");
			var compDrugPricePayLoad = {};
			compDrugPricePayLoad.ReqNo = reqHExtnModel.getData().ReqHExtnSet.ReqNo;
			compDrugPricePayLoad.BICCompDrug = this.getView().byId("compDrug").getValue();
			var aPriceSet = [];
			compDrugPricePayLoad.ValuCtryPricSet = aPriceSet; //valuCtryPricModel.getData().ValuCtryPricSet;
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			// Note: Create is used as a READ operation, & not to create/save anything. OData trick! GODBOV01
			oModel.create("/BICHistPriceSet", compDrugPricePayLoad, {
				success: function (oData) {
					var i = 0;
					if (oData.ValuCtryPricSet.results.length > 0) {
						that.getView().byId("compDdose").setValue(oData.CompDDose);
						that.getView().byId("dosageNotes").setValue(oData.CompNotes);
						that.getView().byId("avgPrice").setValue(oData.AvgWholesaleVal);
						aValuCtryPricTab = [];
						for (i = 0; i < oData.ValuCtryPricSet.results.length; i++) {
							oData.ValuCtryPricSet.results.ReqNo = compDrugPricePayLoad.ReqNo;
							// if (oData.ValuCtryPricSet.results[i].Price === "0.0000") {
							// oData.ValuCtryPricSet.results[i].Price = ""; Defect 82 Fix to show zero price.
							// }
							if (oData.ValuCtryPricSet.results[i].PriceDate === "00000000") {
								oData.ValuCtryPricSet.results[i].PriceDate = null;
							} else {
								oData.ValuCtryPricSet.results[i].PriceDate = new Date(oData.ValuCtryPricSet.results[i].PriceDate);
							}
							aValuCtryPricTab.push(oData.ValuCtryPricSet.results[i]);
						}
						valuCtryPricModel.setProperty("/ValuCtryPricSet", aValuCtryPricTab);
						that.getView().setModel(valuCtryPricModel, "valuCtryPricModel");
						MessageToast.show("Last Price Copied", {
							duration: 3000,
							width: "25em",
							at: "center"
						});
					} else {
						MessageToast.show("Last Price Not Found", {
							duration: 4000,
							width: "25em",
							at: "center"
						});
					}
				},
				error: function () {
					// MessageBox.show("oModel.read.Failed");
				}
			});
		},

		onReqAuditLog: function () {
			var oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, this.reqNo);
			var aFilter = [];
			aFilter.push(oFilter);
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/ReqAuditLogSet", {
				filters: aFilter,
				success: function (oData) {
					var reqAudtLogModel = that.getView().getModel("reqAudtLogModel");
					reqAudtLogModel.setProperty("/ReqAudtLogSet", oData.results);
					that.getView().setModel(reqAudtLogModel, "reqAudtLogModel");
					// create fragment dialog
					if (!that._auditLogDialog) {
						var auditLogFrag = "ReqAuditLogFrag-" + that.getView().getId();
						that._auditLogDialog = new sap.ui.xmlfragment(
							auditLogFrag,
							"com.pfizer.ctg.CTG_REQ.view.fragments.AuditLog", that);
					}
					that.getView().addDependent(that._auditLogDialog);
					that._auditLogDialog.open();
				},
				error: function () {}
			});
		},

		onAuditLogClose: function () {
			this._auditLogDialog.close();
		},

		onProdMstrLink: function () {
			var oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, this.reqNo);
			var aFilter = [];
			aFilter.push(oFilter);
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/ProdSummarySet", {
				filters: aFilter,
				success: function (oData) {
					var prodSummModel = that.getView().getModel("prodSummModel");
					prodSummModel.setProperty("/ProdSummSet", oData.results);
					that.getView().setModel(prodSummModel, "prodSummModel");
					// create fragment dialog
					if (!that._prodSummDialog) {
						var prodSummFrag = "ProdSummFrag-" + that.getView().getId();
						that._prodSummDialog = new sap.ui.xmlfragment(
							prodSummFrag,
							"com.pfizer.ctg.CTG_REQ.view.fragments.ProdSummary", that);
					}
					that.getView().addDependent(that._prodSummDialog);
					that._prodSummDialog.open();
				},
				error: function () {}
			});
		},

		onProdSummClose: function () {
			this._prodSummDialog.close();
		},

		onNavBack: function () {
			//Check if the oData call is executed on ActionSheet Fragment.
			if (this.oView.odataupdatecall) {
				this.odataupdatecall = this.oView.odataupdatecall;
			}
			this.onRefreshView();
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
			this.onRefreshView();
			this.onReturnToHome();
		}
	});
});