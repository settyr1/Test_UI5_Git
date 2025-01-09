//Factory Definition
sap.ui.define([
		'sap/m/ColumnListItem',
		'sap/m/MultiComboBox',
		'sap/m/DatePicker',
		'sap/m/TimePicker',
		"zsdcampupload/model/formatter",
		"zsdcampupload/controller/BaseController"
	], function(ColumnListItem, MultiComboBox, DatePicker, TimePicker, formatter, BaseController) {
		"use strict";

		var AttributeTableFactory = {
			formatter: formatter,
			factory: function(id, context) {

				var oLabelText = context.getProperty("ScrtextL");
				var lOffset = context.getProperty("Offset");
				var lDemPopin = false;
				var lminScreenWidth = "";
				var lpopinDisplay = "WithoutHeader";
				
				if ( parseFloat(lOffset) > 130 ) {
					lDemPopin = true;
					lminScreenWidth = "1024px";
					lpopinDisplay = "WithoutHeader";
				}
				

				var newColumn = new sap.m.Column({
					header: new sap.m.Label({
								text: oLabelText
							}),
					demandPopin: lDemPopin,
					width : "auto",
					minScreenWidth: lminScreenWidth
				});
			
				return newColumn;
				
			}
		};

		return AttributeTableFactory;

	},
	/* bExport= */
	true);