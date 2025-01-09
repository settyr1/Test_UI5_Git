sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, ManagedObject, MessageBox, MessageToast) {

	var extendReqFrag;

	return ManagedObject.extend("com.pfizer.ctg.CTG_REQ.controller.ValuationComparator.ActionSheetSubFunctions", {
		constructor: function (oView) {
			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "com.pfizer.ctg.CTG_REQ.view.fragments.ActionsSubFunc", this);
			this._bInit = false;
		},

		exit: function () {
			delete this._oView;
		},

		getView: function () {
			return this._oView;
		},

		getControl: function () {
			return this._oControl;
		},

		getOwnerComponent: function () {
			return this._oView.getController().getOwnerComponent();
		},

		open: function () {
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			var oView = this._oView;
			var oControl = this._oControl;
			var expDate = oView.getModel("reqHExtnModel").getData().ReqHExtnSet.ExpDateYMD;
			if (expDate.length > 10) {
				expDate = expDate.substr(0, expDate.length - 2);
			}
			var expiryDate = new Date(expDate);
			expiryDate.setDate(expiryDate.getDate() - 30);
			var futureDate = new Date(expDate);
			futureDate.setDate(futureDate.getDate() + 30);
			var currentDate = new Date();
			if (oView.getModel("reqHExtnModel").getData().ReqHExtnSet.PriceModel === "AC") {
				if (currentDate >= expiryDate) {
					//We are in 30 day window of expiration
					if (userInfoModel.getData().ReqstorSet.Role === "CREATOR" && userInfoModel.getData().ReqstorSet.Renew === "X") {
						this._oControl.getButtons()[2].setVisible(true); //Renew
					} else {
						this._oControl.getButtons()[2].setVisible(false); //Renew
					}
					this._oControl.getButtons()[0].setVisible(false); //Append
				}
				if (currentDate < expiryDate) {
					//Expiry date is more than 30 days
					if (userInfoModel.getData().ReqstorSet.Role === "CREATOR" && userInfoModel.getData().ReqstorSet.Append === "X") {
						this._oControl.getButtons()[0].setVisible(true); //Append
					} else {
						this._oControl.getButtons()[0].setVisible(false); //Append
					}
					this._oControl.getButtons()[2].setVisible(false); //Renew
				}
			}
			if (oView.getModel("reqHExtnModel").getData().ReqHExtnSet.PriceModel === "CM" ||
				oView.getModel("reqHExtnModel").getData().ReqHExtnSet.PriceModel === "DS" ||
				oView.getModel("reqHExtnModel").getData().ReqHExtnSet.PriceModel === "FC") {
				if (currentDate >= expiryDate) {
					if (currentDate >= futureDate) {
						//We are over +30 days past expiration. Cannot Extend. Just Renew.
						this._oControl.getButtons()[1].setVisible(false); //Extend
					} else {
						//We are in 30 day window of expiration
						if (userInfoModel.getData().ReqstorSet.Role === "CREATOR" && userInfoModel.getData().ReqstorSet.Extend === "X") {
							this._oControl.getButtons()[1].setVisible(true); //Extend
						} else {
							//New if condition code by DOGIPA since valuator role is not getting read in ReqstorSet
							if (userInfoModel.getData().VFCMgrSet.Role === "VALUATOR" && userInfoModel.getData().VFCMgrSet.Extend === "X") {
								//
								// if (userInfoModel.getData().ReqstorSet.Role === "VALUATOR" && userInfoModel.getData().VFCMgrSet.Extend === "X") {
								this._oControl.getButtons()[1].setVisible(true); //Extend
							} else {
								this._oControl.getButtons()[1].setVisible(false);
							}
						}
					}
					if (userInfoModel.getData().ReqstorSet.Role === "CREATOR" && userInfoModel.getData().ReqstorSet.Renew === "X") {
						this._oControl.getButtons()[2].setVisible(true); //Renew
					} else {
						this._oControl.getButtons()[2].setVisible(false); //Renew
					}
					this._oControl.getButtons()[3].setVisible(false); //Update
				}
				if (currentDate < expiryDate) {
					//Expiry date is more than 30 days
					if (userInfoModel.getData().ReqstorSet.Role === "CREATOR" && userInfoModel.getData().ReqstorSet.Update === "X") {
						this._oControl.getButtons()[3].setVisible(true); //Update
					} else {
						this._oControl.getButtons()[3].setVisible(false); //Update
					}
					this._oControl.getButtons()[1].setVisible(false); //Extend					
					this._oControl.getButtons()[2].setVisible(false); //Renew
				}
			}
			if (oView.getModel("reqHExtnModel").getData().ReqHExtnSet.PriceModel === "CP") {
				if (currentDate >= expiryDate) {
					//We are in 30 day window of expiration
					if (currentDate >= futureDate) {
						//We are over +30 days past expiration. Cannot Extend. Just Renew.
						this._oControl.getButtons()[1].setVisible(false); //Extend
					} else {
						if (userInfoModel.getData().ReqstorSet.Role === "CREATOR" && userInfoModel.getData().ReqstorSet.Extend === "X") {
							this._oControl.getButtons()[1].setVisible(true); //Extend
						} else {
							//New if condition code by DOGIPA since valuator role is not getting read in ReqstorSet
							if (userInfoModel.getData().VFCMgrSet.Role === "VALUATOR" && userInfoModel.getData().VFCMgrSet.Extend === "X") {
								// if (userInfoModel.getData().ReqstorSet.Role === "VALUATOR" && userInfoModel.getData().VFCMgrSet.Extend === "X") {
								this._oControl.getButtons()[1].setVisible(true); //Extend
							} else {
								this._oControl.getButtons()[1].setVisible(false);
							}
						}
					}
					if (userInfoModel.getData().ReqstorSet.Role === "CREATOR" && userInfoModel.getData().ReqstorSet.Renew === "X") {
						this._oControl.getButtons()[2].setVisible(true); //Renew
					} else {
						this._oControl.getButtons()[2].setVisible(false); //Renew
					}
				} else {
					this._oControl.getButtons()[1].setVisible(false); //Extend
					this._oControl.getButtons()[2].setVisible(false); //Renew 					
				}
			}

			if (!this._bInit) {
				// Initialize our fragment
				this.onInit();
				this._bInit = true;
				// connect fragment to the root view of this component (models, lifecycle)
				oView.addDependent(oControl);
			}

			var args = Array.prototype.slice.call(arguments);
			if (oControl.open) {
				oControl.open.apply(oControl, args);
			} else if (oControl.openBy) {
				oControl.openBy.apply(oControl, args);
			}
		},

		close: function () {
			this._oControl.close();
		},

		setRouter: function (oRouter) {
			this.oRouter = oRouter;

		},
		getBindingParameters: function () {
			return {};

		},
		onInit: function () {

			this._oDialog = this.getControl();

		},
		onExit: function () {
			this._oDialog.destroy();
		},

		onAppendAction: function () {
			var oView = this._oView;
			if (oView.getModel("reqHExtnModel").getData().ReqHExtnSet.PriceModel === "AC") {
				//Prepare for Display request  			
				var sReqHead = oView.getModel("reqHExtnModel").getData().ReqHExtnSet;
				this.oRouter.navTo("AppendRequest", {
					reqId: sReqHead.ReqNo,
					action: "EDIT"
				});
			}
		},

		onExtendAction: function (oEvent) {
			var oView = this._oView;
			var sReqHead = oView.getModel("reqHExtnModel").getData().ReqHExtnSet;
			var userInfoModel = oView.getModel("userInfoModel");
			// create value help dialog
			var sInputValue = oEvent.getSource().getText();
			if (!this._valueHelpDialog) {
				extendReqFrag = "ExtendReqFrag-" + oView.getId();
				this._valueHelpDialog = new sap.ui.xmlfragment(
					extendReqFrag,
					"com.pfizer.ctg.CTG_REQ.view.fragments.ExtendRequest", this);
			}
			this.getView().addDependent(this._valueHelpDialog);
			if (sReqHead.HStatus === "AC" && userInfoModel.getData().ReqstorSet.Role === "CREATOR") {
				if (sReqHead.ExpDate.indexOf("") >= 0){
					sap.ui.core.Fragment.byId(extendReqFrag, "reqExtn").setVisible(true);
					sap.ui.core.Fragment.byId(extendReqFrag, "apprvExtn").setVisible(false);
					sap.ui.core.Fragment.byId(extendReqFrag, "bReqExtn").setVisible(true);
					sap.ui.core.Fragment.byId(extendReqFrag, "bReject").setVisible(false);
					sap.ui.core.Fragment.byId(extendReqFrag, "bApprv").setVisible(false);
				}
			}
			if (sReqHead.HStatus === "AC" && userInfoModel.getData().VFCMgrSet.Role === "VALUATOR") {
				if (sReqHead.ExpDate.indexOf("**") >= 0){
					sap.ui.core.Fragment.byId(extendReqFrag, "reqExtn").setVisible(false);
					sap.ui.core.Fragment.byId(extendReqFrag, "apprvExtn").setVisible(true);
					sap.ui.core.Fragment.byId(extendReqFrag, "bReject").setVisible(true);
					sap.ui.core.Fragment.byId(extendReqFrag, "bApprv").setVisible(true);
					sap.ui.core.Fragment.byId(extendReqFrag, "bReqExtn").setVisible(false);
				}
			}
			this._valueHelpDialog.open(sInputValue);
		},

		onReqNotesChange: function () {
			if (sap.ui.core.Fragment.byId(extendReqFrag, "reqExtNotes").getValue() !== "") {
				sap.ui.core.Fragment.byId(extendReqFrag, "reqExtNotes").setValueState(sap.ui.core.ValueState.None);
			}

		},

		onVfcNotesChange: function () {
			if (sap.ui.core.Fragment.byId(extendReqFrag, "apprvExtNotes").getValue() !== "") {
				sap.ui.core.Fragment.byId(extendReqFrag, "apprvExtNotes").setValueState(sap.ui.core.ValueState.None);
			}
		},

		onVfcDateChange: function () {
			if (sap.ui.core.Fragment.byId(extendReqFrag, "extnDate").getValue() !== "") {
				sap.ui.core.Fragment.byId(extendReqFrag, "extnDate").setValueState(sap.ui.core.ValueState.None);
			}
			var extnDate = sap.ui.core.Fragment.byId(extendReqFrag, "extnDate").getValue();
			extnDate = new Date(extnDate);
			var currentDate = new Date();
			if (extnDate < currentDate) {
				sap.ui.core.Fragment.byId(extendReqFrag, "extnDate").setValueState(sap.ui.core.ValueState.Error);
				MessageBox.error("Extension date cannot be in past");
				return;
			} else {
				sap.ui.core.Fragment.byId(extendReqFrag, "extnDate").setValueState(sap.ui.core.ValueState.None);
			}
			var oView = this._oView;
			var expDate = oView.getModel("reqHExtnModel").getData().ReqHExtnSet.ExpDateYMD;
			if (expDate.length > 10) {
				expDate = expDate.substr(0, expDate.length - 2);
			}
			var expiryDate = new Date(expDate);
			var futureExpDate = new Date(expiryDate);
			futureExpDate.setFullYear(futureExpDate.getFullYear() + 1);
			if (extnDate > futureExpDate) {
				sap.ui.core.Fragment.byId(extendReqFrag, "extnDate").setValueState(sap.ui.core.ValueState.Error);
				MessageBox.error("Extension >1 year from current expiry date is not permitted");
				return;
			} else {
				sap.ui.core.Fragment.byId(extendReqFrag, "extnDate").setValueState(sap.ui.core.ValueState.None);
			}
		},

		onRequestExtn: function () {
			var oView = this._oView;
			var sReqHead = oView.getModel("reqHExtnModel").getData().ReqHExtnSet;
			var reqNotes = sap.ui.core.Fragment.byId(extendReqFrag, "reqExtNotes").getValue();
			if (reqNotes === "") {
				sap.ui.core.Fragment.byId(extendReqFrag, "reqExtNotes").setValueState(sap.ui.core.ValueState.Error);
				MessageBox.error("Please enter reason for extension");
				return;
			}
			var aFilter = [];
			var oFilter;
			oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "ER"); //Request Extension
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, sReqHead.ReqNo);
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("ReqNotes", sap.ui.model.FilterOperator.EQ, reqNotes);
			aFilter.push(oFilter);
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/StatUpdtActionSet", {
				filters: aFilter,
				success: function (oData) {
					that._oView.odataupdatecall = "X";
					that._oControl.getButtons()[1].setEnabled(false); //Disable Extend button
					that._valueHelpDialog.close();
					var msg = "Contego Request ";
					msg = msg.concat(sReqHead.ReqNo, " extension is Requested.");
					MessageToast.show(msg, {
						duration: 4000,
						width: "25em",
						at: "center",
						onClose: function () {
							//Do something...
						}
					});
				},
				error: function () {}
			});
		},

		onApprvExtn: function () {
			var oView = this._oView;
			var sReqHead = oView.getModel("reqHExtnModel").getData().ReqHExtnSet;
			var vfcNotes = sap.ui.core.Fragment.byId(extendReqFrag, "apprvExtNotes").getValue();
			if (vfcNotes === "") {
				sap.ui.core.Fragment.byId(extendReqFrag, "apprvExtNotes").setValueState(sap.ui.core.ValueState.Error);
				MessageBox.error("Please enter notes for extension approval");
				return;
			}
			var extnDate = sap.ui.core.Fragment.byId(extendReqFrag, "extnDate").getValue();
			if (extnDate === "") {
				sap.ui.core.Fragment.byId(extendReqFrag, "extnDate").setValueState(sap.ui.core.ValueState.Error);
				MessageBox.error("Please select new expiration date");
				return;
			}
			var oExpDate = sap.ui.core.Fragment.byId(extendReqFrag, "extnDate").getDateValue();
			if (oExpDate.toString().length > 10) {
				var twoDigitMonth = ((oExpDate.getMonth() + 1) >= 10) ? (oExpDate.getMonth() + 1) : "0" + (oExpDate.getMonth() + 1);
				var twoDigitDate = ((oExpDate.getDate()) >= 10) ? (oExpDate.getDate()) : "0" + (oExpDate.getDate());
				var fullYear = oExpDate.getFullYear();
				extnDate = twoDigitMonth + "/" + twoDigitDate + "/" + fullYear;
			}
			var aFilter = [];
			var oFilter;
			oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "EA"); //Approve Extension
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, sReqHead.ReqNo);
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("ExpDate", sap.ui.model.FilterOperator.EQ, extnDate);
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("VFCNotes", sap.ui.model.FilterOperator.EQ, vfcNotes);
			aFilter.push(oFilter);
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/StatUpdtActionSet", {
				filters: aFilter,
				success: function (oData) {
					that._oView.odataupdatecall = "X";
					that._oControl.getButtons()[1].setEnabled(false); //Disable Extend button
					that._valueHelpDialog.close();
					var msg = "Contego Request ";
					msg = msg.concat(sReqHead.ReqNo, " extension is Approved.");
					MessageToast.show(msg, {
						duration: 4000,
						width: "25em",
						at: "center",
						onClose: function () {
							//Do something...
						}
					});
				},
				error: function () {}
			});
		},

		onRejectExtn: function () {
			var oView = this._oView;
			var sReqHead = oView.getModel("reqHExtnModel").getData().ReqHExtnSet;
			var vfcNotes = sap.ui.core.Fragment.byId(extendReqFrag, "apprvExtNotes").getValue();
			if (vfcNotes === "") {
				sap.ui.core.Fragment.byId(extendReqFrag, "apprvExtNotes").setValueState(sap.ui.core.ValueState.Error);
				MessageBox.error("Please enter reason for Rejection");
				return;
			}
			var aFilter = [];
			var oFilter;
			oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "EJ"); //Approve Extension
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, sReqHead.ReqNo);
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("VFCNotes", sap.ui.model.FilterOperator.EQ, vfcNotes);
			aFilter.push(oFilter);
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/StatUpdtActionSet", {
				filters: aFilter,
				success: function (oData) {
					that._oView.odataupdatecall = "X";
					that._oControl.getButtons()[1].setEnabled(false); //Disable Extend button
					that._valueHelpDialog.close();
					var msg = "Contego Request ";
					msg = msg.concat(sReqHead.ReqNo, " extension has been rejected.");
					MessageToast.show(msg, {
						duration: 4000,
						width: "25em",
						at: "center",
						onClose: function () {
							//Do something...
						}
					});
				},
				error: function () {}
			});
		},

		onCloseExtn: function () {
			this._valueHelpDialog.close();
		},

		onRenewAction: function () {
			var oView = this._oView;
			this.oRouter.navTo("RenewRequest", {
				reqNo: oView.getModel("reqHExtnModel").getData().ReqHExtnSet.ReqNo,
				action: "REN"
			});
		},

		onUpdateAction: function () {
			var oView = this._oView;
			var reqNo = oView.getModel("reqHExtnModel").getData().ReqHExtnSet.ReqNo;
			this.oRouter.navTo("UpdateRequest", {
				reqId: reqNo,
				action: "UPDT"
			});
		}

	});
}, /* bExport= */ true);