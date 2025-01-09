sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"com/pfizer/ctg/CTG_REQ/model/formatter",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"sap/ui/core/format/DateFormat",
	"sap/ui/table/library"
], function (Controller, Formatter, History, MessageToast, MessageBox, Sorter, DateFormat, library) {
	"use strict";
	var SortOrder = library.SortOrder;
	var aProdListActv = [];
	var aProdListInAct = [];

	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.WorkListProductMaster", {

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
			var oIconTabBar = this.getView().byId("iTabBarProdAdmin");
			if (this.getRaisedEvent() === undefined || this.getRaisedEvent() === null) {
				//this.clearFormField();
				oIconTabBar.setSelectedKey("PRODTAB");
			}
			var prodWrkListModel = this.getView().getModel("prodWrkListModel");
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			var oFilter;
			var aFilter;
			var newProdReqModel = this.getView().getModel("newProdReqModel");
			//	if (oEvent.getSource().getSelectedKey() === "PRDREQTAB") {
			if (this.getView().byId("iTFProdReq").getCount() === "") {
				var oIconTabFilter = this.getView().byId("iTFProdReq");
				if (newProdReqModel) {
					newProdReqModel.setProperty("/ProdList", "");
				}
				oFilter = new sap.ui.model.Filter("ProdStat", sap.ui.model.FilterOperator.EQ, "D");
				aFilter = [oFilter];
				this.getView().byId("sfProdMaster").setBusy(true);
				oModel.read("/ProductWrkListSet", {
					filters: aFilter,
					success: function (oData) {
						that.getView().byId("sfProdMaster").setBusy(false);
						newProdReqModel.setProperty("/ProdList", oData.results);
						that.getView().setModel(newProdReqModel, "newProdReqModel");
						var newProdCount = newProdReqModel.getData().ProdList.length;
						oIconTabFilter.setCount(newProdCount);
					},
					error: function (oData) {}
				});
			}
			//	if (oEvent.getSource().getSelectedKey() === "PRODTAB") {
			if (this.getView().byId("iTFProdList").getCount() === "") {
				var oIconTabFilter1 = this.getView().byId("iTFProdList");
				if (aProdListActv.length > 0) {
					return;
				}
				prodWrkListModel.setProperty("/ProdList", " ");
				oFilter = new sap.ui.model.Filter("ProdStat", sap.ui.model.FilterOperator.EQ, "A");
				aFilter = [oFilter];
				this.getView().byId("sfProdMaster").setBusy(true);
				oModel.read("/ProductWrkListSet", {
					filters: aFilter,
					success: function (oData) {
						that.getView().byId("sfProdMaster").setBusy(false);
						aProdListActv = [];
						aProdListActv = oData.results;
						/*	for (var i = 0; i < aProdListActv.length; i++) {
								var name = aProdListActv[i].ProdName;
								name.replace(/_/g, ' ');
							}*/
						prodWrkListModel.setProperty("/ProdList", aProdListActv);
						that.getView().setModel(prodWrkListModel, "prodWrkListModel");
						var newProdCount1 = prodWrkListModel.getData().ProdList.length;
						oIconTabFilter1.setCount(newProdCount1);
					},
					error: function (oData) {}
				});
			}
			if (this.getView().byId("iTFInActvProd").getCount() === "") {
				var oIconTabFilter2 = this.getView().byId("iTFInActvProd");
				//	if (oEvent.getSource().getSelectedKey() === "PRDINACTAB") {
				if (aProdListInAct.length > 0) {
					return;
				}
				prodWrkListModel.setProperty("/InActProd", "");
				oFilter = new sap.ui.model.Filter("ProdStat", sap.ui.model.FilterOperator.EQ, "I");
				aFilter = [oFilter];
				this.getView().byId("sfProdMaster").setBusy(true);
				oModel.read("/ProductWrkListSet", {
					filters: aFilter,
					success: function (oData) {
						that.getView().byId("sfProdMaster").setBusy(false);
						aProdListInAct = [];
						aProdListInAct = oData.results;
						prodWrkListModel.setProperty("/InActProd", aProdListInAct);
						that.getView().setModel(prodWrkListModel, "prodWrkListModel");
						var newProdCount2 = aProdListInAct.length;
						oIconTabFilter2.setCount(newProdCount2);
					},
					error: function (oData) {}
				});
			}
			if (oEvent.getParameters().name !== "WorkListProducts") {
				return;
			}
			var oFilter1;
			var aFilter1;
			//	var that = this;
			//	var oModel = this.getOwnerComponent().getModel();
			//	var newProdReqModel = this.getView().getModel("newProdReqModel");
			/*if (this.getView().byId("iTFProdReq").getCount() === "0") {
				var oIconTabFilter = this.getView().byId("iTFProdReq");
				var newProdCount = newProdReqModel.getData().ProdList.length;
				oIconTabFilter.setCount(newProdCount);
			}*/

			//this.getView().byId("iTFProdReq").setCount(newProdCount);
			//	var prodWrkListModel = this.getView().getModel("prodWrkListModel");
			if (prodWrkListModel.getData().ProdList.length > 0 || newProdReqModel.getData().ProdList.length > 0) {
				if (this.getView().byId("iTabBarProdAdmin").getSelectedKey().indexOf("iTFProdReq") >= 0) {
					this.getView().byId("iTabBarProdAdmin").setSelectedKey("iTFProdReq");
				}
				if (this.getView().byId("iTabBarProdAdmin").getSelectedKey().indexOf("iTFProdList") >= 0) {
					this.getView().byId("iTabBarProdAdmin").setSelectedKey("iTFProdList");
					return;
				}
			}
			oFilter1 = new sap.ui.model.Filter("ProdStat", sap.ui.model.FilterOperator.EQ, "A");
			aFilter1 = [oFilter1];
			this.getView().byId("sfProdMaster").setBusy(true);
			oModel.read("/ProductWrkListSet", {
				filters: aFilter1,
				success: function (oData) {
					that.getView().byId("sfProdMaster").setBusy(false);
					prodWrkListModel.setProperty("/ProdList", oData.results);
					that.getView().setModel(prodWrkListModel, "prodWrkListModel");

				},
				error: function (oData) {}
			});
			// oFilter = new sap.ui.model.Filter("ProdStat", sap.ui.model.FilterOperator.EQ, "D");
			// aFilter = [oFilter];
			// this.getView().byId("sfProdMaster").setBusy(true);
			// oModel.read("/ProductWrkListSet", {
			// 	filters: aFilter,
			// 	success: function (oData) {
			// 		that.getView().byId("sfProdMaster").setBusy(false);					
			// 		newProdReqModel.setProperty("/ProdList", oData.results);
			// 		that.getView().setModel(newProdReqModel, "newProdReqModel");
			// 	},
			// 	error: function (oData) {}
			// });				
		},
		onRequestedDateSort: function (oEvent) {
			var oCurrentColumn = oEvent.getParameter("column");
			var oDeliveryDateColumn = this.byId("reqDate");
			if (oCurrentColumn != oDeliveryDateColumn) {
				oDeliveryDateColumn.setSorted(false); //No multi-column sorting
				return;
			}

			oEvent.preventDefault();

			var sOrder = oEvent.getParameter("sortOrder");
			/*var oDateFormat = DateFormat.getDateInstance({
				pattern: "dd/MM/yyyy"
			});*/

			//	this._resetSortingState(); //No multi-column sorting
			oDeliveryDateColumn.setSorted(true);
			oDeliveryDateColumn.setSortOrder(sOrder);

			var oSorter = new Sorter(oDeliveryDateColumn.getSortProperty(), sOrder === SortOrder.Descending);
			//The date data in the JSON model is string based. For a proper sorting the compare function needs to be customized.
			oSorter.fnCompare = function (a, b) {
				if (b === null) {
					return -1;
				}
				if (a === null) {
					return 1;
				}
				var aa = new Date(a).getTime();
				var bb = new Date(b).getTime();
				if (aa < bb) {
					return -1;
				}
				if (aa > bb) {
					return 1;
				}
				return 0;
			};
			this.byId("prodListTab").getBinding("rows").sort(oSorter);
		},
		onSearch: function (oEvent) {
			var oTable;
			var aFilter;
			var srchStr = oEvent.getParameter("query");
			if (!srchStr) {
				srchStr = oEvent.getParameter("newValue");
			}
			if (!srchStr) {
				oTable = this.getView().byId("prodReqTab");
				oTable.getBinding("rows").filter(aFilter);
				return;
			}
			var oProdName = new sap.ui.model.Filter("ProdName", sap.ui.model.FilterOperator.Contains, srchStr);
			var oOtherNames = new sap.ui.model.Filter("OtherNames", sap.ui.model.FilterOperator.Contains, srchStr);
			var oDevPhDesc = new sap.ui.model.Filter("DevPhDesc", sap.ui.model.FilterOperator.Contains, srchStr);
			var oPriIndDesc = new sap.ui.model.Filter("PriIndDesc", sap.ui.model.FilterOperator.Contains, srchStr);
			var oCreatedBy = new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.Contains, srchStr);
			var oCreatedDt = new sap.ui.model.Filter("CreatedAt", sap.ui.model.FilterOperator.Contains, srchStr);
			var oFilter = new sap.ui.model.Filter(
				[oProdName, oOtherNames, oDevPhDesc, oPriIndDesc, oCreatedBy, oCreatedDt]
			);
			aFilter = [oFilter];
			oTable = this.getView().byId("prodReqTab");
			oTable.getBinding("rows").filter(aFilter);
		},

		onSearchList: function (oEvent) {
			var oTable;
			var aFilter;
			var srchStr = oEvent.getParameter("query");
			if (!srchStr) {
				srchStr = oEvent.getParameter("newValue");
			}
			if (!srchStr) {
				oTable = this.getView().byId("prodListTab");
				oTable.getBinding("rows").filter(aFilter);
				return;
			}
			var oProdName = new sap.ui.model.Filter("ProdName", sap.ui.model.FilterOperator.Contains, srchStr);
			var oOtherNames = new sap.ui.model.Filter("OtherNames", sap.ui.model.FilterOperator.Contains, srchStr);
			var oDevPhDesc = new sap.ui.model.Filter("DevPhDesc", sap.ui.model.FilterOperator.Contains, srchStr);
			var oPriIndDesc = new sap.ui.model.Filter("PriIndDesc", sap.ui.model.FilterOperator.Contains, srchStr);
			var oCreatedBy = new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.Contains, srchStr);
			var oCreatedDt = new sap.ui.model.Filter("CreatedAt", sap.ui.model.FilterOperator.Contains, srchStr);
			var oFilter = new sap.ui.model.Filter(
				[oProdName, oOtherNames, oDevPhDesc, oPriIndDesc, oCreatedBy, oCreatedDt]
			);
			aFilter = [oFilter];
			oTable = this.getView().byId("prodListTab");
			oTable.getBinding("rows").filter(aFilter);
		},

		onSearchInActProd: function (oEvent) {
			var oTable;
			var aFilter;
			var srchStr = oEvent.getParameter("query");
			if (!srchStr) {
				srchStr = oEvent.getParameter("newValue");
			}
			if (!srchStr) {
				oTable = this.getView().byId("inactProdTab");
				oTable.getBinding("rows").filter(aFilter);
				return;
			}
			var oProdName = new sap.ui.model.Filter("ProdName", sap.ui.model.FilterOperator.Contains, srchStr);
			var oOtherNames = new sap.ui.model.Filter("OtherNames", sap.ui.model.FilterOperator.Contains, srchStr);
			var oDevPhDesc = new sap.ui.model.Filter("DevPhDesc", sap.ui.model.FilterOperator.Contains, srchStr);
			var oPriIndDesc = new sap.ui.model.Filter("PriIndDesc", sap.ui.model.FilterOperator.Contains, srchStr);
			var oCreatedBy = new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.Contains, srchStr);
			var oCreatedDt = new sap.ui.model.Filter("CreatedAt", sap.ui.model.FilterOperator.Contains, srchStr);
			var oFilter = new sap.ui.model.Filter(
				[oProdName, oDevPhDesc, oOtherNames, oPriIndDesc, oCreatedBy, oCreatedDt]
			);
			aFilter = [oFilter];
			oTable = this.getView().byId("inactProdTab");
			oTable.getBinding("rows").filter(aFilter);
		},

		/*onIconTabSelect: function (oEvent) {
			var prodWrkListModel = this.getView().getModel("prodWrkListModel");
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			var oFilter;
			var aFilter;
			if (oEvent.getSource().getSelectedKey() === "PRDREQTAB") {
				var newProdReqModel = this.getView().getModel("newProdReqModel");
				if (newProdReqModel) {
					newProdReqModel.setProperty("/ProdList", "");
				}
				oFilter = new sap.ui.model.Filter("ProdStat", sap.ui.model.FilterOperator.EQ, "D");
				aFilter = [oFilter];
				this.getView().byId("sfProdMaster").setBusy(true);
				oModel.read("/ProductWrkListSet", {
					filters: aFilter,
					success: function (oData) {
						that.getView().byId("sfProdMaster").setBusy(false);
						newProdReqModel.setProperty("/ProdList", oData.results);
						that.getView().setModel(newProdReqModel, "newProdReqModel");
					},
					error: function (oData) {}
				});
			}
			if (oEvent.getSource().getSelectedKey() === "PRODTAB") {
				if (aProdListActv.length > 0) {
					return;
				}
				prodWrkListModel.setProperty("/ProdList", " ");
				oFilter = new sap.ui.model.Filter("ProdStat", sap.ui.model.FilterOperator.EQ, "A");
				aFilter = [oFilter];
				this.getView().byId("sfProdMaster").setBusy(true);
				oModel.read("/ProductWrkListSet", {
					filters: aFilter,
					success: function (oData) {
						that.getView().byId("sfProdMaster").setBusy(false);
						aProdListActv = [];
						aProdListActv = oData.results;
						prodWrkListModel.setProperty("/ProdList", aProdListActv);
						that.getView().setModel(prodWrkListModel, "prodWrkListModel");
					},
					error: function (oData) {}
				});
			}

			if (oEvent.getSource().getSelectedKey() === "PRDINACTAB") {
				if (aProdListInAct.length > 0) {
					return;
				}
				prodWrkListModel.setProperty("/InActProd", "");
				oFilter = new sap.ui.model.Filter("ProdStat", sap.ui.model.FilterOperator.EQ, "I");
				aFilter = [oFilter];
				this.getView().byId("sfProdMaster").setBusy(true);
				oModel.read("/ProductWrkListSet", {
					filters: aFilter,
					success: function (oData) {
						that.getView().byId("sfProdMaster").setBusy(false);
						aProdListInAct = [];
						aProdListInAct = oData.results;
						prodWrkListModel.setProperty("/InActProd", aProdListInAct);
						that.getView().setModel(prodWrkListModel, "prodWrkListModel");
					},
					error: function (oData) {}
				});
			}
		},
*/
		onRefreshProdList: function () {
			var prodWrkListModel = this.getView().getModel("prodWrkListModel");
			prodWrkListModel.setProperty("/ProdList", " ");
			var oModel = this.getOwnerComponent().getModel();
			var oFilter = new sap.ui.model.Filter("ProdStat", sap.ui.model.FilterOperator.EQ, "A");
			var aFilter = [oFilter];
			var that = this;
			this.getView().byId("sfProdMaster").setBusy(true);
			oModel.read("/ProductWrkListSet", {
				filters: aFilter,
				success: function (oData) {
					that.getView().byId("sfProdMaster").setBusy(false);
					aProdListActv = [];
					aProdListActv = oData.results;
					prodWrkListModel.setProperty("/ProdList", aProdListActv);
					that.getView().setModel(prodWrkListModel, "prodWrkListModel");
				},
				error: function (oData) {}
			});
		},

		onRefreshInActProd: function () {
			var prodWrkListModel = this.getView().getModel("prodWrkListModel");
			prodWrkListModel.setProperty("InActProd", "");
			var oModel = this.getOwnerComponent().getModel();
			var oFilter = new sap.ui.model.Filter("ProdStat", sap.ui.model.FilterOperator.EQ, "I");
			var aFilter = [oFilter];
			var that = this;
			this.getView().byId("sfProdMaster").setBusy(true);
			oModel.read("/ProductWrkListSet", {
				filters: aFilter,
				success: function (oData) {
					that.getView().byId("sfProdMaster").setBusy(false);
					aProdListInAct = [];
					aProdListInAct = oData.results;
					prodWrkListModel.setProperty("/InActProd", aProdListInAct);
					that.getView().setModel(prodWrkListModel, "prodWrkListModel");
				},
				error: function (oData) {}
			});
		},

		onCreateProd: function (oEvent) {
			this.oRouter.navTo("CreateProduct", {
				prodName: " ",
				prodId: " ",
				action: "C"
			});
		},

		onProdReqNameLink: function (oEvent) {
			var newProdReqModel = this.getView().getModel("newProdReqModel");
			var sPath = oEvent.getSource().getBindingContext("newProdReqModel").sPath;
			var sProp = newProdReqModel.getProperty(sPath);
			this.oRouter.navTo("CreateProduct", {
				prodName: oEvent.getSource().getText(),
				prodId: sProp.ProdId,
				action: "R"
			});
		},

		onProdListNameLink: function (oEvent) {
			var prodWrkListModel = this.getView().getModel("prodWrkListModel");
			var sPath = oEvent.getSource().getBindingContext("prodWrkListModel").sPath;
			var sProp = prodWrkListModel.getProperty(sPath);
			this.oRouter.navTo("CreateProduct", {
				//Defect to overcome the spaces issue
				//	prodName: oEvent.getSource().getText(),
				prodName: sProp.ProdNameUscore,
				prodId: sProp.ProdId,
				action: "R"
			});
		},

		onNavBack: function () {
			aProdListActv = [];
			aProdListInAct = [];
			this.getView().getModel("prodWrkListModel").getData().ProdList = "";
			this.getView().getModel("prodWrkListModel").getData().InActProd = "";
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.oRouter.navTo("MainView", true);
			}
		},

		onHome: function () {
			aProdListActv = [];
			aProdListInAct = [];
			this.getView().getModel("prodWrkListModel").getData().ProdList = "";
			this.getView().getModel("prodWrkListModel").getData().InActProd = "";
			this.initializeModels();
			this.onReturnToHome();
		}

	});
});