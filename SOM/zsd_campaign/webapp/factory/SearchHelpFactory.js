//Factory Definition
sap.ui.define([
		'sap/m/ColumnListItem',
		'sap/m/MultiComboBox',
		'sap/m/DatePicker',
		'sap/m/TimePicker',
		"zsdcampaign/model/formatter",
		"zsdcampaign/controller/BaseController"
	], function(ColumnListItem, MultiComboBox, DatePicker, TimePicker, formatter, BaseController) {
		"use strict";

		var AttributeTableFactory = {
			formatter: formatter,
			factory: function(id, context) {

				var oDropDown = context.getProperty("F4availabl");
				var oDataType = context.getProperty("Datatype");
				var Outputstyle = context.getProperty("Outputstyle");

				var oSingleValue = '';
				var cellCharInput = null;

				var cellLabel = new sap.m.Label({
					text: context.getProperty("ScrtextL"),
					required: context.getProperty("EntryObligatory")
				});

				switch (oDataType)
				{
				   case 'CHAR':
				   	
						cellCharInput = new sap.m.Input({
							value: "{SH_MODEL>CurValue}",
							valueState: "None",
							enabled: true
						});
					
				   	 break;
				   case 'LANG':
						cellCharInput = new sap.m.Input({
							value: "{SH_MODEL>Langu}",
							valueState: "None",
							enabled: true
						});
					
				   	 break;				   	 
				   case 'DATE':
				   	 break;
				   default:

						cellCharInput = new sap.m.Text({
							text: "New Data Type from search help"
						});
				
				     break;
				}
				
				
				var oColList = new ColumnListItem({
									cells: [
												cellLabel,
												cellCharInput
											]
				});
				
				return oColList;
				
			}
		};

		return AttributeTableFactory;

	},
	/* bExport= */
	true);