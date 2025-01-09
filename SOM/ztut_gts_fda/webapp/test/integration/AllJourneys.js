/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 FDA_PGENERALSet in the list
// * All 3 FDA_PGENERALSet have at least one PgeneralToPPG19PG20

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
		"com/pfizer/fda/test/integration/MasterJourney",
		"com/pfizer/fda/test/integration/NavigationJourney",
		"com/pfizer/fda/test/integration/NotFoundJourney",
		"com/pfizer/fda/test/integration/BusyJourney",
		"com/pfizer/fda/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});