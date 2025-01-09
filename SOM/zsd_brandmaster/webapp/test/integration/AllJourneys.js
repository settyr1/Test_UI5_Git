jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"zsdbrandmaster/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"zsdbrandmaster/test/integration/pages/Worklist",
		"zsdbrandmaster/test/integration/pages/Object",
		"zsdbrandmaster/test/integration/pages/NotFound",
		"zsdbrandmaster/test/integration/pages/Browser",
		"zsdbrandmaster/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zsdbrandmaster.view."
	});

	sap.ui.require([
		"zsdbrandmaster/test/integration/WorklistJourney",
		"zsdbrandmaster/test/integration/ObjectJourney",
		"zsdbrandmaster/test/integration/NavigationJourney",
		"zsdbrandmaster/test/integration/NotFoundJourney",
		"zsdbrandmaster/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});