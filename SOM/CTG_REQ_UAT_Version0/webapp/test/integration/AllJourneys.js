/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"com/pfizer/ctg/CTG_REQ/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/pfizer/ctg/CTG_REQ/test/integration/pages/Worklist",
	"com/pfizer/ctg/CTG_REQ/test/integration/pages/Object",
	"com/pfizer/ctg/CTG_REQ/test/integration/pages/NotFound",
	"com/pfizer/ctg/CTG_REQ/test/integration/pages/Browser",
	"com/pfizer/ctg/CTG_REQ/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.pfizer.ctg.CTG_REQ.view."
	});

	sap.ui.require([
		"com/pfizer/ctg/CTG_REQ/test/integration/WorklistJourney",
		"com/pfizer/ctg/CTG_REQ/test/integration/ObjectJourney",
		"com/pfizer/ctg/CTG_REQ/test/integration/NavigationJourney",
		"com/pfizer/ctg/CTG_REQ/test/integration/NotFoundJourney",
		"com/pfizer/ctg/CTG_REQ/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});