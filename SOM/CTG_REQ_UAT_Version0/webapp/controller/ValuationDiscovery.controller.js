sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"./ActionSheetSubFunctions",
	"sap/ui/core/routing/History",
	"com/pfizer/ctg/CTG_REQ/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, ActionSheetSubFunctions, History, Formatter, MessageToast, MessageBox) {
	"use strict";

	var aAttachments = [];
	var getAttchmntCall = "";
	this.odataupdatecall = "";

	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.ValuationDiscovery", {

		formatter: Formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			if (oEvent.getParameters().name !== "ValuationDiscovery") {
				return;
			}
			this.odataupdatecall = undefined;
			aAttachments = [];
			getAttchmntCall = "";
			this.attmntSaved = "";
			this.reqNo = oEvent.getParameters("ValuationDiscovery").arguments.reqId;
			var pad = "0000000000";
			this.reqNo = (pad + this.reqNo).slice(-pad.length);
			this.priceModel = oEvent.getParameters("ValuationDiscovery").arguments.priceModel;
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
			this.getView().byId("returnReq").setVisible(false);
			this.getView().byId("saveReq").setVisible(false);
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
			}
			
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
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
			this.getView().byId("valuationTab").setVisibleRowCount(this.getView().getModel("reqDetailsModel").getData().ReqDetailsSet.length);
			if (reqHExtnModel.getData().ReqHExtnSet.ProdMstrU !== "2") {
				this.getView().byId("sendToApprv").setText("Approve");
			}
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			if (reqHExtnModel.getData().ReqHExtnSet.HStatus === "AC" || reqHExtnModel.getData().ReqHExtnSet.HStatus === "EX") {
				if (userInfoModel.getData().ReqstorSet.Role === "CREATOR" || userInfoModel.getData().ReqstorSet.Role === "VALUATOR") {
					if (reqHExtnModel.getData().ReqHExtnSet.CurrReqNo) {
						this.getView().byId("actionsButn").setVisible(false);
					} else {
						this.getView().byId("actionsButn").setVisible(true);
					}
				}
				//New code by DOGIPA to display action button for Discovery Pricing model
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
			var that;
			var fileAttachmentModel = this.getView().getModel("fileAttachmentModel");
			var oAttchModel = this.getOwnerComponent().getModel();

			if (oEvent.getSource().getSelectedKey().indexOf("iTFValuPrdTyp") >= 0) {
				if (this.action === "UPD-VFC") {
					this.getView().byId("returnReq").setVisible(true);
					this.getView().byId("saveReq").setVisible(true);
					this.getView().byId("sendToApprv").setVisible(true);
					this.getView().byId("fileUploader").setEnabled(true);
					this.getView().byId("bDelAttmnt").setEnabled(true);
					this.getView().byId("vfcMgrNotes").setEditable(true);
				} else {
					this.getView().byId("returnReq").setVisible(false);
					this.getView().byId("sendToApprv").setVisible(false);
					this.getView().byId("saveReq").setVisible(false);
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
				this.getView().byId("returnReq").setVisible(false);
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
						that.oRouter.navTo("ValuationDiscovery", {
							reqId: oData.ReqNo,
							priceModel: "Discovery",
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
			this.attmntSaved = "";
			this.getView().byId("iTabBarComparator").setSelectedKey(null);
			this.getView().byId("fileUploader").setValue("");
			this.getView().byId("sendToApprv").setEnabled(true);
			this.getView().byId("returnReq").setEnabled(true);
			this.getView().byId("saveReq").setEnabled(true);
			this.getView().byId("apprvReq").setEnabled(true);
			this.getView().byId("rejectReq").setEnabled(true);
			this.getView().byId("refReqE").setVisible(false);
			this.getView().byId("sendToApprv").setText("Send for Approval");
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