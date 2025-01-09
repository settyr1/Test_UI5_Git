sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"./ActionSheetSubFunctions",
	"sap/ui/core/routing/History",
	"com/pfizer/ctg/CTG_REQ/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function (Controller, ActionSheetSubFunctions, History, Formatter, MessageToast, MessageBox, Export, ExportTypeCSV) {
	"use strict";

	var aAttachments = [];
	var getAttchmntCall = "";
	this.odataupdatecall = "";

	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.ValuationActual", {

		formatter: Formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function (oEvent) {
			if (oEvent.getParameters().name !== "ValuationActual") {
				return;
			}
			this.odataupdatecall = undefined;
			getAttchmntCall = "";
			aAttachments = [];
			this.attmntSaved = "";
			this.reqNo = oEvent.getParameters("ValuationActual").arguments.reqId;
			var pad = "0000000000";
			this.reqNo = (pad + this.reqNo).slice(-pad.length);
			this.priceModel = oEvent.getParameters("ValuationActual").arguments.priceModel;
			this.action = oEvent.getParameters("ValuationActual").arguments.action;
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
					var aValuTab = [];
					var j = 0;
					for (j = 0; j < oData.ReqDetailsSet.results.length; j++) {
						var item = {};
						item = oData.ReqDetailsSet.results[j];
						if (that.action === "UPD-VFC") {
							if (oData.ReqDetailsSet.results[j].ItemStat === "AC") {
								item.isEditable = false;
							} else {
								item.isEditable = true;
							}
						} else {
							item.isEditable = false;
						}
						aValuTab.push(item);
					}
					reqDetailsModel.setProperty("/ReqDetailsSet", aValuTab);
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
				this.getView().byId("iTFValuPrdTyp").setVisible(false);
			} else {
				this.getView().byId("iTFValuPrdTyp").setVisible(true);
				var iTabTitle = "Valuation";
				iTabTitle = iTabTitle.concat("(", reqHExtnModel.getData().ReqHExtnSet.ProdTyp, ")");
				this.getView().byId("iTFValuPrdTyp").setText(iTabTitle);
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
			this.getView().byId("valuationTab").setVisibleRowCount(this.getView().getModel("reqDetailsModel").getData().ReqDetailsSet.length);
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			if (reqHExtnModel.getData().ReqHExtnSet.HStatus === "AC" || reqHExtnModel.getData().ReqHExtnSet.HStatus === "EX") {
				if (userInfoModel.getData().ReqstorSet.Role === "CREATOR" || userInfoModel.getData().ReqstorSet.Role === "VALUATOR") {
					if (reqHExtnModel.getData().ReqHExtnSet.ExpDate.indexOf("*") >= 0) {
						this.getView().byId("actionsButn").setVisible(false);
					} else {
						if (reqHExtnModel.getData().ReqHExtnSet.CurrReqNo) {
							this.getView().byId("actionsButn").setVisible(false);
						} else {
							this.getView().byId("actionsButn").setVisible(true);
						}
					}
				}
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
			var fileAttachmentModel = this.getView().getModel("fileAttachmentModel");
			var oAttchModel = this.getOwnerComponent().getModel();
			var that;
			if (oEvent.getSource().getSelectedKey().indexOf("iTFValuPrdTyp") >= 0) {
				//Upload/Download Valuation Sheet
				var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
				if (userInfoModel.getData().VFCMgrSet.Role === "VALUATOR") {
					this.getView().byId("dnloadButn").setVisible(true);
					this.getView().byId("excelUploader").setVisible(true);
				} else {
					this.getView().byId("dnloadButn").setVisible(false);
					this.getView().byId("excelUploader").setVisible(false);
				}
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
				this.getView().byId("submitReq").setVisible(false);
				this.getView().byId("saveReq").setVisible(false);
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
			this.getView().byId("cancelReq").setVisible(true);
			this.getView().byId("returnReq").setVisible(false);
			this.getView().byId("saveReq").setVisible(false);
			this.getView().byId("sendToApprv").setVisible(false);
			this.getView().byId("editReq").setVisible(false);
			this.getView().byId("submitReq").setVisible(true);
		},

		onCancelReq: function () {
			this.getView().byId("cancelReq").setVisible(false);
			this.getView().byId("returnReq").setVisible(false);
			this.getView().byId("saveReq").setVisible(false);
			this.getView().byId("sendToApprv").setVisible(false);
			this.getView().byId("editReq").setVisible(true);
			this.getView().byId("submitReq").setVisible(false);
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
			this.onSaveRequest(); //To Save VFC Notes before return to requester.		
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
			var sReqHead = reqHExtnModel.getData().ReqHExtnSet;
			var aFilter = [];
			var oFilter;
			oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, this.getUserId());
			aFilter.push(oFilter);
			if (sReqHead.HStatus === "IP") {
				oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "AP");
			}
			if (sReqHead.HStatus === "AI") {
				oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "AA");
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
					that.getView().byId("avgPriceSave").setEnabled(false);
					var oTable = that.getView().byId("valuationTab");
					for (var i = 0; i < oTable.getRows().length; i++) {
						oTable.getRows()[i].getCells()[4].setEditable(false);
						oTable.getRows()[i].getCells()[5].setEditable(false);
						oTable.getRows()[i].getCells()[7].setEditable(false);
					}
					var msg = "Contego Request ";
					msg = msg.concat(reqHExtnModel.getData().ReqHExtnSet.ReqNo, " Sent for Approval.");
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

		onUnitPriceChange: function (oEvent) {
			var _oInput = oEvent.getSource();
			var val = _oInput.getValue();
			if (val === "") {
				_oInput.setValue("0.000000");
			}
			if (val.length >= 1 && val.match(/[1-9]/g)) {
				_oInput.setValueState("None");
			} else {
				// _oInput.setValueState("Error");
			}
			// var reqDetailsModel = this.getView().getModel("reqDetailsModel");
			// var sPath = oEvent.getSource().getBindingInfo("value").binding.getContext().sPath;
			// var iRowIndex = parseInt(sPath.substring(sPath.length - 1), 20);
			// reqDetailsModel.getData().ReqDetailsSet[iRowIndex].UnitPrice = oEvent.getSource().getValue();
			// this.getView().setModel(reqDetailsModel, "reqDetailsModel");
			// var oTable = this.getView().byId("valuationTab");
			// for (var i = 0; i < oTable.getRows().length; i++) {
			// 	var result = oTable.getRows()[i].getCells()[4].getValue().match(/[1-9]/g);
			// 	if (result) {
			// 		oTable.getRows()[i].getCells()[4].setValueState(sap.ui.core.ValueState.None);
			// 	}
			// }
		},
		onValuNotesChange: function (oEvent) {
			var oTable = this.getView().byId("valuationTab");
			for (var i = 0; i < oTable.getRows().length; i++) {
				if (oTable.getRows()[i].getCells()[7].getValue() !== "") {
					oTable.getRows()[i].getCells()[7].setValueState(sap.ui.core.ValueState.None);
				}
			}
		},
		onFGIndChecked: function (oEvent) {
			var reqDetailsModel = this.getView().getModel("reqDetailsModel");
			var sPath = oEvent.getSource().getBindingInfo("selected").binding.getContext().sPath;
			//	var iRowIndex = parseInt(sPath.substring(sPath.length - 1), 20);
			//New line of code for defect 65 .... Checkbox value being hover to other rowindex 
			var iRowIndex = sPath.substring(15);
			if (oEvent.getSource().getSelected()) {
				reqDetailsModel.getData().ReqDetailsSet[iRowIndex].FGInd = "X";
			} else {
				reqDetailsModel.getData().ReqDetailsSet[iRowIndex].FGInd = "";
			}
			this.getView().setModel(reqDetailsModel, "reqDetailsModel");
		},
		onValidateData: function () {
			var error;
			var errorUnitPrice;
			var errorNotes;
			var oTable = this.getView().byId("valuationTab");
			for (var i = 0; i < oTable.getRows().length; i++) {
				var result = oTable.getRows()[i].getCells()[4].getValue().match(/[1-9]/g);
				if (!result) {
					oTable.getRows()[i].getCells()[4].setValueState(sap.ui.core.ValueState.Error);
					errorUnitPrice = "X";
				} else {
					oTable.getRows()[i].getCells()[4].setValueState(sap.ui.core.ValueState.None);
				}
				if (oTable.getRows()[i].getCells()[7].getValue() === "") {
					errorNotes = "X";
					oTable.getRows()[i].getCells()[7].setValueState(sap.ui.core.ValueState.Error);
				} else {
					oTable.getRows()[i].getCells()[7].setValueState(sap.ui.core.ValueState.None);
				}
			}
			if (errorUnitPrice === "X" && errorNotes === "X") {
				error = errorUnitPrice;
				MessageBox.error("Please enter Unit Price and Notes.");
			} else {
				if (errorUnitPrice === "X") {
					error = errorUnitPrice;
					MessageBox.error("Please enter Unit Price.");
				}
				if (errorNotes === "X") {
					error = errorNotes;
					MessageBox.error("Please enter Notes.");
				}
			}
			return error;
		},

		onSaveCalcPrice: function () {
			// var error = this.onValidateData();
			// if (error === "X") {
			// 	return;
			// }
			var reqDetailsModel = this.getView().getModel("reqDetailsModel");
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			var valuSavePayLoad = {};
			valuSavePayLoad.ReqNo = reqHExtnModel.getData().ReqHExtnSet.ReqNo;
			valuSavePayLoad.Action = "A";
			valuSavePayLoad.ReqDetailsSet = reqDetailsModel.getData().ReqDetailsSet.concat(); //New Array Ref
			var i = 0;
			for (i = 0; i < valuSavePayLoad.ReqDetailsSet.length; i++) {
				if (valuSavePayLoad.ReqDetailsSet[i].FGInd) {
					valuSavePayLoad.ReqDetailsSet[i].FGInd = "X";
				}
				delete valuSavePayLoad.ReqDetailsSet[i].isEditable;
			}
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			//New code added by DOGIPA for Sorting the Table after Save and Calculate
			// var oSorter = new sap.ui.model.Sorter("CtryKey", false);
			oModel.create("/ReqHeadExtnSet", valuSavePayLoad, {
				method: "POST",
				// sorter: oSorter,
				success: function (oData) {
					var aValuTab = [];
					var j = 0;
					for (j = 0; j < oData.ReqDetailsSet.results.length; j++) {
						var item = {};
						item = oData.ReqDetailsSet.results[j];
						if (that.action === "UPD-VFC") {
							if (oData.ReqDetailsSet.results[j].ItemStat === "AC") {
								item.isEditable = false;
							} else {
								item.isEditable = true;
							}
						} else {
							item.isEditable = false;
						}
						aValuTab.push(item);
					}
					reqDetailsModel.setProperty("/ReqDetailsSet", aValuTab);
					that.getView().setModel(reqDetailsModel, "reqDetailsModel");
					var oTable = that.getView().byId("valuationTab");
					var oTemplate = oTable.getBindingInfo("rows").template;
					oTable.unbindAggregation("rows");
					oTable.bindAggregation("rows", {
						path: "reqDetailsModel>/ReqDetailsSet",
						template: oTemplate
					});
					//New code by DOGIPA
					// that.byId("valuationTab").getBinding("rows").sort(oSorter);
					//
					var msg = "Contego Request ";
					if (oData.RetMsgType === "E") {
						msg = oData.RetMsg;
					} else {
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
							that.odataupdatecall = "X";
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
						that.oRouter.navTo("ValuationActual", {
							reqId: oData.ReqNo,
							priceModel: "Actual",
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
			var oTable = this.getView().byId("valuationTab");
			for (var i = 0; i < oTable.getRows().length; i++) {
				oTable.getRows()[i].getCells()[4].setValueState(sap.ui.core.ValueState.None);
				oTable.getRows()[i].getCells()[5].setValueState(sap.ui.core.ValueState.None);
				oTable.getRows()[i].getCells()[7].setValueState(sap.ui.core.ValueState.None);
			}
			this.attmntSaved = "";
			this.getView().byId("iTabBarComparator").setSelectedKey(null);
			this.getView().byId("fileUploader").setValue("");
			this.getView().byId("sendToApprv").setEnabled(true);
			this.getView().byId("returnReq").setEnabled(true);
			this.getView().byId("saveReq").setEnabled(true);
			this.getView().byId("apprvReq").setEnabled(true);
			this.getView().byId("rejectReq").setEnabled(true);
			this.getView().byId("refReqE").setVisible(false);
			var reqHExtnModel = this.getView().getModel("reqHExtnModel");
			reqHExtnModel.setProperty("/ReqHExtnSet", null);
			this.getView().setModel(reqHExtnModel, "reqHExtnModel");
			if (this.mActionsheets) {
				this.mActionsheets.ActionSheetSubFunctions._oControl.getButtons()[1].setEnabled(true);
			}
			this.initializeModels();
			getAttchmntCall = "";
		},

		onPDFDownload: function () {
			var reqNo = this.getView().getModel("reqHExtnModel").getData().ReqHExtnSet.ReqNo;
			this.onRequestPDFDownload(reqNo);
		},

		onDownloadValuExcel: function () {
			var oExport = new Export({
				exportType: new ExportTypeCSV({
					fileExtension: "xls",
					separatorChar: "\t"
				}),

				models: this.getView().getModel("reqDetailsModel"),

				rows: {
					path: "/ReqDetailsSet"
				},
				columns: [{
					name: "PosNum",
					template: {
						content: {
							parts: ["Posnr"],
							formatter: function (Posnr) {
								var posInd = "P" + Posnr;
								return posInd;
							}
						}
					}
				}, {
					name: "ReqNo",
					template: {
						content: "{ReqNo}"
					}
				}, {
					name: "Status",
					template: {
						content: {
							parts: ["ItmStatDesc"],
							formatter: function (ItmStatDesc) {
								var itmStat;
								if (ItmStatDesc === "In-Progress") {
									itmStat = "InProgress";
								} else {
									itmStat = ItmStatDesc;
								}
								return itmStat;
							}
						}
					}
				}, {
					name: "Destination",
					template: {
						content: "{DestTyp}"
					}
				}, {
					name: "Country",
					template: {
						content: "{CtryKey}"
					}
				}, {
					name: "Formulation",
					template: {
						content: {
							parts: [{
								path: "Strn1"
							}, {
								path: "UOM1"
							}, {
								path: "Strn2"
							}, {
								path: "UOM2"
							}, {
								path: "Strn3"
							}, {
								path: "UOM3"
							}],
							formatter: ".formatter.formatValuePerUnit"
						}
					}
				}, {
					name: "UnitPrice",
					template: {
						content: "{UnitPrice}"
					}
				}, {
					name: "FGValue",
					template: {
						content: {
							parts: ["FGInd"],
							formatter: function (FGInd) {
								var indFlag;
								if (FGInd === "X") {
									indFlag = "Y";
								} else {
									indFlag = "N";
								}
								return indFlag;
							}
						}
					}
				}, {
					name: "CalculatedValue",
					template: {
						content: "{CalcValue}"
					}
				}, {
					name: "Notes",
					template: {
						content: "{Comments}"
					}
				}]
			});

			// download exported file
			var fileName = "InProgress_Valuation_" + this.getView().getModel("reqHExtnModel").getData().ReqHExtnSet.ReqNo;
			oExport.saveFile(fileName).catch(function (oError) {
				MessageBox.error("Error when downloading data" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},

		onUploadValuExcel: function (oEvent) {
			var oUploader = this.getView().byId("excelUploader");
			var domRef = oUploader.getFocusDomRef();
			if (domRef.files.length <= 0) {
				return;
			}
			var file = domRef.files[0];
			this.fileName = oEvent.getParameter("files")[0].name;
			this.fileType = oEvent.getParameter("files")[0].type;
			var that = this;
			var reader = new FileReader();
			reader.onload = function (event) {
				/*global Uint8Array*/ //Declared global to avoid ESLINT error. - Vallabh.
				var bytes = new Uint8Array(event.currentTarget.result);
				var binary = "";
				var length = bytes.byteLength;
				for (var i = 0; i < length; i++) {
					binary += String.fromCharCode(bytes[i]);
				}
				var arrCSV = binary.match(/[\w ."?]+(?=,?)/g);
				var noOfCol = 10;
				var headerRow = arrCSV.splice(0, noOfCol);
				var data = [];
				var reqNoPad = "0000000000";
				var pad = "000000";
				noOfCol = 1;
				while (arrCSV.length > 0) {
					var record = {};
					noOfCol = noOfCol + 1;
					var padCol = (pad + noOfCol).slice(-pad.length);
					var colStr = "P" + padCol;
					var rowIndx;
					var excelData;
					if (arrCSV.indexOf(colStr) > 0) {
						rowIndx = arrCSV.indexOf(colStr);
						excelData = arrCSV.splice(0, rowIndx);
					} else {
						excelData = arrCSV.splice(0, arrCSV.length);
					}
					var notes = "";
					for (i = 0; i < excelData.length; i++) {
						if (i > 8) {
							notes = notes.concat(" ", excelData[i].trim());
							record[headerRow[9]] = notes;
						} else {
							record[headerRow[i]] = excelData[i].trim();
						}
					}
					if (record.Status === "InProgress") {
						record.Status = "In-Progress";
					}
					record.PosNum = (pad + record.PosNum).slice(-pad.length);
					record.ReqNo = (reqNoPad + record.ReqNo).slice(-reqNoPad.length);
					data.push(record);
				}

				var reqDetailsModel = that.getView().getModel("reqDetailsModel");
				var aValuTab = reqDetailsModel.getData().ReqDetailsSet;

				if (data.length === aValuTab.length) {
					var checkForError = "";
					for (i = 0; i < aValuTab.length; i++) {
						if (aValuTab[i].ItemStat !== "AC") {
							if (data[i].ReqNo !== aValuTab[i].ReqNo) {
								checkForError = "X";
							}

							data.filter(function (arr) {
								if (arr.PosNum === aValuTab[i].Posnr) {
									if (arr.PosNum === aValuTab[i].Posnr &&
										arr.ReqNo === aValuTab[i].ReqNo &&
										arr.Status === aValuTab[i].ItmStatDesc &&
										arr.Destination === aValuTab[i].DestTyp &&
										arr.Country === aValuTab[i].CtryKey) {
										if (arr.UnitPrice === "0") {
											aValuTab[i].UnitPrice = "0.000000";
										} else {
											aValuTab[i].UnitPrice = arr.UnitPrice;
										}
										if (arr.FGValue === "Y" || arr.FGValue === "y") {
											aValuTab[i].FGInd = "X";
										} else {
											aValuTab[i].FGInd = "";
										}
										aValuTab[i].Comments = arr.Notes;
									}
								}
							});
						}
					}
					if (!checkForError) {
						reqDetailsModel.setProperty("/ReqDetailsSet", aValuTab);
						that.getView().setModel(reqDetailsModel, "reqDetailsModel");
						var oTable = that.getView().byId("valuationTab");
						var oTemplate = oTable.getBindingInfo("rows").template;
						oTable.unbindAggregation("rows");
						oTable.bindAggregation("rows", {
							path: "reqDetailsModel>/ReqDetailsSet",
							template: oTemplate
						});
						
						for (i = 0; i < oTable.getRows().length; i++) {
							oTable.getRows()[i].getCells()[4].setValueState(sap.ui.core.ValueState.None);
							oTable.getRows()[i].getCells()[7].setValueState(sap.ui.core.ValueState.None);
						}
						
						MessageToast.show("Valuation Worksheet Uploaded", {
							duration: 4000,
							width: "25em",
							at: "center"
						});
					} else {
						MessageBox.error("Upload Failed. Req no incorrect for some records. Please recheck.");
					}
				} else {
					MessageBox.show("Worksheet Upload Failed. Row count mismatch! Please recheck file.");
				}
			};
			reader.readAsArrayBuffer(file);
		},

		onReqAuditLog:	function(){
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
							"com.pfizer.ctg.CTG_REQ.view.fragments.AuditLog", that );
					}
					that.getView().addDependent(that._auditLogDialog);					
					that._auditLogDialog.open();					
				},
				error: function () {}
			});			
		},
		
		onAuditLogClose:	function(){
			this._auditLogDialog.close();
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