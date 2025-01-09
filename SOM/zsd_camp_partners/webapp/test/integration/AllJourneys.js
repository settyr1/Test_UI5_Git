jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"zsdcamppartners/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"zsdcamppartners/test/integration/pages/Worklist",
		"zsdcamppartners/test/integration/pages/Object",
		"zsdcamppartners/test/integration/pages/NotFound",
		"zsdcamppartners/test/integration/pages/Browser",
		"zsdcamppartners/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zsdcamppartners.view."
	});

	sap.ui.require([
		"zsdcamppartners/test/integration/WorklistJourney",
		"zsdcamppartners/test/integration/ObjectJourney",
		"zsdcamppartners/test/integration/NavigationJourney",
		"zsdcamppartners/test/integration/NotFoundJourney",
		"zsdcamppartners/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});