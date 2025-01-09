jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"zsdcampupload/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"zsdcampupload/test/integration/pages/Worklist",
		"zsdcampupload/test/integration/pages/Object",
		"zsdcampupload/test/integration/pages/NotFound",
		"zsdcampupload/test/integration/pages/Browser",
		"zsdcampupload/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zsdcampupload.view."
	});

	sap.ui.require([
		"zsdcampupload/test/integration/WorklistJourney",
		"zsdcampupload/test/integration/ObjectJourney",
		"zsdcampupload/test/integration/NavigationJourney",
		"zsdcampupload/test/integration/NotFoundJourney",
		"zsdcampupload/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});