sap.ui.define(["sap/ui/core/library", 'sap/uxap/BlockBase', "com/pfizer/fda/factory/SearchHelpFactory",], function (coreLibrary, BlockBase, SearchHelpFactory) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var HeaderBlockP04P06 = BlockBase.extend("sap.uxap.sample.SharedBlocks.Dependent.P04P06Edit", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.pfizer.fda.SharedBlocks.Dependent.P04P06",
					type: ViewType.XML
				},
				Expanded: {
					viewName: "com.pfizer.fda.SharedBlocks.Dependent.P04P06",
					type: ViewType.XML
				}
			}
		}
	});
	return HeaderBlockP04P06;
}, true);