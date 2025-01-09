sap.ui.define(['jquery.sap.global'],
	function (jQuery) {
		"use strict";

		var wrkListPersoServ = {
			oData: {
				aColumns: [{
						id: "ReqNo",
						order: 0,
						text: "Request No",
						visible: true
					}, {
						id: "ReqType",
						order: 1,
						text: "Request Type",
						visible: true
					}, {
						id: "ProdId",
						order: 2,
						text: "Pfizer Compound Name",
						visible: true
					}, {
						id: "ProdTyp",
						order: 3,
						text: "Product Type",
						visible: true
					}, {						
						id: "ProdName",
						order: 4,
						text: "Other Names",
						visible: true
					}, {
						id: "PrimInd",
						order: 5,
						text: "Primary Indication",
						visible: true
					}, {						
						id: "DevPhase",
						order: 6,
						text: "Phase",
						visible: true
					}, {
						id: "HStatus",
						order: 7,
						text: "Status",
						visible: true
					}, {
						id: "SubmitDate",
						order: 8,
						text: "Date Submitted",
						visible: true
					}, {
						id: "EffectDate",
						order: 9,
						text: "Effective Date",
						visible: true
					}, {
						id: "ExpiryDate",
						order: 10,
						text: "Expiration Date",
						visible: true
					}, {
						id: "RequstName",
						order: 11,
						text: "Requester Name",
						visible: true
					}, {
						id: "ValName",
						order: 12,
						text: "VFC Manager Name",
						visible: true
					}, {
						id: "SPInptName",
						order: 13,
						text: "SP Inputter Name",
						visible: true
					}, {
						id: "ApprvName",
						order: 14,
						text: "Approver Name",
						visible: true
					}, {
						id: "ALLPosnr",
						order: 15,
						text: "Line Items",
						visible: true
					}, {
						id: "PricModl",
						order: 16,
						text: "Price Model",
						visible: true
					}]
			},
			
			getData:	function(){
				return this.oData;
			},
			
			getPersData: function () {
				var oDeferred = new jQuery.Deferred();
				if (!this._oBundle) {
					this._oBundle = this.oData;
				}
				var oBundle = this._oBundle;
				oDeferred.resolve(oBundle);
				return oDeferred.promise();
			},

			setPersData: function (oBundle) {
				var oDeferred = new jQuery.Deferred();
				this._oBundle = oBundle;
				oDeferred.resolve();
				return oDeferred.promise();
			},

			resetPersData: function () {
				var oDeferred = new jQuery.Deferred();
				var oInitialData = {
					_persoSchemaVersion: "1.0",
					aColumns: [{
						id: "ReqNo",
						order: 0,
						text: "Request No",
						visible: true
					}, {
						id: "ReqType",
						order: 1,
						text: "Request Type",
						visible: true
					}, {
						id: "ProdId",
						order: 2,
						text: "Pfizer Compound Name",
						visible: true
					}, {
						id: "ProdTyp",
						order: 3,
						text: "Product Type",
						visible: true
					}, {						
						id: "ProdName",
						order: 4,
						text: "Other Names",
						visible: true
					}, {
						id: "PrimInd",
						order: 5,
						text: "Primary Indication",
						visible: true
					}, {												
						id: "DevPhase",
						order: 6,
						text: "Phase",
						visible: true
					}, {
						id: "HStatus",
						order: 7,
						text: "Status",
						visible: true
					}, {
						id: "SubmitDate",
						order: 8,
						text: "Date Submitted",
						visible: true
					}, {
						id: "EffectDate",
						order: 9,
						text: "Effective Date",
						visible: true
					}, {
						id: "ExpiryDate",
						order: 10,
						text: "Expiration Date",
						visible: true
					}, {
						id: "RequstName",
						order: 11,
						text: "Requester Name",
						visible: true
					}, {
						id: "ValName",
						order: 12,
						text: "VFC Manager Name",
						visible: true
					}, {
						id: "SPInptName",
						order: 13,
						text: "SP Inputter Name",
						visible: true
					}, {
						id: "ApprvName",
						order: 14,
						text: "Approver Name",
						visible: true
					}, {
						id: "ALLPosnr",
						order: 15,
						text: "Line Items",
						visible: true
					}, {
						id: "PricModl",
						order: 16,
						text: "Price Model",
						visible: true
					}]
				};

				//set personalization
				this._oBundle = oInitialData;

				//reset personalization, i.e. display table as defined
				//		this._oBundle = null;

				oDeferred.resolve();
				return oDeferred.promise();
			},

			//this caption callback will modify the TablePersoDialog' entry for the 'Weight' column
			//to 'Weight (Important!)', but will leave all other column names as they are.
			getCaption: function (oColumn) {
				if (oColumn.getHeader() && oColumn.getHeader().getText) {
					if (oColumn.getHeader().getText() === "Weight") {
						return "Weight (Important!)";
					}
				}
				return null;
			},

			getGroup: function (oColumn) {
				if (oColumn.getId().indexOf("productCol") !== -1 ||
					oColumn.getId().indexOf("supplierCol") !== -1) {
					return "Primary Group";
				}
				return "Secondary Group";
			}
		};

		return wrkListPersoServ;

	}, /* bExport= */ true);