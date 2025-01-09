sap.ui.define(["sap/ui/core/format/DateFormat"
	], function (DateFormat) {
		"use strict";

		return {
			/**
			 * Rounds the currency value to 2 digits
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * @returns {string} formatted currency value with 2 digits
			 */
			currencyValue : function (sValue) {
				if (!sValue) {
					return "";
				}

				return parseFloat(sValue).toFixed(2);
			},
			
			formatMyDateTime: function(fMyDate) {
	
				var userDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "MM/dd/yyyy HH:mm:ss"
				});
				if (fMyDate) {
					var ldate = this.formatter.convertStringToDate(fMyDate);
	
					return userDateFormat.format(ldate);
				}
				return "";
			},
			
			convertStringToDate: function(dateString) {
				var date;
				var year, month, day, hour, minutes, seconds;
	
				if (dateString !== "" && dateString !== null && dateString !== "undefined") {
					if (dateString.length === 8) {
						year = dateString.substring(0, 4);
						month = dateString.substring(4, 6);
						day = dateString.substring(6, 8);
	
						date = new Date(year, month - 1, day);
					}
					if (dateString.length === 14) {
						year = dateString.substring(0, 4);
						month = dateString.substring(4, 6);
						day = dateString.substring(6, 8);
						hour = parseInt(dateString.substring(8, 10), 10);
						minutes = parseInt(dateString.substring(10, 12), 10);
						seconds = parseInt(dateString.substring(12), 10);
						date = new Date(year, month - 1, day, hour, minutes, seconds);
					}
				} else {
					date = new Date();
				}
				return date;
		}
		
		};

	}
);