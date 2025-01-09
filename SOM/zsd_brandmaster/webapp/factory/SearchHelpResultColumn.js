//Factory Definition
sap.ui.define([
		'sap/m/ColumnListItem',
		'sap/m/MultiComboBox',
		'sap/m/DatePicker',
		'sap/m/TimePicker',
		"zsdbrandmaster/model/formatter",
		"zsdbrandmaster/controller/BaseController"
	], function(ColumnListItem, MultiComboBox, DatePicker, TimePicker, formatter, BaseController) {
		"use strict";

		var AttributeTableFactory = {
			formatter: formatter,
			factory: function(id, context) {

				var oLabelText = context.getProperty("ScrtextL");

				var newColumn = new sap.m.Column({
					header: new sap.m.Label({
								text: oLabelText
							}),
					demandPopin: true
				});
			
				return newColumn;
				
			}
		};

		return AttributeTableFactory;

	},
	/* bExport= */
	true);