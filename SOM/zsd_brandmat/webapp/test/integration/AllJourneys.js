jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"zsdbrandmat/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"zsdbrandmat/test/integration/pages/Worklist",
		"zsdbrandmat/test/integration/pages/Object",
		"zsdbrandmat/test/integration/pages/NotFound",
		"zsdbrandmat/test/integration/pages/Browser",
		"zsdbrandmat/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zsdbrandmat.view."
	});

	sap.ui.require([
		"zsdbrandmat/test/integration/WorklistJourney",
		"zsdbrandmat/test/integration/ObjectJourney",
		"zsdbrandmat/test/integration/NavigationJourney",
		"zsdbrandmat/test/integration/NotFoundJourney",
		"zsdbrandmat/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});