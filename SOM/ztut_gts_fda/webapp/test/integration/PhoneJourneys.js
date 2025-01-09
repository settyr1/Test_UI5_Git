/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"com/pfizer/fda/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/pfizer/fda/test/integration/pages/App",
	"com/pfizer/fda/test/integration/pages/Browser",
	"com/pfizer/fda/test/integration/pages/Master",
	"com/pfizer/fda/test/integration/pages/Detail",
	"com/pfizer/fda/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.pfizer.fda.view."
	});

	sap.ui.require([
		"com/pfizer/fda/test/integration/NavigationJourneyPhone",
		"com/pfizer/fda/test/integration/NotFoundJourneyPhone",
		"com/pfizer/fda/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});