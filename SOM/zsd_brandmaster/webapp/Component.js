sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/Device",
		"zsdbrandmaster/model/models",
		"zsdbrandmaster/controller/ErrorHandler",
		"zsdbrandmaster/model/ODataCalls",
		"sap/ui/model/json/JSONModel"
	], function (UIComponent, Device, models, ErrorHandler,ODataCalls,JSONModel) {
		"use strict";

		return UIComponent.extend("zsdbrandmaster.Component", {

			metadata : {
				manifest: "json"
			},

			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
			 * In this function, the FLP and device models are set and the router is initialized.
			 * @public
			 * @override
			 */
			init : function () {
				// call the base component's init function
				UIComponent.prototype.init.apply(this, arguments);

				// initialize the error handler with the component
				this._oErrorHandler = new ErrorHandler(this);

				// set the device model
				this.setModel(models.createDeviceModel(), "device");
				// set the FLP model
				this.setModel(models.createFLPModel(), "FLP");

				//url parameters
				this.urlParams = jQuery.sap.getUriParameters();
				
				//do not show views until the metadata is loaded
				var zshowViews = function() {
					// create the views based on the url/hash
					this.getRouter().initialize();
					
                      
					
				}.bind(this);
				
				//only display view after metadata was loaded
				this.getModel().metadataLoaded().
						then(zshowViews);

				if(this.urlParams["mParams"]["language"]){
					//de,en (small case from url language=de)
					sap.ui.getCore().getConfiguration().setLanguage(this.urlParams["mParams"]["language"][0]);
				}
				
				//force language enlish
				sap.ui.getCore().getConfiguration().setLanguage('it');

				// var sPath = jQuery.sap.getModulePath("zsdbrandmaster", "/model/mandatoryBrands.json");
				// var oMandatoryBrands = new JSONModel(sPath);
				// this.setModel(oMandatoryBrands, "mandatoryBrands");

			},


			/**
			 * The component is destroyed by UI5 automatically.
			 * In this method, the ErrorHandler is destroyed.
			 * @public
			 * @override
			 */
			destroy : function () {
				this._oErrorHandler.destroy();
				// call the base component's destroy function
				UIComponent.prototype.destroy.apply(this, arguments);
			},

			/**
			 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
			 * design mode class should be set, which influences the size appearance of some controls.
			 * @public
			 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
			 */
			getContentDensityClass : function() {
				if (this._sContentDensityClass === undefined) {
					// check whether FLP has already set the content density class; do nothing in this case
					if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
						this._sContentDensityClass = "";
					} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
						this._sContentDensityClass = "sapUiSizeCompact";
					} else {
						// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
						this._sContentDensityClass = "sapUiSizeCozy";
					}
				}
				return this._sContentDensityClass;
			}

		});

	}
);