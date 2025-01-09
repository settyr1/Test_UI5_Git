sap.ui.define(["sap/ui/core/library", 'sap/uxap/BlockBase'], function (coreLibrary, BlockBase) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var HeaderBlock = BlockBase.extend("sap.uxap.sample.SharedBlocks.Header.HeaderPage", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.pfizer.fda.SharedBlocks.Header.HeaderPage",
					type: ViewType.XML
				},
				Expanded: {
					viewName: "com.pfizer.fda.SharedBlocks.Header.HeaderPage",
					type: ViewType.XML
				}
			}
		}
	});
	return HeaderBlock;
}, true);