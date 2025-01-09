sap.ui.define([], function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		formatCurrency: function (currency) {
			var Curr = "$" + currency + "  " + "USD";
			return Curr;
		},

		formatUoM: function (Qty, UoM) {
			var quantity = Qty + "  " + UoM;
			return quantity;
		},

		replaceDate: function (submitDate, createDate) {
			if (submitDate) {
				return submitDate;
			} else {
				return createDate;
			}
		},

		formatDevPhDesc: function (devPhase) {
			var devPhDesc;
			var aDevPhase = [];
			aDevPhase = this.getView().getModel("dropDownModel").getData().devPhase;
			if (aDevPhase) {
				var i = 0;
				for (i = 0; i < aDevPhase.length; i++) {
					if (aDevPhase[i].Value === devPhase) {
						devPhDesc = aDevPhase[i].Desc;
						break;
					}
				}
			}
			return devPhDesc;
		},

		formatPriceUnit: function (uom1) {
			var unit;
			if (uom1) {
				unit = "USD/";
				//unit = "USD";
				unit = unit.concat(uom1);
				return unit;
			} else {
				unit = "USD/XX";
				//	unit = "USD";
				return unit;
			}
		},

		formatValuePerUnit: function (strn1, uom1, strn2, uom2, strn3, uom3) {
			var formulation;
			var value1 = "" + strn1 + " " + uom1 + "";
			var value2 = "" + strn2 + " " + uom2 + "";
			var value3 = "" + strn3 + " " + uom3 + "";
			if (value1.match(/[1-9]/g) && value2.match(/[1-9]/g) && value3.match(/[1-9]/g)) {
				formulation = "" + value1 + " / " + value2 + " / " + value3 + "";
			} else {
				if (value1.match(/[1-9]/g) && value2.match(/[1-9]/g)) {
					formulation = "" + value1 + " / " + value2 + "";
				} else {
					if (value1.match(/[1-9]/g)) {
						formulation = value1;
					}
				}
			}
			return formulation;
		},

		formatStatusIcon: function (itemStatus) {
			var icon;
			if (itemStatus === "In-Progress") {
				icon = "sap-icon://locked";
				// icon = "sap-icon://SAP-icons-TNT/exceptions";
			}
			return icon;
		},

		formatBooleanVal: function (oValue) {
			var yesNoFlag;
			if (oValue === "X") {
				yesNoFlag = "Yes";
			} else {
				yesNoFlag = "No";
			}
			return yesNoFlag;
		},

		formatColor: function (value) {
			var currentDate30 = new Date();
			currentDate30.setDate(currentDate30.getDate() + 30);
			//	var currentDateFormat = this.formatDateReport(currentDate30);
			//	var ExpiryDate30 = currentDateFormat;
			var crDate = new Date();
			//	var crDateFormat = this.formatDateReport(crDate);
			var expDt2 = new Date(value);
			if (crDate.getTime() <= expDt2.getTime() && currentDate30.getTime() > expDt2.getTime()) {
				return "Error";
			} else {
				return "Warning";
			}
		},
		rowHighlight: function (value) {
			var currentDate30 = new Date();
			currentDate30.setDate(currentDate30.getDate() + 30);
			//var currentDateFormat = this.formatDateReport(currentDate30);
			//var ExpiryDate30 = currentDateFormat;
			var crDate = new Date();
			//var crDateFormat = this.formatDateReport(crDate);
			var expDt2 = new Date(value);
			if (crDate.getTime() <= expDt2.getTime() && currentDate30.getTime() > expDt2.getTime()) {
				return "Error";
			} else {
				return "Warning";
			}
		},
		formatReqGrp: function (reqgrp) {
			var aReqGrp = this.getView().getModel("dropDownModel").getData().reqGrp;
			var reqGrpDesc;
			aReqGrp.filter(function (arr) {
				if (arr.Value === reqgrp) {
					reqGrpDesc = arr.Desc;
				}
			});
			return reqGrpDesc;
		},

		formatProdSrc: function (oValue) {
			var prodSrc;
			if (oValue === "P") {
				prodSrc = "Pfizer";
			} else {
				prodSrc = "External";
			}
			return prodSrc;
		},

		formatDestination: function (dest) {
			var oDest;
			if (dest === "P") {
				oDest = "Pfizer";
			}
			if (dest === "3") {
				oDest = "3rd Party";
			}
			if (dest === "B") {
				oDest = "Both Pfizer & 3rd Party";
			}
			return oDest;
		}
	};
});