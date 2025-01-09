jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"zsdcampaign/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"zsdcampaign/test/integration/pages/Worklist",
		"zsdcampaign/test/integration/pages/Object",
		"zsdcampaign/test/integration/pages/NotFound",
		"zsdcampaign/test/integration/pages/Browser",
		"zsdcampaign/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zsdcampaign.view."
	});

	sap.ui.require([
		"zsdcampaign/test/integration/WorklistJourney",
		"zsdcampaign/test/integration/ObjectJourney",
		"zsdcampaign/test/integration/NavigationJourney",
		"zsdcampaign/test/integration/NotFoundJourney",
		"zsdcampaign/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});