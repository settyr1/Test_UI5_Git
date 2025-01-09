sap.ui.define(["sap/ui/core/library", 'sap/uxap/BlockBase'], function (coreLibrary, BlockBase) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var HeaderBlockP01 = BlockBase.extend("sap.uxap.sample.SharedBlocks.Header.HeaderPageP01", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.pfizer.fda.SharedBlocks.Header.HeaderPageP01",
					type: ViewType.XML
				},
				Expanded: {
					viewName: "com.pfizer.fda.SharedBlocks.Header.HeaderPageP01",
					type: ViewType.XML
				}
			}
		}
	});
	return HeaderBlockP01;
}, true);