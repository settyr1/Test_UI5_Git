sap.ui.define([
		"com/pfizer/ctg/CTG_REQ/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("com.pfizer.ctg.CTG_REQ.controller.NotFound", {

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