jQuery.sap.declare("ZBP_CREATE.util.Controller");

sap.ui.core.mvc.Controller.extend("ZBP_CREATE.util.Controller", {

	getEventBus: function() {

		return sap.ui.getCore().getEventBus();

	},

	getRouter: function() {

		return sap.ui.core.UIComponent.getRouterFor(this);

	}

});