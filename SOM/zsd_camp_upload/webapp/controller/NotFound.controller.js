sap.ui.define([
		"zsdcampupload/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("zsdcampupload.controller.NotFound", {

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