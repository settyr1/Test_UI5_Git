sap.ui.define([
		"zsdbrandmat/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("zsdbrandmat.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);