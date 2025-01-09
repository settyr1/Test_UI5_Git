jQuery.sap.declare("ZBP_CREATE.Component");

jQuery.sap.require("ZBP_CREATE.MyRouter");

sap.ui.core.UIComponent.extend("ZBP_CREATE.Component", {

	metadata: {

		name: "ZBP_CREATE",
		version: "1.0",
		includes: [],

		dependencies: {

			libs: ["sap.m", "sap.ui.layout"],

			components: []

		},

		rootView: "ZBP_CREATE.view.App",

		config: {

			resourceBundle: "i18n/messageBundle.properties",

			serviceConfig: {

				name: "ZGTS_BP_SCREEN_SRV",

				serviceUrl: "/sap/opu/odata/sap/ZGTS_BP_SCREEN_SRV/",

				apikey: ""

			}

		},

		routing: {

			config: {

				routerClass: ZBP_CREATE.MyRouter,

				viewType: "XML",

				viewPath: "ZBP_CREATE.view",

				targetAggregation: "detailPages",

				clearTarget: false

			},

			routes: [

				{

					pattern: "",

					name: "main",

					view: "Master",

					targetAggregation: "masterPages",

					targetControl: "idAppControl",

					subroutes: [

						{

							pattern: "{entity}/:tab:",

							name: "detail",

							view: "Detail"

						}

					]

				},

				{

					name: "catchallMaster",

					view: "Master",

					targetAggregation: "masterPages",

					targetControl: "idAppControl",

					subroutes: [

						{

							pattern: ":all*:",

							name: "catchallDetail",

							view: "NotFound",

							transition: "show"

						}

					]

				}

			]

		}

	},

	init: function() {

		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		var mConfig = this.getMetadata().getConfig();

		// always use absolute paths relative to our own component

		// (relative paths will fail if running in the Fiori Launchpad)

		var oRootPath = jQuery.sap.getModulePath("ZBP_CREATE");

		// set i18n model

		var i18nModel = new sap.ui.model.resource.ResourceModel({

			bundleUrl: [oRootPath, mConfig.resourceBundle].join("/")

		});

		this.setModel(i18nModel, "i18n");

		var oModel;

		var mHeaders = {
			"apikey": mConfig.serviceConfig.apikey
		};

		if (window.cordova) {

			//TODO: If running using Cordova without SMP :

			// 1)  Replace the place holder in the url with the service server host and port

			// 2)  Set the user name and password to the appropriate values or implement login screen

			var url = "<Service host and port>" + mConfig.serviceConfig.name;

			var sUsername = null;

			var sPassword = null;

			oModel = new sap.ui.model.odata.ODataModel(url, true, sUsername, sPassword, mHeaders, true, true, true);

			//TODO: If using SMP uncomment the code below and use instead of the above lines 

			//      var url = appContext.applicationEndpointURL;

			//      mHeaders["X-SMP-APPCID"] = appContext.applicationConnectionId;

			//      oModel = new sap.ui.model.odata.ODataModel(url, true, appContext.registrationContext.user, appContext.registrationContext.password, mHeaders);

		} else {

			var sServiceUrl = mConfig.serviceConfig.serviceUrl;

			var oStartupParameters = jQuery.sap.getUriParameters().mParams;

			//This code is only needed for testing the application when there is no local proxy available, and to have stable test data.

			var bIsMocked = jQuery.sap.getUriParameters().get("responderOn") === "true";

			// start the mock server for the domain model

			if (bIsMocked) {

				this._startMockServer(sServiceUrl);

			}

			if (oStartupParameters !== null)

			{

				var StartParam = oStartupParameters;

			} else

			{

				var StartParam = this.getComponentData().startupParameters;

			}

			// Create and set domain model to the component

			//var FilterUrl = "$filter=Userid eq " + StartParam.USERID[0] + " and Logsys eq " + StartParam.LOGSYS[0] + "";

			var FilterUrl = "$filter=Userid eq " + StartParam.userid[0] + " and Logsys eq " + StartParam.logsys[0] + "";

			var GlobalModel = new sap.ui.model.json.JSONModel(
				{
					userid: StartParam.userid[0],
					logsys: StartParam.logsys[0]
				});
				
			sap.ui.getCore().setModel(GlobalModel,"GlobalModel");
			// oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true, null, null, mHeaders);

			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, {

				json: true,

				loadMetadataAsync: true,

				serviceUrlParams: FilterUrl

			});

			/* IE issue

			var ListJsonModel = new sap.ui.model.json.JSONModel();

			var fnSuccess = function(oData) {

			    ListJsonModel.setData({"GTS_BPSet":oData.results});

			    };

			  var fnError = function(oError) {

			  };

			  oModel.read("/GTS_BPSet", {

			      success: fnSuccess,

			      error: fnError

			  });



			  */

			var oModelCountry = new sap.ui.model.odata.ODataModel(sServiceUrl, {

				json: true,

				loadMetadataAsync: true

			});

		}

		this.setModel(oModel);

		oModel.setSizeLimit(300);

		oModelCountry.setSizeLimit(300);

		oModelCountry.attachMetadataFailed(function() {

			this.getEventBus().publish("Component", "MetadataFailed");

		}, this);

		this.setModel(oModelCountry, "oModelCountry");

		sap.ui.getCore().setModel(oModelCountry, "oModelCountry");

		// set device model

		var oDeviceModel = new sap.ui.model.json.JSONModel({

			isTouch: sap.ui.Device.support.touch,

			isNoTouch: !sap.ui.Device.support.touch,

			isPhone: sap.ui.Device.system.phone,

			isNoPhone: !sap.ui.Device.system.phone,

			listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",

			listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive"

		});

		oDeviceModel.setDefaultBindingMode("OneWay");

		this.setModel(oDeviceModel, "device");

		this.getRouter().initialize();

	},

	_startMockServer: function(sServiceUrl) {

		jQuery.sap.require("sap.ui.core.util.MockServer");

		var oMockServer = new sap.ui.core.util.MockServer({

			rootUri: sServiceUrl

		});

		var iDelay = +(jQuery.sap.getUriParameters().get("responderDelay") || 0);

		sap.ui.core.util.MockServer.config({

			autoRespondAfter: iDelay

		});

		oMockServer.simulate("model/metadata.xml", "model/");

		oMockServer.start();

		sap.m.MessageToast.show("Running in demo mode with mock data.", {

			duration: 2000

		});

	}

});