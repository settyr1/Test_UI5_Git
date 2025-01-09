sap.ui.define([
		"sap/ui/base/ManagedObject",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"sap/m/TablePersoController",
		"com/pfizer/ctg/CTG_REQ/model/wrkListPersoServ"
	],

	function (ManagedObject, MessageBox, MessageToast, TablePersoController, wrkListPersoServ) {

		return ManagedObject.extend("com.pfizer.ctg.CTG_REQ.controller.WorkListVFCMgr.WorkListVFCMgrExtn", {
			constructor: function (oCtrl) {
				this._oCtrl = oCtrl;
				this._bInit = false;
			},

			onSubmit: function () {
				this._oCtrl.byId("bProgress").setType("Transparent");
				this._oCtrl.byId("bReturn").setType("Transparent");
				this._oCtrl.byId("bAwaitSPI").setType("Transparent");
				this._oCtrl.byId("bAwaitAprval").setType("Transparent");
				this._oCtrl.byId("bDraft").setType("Transparent");

				this._oCtrl._showFormFragment("WrkListVFCMgrSB");

				var reqHeadModel = this._oCtrl.getView().getModel("reqHeadModel");
				reqHeadModel.setProperty("/ReqHeadSet", this._oCtrl.aDataSubmit);
				this._oCtrl.getView().setModel(reqHeadModel, "reqHeadModel");

				this._oCtrl.byId("bSubmit").setText("Submitted (" + this._oCtrl.aDataSubmit.length.toString() + ")");
				var oFrag = this._oCtrl._getFormFragment("WrkListVFCMgrSB").getAggregation("items")[0].getContent()[0];
				oFrag.getHeaderToolbar().getAggregation("content")[0].setText("Requests (" + this._oCtrl.aDataSubmit.length.toString() + ")");

				var oColl = oFrag.getColumns();
				var i = 0;
				for (i = 0; i < oColl.length; i++) {
					if (oColl[i].getId().indexOf("SbmtForInptDt") >= 0 ||
						oColl[i].getId().indexOf("SbmtForApprvDt") >= 0 ||
						oColl[i].getId().indexOf("SPInptName") >= 0 ||
						oColl[i].getId().indexOf("PrimInd") >= 0 ||
						oColl[i].getId().indexOf("PricModl") >= 0 ||
						oColl[i].getId().indexOf("ApprvName") >= 0) {
						oColl[i].setVisible(false);
					} else {
						oColl[i].setVisible(true);
					}
				}
			},

			onProgress: function () {
				this._oCtrl.byId("bSubmit").setType("Transparent");
				this._oCtrl.byId("bReturn").setType("Transparent");
				this._oCtrl.byId("bAwaitSPI").setType("Transparent");
				this._oCtrl.byId("bAwaitAprval").setType("Transparent");
				this._oCtrl.byId("bDraft").setType("Transparent");

				this._oCtrl._showFormFragment("WrkListVFCMgrIP");

				var i = 0;
				for (i = 0; i < this._oCtrl.aDataInprog.length; i++) {
					if (this._oCtrl.aDataInprog[i].Phase === "CM") {
						this._oCtrl.aDataComm.push(this._oCtrl.aDataInprog[i]);
					}
					if (this._oCtrl.aDataInprog[i].Phase === "PC") {
						this._oCtrl.aDataPreComm.push(this._oCtrl.aDataInprog[i]);
					}
				}
				var reqHeadModel = this._oCtrl.getView().getModel("reqHeadModel");
				reqHeadModel.setProperty("/ReqHeadSet", this._oCtrl.aDataComm);
				this._oCtrl.getView().setModel(reqHeadModel, "reqHeadModel");

				var reqHPreComModel = this._oCtrl.getView().getModel("reqHPreComModel");
				reqHPreComModel.setProperty("/ReqHPreCM", this._oCtrl.aDataPreComm);
				this._oCtrl.getView().setModel(reqHPreComModel, "reqHPreComModel");
				this._oCtrl.byId("bProgress").setText("In-progress (" + this._oCtrl.aDataInprog.length.toString() + ")");

				var oFrag = this._oCtrl._getFormFragment("WrkListVFCMgrIP");
				oFrag._getIconTabHeader().getItems()[1].getContent()[0].getHeaderToolbar().getContent()[0].setText("Requests (" + this._oCtrl.aDataComm
					.length.toString() +
					")");
				oFrag._getIconTabHeader().getItems()[0].getContent()[0].getHeaderToolbar().getContent()[0].setText("Requests (" + this._oCtrl.aDataPreComm
					.length.toString() +
					")");

				var oColl = oFrag._getIconTabHeader().getItems()[1].getContent()[0].getColumns();
				i = 0;
				for (i = 0; i < oColl.length; i++) {
					if (oColl[i].getId().indexOf("SbmtForInptDt") >= 0 ||
						oColl[i].getId().indexOf("SbmtForApprvDt") >= 0 ||
						oColl[i].getId().indexOf("ApprvName") >= 0 ||
						oColl[i].getId().indexOf("DevPhDesc") >= 0 ||
						oColl[i].getId().indexOf("CMHeadStatus") >= 0 ||
						oColl[i].getId().indexOf("SPInptName") >= 0) {
						oColl[i].setVisible(false);
					} else {
						oColl[i].setVisible(true);
					}
				}

				oColl = oFrag._getIconTabHeader().getItems()[0].getContent()[0].getColumns();
				i = 0;
				for (i = 0; i < oColl.length; i++) {
					if (oColl[i].getId().indexOf("PCSbmtForInptDt") >= 0 ||
						oColl[i].getId().indexOf("PCSbmtForApprvDt") >= 0 ||
						oColl[i].getId().indexOf("PCApprvName") >= 0 ||
						oColl[i].getId().indexOf("PCHeadStatus") >= 0 ||
						oColl[i].getId().indexOf("PCDevPhDesc") >= 0) {
						oColl[i].setVisible(false);
					} else {
						oColl[i].setVisible(true);
					}
				}
				//Pre-Commercial SP Inputter Disable field.
				var oTabItems = oFrag._getIconTabHeader().getItems()[0].getContent()[0].getAggregation("items");
				i = 0;
				for (i = 0; i < oTabItems.length; i++) {
					if (oTabItems[i].getCells()[8].getText() !== "Comparator") {
						oTabItems[i].getCells()[9].setEditable(false);
					} else {
						oTabItems[i].getCells()[9].setEditable(true);
					}
				}
			},

			onReturn: function () {
				this._oCtrl.byId("bSubmit").setType("Transparent");
				this._oCtrl.byId("bProgress").setType("Transparent");
				this._oCtrl.byId("bAwaitSPI").setType("Transparent");
				this._oCtrl.byId("bAwaitAprval").setType("Transparent");
				this._oCtrl.byId("bDraft").setType("Transparent");

				this._oCtrl._showFormFragment("WrkListVFCMgrALL");

				var reqHeadModel = this._oCtrl.getView().getModel("reqHeadModel");
				reqHeadModel.setProperty("/ReqHeadSet", this._oCtrl.aDataRet);
				this._oCtrl.getView().setModel(reqHeadModel, "reqHeadModel");

				this._oCtrl.byId("bReturn").setText("Returned (" + this._oCtrl.aDataRet.length.toString() + ")");
				var oFrag = this._oCtrl._getFormFragment("WrkListVFCMgrALL");
				oFrag.getHeaderToolbar().getAggregation("content")[0].setText("Requests (" + this._oCtrl.aDataRet.length.toString() + ")");

				var oColl = oFrag.getColumns();
				var i = 0;
				for (i = 0; i < oColl.length; i++) {
					if (oColl[i].getId().indexOf("SbmtForInptDt") >= 0 ||
						oColl[i].getId().indexOf("SbmtForApprvDt") >= 0 ||
						oColl[i].getId().indexOf("SubmitDate") >= 0 ||
						oColl[i].getId().indexOf("ApprvName") >= 0 ||
						oColl[i].getId().indexOf("DevPhDesc") >= 0 ||
						oColl[i].getId().indexOf("PrimInd") >= 0 ||
						oColl[i].getId().indexOf("ALLPosnr") >= 0 ||
						oColl[i].getId().indexOf("ALLHeadStatus") >= 0 ||
						oColl[i].getId().indexOf("SPInptName") >= 0) {
						oColl[i].setVisible(false);
					} else {
						oColl[i].setVisible(true);
					}
				}
			},

			onAwaitSPI: function () {
				this._oCtrl.byId("bSubmit").setType("Transparent");
				this._oCtrl.byId("bProgress").setType("Transparent");
				this._oCtrl.byId("bReturn").setType("Transparent");
				this._oCtrl.byId("bAwaitAprval").setType("Transparent");
				this._oCtrl.byId("bDraft").setType("Transparent");

				this._oCtrl._showFormFragment("WrkListVFCMgrASP");

				var reqHeadModel = this._oCtrl.getView().getModel("reqHeadModel");
				reqHeadModel.setProperty("/ReqHeadSet", this._oCtrl.aDataAwaitSPInpt);
				this._oCtrl.getView().setModel(reqHeadModel, "reqHeadModel");
				this._oCtrl.byId("bAwaitSPI").setText("Awaiting SP Input (" + this._oCtrl.aDataAwaitSPInpt.length.toString() + ")");
				var oFrag = this._oCtrl._getFormFragment("WrkListVFCMgrASP");
				oFrag.getHeaderToolbar().getAggregation("content")[0].setText("Requests (" + this._oCtrl.aDataAwaitSPInpt.length.toString() + ")");

				var oColl = oFrag.getColumns();
				var i = 0;
				for (i = 0; i < oColl.length; i++) {
					if (oColl[i].getId().indexOf("SubmitDate") >= 0 ||
						oColl[i].getId().indexOf("ASPReturnDate") >= 0 ||
						oColl[i].getId().indexOf("SbmtForApprvDt") >= 0 ||
						oColl[i].getId().indexOf("ApprvName") >= 0 ||
						oColl[i].getId().indexOf("ASPPosnr") >= 0 ||
						oColl[i].getId().indexOf("DevPhDesc") >= 0 ||
						oColl[i].getId().indexOf("PrimInd") >= 0 ||
						oColl[i].getId().indexOf("PricModl") >= 0 ||
						oColl[i].getId().indexOf("ASPHeadStatus") >= 0 ||
						oColl[i].getId().indexOf("RequstName") >= 0) {
						oColl[i].setVisible(false);
					} else {
						oColl[i].setVisible(true);
					}
				}
			},

			onAwaitAprval: function () {
				this._oCtrl.byId("bSubmit").setType("Transparent");
				this._oCtrl.byId("bProgress").setType("Transparent");
				this._oCtrl.byId("bReturn").setType("Transparent");
				this._oCtrl.byId("bAwaitSPI").setType("Transparent");
				this._oCtrl.byId("bDraft").setType("Transparent");

				this._oCtrl._showFormFragment("WrkListVFCMgrALL");

				var reqHeadModel = this._oCtrl.getView().getModel("reqHeadModel");
				reqHeadModel.setProperty("/ReqHeadSet", this._oCtrl.aDataAwaitAprv);
				this._oCtrl.getView().setModel(reqHeadModel, "reqHeadModel");

				this._oCtrl.byId("bAwaitAprval").setText("Awaiting Approval (" + this._oCtrl.aDataAwaitAprv.length.toString() + ")");
				var oFrag = this._oCtrl._getFormFragment("WrkListVFCMgrALL");
				oFrag.getHeaderToolbar().getAggregation("content")[0].setText("Requests (" + this._oCtrl.aDataAwaitAprv.length.toString() + ")");

				var oColl = oFrag.getColumns();
				var i = 0;
				for (i = 0; i < oColl.length; i++) {
					if (oColl[i].getId().indexOf("SbmtForInptDt") >= 0 ||
						oColl[i].getId().indexOf("SubmitDate") >= 0 ||
						oColl[i].getId().indexOf("ALLReturnDate") >= 0 ||
						oColl[i].getId().indexOf("SPInptName") >= 0 ||
						oColl[i].getId().indexOf("PrimInd") >= 0 ||
						oColl[i].getId().indexOf("ApprvName") >= 0 ||
						oColl[i].getId().indexOf("ALLHeadStatus") >= 0 ||
						oColl[i].getId().indexOf("RequstName") >= 0) {
						oColl[i].setVisible(false);
					} else {
						oColl[i].setVisible(true);
					}
				}
			},

			onDraft: function (that, aDataDraft) {
				this._oCtrl.byId("bSubmit").setType("Transparent");
				this._oCtrl.byId("bProgress").setType("Transparent");
				this._oCtrl.byId("bReturn").setType("Transparent");
				this._oCtrl.byId("bAwaitSPI").setType("Transparent");
				this._oCtrl.byId("bAwaitAprval").setType("Transparent");

				this._oCtrl._showFormFragment("WrkListVFCMgrALL");

				var reqHeadModel = this._oCtrl.getView().getModel("reqHeadModel");
				reqHeadModel.setProperty("/ReqHeadSet", this._oCtrl.aDataDraft);
				this._oCtrl.getView().setModel(reqHeadModel, "reqHeadModel");
				this._oCtrl.byId("bDraft").setText("All Draft (" + this._oCtrl.aDataDraft.length.toString() + ")");
				var oFrag = this._oCtrl._getFormFragment("WrkListVFCMgrALL");
				oFrag.getHeaderToolbar().getAggregation("content")[0].setText("Requests (" + this._oCtrl.aDataDraft.length.toString() + ")");

				var oColl = oFrag.getColumns();
				var i = 0;
				for (i = 0; i < oColl.length; i++) {
					if (oColl[i].getId().indexOf("SbmtForInptDt") >= 0 ||
						oColl[i].getId().indexOf("SubmitDate") >= 0 ||
						oColl[i].getId().indexOf("ALLReturnDate") >= 0 ||
						oColl[i].getId().indexOf("SbmtForApprvDt") >= 0 ||
						oColl[i].getId().indexOf("ApprvName") >= 0 ||
						oColl[i].getId().indexOf("DevPhDesc") >= 0 ||
						oColl[i].getId().indexOf("PrimInd") >= 0 ||
						oColl[i].getId().indexOf("PricModl") >= 0 ||
						oColl[i].getId().indexOf("ALLPosnr") >= 0 ||
						oColl[i].getId().indexOf("ALLHeadStatus") >= 0 ||
						oColl[i].getId().indexOf("SPInptName") >= 0) {
						oColl[i].setVisible(false);
					} else {
						oColl[i].setVisible(true);
					}
				}
				return;
			},

			onSetToInProg: function (oEvent, pUserId) {
				var aFilter = [];
				var oFilter;
				var sReqHead;
				var oSelectedPaths = oEvent.getSource().getParent().getParent()._aSelectedPaths;
				var i = 0;
				for (i = 0; i < oSelectedPaths.length; i++) {
					sReqHead = this._oCtrl.getView().getModel("reqHeadModel").getProperty(oSelectedPaths[i]);
					if (sReqHead.HStatus === "SB" || sReqHead.HStatus === "RW") {
						oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, sReqHead.ReqNo);
						aFilter.push(oFilter);
						oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "IP");
						aFilter.push(oFilter);
					}
				}
				var that = this;
				if (aFilter.length > 0) {
					oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, pUserId);
					aFilter.push(oFilter);
					var oModel = this._oCtrl.getOwnerComponent().getModel();
					oModel.read("/StatUpdtActionSet", {
						filters: aFilter,
						success: function (oData) {
							var msg = "Selected Requests are set to In-progress status.";
							MessageToast.show(msg, {
								duration: 2000,
								width: "25em",
								at: "center"
							});
							that._oCtrl.updateViewModels(oData);
						},
						error: function () {}
					});
				}

				aFilter = [];
				for (i = 0; i < oSelectedPaths.length; i++) {
					sReqHead = this._oCtrl.getView().getModel("reqHeadModel").getProperty(oSelectedPaths[i]);
					if (sReqHead.HStatus === "AS") {
						oFilter = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, sReqHead.ReqNo);
						aFilter.push(oFilter);
						oFilter = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "AI");
						aFilter.push(oFilter);
					}
				}
				if (aFilter.length > 0) {
					oFilter = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, pUserId);
					aFilter.push(oFilter);
					var oModel1 = this._oCtrl.getOwnerComponent().getModel();
					oModel1.read("/StatUpdtActionSet", {
						filters: aFilter,
						success: function (oData) {
							var msg = "Selected Requests are set to In-progress status.";
							MessageToast.show(msg, {
								duration: 2000,
								width: "25em",
								at: "center"
							});
							that._oCtrl.updateViewModels(oData);
						},
						error: function () {}
					});
				}
			},

			oUpdateFICGrpPriceAfterSave: function () {
				var aFICGrpPrc = this._oCtrl.getView().getModel("dropDownModel").getData().ficGrp;
				var ficPricGrpModel = this._oCtrl.getView().getModel("ficPricGrpModel");
				var i = 0;
				for (i = 0; i < ficPricGrpModel.getData().grpprice.length; i++) {
					ficPricGrpModel.UOM1 = ficPricGrpModel.getData().grpprice[i].UOM1;
					aFICGrpPrc.filter(function (arr) {
						if (arr.Value === ficPricGrpModel.getData().grpprice[i].FICGrp) {
							ficPricGrpModel.getData().grpprice[i].FICGrp = arr.Desc;
							return arr;
						}
					});
				}
				this._oCtrl.getView().setModel(ficPricGrpModel, "ficPricGrpModel");
			}

		});
	});