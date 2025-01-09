//Factory Definition
sap.ui.define([
		'sap/m/ColumnListItem',
		'sap/m/MultiComboBox',
		'sap/m/DatePicker',
		'sap/m/TimePicker',
		"com/pfizer/fda/model/formatter",
		"com/pfizer/fda/controller/BaseController"
	], function(ColumnListItem, MultiComboBox, DatePicker, TimePicker, formatter, BaseController) {
		"use strict";

		var AttributeTableFactory = {
			formatter: formatter,

			factory: function(id, context) {

				var totColumns = Object.keys(context.getObject());
				var ColumnRef;
				var mycells = [];
				totColumns.sort();

				totColumns.map(function(resultColumn) {

					ColumnRef = "{FDA>" + resultColumn + "}";
					
					switch(resultColumn){
						case "__metadata":
							return;
						// case "Ctsms":
						// 	return;
						// case "Ctsmu":
						// 	var linkCell = new sap.m.Link({
						// 				text: ColumnRef,
						// 				press: function(oEvent) {
						// 					var oSelectedItem = oEvent.getSource();
						// 					var lController = this.getParent().getParent().getParent().getParent().getParent().oController;
						// 					lController._SearchElement.setValue(oSelectedItem.getProperty('text'));
						// 					this.getParent().getParent().getParent().getParent().close();
						// 				}
						// 			});	

						// 	mycells.push(linkCell);
						// 	return;
						default:
					}

					mycells.push(
							new sap.m.Text({
								text: ColumnRef
							})						
						);
				});
				
				var oColList = new ColumnListItem({
									cells: mycells
				});
				
				return oColList;
				
			}
		};

		return AttributeTableFactory;

	},
	/* bExport= */
	true);