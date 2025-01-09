sap.ui.define([
	"com/pfizer/ctg/CTG_REQ/controller/BaseController",
	"com/pfizer/ctg/CTG_REQ/model/formatter",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/TextArea",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/Tokenizer"
], function (Controller, Formatter, MessageToast, History, JSONModel, MessageBox, Fragment, Button, Dialog, Label, TextArea, Filter,
	FilterOperator, Export, ExportTypeCSV, Tokenizer) {
	"use strict";
	var userId;
	var aBICCompProd = [];
	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.SearchandReport", {

		formatter: Formatter,

		onInit: function () {
			var dropDownModel = this.getOwnerComponent().getModel("dropDownModel");
			if (dropDownModel.getData().devPhase.length === 0) {
				var oFilter = new sap.ui.model.Filter("TabName", sap.ui.model.FilterOperator.EQ, " ");
				var aFilter = [oFilter];
				var that = this;
				var oModel = this.getOwnerComponent().getModel();
				oModel.read("/SrchHelpDropDnSet", {
					filters: aFilter,
					success: function (oData) {
						var aDevPhase = [];
						var aProdType = [];
						var aProdTypeFilter = [];
						var aFiniGoodsForm = [];
						var aProdSource = [];
						var aPrimaryInd = [];
						var aMechOfAction = [];
						var aDestMarkets = [];
						var aUOMValues = [];
						var aProcureType = [];
						var aDestType = [];
						var aPricing = [];
						var aReqGrp = [];
						var aFICGrp = [];
						var aProdQualifier = [];
						var aReqTyp = [];
						var aReqStatus = [];
						var aMrktGrp = [];
						var i = 0;
						for (i = 0; i < oData.results.length; i++) {
							if (oData.results[i].TabName === "ZCTGPHSE1") {
								aDevPhase.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGPRODTY") {
								aProdType.push(oData.results[i]);
								aProdTypeFilter.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGFRM1") {
								aFiniGoodsForm.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGSOURCE") {
								aProdSource.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGINDI1") {
								aPrimaryInd.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGMCHA1") {
								aMechOfAction.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGMKT1") {
								aDestMarkets.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGUOM") {
								aUOMValues.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGPROC") {
								aProcureType.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGDTYPE") {
								aDestType.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGMODEL") {
								aPricing.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGRQGRP") {
								aReqGrp.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGFICGRP") {
								aFICGrp.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGQUAL") {
								aProdQualifier.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGREQTY") {
								aReqTyp.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGHSTA") {
								aReqStatus.push(oData.results[i]);
							}
							if (oData.results[i].TabName === "ZCTGGROUP") {
								aMrktGrp.push(oData.results[i]);
							}
						}
						dropDownModel.setProperty("/devPhase", aDevPhase);
						dropDownModel.setProperty("/prodType", aProdType);
						dropDownModel.setProperty("/finiGoodsForm", aFiniGoodsForm);
						dropDownModel.setProperty("/prodSource", aProdSource);
						dropDownModel.setProperty("/primaryInd", aPrimaryInd);
						dropDownModel.setProperty("/mechOfAction", aMechOfAction);
						dropDownModel.setProperty("/destMarkets", aDestMarkets);
						dropDownModel.setProperty("/uomValues", aUOMValues);
						dropDownModel.setProperty("/procureType", aProcureType);
						dropDownModel.setProperty("/destType", aDestType);
						dropDownModel.setProperty("/pricing", aPricing);
						dropDownModel.setProperty("/reqGrp", aReqGrp);
						dropDownModel.setProperty("/ficGrp", aFICGrp);
						dropDownModel.setProperty("/prodQualifier", aProdQualifier);
						dropDownModel.setProperty("/reqTyp", aReqTyp);
						dropDownModel.setProperty("/reqStat", aReqStatus);
						dropDownModel.setProperty("/mrktGrp", aMrktGrp);
						that.getView().setModel(dropDownModel, "dropDownModel");
						i = 0;
						for (i = 0; i < aProdTypeFilter.length; i++) {
							if (aProdTypeFilter[i].Value === "AFS") {
								aProdTypeFilter.splice(i, 1);
								break;
							}
						}
						var prodTypeModel = that.getModel("prodTypeModel");
						prodTypeModel.setProperty("/myData", aProdTypeFilter);
						//Adding Select All Desc to the Development Phase Dropdown while refreshing the page
						var selectAllKeyDevPhase = dropDownModel.getProperty("/devPhase");
						selectAllKeyDevPhase.unshift({
							Desc: 'Select All',
							Value: 'closeitem'
						});
						dropDownModel.setProperty("/devPhase", selectAllKeyDevPhase);
						//Adding Select All Desc to the Request Status Phase Dropdown while refreshing the page
						var selectAllKeyReqStatus = dropDownModel.getProperty("/reqStat");
						selectAllKeyReqStatus.unshift({
							Desc: 'Select All',
							Value: 'closeitem'
						});
						dropDownModel.setProperty("/reqStat", selectAllKeyReqStatus);
					},
					error: function () {}
				});
			}
			var oView = this.getView();
			oView.setModel(new JSONModel({
				globalFilter: ""
			}), "ui");
			this._oGlobalFilter = null;
			//Get Router Object instance and store it in Global Variable.
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function (oEvent) {
			if (this.getView().byId('reportTabFilter').getCount() === "") {
				var t = this;
				var oIconTabFilter = this.getView().byId("reportTabFilter");
				this.clearFormField();
				userId = this.getUserId();
				var today = new Date();
				var ExpiryDt = new Date(today);
				ExpiryDt.setDate(ExpiryDt.getDate() + 60);
				var expiryResultThirty = [];
				var serviceURL = "/sap/opu/odata/sap/ZCTG_REQUEST_SRV/";
				var oModel = new sap.ui.model.odata.ODataModel(serviceURL, true);
				var oFilter = new sap.ui.model.Filter("SrchTyp", sap.ui.model.FilterOperator.EQ, "H");
				var oFilter1 = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, userId);
				var oSorter = new sap.ui.model.Sorter("ExpiryDt", false);
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
				var aFilter = [oFilter, oFilter1];
				oModel.read("/ReqSrchQuerySet", {
					filters: aFilter,
					sorter: oSorter,
					success: function (oData) {
						var results = oData.results;
						for (var i = 0; i < results.length; i++) {
							var expd2 = new Date(results[i].ExpiryDt);
							if (new Date(expd2).getTime() >= new Date(today).getTime() && new Date(expd2).getTime() < new Date(ExpiryDt).getTime()) {
								expiryResultThirty.push(results[i]);
							}
						}
						var jsonModel = new sap.ui.model.json.JSONModel();
						jsonModel.setData(expiryResultThirty);
						t.getView().byId("standReportId").setModel(jsonModel, "standardReportModel");
						t.getView().byId("count").setText("Expiring Requests (" +
							expiryResultThirty.length + ")");
						oIconTabFilter.setCount(expiryResultThirty.length);
						t.byId("standReportId").getBinding("rows").sort(oSorter);
					}
				});
			}
			if (this.getView().getModel("userInfoModel").getData().SrchReptSet.WrkItmCnt >= "  5") {
				this.getView().byId("saveSearch").setVisible(false);
			} else {
				this.getView().byId("saveSearch").setVisible(true);
			}
			//Setting the Tabs while Navigating 
			var oIconTabBar = this.getView().byId("idIconTabBar");
			if (oIconTabBar.getSelectedKey() === "Heavy") {
				oIconTabBar.setSelectedKey("Heavy");
			} else {
				oIconTabBar.setSelectedKey("Ok");
			}
			if (oEvent.getParameter("name") !== "SearchandReport") {
				return;
			}
			if (this.getRaisedEvent() === undefined || this.getRaisedEvent() === null) {
				this.clearFormField();
				oIconTabBar.setSelectedKey("Ok");
			}
			this.addSelectAllToComboBox();
			var that = this;
			var oModel1 = this.getOwnerComponent().getModel();
			var suggestedProd = " ";
			//Product Name Filter 
			var oFilter4 = new sap.ui.model.Filter("ProdName", sap.ui.model.FilterOperator.EQ, suggestedProd);
			var aFilter2 = [oFilter4];
			oModel1.read("/ProductCollectionSet", {
				filters: aFilter2,
				success: function (oData) {
					var aProducts = [];
					aProducts = oData.results;
					var prodSrchModel = that.getView().getModel("prodSrchModel");
					prodSrchModel.setProperty("/products", aProducts);
					that.getView().setModel(prodSrchModel, "prodSrchModel");

				},
				error: function () {}
			});
			//Best in Class Comparator Filter
			var i = 0;
			var oFilter5 = new sap.ui.model.Filter("TabName", sap.ui.model.FilterOperator.EQ, " ");
			var aFilter3 = [oFilter5];
			oModel1.read("/ValuationDropDnSet", {
				filters: aFilter3,
				success: function (oData) {
					aBICCompProd = [];
					i = 0;
					for (i = 0; i < oData.results.length; i++) {
						if (oData.results[i].TabName === "ZCTGBIC1") {
							aBICCompProd.push(oData.results[i]);
						}
					}
					var dropDownModel = that.getView().getModel("dropDownModel");
					dropDownModel.setProperty("/bicCompProd", aBICCompProd);
					that.getView().setModel(dropDownModel, "dropDownModel");
				},
				error: function () {}
			});
		},
		onAfterRendering: function (oEvent) {
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
							//Hide the button even after page refresh
							if (oData.results[0].WrkItmCnt >= "  5") {
								that.getView().byId("saveSearch").setVisible(false);
							} else {
								that.getView().byId("saveSearch").setVisible(true);
							}
							that.updateViewModels(oData);
						},
						error: function () {}
					});
				}

			} else {
				this.byId("idUserName").setText(this.getUserName());
			}
		},
		updateViewModels: function (oData) {
			var userInfoModel = this.getOwnerComponent().getModel("userInfoModel");
			userId = "";
			var i;
			var role;
			//	var t = this;
			for (i = 0; i < oData.results.length; i++) {
				if (!userId) {
					userId = oData.results[0].UserId;
				}
				role = oData.results[i].Role;
				if (role === "CREATOR") {
					userInfoModel.setProperty("/ReqstorSet", oData.results[i]);
				}
				if (role === "VALUATOR") {
					userInfoModel.setProperty("/VFCMgrSet", oData.results[i]);
				}
				if (role === "SPINPUTTER") {
					userInfoModel.setProperty("/SPInputSet", oData.results[i]);
				}
				if (role === "APPROVER") {
					userInfoModel.setProperty("/ApprvSet", oData.results[i]);
				}
				if (role === "ADMIN") {
					userInfoModel.setProperty("/AdminSet", oData.results[i]);
				}
				if (role === "REPORTING") {
					userInfoModel.setProperty("/SrchReptSet", oData.results[i]);
				}
			}
			this.getView().setModel(userInfoModel, "userInfoModel");
		},
		addSelectAllToComboBox: function (oEvent) {
			if (this.getView().byId('devPhase').getFirstItem() && !(this.getView().byId('devPhase').getFirstItem().getProperty("key") ===
					"closeitem")) {
				this.getView().byId('devPhase').insertItem(new sap.ui.core.Item({
					key: 'closeitem',
					text: 'Select All'
				}), 0);
			}
			if (this.getView().byId('reqStat').getFirstItem() && !(this.getView().byId('reqStat').getFirstItem().getProperty("key") ===
					"closeitem")) {
				this.getView().byId('reqStat').insertItem(new sap.ui.core.Item({
					key: 'closeitem',
					text: 'Select All'
				}), 0);
			}

		},
		onComboBoxSelectionChange: function (oEvent) {
			var changedItem = oEvent.getParameter("changedItem");
			var isSelected = oEvent.getParameter("selected");
			var state = "Selected";
			if (!isSelected) {
				state = "Deselected";
			}
			//Check if "Selected All is selected
			if (changedItem.getProperty("key") === "closeitem") {
				var oName, res;
				//If it is Selected
				if (state === "Selected") {
					var oItems = oEvent.getSource("mAggregations").getItems();
					for (var i = 0; i < oItems.length; i++) {
						if (i === 0) {
							oName = oItems[i].getProperty("key");
						} else {
							oName = oName + ',' + oItems[i].getProperty("key");
						} //If i == 0									
					} //End of For Loop
					res = oName.split(",");
					oEvent.getSource().setSelectedKeys(res);
				} else {
					res = null;
					oEvent.getSource().setSelectedKeys(res);
				}
			}
			if (oEvent.getParameter('changedItem').getProperty('key') === 'closeitem') {
				var box = oEvent.getSource();
				box.removeSelectedKeys(['closeitem']);
				box.close();
			}
		},
		onSearchPressed: function (oEvent) {
			var srchHeadModel = this.getView().getModel("srchHeadModel");
			var ret = this.validateForm(this);
			//Validating the fields ValueState
			if (!ret) {
				sap.m.MessageBox.show("Please enter all required fields", sap.m.MessageBox.Icon.ERROR, "Required Fields", [sap.m.MessageBox.Action
					.OK
				]);
				return;
			}
			var expDateFrom = new Date(this.getView().byId("expDateId").getDateValue());
			var expDateTo = this.getView().byId("expDateId").getSecondDateValue();
			var expDateF = this.formatDate(expDateFrom);
			var expDateT = this.formatDate(expDateTo);
			if (this.getView().byId("expDateId").getDateValue() === null && this.getView().byId("expDateId").getSecondDateValue() === null) {
				expDateF = null;
				expDateT = null;
			}
			var reqDateFrom = new Date(this.getView().byId("subDateId").getDateValue());
			var reqDateTo = this.getView().byId("subDateId").getSecondDateValue();
			var reqDateF = this.formatDate(reqDateFrom);
			var reqDateT = this.formatDate(reqDateTo);
			if (this.getView().byId("subDateId").getDateValue() === null && this.getView().byId("subDateId").getSecondDateValue() === null) {
				reqDateF = null;
				reqDateT = null;
			}
			var effDateFrom = new Date(this.getView().byId("effecDateId").getDateValue());
			var effDateTo = this.getView().byId("effecDateId").getSecondDateValue();
			var effDateF = this.formatDate(effDateFrom);
			var effDateT = this.formatDate(effDateTo);
			if (this.getView().byId("effecDateId").getDateValue() === null && this.getView().byId("effecDateId").getSecondDateValue() ===
				null) {
				effDateF = null;
				effDateT = null;
			}
			var prodId = [];
			var selectedTokens = this.getView().byId('selectedProds').getTokens();
			for (var id = 0; id < selectedTokens.length; id++) {
				var keys = selectedTokens[id].getKey();
				prodId.push(keys);
			}
			var SearchType = "";
			if (this.getView().byId("srchHeader").getSelected()) {
				SearchType = "H";

			} else if (this.getView().byId("srchDetail").getSelected()) {
				SearchType = "I";
			}
			var biologic = "";
			var ficind = "";
			var pocInd = "";
			var prodSrc = "";
			if (this.getView().byId("biologic").getSelected()) {
				biologic = "X";
			}
			if (this.getView().byId("ficind").getSelected()) {
				ficind = "X";
			}
			if (this.getView().byId("pocInd").getSelected()) {
				pocInd = "X";
			}
			if (this.getView().byId("prodSrc").getSelected()) {
				prodSrc = "E";
			}
			var t = this;
			var oEntry = {};
			oEntry.SrchTyp = SearchType;
			oEntry.ReqNo = this.getView().byId("reqNo").getValue();
			oEntry.DevPhase = this.getView().byId("devPhase").getSelectedKeys().toString();
			oEntry.ReqTyp = this.getView().byId("reqTyp").getSelectedKey().toString();
			oEntry.HStatus = this.getView().byId("reqStat").getSelectedKeys().toString();
			oEntry.ProdTyp = this.getView().byId("prodType").getSelectedKeys().toString();
			oEntry.IndKey = this.getView().byId("primaryInd").getSelectedKeys().toString();
			oEntry.MechAction = this.getView().byId("actionMech").getSelectedKey();
			oEntry.FiniGoodsFrm = this.getView().byId("finiGoodsForm").getSelectedKey();
			oEntry.Biologic = biologic;
			oEntry.FICInd = ficind;
			oEntry.POCInd = pocInd;
			oEntry.ProdSrce = prodSrc;
			oEntry.ProdId = prodId.toString();
			oEntry.PriceModel = this.getView().byId("pricing").getSelectedKeys().toString();
			oEntry.DestMrkts = this.getView().byId("markets").getSelectedKeys().toString();
			oEntry.Group = this.getView().byId("ficGrp").getSelectedKeys().toString();
			oEntry.ShipDest = this.getView().byId("destType").getSelectedKeys().toString();
			if (oEntry.ShipDest === "P,3" || oEntry.ShipDest === "3,P") {
				oEntry.ShipDest = "B";
			}
			oEntry.ReqUserId = this.getView().byId("idNtId").getValue().toUpperCase();
			oEntry.ReqGrp = this.getView().byId("reqGrp").getSelectedKey();
			if (expDateF === null && expDateT === null) {
				oEntry.ExpiryDt = null;
			} else {
				oEntry.ExpiryDt = expDateF.concat(expDateT);
			}
			oEntry.BICComp = this.getView().byId("classComp").getSelectedKey();
			oEntry.ValuUserId = this.getView().byId("valById").getValue().toUpperCase();
			oEntry.SPIUserId = this.getView().byId("spInputId").getValue().toUpperCase();
			oEntry.ApprvUserId = this.getView().byId("approvId").getValue().toUpperCase();
			if (reqDateF === null && reqDateT === null) {
				oEntry.SubmitDt = null;
			} else {
				oEntry.SubmitDt = reqDateF.concat(reqDateT);
			}
			if (effDateF === null && effDateT === null) {
				oEntry.EffDate = null;
			} else {
				oEntry.EffDate = effDateF.concat(effDateT);
			}
			var assetArray = [];
			var resultPayload = {};
			resultPayload.SrchTyp = SearchType;
			assetArray.push(resultPayload);
			oEntry.ReqSrchResultsSet = assetArray;
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/ReqSrchQuerySet", oEntry, {
				method: "POST",
				success: function (oData) {
					var results = oData.ReqSrchResultsSet.results;
					srchHeadModel.setData(results);
					if (oData.SrchTyp === "H" && results.length !== 0) {
						t.oRouter.navTo("HeaderLevelList", true);
					} else if (oData.SrchTyp === "I" && results.length !== 0) {
						t.oRouter.navTo("ItemLevelList", true);
					} else if (results.length === 0) {
						sap.m.MessageBox.show("Please Select a Different Search Criteria", sap.m.MessageBox.Icon.ERROR, "No Data Found", [sap.m.MessageBox
							.Action
							.OK
						]);
					}
				}
			});
		},
		onSearch: function (oEvent) {
			var sInputValue;
			if (oEvent.getId() === "suggestionItemSelected") {
				sInputValue = oEvent.getParameters().selectedItem.getText();
			} else {
				sInputValue = oEvent.getSource().getValue();
			}
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
								"com.pfizer.ctg.CTG_REQ.view.fragments.SearchProductSelect",
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
					}
				},
				error: function () {}
			});
		},
		onDevPhase: function (oEvent) {
			var _oInput = oEvent.getSource();
			var val = _oInput.getSelectedKeys();
			if (val.length >= 1) {
				_oInput.setValueState("None");
			}
		},
		onItemSelected: function (oEvent) {
			if (oEvent.getParameters().selectedItem) {
				this.getView().byId("srchProduct").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("selectedProds").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("srchProduct").destroyTokens();
				this.onSearch(oEvent);
			}
		},
		validateForm: function (self) {
			var ret = true;
			if (this.getView().byId("reqStat").getSelectedKeys().toString() === "") {
				this.getView().byId("reqStat").setValueState("Error");
				ret = false;
			} else {
				this.getView().byId("reqStat").setValueState("None");
			}
			if (this.getView().byId("devPhase").getSelectedKeys().toString() === "") {
				this.getView().byId("devPhase").setValueState("Error");
				ret = false;
			} else {
				this.getView().byId("devPhase").setValueState("None");
			}
			return ret;
		},
		formatDate: function (v) {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "YYYYMMdd"

			});
			return oDateFormat.format(new Date(v));
		},
		onTokenUpdate: function (oEvent) {
			var sType = oEvent.getParameter("type");
			if (sType === "removed") {
				var sKey = oEvent.getParameter("removedTokens")[0].getProperty("text");
				var aData = this.getView().byId('selectedProds').getTokens();
				for (var i = 0, len = aData.length; i < len; i++) {
					var idx;
					if (aData[i].getProperty('text') === sKey) {
						idx = i;
					}
				}
				aData.splice(idx, 1);
				//Reset Product Search if Selected Prods are Empty
				if (aData.length === 0) {
					this.getView().byId("srchProduct").destroyTokens();
				}
			}
		},
		onClickOk: function (oEvent) {
			var oSelectedItems = oEvent.getParameter("selectedItems");
			var prodId = [];
			for (var id = 0; id < oSelectedItems.length; id++) {
				var text = oSelectedItems[id].getAggregation("customData")[0].getValue();
				var key = oSelectedItems[id].getAggregation("customData")[0].getKey();
				prodId.push({
					text: text,
					key: key
				});
			}
			for (var plant = 0; plant < prodId.length; plant++) {
				this.getView().byId("selectedProds").addToken(new sap.m.Token({
					text: prodId[plant].text,
					key: prodId[plant].key
				}));
			}
		},
		onFragVHelpSearch: function (oEvent) {
			var srchStr = oEvent.getParameters("value").value;
			if (!srchStr) {
				srchStr = oEvent.getParameter("newValue");
			}
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
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);
			oBinding.filter(aFilter);
		},
		onResetPressed: function (oEvent) {
			if (this.getView().getModel("userInfoModel").getData().SrchReptSet.WrkItmCnt >= "  5") {
				this.getView().byId("saveSearch").setVisible(false);
			} else {
				this.getView().byId("saveSearch").setVisible(true);
			}
			this.clearFormField();
		},
		clearFormField: function () {
			var tokenFields = ["selectedProds", "srchProduct"];
			var i;
			for (i = 0; i < tokenFields.length; i++) {
				this.byId(tokenFields[i]).destroyTokens();
			}
			var valueFields = ["reqNo", "expDateId", "valById", "spInputId", "approvId", "subDateId",
				"effecDateId", "idNtId"
			];
			for (i = 0; i < valueFields.length; i++) {
				this.byId(valueFields[i]).setValue("");
			}
			var selectedKeys = ["devPhase", "reqStat", "prodType", "primaryInd", "pricing", "markets", "destType", "ficGrp"];
			for (i = 0; i < selectedKeys.length; i++) {
				this.byId(selectedKeys[i]).clearSelection();
				this.byId(selectedKeys[i]).setValueState("None");
			}
			var selectedKey = ["reqTyp", "reqGrp", "classComp", "actionMech", "finiGoodsForm"];
			for (i = 0; i < selectedKey.length; i++) {
				this.byId(selectedKey[i]).setSelectedKey("");
				this.byId(selectedKey[i]).setValueState("None");
			}
			var checkBoxSelect = ["biologic", "ficind", "pocInd", "prodSrc"];
			for (i = 0; i < checkBoxSelect.length; i++) {
				this.byId(checkBoxSelect[i]).setSelected(false);
			}
			var radioButtonSelect = ["srchHeader", "srchDetail"];
			for (i = 0; i < radioButtonSelect.length; i++) {
				if (radioButtonSelect[i] === "srchHeader") {
					this.byId(radioButtonSelect[i]).setSelected(true);
				} else if (radioButtonSelect[i] === "srchDetail") {
					this.byId(radioButtonSelect[i]).setSelected(false);
				}
			}
			var selectedProdModel = this.getView().getModel("selectedProdModel");
			selectedProdModel.setProperty("/matchedItems", "");
		},
		onHome: function () {
			this.oRouter.navTo("MainView", true);
			this.clearFormField();
			this.onReturnToHome();
			this.clearAllFilters();
		},
		onFilterRows: function () {
			var t = this;
			var filteredResults = this.getView().byId("standReportId").getBinding("rows");
			filteredResults.attachChange(function (oEvent) {
				t.getView().byId("count").setText("Expiring Requests (" + oEvent.getSource().iLength + ")");
			});
		},
		filterGlobally: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;
			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter("ReqNo", FilterOperator.Contains, sQuery),
					new Filter("PriceModelDesc", FilterOperator.Contains, sQuery),
					new Filter("ProdName", FilterOperator.Contains, sQuery),
					new Filter("OtherNames", FilterOperator.Contains, sQuery),
					new Filter("PhaseDesc", FilterOperator.Contains, sQuery),
					new Filter("ProdTypDesc", FilterOperator.Contains, sQuery),
					new Filter("ReqUserId", FilterOperator.Contains, sQuery),
					new Filter("ExpiryDt", FilterOperator.Contains, sQuery)
				], false);
			}
			this._filter();
		},
		_filter: function (oEvent) {
			var oFilter = null;
			if (this._oGlobalFilter) {
				oFilter = new sap.ui.model.Filter(this._oGlobalFilter, true);
			} else if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			}
			this.getView().byId("standReportId").getBinding("rows").filter(oFilter, "Application");
			var filteredResults = this.getView().byId("standReportId").getBinding("rows");
			this.getView().byId("count").setText("Expiring Requests (" + filteredResults.iLength + ")");
		},
		clearAllFilters: function (oEvent) {
			var tab = this.getView().byId("standReportId");
			var oUiModel = this.getView().getModel("ui");
			oUiModel.setProperty("/globalFilter", "");
			this._oGlobalFilter = null;
			this._filter();
			var aColumns = tab.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				tab.filter(aColumns[i], null);
			}
		},
		onDataExport: function () {
			var f = [];
			if (this.getView().byId("reqNoReport").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, this.getView().byId("reqNoReport").getParent().getProperty(
					"filterValue")));
			}
			if (this.getView().byId("pricModelDesc").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("PriceModelDesc", sap.ui.model.FilterOperator.EQ, this.getView().byId("pricModelDesc").getParent()
					.getProperty(
						"filterValue")));
			}
			if (this.getView().byId("prodName").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("ProdName", sap.ui.model.FilterOperator.EQ, this.getView().byId("prodName").getParent().getProperty(
					"filterValue")));
			}
			if (this.getView().byId("otherName").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("OtherNames", sap.ui.model.FilterOperator.EQ, this.getView().byId("otherName").getParent().getProperty(
					"filterValue")));
			}
			if (this.getView().byId("phaseDesc").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("PhaseDesc", sap.ui.model.FilterOperator.EQ, this.getView().byId("phaseDesc").getParent().getProperty(
					"filterValue")));
			}
			if (this.getView().byId("prodTypDesc").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("ProdTypDesc", sap.ui.model.FilterOperator.EQ, this.getView().byId("prodTypDesc").getParent().getProperty(
					"filterValue")));
			}
			if (this.getView().byId("requestorId").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("ReqUserId", sap.ui.model.FilterOperator.EQ, this.getView().byId("requestorId").getParent().getProperty(
					"filterValue")));
			}
			if (this.getView().byId("expDate").getParent().getProperty("filterValue")) {
				f.push(new sap.ui.model.Filter("ExpiryDt", sap.ui.model.FilterOperator.EQ, this.getView().byId("expDate").getParent().getProperty(
					"filterValue")));
			}
			var oExport = new Export({
				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new ExportTypeCSV({
					separatorChar: ","
				}),
				// Pass in the model created above
				models: this.getView().byId("standReportId").getModel("standardReportModel"),
				// binding information for the rows aggregation
				rows: {
					path: "/",
					filters: f
				},
				// column definitions with column name and binding info for the content
				columns: [{
					name: "Request No",
					template: {
						content: "{ReqNo}"
					}
				}, {
					name: "Pricing Model",
					template: {
						content: "{PriceModelDesc}"
					}
				}, {
					name: "Product Name",
					template: {
						content: "{ProdName}"
					}
				}, {
					name: "Other Names",
					template: {
						content: "{OtherNames}"
					}
				}, {
					name: "Phase",
					template: {
						content: "{PhaseDesc}"
					}
				}, {
					name: "Product Type",
					template: {
						content: "{ProdTypDesc}"
					}
				}, {
					name: "Requestor",
					template: {
						content: "{ReqUserId}"
					}
				}, {
					name: "Expiration Date",
					template: {
						content: "{ExpiryDt}"
					}
				}]
			});
			// download exported file
			oExport.saveFile().catch(function (oError) {
				sap.m.MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},
		onReqNoHyperlink: function (oEvent) {
			var sPath = oEvent.getSource().getParent().getBindingContext("standardReportModel").sPath;
			var sReqHead = this.getView().byId("standReportId").getModel("standardReportModel").getProperty(sPath);
			var userName = this.getView().byId("standReportId").getModel("standardReportModel").getProperty(sPath).ReqUserId;
			if (userName === this.getUserId()) {
				if (sReqHead.ReqTypDesc === "New") {
					if (sReqHead.HStatus === "DR" || sReqHead.HStatus === "RT") {
						this.onRequestCreDispView(sReqHead.ReqNo, "UPD-DR");
					}
					if (sReqHead.HStatus === "SB" || sReqHead.HStatus === "RW" || sReqHead.HStatus === "AS") {
						if (sReqHead.EffDate === "00/00/0000") {
							this.onRequestCreDispView(sReqHead.ReqNo, "UPD-SB");
						} else {
							this.oRouter.navTo("AppendRequest", {
								reqId: sReqHead.ReqNo,
								action: "DIS"
							});
						}
					}
					if (sReqHead.HStatus === "IP" || sReqHead.HStatus === "AI" ||
						sReqHead.HStatus === "AP" || sReqHead.HStatus === "AC" ||
						sReqHead.HStatus === "EX") {
						this.onRequestPricModelView(sReqHead);
					}
				}
				if (sReqHead.ReqTypDesc === "Update") {
					if (sReqHead.PriceModel === "CM" || sReqHead.PriceModel === "DS" || sReqHead.PriceModel === "FC" || sReqHead.PriceModel ===
						"AC") {
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
				if (sReqHead.ReqTypDesc === "Renewal") {
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
				if (sReqHead.ReqTypDesc === "Legacy") {
					if (sReqHead.PriceModel === "AC") {
						if (sReqHead.HStatus === "DR" || sReqHead.HStatus === "RT" || sReqHead.HStatus === "SB" ||
							sReqHead.HStatus === "RW" || sReqHead.HStatus === "AS") {
							this.oRouter.navTo("AppendRequest", {
								reqId: sReqHead.ReqNo,
								action: "EDIT"
							});
						} else {
							this.onRequestPricModelView(sReqHead);
						}
					} else {
						this.onRequestPricModelView(sReqHead);
					}
					//	this.onRequestPricModelView(sReqHead);
				}
			} else {
				if (sReqHead.ReqTypDesc === "New") {
					if (sReqHead.HStatus === "DR" || sReqHead.HStatus === "RT" || sReqHead.HStatus === "SB" ||
						sReqHead.HStatus === "RW" || sReqHead.HStatus === "AS") {
						if (sReqHead.EffDate === "00/00/0000") {
							this.onRequestCreDispView(sReqHead.ReqNo, "DIS");
						} else {
							this.oRouter.navTo("AppendRequest", {
								reqId: sReqHead.ReqNo,
								action: "DIS"
							});
						}
					} else {
						this.onRequestPricModelView(sReqHead);
					}
				}
				if (sReqHead.ReqTypDesc === "Update") {
					if (sReqHead.PriceModel === "CM" || sReqHead.PriceModel === "DS" || sReqHead.PriceModel === "FC" || sReqHead.PriceModel ===
						"AC") {
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
				if (sReqHead.ReqTypDesc === "Renewal") {
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
				if (sReqHead.ReqTypDesc === "Legacy") {
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
					priceModel: sReqHead.PriceModelDesc,
					action: "DIS"
				});
			}
			if (sReqHead.PriceModel === "AC") {
				this.oRouter.navTo("ValuationActual", {
					reqId: sReqHead.ReqNo,
					priceModel: sReqHead.PriceModelDesc,
					action: "DIS"
				});
			}
			if (sReqHead.PriceModel === "CP") {
				this.oRouter.navTo("ValuationCostPlus", {
					reqId: sReqHead.ReqNo,
					priceModel: sReqHead.PriceModelDesc,
					action: "DIS"
				});
			}
			if (sReqHead.PriceModel === "FC") {
				this.oRouter.navTo("ValuationFirstInClass", {
					reqId: sReqHead.ReqNo,
					priceModel: sReqHead.PriceModelDesc,
					action: "DIS"
				});
			}
			if (sReqHead.PriceModel === "DS") {
				this.oRouter.navTo("ValuationDiscovery", {
					reqId: sReqHead.ReqNo,
					priceModel: sReqHead.PriceModelDesc,
					action: "DIS"
				});
			}
		},
		onSavedVarinatsPressed: function (oEvent) {
			var t = this;
			var loggedInUserId = this.getUserId();
			var serviceURL = "/sap/opu/odata/sap/ZCTG_REQUEST_SRV/";
			var oModel = new sap.ui.model.odata.ODataModel(serviceURL, true);
			var oFilter = new sap.ui.model.Filter("SrchTyp", sap.ui.model.FilterOperator.EQ, "V");
			var oFilter1 = new sap.ui.model.Filter("UserId", sap.ui.model.FilterOperator.EQ, loggedInUserId);
			var aFilter = [oFilter, oFilter1];
			oModel.read("/ReqSrchQuerySet", {
				filters: aFilter,
				success: function (oData) {
					var results = oData.results;
					var savedVariantModel = t.getView().getModel("savedVariantModel");
					savedVariantModel.setData(results);
					sap.ui.getCore().setModel(savedVariantModel, "savedVariantModel");
				//	t.getView().byId("count").setText("Saved Search (" + results.length + ")");
					if (!t._oDialog) {
						t._oDialog = sap.ui.xmlfragment("com.pfizer.ctg.CTG_REQ.view.fragments.SavedVariantSelect", t);
					}
					if (oData.results.length < 2) {
						t._oDialog.setContentHeight("12%");
					} else if (oData.results.length > 1 && oData.results.length <= 5) {
						t._oDialog.setContentHeight("40%");
					}
					t.clearFormField();
					t._oDialog.setTitle("My Saved Searches(" + results.length + ")");
					t._oDialog.setIcon("sap-icon://visits");
					t._oDialog.open();

				}
			});
		},
		handleClose: function (oEvent) {
			if (oEvent.getId() === "itemPress") {
				this.getView().byId("saveSearch").setVisible(true);
			}
			var selectedPath = oEvent.getParameter('listItem').getBindingContext('savedVariantModel').getPath().substr(1);
			var data = [sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath]];
			var newDevData = [sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].DevPhase.split(',')];
			var newReqStatusData = [sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].HStatus.split(',')];
			var prodTypeData = [sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].ProdTyp.split(',')];
			var primIndData = [sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].IndKey.split(',')];
			var pricModelData = [sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].PriceModel.split(',')];
			var destMarkData = [sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].DestMrkts.split(',')];
			var marketGrpData = [sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].Group.split(',')];
			var destTypeData = sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].ShipDest.split(',');
			var prodNameData = sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].OtherNames.split(',');
			var prodArrayData = [];
			for (var i = 0; i < prodNameData.length; i++) {
				var obj = {};
				obj['text'] = prodNameData[i];
				prodArrayData.push(obj);
			}
			var prodIdData = sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].ProdId.split(',');
			var prodId = [];
			for (var id = 0; id < prodIdData.length; id++) {
				var obj1 = {};
				obj1['key'] = prodIdData[id];
				prodId.push(obj1);
			}
			var newArray = prodNameData.map(function (value, index) {
				return value + ',' + prodIdData[index];
			});
			var splitArray = [];
			for (var j = 0; j < newArray.length; j++) {
				var obj3 = {};
				obj3["valuepair"] = newArray[j].split(',');
				splitArray.push(obj3);
			}
			var expFromdate = "";
			var expToDate = "";
			if (sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].ExpiryDt !== "") {
				expFromdate = sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].ExpiryDt.slice(0, 8);
				expFromdate = expFromdate.substring(0, 4) + "," + expFromdate.substring(4, 6) + "," + expFromdate.substring(6, 8);
				expToDate = sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].ExpiryDt.slice(8, 16);
				expToDate = expToDate.substring(0, 4) + "," + expToDate.substring(4, 6) + "," + expToDate.substring(6, 8);
			} else {
				expFromdate = null;
				expToDate = null;
			}
			var subFromdate = "";
			var subToDate = "";
			if (sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].SubmitDt !== "") {
				subFromdate = sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].SubmitDt.slice(0, 8);
				subFromdate = subFromdate.substring(0, 4) + "," + subFromdate.substring(4, 6) + "," + subFromdate.substring(6, 8);
				subToDate = sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].SubmitDt.slice(8, 16);
				subToDate = subToDate.substring(0, 4) + "," + subToDate.substring(4, 6) + "," + subToDate.substring(6, 8);
			} else {
				subFromdate = null;
				subToDate = null;
			}
			var effFromdate = "";
			var effToDate = "";
			if (sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].EffDate !== "") {
				effFromdate = sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].EffDate.slice(0, 8);
				effFromdate = effFromdate.substring(0, 4) + "," + effFromdate.substring(4, 6) + "," + effFromdate.substring(6, 8);
				effToDate = sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].EffDate.slice(8, 16);
				effToDate = effToDate.substring(0, 4) + "," + effToDate.substring(4, 6) + "," + effToDate.substring(6, 8);
			} else {
				effFromdate = null;
				effToDate = null;
			}
			var jsonModel = new sap.ui.model.json.JSONModel();
			jsonModel.setData(data);
			var newDevDataModel = new sap.ui.model.json.JSONModel();
			newDevDataModel.setData(newDevData);
			var newReqStatusDataModel = new sap.ui.model.json.JSONModel();
			newReqStatusDataModel.setData(newReqStatusData);
			var prodTypeDataModel = new sap.ui.model.json.JSONModel();
			prodTypeDataModel.setData(prodTypeData);
			var primIndDataModel = new sap.ui.model.json.JSONModel();
			primIndDataModel.setData(primIndData);
			var pricModelDataModel = new sap.ui.model.json.JSONModel();
			pricModelDataModel.setData(pricModelData);
			var destMarkDataModel = new sap.ui.model.json.JSONModel();
			destMarkDataModel.setData(destMarkData);
			var marketGrpDataModel = new sap.ui.model.json.JSONModel();
			marketGrpDataModel.setData(marketGrpData);
			var prodNameDataModel = new sap.ui.model.json.JSONModel();
			prodNameDataModel.setData(splitArray);
			var prodIdDataModel = new sap.ui.model.json.JSONModel();
			prodIdDataModel.setData(prodId);
			var destTypeDataModel = new sap.ui.model.json.JSONModel();
			destTypeDataModel.setData(destTypeData);
			var expDateModel = new sap.ui.model.json.JSONModel();
			expDateModel.setData({
				dateValueDrs2: new Date(expFromdate),
				secondDateValueDrs2: new Date(expToDate)
			});
			var subDateModel = new sap.ui.model.json.JSONModel();
			subDateModel.setData({
				dateValueDrsSub2: new Date(subFromdate),
				secondDateValueDrsSub2: new Date(subToDate)
			});
			var effDateModel = new sap.ui.model.json.JSONModel();
			effDateModel.setData({
				dateValueDrsEff2: new Date(effFromdate),
				secondDateValueDrsEff2: new Date(effToDate)
			});
			var selectedRadioButtonDetail = this.getView().byId("srchDetail");
			var selectedRadioButtonHeader = this.getView().byId("srchHeader");
			var selectedCheckBoxBilogic = this.getView().byId("biologic");
			var selectedCheckBoxFic = this.getView().byId("ficind");
			var selectedCheckBoxPoc = this.getView().byId("pocInd");
			var selectedCheckBoxThrdParty = this.getView().byId("prodSrc");
			if (data[0].SrchTyp === "I") {
				selectedRadioButtonDetail.setSelected(true);
			} else if (data[0].SrchTyp === "H") {
				selectedRadioButtonHeader.setSelected(true);
			}
			if (data[0].Biologic === "X") {
				selectedCheckBoxBilogic.setSelected(true);
			}
			if (data[0].FICInd === "X") {
				selectedCheckBoxFic.setSelected(true);
			}
			if (data[0].POCInd === "X") {
				selectedCheckBoxPoc.setSelected(true);
			}
			if (data[0].ProdSrce === "X") {
				selectedCheckBoxThrdParty.setSelected(true);
			}
			var tabDate = this.getView().byId("expDateId");
			var tabSubDate = this.getView().byId("subDateId");
			var tabEffDate = this.getView().byId("effecDateId");
			var form = this.getView().byId("searchForm");
			form.setModel(jsonModel, "variantData");
			form.setModel(newDevDataModel, "variantDevPhase");
			form.setModel(newReqStatusDataModel, "variantReqStatus");
			form.setModel(prodTypeDataModel, "prodTypeData");
			form.setModel(primIndDataModel, "primIndData");
			form.setModel(pricModelDataModel, "pricModelData");
			form.setModel(marketGrpDataModel, "marketGrpData");
			form.setModel(destMarkDataModel, "destMarkData");
			form.setModel(destTypeDataModel, "destTypeData");
			form.setModel(expDateModel, "expDateData");
			form.setModel(subDateModel, "subDateData");
			form.setModel(effDateModel, "effDateData");
			if (sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].ExpiryDt === "") {
				tabDate.setDateValue(null);
				tabDate.setSecondDateValue(null);
			}
			if (sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].SubmitDt === "") {
				tabSubDate.setDateValue(null);
				tabSubDate.setSecondDateValue(null);
			}
			if (sap.ui.getCore().getModel("savedVariantModel").getData()[selectedPath].EffDate === "") {
				tabEffDate.setDateValue(null);
				tabEffDate.setSecondDateValue(null);
			}
			form.setModel(prodNameDataModel, "prodNameData");
			if (prodNameDataModel.getData()[0].valuepair.toString() === ",") {
				this.getView().byId("selectedProds").destroyTokens();
			}
			form.setModel(prodIdDataModel, "prodIdData");
			this._oDialog.close();
		},
		onClosePress: function (oEvent) {
			this._oDialog.close();
		},
		saveVariant: function (oEvent) {
			var srchHeadModel = this.getView().getModel("srchHeadModel");
			var ret = this.validateForm(this);
			if (!ret) {
				sap.m.MessageBox.show("Please enter all required fields", sap.m.MessageBox.Icon.ERROR, "Required Fields", [sap.m.MessageBox.Action
					.OK
				]);
				return;
			}
			var expDateFrom = new Date(this.getView().byId("expDateId").getDateValue());
			var expDateTo = this.getView().byId("expDateId").getSecondDateValue();
			var expDateF = this.formatDate(expDateFrom);
			var expDateT = this.formatDate(expDateTo);
			if (this.getView().byId("expDateId").getDateValue() === null && this.getView().byId("expDateId").getSecondDateValue() === null) {
				expDateF = null;
				expDateT = null;
			}
			var reqDateFrom = new Date(this.getView().byId("subDateId").getDateValue());
			var reqDateTo = this.getView().byId("subDateId").getSecondDateValue();
			var reqDateF = this.formatDate(reqDateFrom);
			var reqDateT = this.formatDate(reqDateTo);
			if (this.getView().byId("subDateId").getDateValue() === null && this.getView().byId("subDateId").getSecondDateValue() === null) {
				reqDateF = null;
				reqDateT = null;
			}
			var effDateFrom = new Date(this.getView().byId("effecDateId").getDateValue());
			var effDateTo = this.getView().byId("effecDateId").getSecondDateValue();
			var effDateF = this.formatDate(effDateFrom);
			var effDateT = this.formatDate(effDateTo);
			if (this.getView().byId("effecDateId").getDateValue() === null && this.getView().byId("effecDateId").getSecondDateValue() ===
				null) {
				effDateF = null;
				effDateT = null;
			}
			var prodName = [];
			var selectedProdName = this.getView().byId("selectedProds").getTokens();
			for (var name = 0; name < selectedProdName.length; name++) {
				var prodText = selectedProdName[name].getText();
				prodName.push(prodText);
			}
			var prodId = [];
			var selectedTokens = this.getView().byId('selectedProds').getTokens();
			for (var id = 0; id < selectedTokens.length; id++) {
				var keys1 = selectedTokens[id].getKey();
				prodId.push(keys1);
			}
			var SearchType = "";
			if (this.getView().byId("srchHeader").getSelected()) {
				SearchType = "H";

			} else if (this.getView().byId("srchDetail").getSelected()) {
				SearchType = "I";
			}
			var biologic = "";
			var ficind = "";
			var pocInd = "";
			var prodSrc = "";
			if (this.getView().byId("biologic").getSelected()) {
				biologic = "X";
			}
			if (this.getView().byId("ficind").getSelected()) {
				ficind = "X";
			}
			if (this.getView().byId("pocInd").getSelected()) {
				pocInd = "X";
			}
			if (this.getView().byId("prodSrc").getSelected()) {
				prodSrc = "X";
			}
			var t = this;
			var oEntry = {};
			oEntry.SrchTyp = SearchType;
			oEntry.ReqNo = this.getView().byId("reqNo").getValue();
			oEntry.DevPhase = this.getView().byId("devPhase").getSelectedKeys().toString();
			oEntry.ReqTyp = this.getView().byId("reqTyp").getSelectedKey().toString();
			oEntry.HStatus = this.getView().byId("reqStat").getSelectedKeys().toString();
			oEntry.ProdTyp = this.getView().byId("prodType").getSelectedKeys().toString();
			oEntry.IndKey = this.getView().byId("primaryInd").getSelectedKeys().toString();
			oEntry.MechAction = this.getView().byId("actionMech").getSelectedKey();
			oEntry.FiniGoodsFrm = this.getView().byId("finiGoodsForm").getSelectedKey();
			oEntry.Biologic = biologic;
			oEntry.FICInd = ficind;
			oEntry.POCInd = pocInd;
			oEntry.ProdSrce = prodSrc;
			oEntry.ProdId = prodId.toString();
			oEntry.OtherNames = prodName.toString();
			oEntry.PriceModel = this.getView().byId("pricing").getSelectedKeys().toString();
			oEntry.DestMrkts = this.getView().byId("markets").getSelectedKeys().toString();
			oEntry.Group = this.getView().byId("ficGrp").getSelectedKeys().toString();
			oEntry.ShipDest = this.getView().byId("destType").getSelectedKeys().toString().replace(/,\s*$/, "");
			if (oEntry.ShipDest === "P,3" || oEntry.ShipDest === "3,P") {
				oEntry.ShipDest = "B";
			}
			oEntry.ReqUserId = this.getView().byId("idNtId").getValue();
			oEntry.ReqGrp = this.getView().byId("reqGrp").getSelectedKey();
			if (expDateF === null && expDateT === null) {
				oEntry.ExpiryDt = null;
			} else {
				oEntry.ExpiryDt = expDateF.concat(expDateT);
			}
			oEntry.BICComp = this.getView().byId("classComp").getSelectedKey();
			oEntry.ValuUserId = this.getView().byId("valById").getValue();
			oEntry.SPIUserId = this.getView().byId("spInputId").getValue();
			oEntry.ApprvUserId = this.getView().byId("approvId").getValue();
			if (reqDateF === null && reqDateT === null) {
				oEntry.SubmitDt = null;
			} else {
				oEntry.SubmitDt = reqDateF.concat(reqDateT);
			}
			if (effDateF === null && effDateT === null) {
				oEntry.EffDate = null;
			} else {
				oEntry.EffDate = effDateF.concat(effDateT);
			}
			oEntry.VariantId = t.sText;
			oEntry.VariantDesc = t.tText;
			oEntry.UserId = t.getUserId();
			var assetArray = [];
			var resultPayload = {};
			resultPayload.SrchTyp = SearchType;
			assetArray.push(resultPayload);
			oEntry.ReqSrchResultsSet = assetArray;
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/ReqSrchQuerySet", oEntry, {
				method: "POST",
				success: function (oData) {
					var results = oData.ReqSrchResultsSet.results;
					srchHeadModel.setData(results);
				}
			});
		},
		onSaveSearchPressed: function (oEvent) {
			var variantId = "";
			var variantDesc = "";
			var form = this.getView().byId("searchForm");
			if (form.getModel("variantData")) {
				variantId = form.getModel("variantData").getData()[0].VariantId;
				variantDesc = form.getModel("variantData").getData()[0].VariantDesc;
			} else {
				variantId = "";
				variantDesc = "";
			}
			var ret = this.validateForm(this);
			if (!ret) {
				sap.m.MessageBox.show("Please enter all required fields", sap.m.MessageBox.Icon.ERROR, "Required Fields", [sap.m.MessageBox.Action
					.OK
				]);
				return;
			}
			var t = this;
			var dialog = new Dialog({
				title: 'Confirm',
				type: 'Message',
				content: [
					new Label({
						text: 'Report Name',
						labelFor: 'submitDialogTextarea',
						design: 'Bold',
						required: true,
						valueStateText: 'Required Field Cannot be Empty'
					}),
					new TextArea('submitDialogTextarea', {
						liveChange: function () {
							var sText = oEvent.getParameter('value');
							if (sText.length >= 1) {
								sap.ui.getCore().byId("submitDialogTextarea").setValueState("None");
							}
						},
						width: '100%',
						placeholder: 'Search Name (required)',
						id: 'srchName',
						value: variantId
					}),
					new Label({
						text: 'Report Description',
						labelFor: 'test',
						design: 'Bold',
						required: true
					}),
					new TextArea('test', {
						liveChange: function () {
							var sText = oEvent.getParameter('value');
							var parent = oEvent.getSource().getParent();
							parent.getBeginButton().setEnabled(sText.length > 0);
						},
						width: '100%',
						placeholder: 'Search Description (required)',
						value: variantDesc
					})
				],
				beginButton: new Button({
					text: 'Save',
					enabled: false,
					press: function () {
						var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
						if (sText === "") {
							sap.ui.getCore().byId("submitDialogTextarea").setValueState("Error");
							sap.m.MessageBox.show("Please enter the required field", sap.m.MessageBox.Icon.ERROR, "Required Fields", [sap.m.MessageBox
								.Action
								.OK
							]);
							return;
						}
						var tText = sap.ui.getCore().byId('test').getValue();
						t.sText = sText;
						t.tText = tText;
						t.saveVariant();
						MessageToast.show('My Report name is saved as: ' + sText);
						dialog.close();
						if (t.getView().getModel("userInfoModel").getData().SrchReptSet.WrkItmCnt >= "  5") {
							t.getView().byId("saveSearch").setVisible(false);
						} else {
							t.getView().byId("saveSearch").setVisible(true);
						}
					}
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
			if (variantId !== "") {
				dialog.getAggregation('beginButton').setEnabled(true);
			}
			if (t.getView().getModel("userInfoModel").getData().SrchReptSet.WrkItmCnt >= "  5") {
				sap.ui.getCore().byId('submitDialogTextarea').setEditable(false);
			}
		},
		onNavBack: function () {
			this.clearFormField();
			this.setRaisedEvent("NAVBACK");
			this.clearAllFilters();
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.oRouter.navTo("MainView", {}, true);
			}
		}
	});
});