sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/MessageBox"
], function(UI5Object, MessageBox) {
	"use strict";

	return UI5Object.extend("com.lbrands.rfq.controller.ErrorHandler", {

		/**
		 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
		 * @class
		 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
		 * @public
		 * @alias com.lbrands.rfq.controller.ErrorHandler
		 */
		constructor: function(oComponent, oResourceBundle, oModel) {

			if (oResourceBundle) {
				this._oResourceBundle = oResourceBundle;
			} else {
				this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			}
			this._oComponent = oComponent;
			if (oModel) {
				this._oModel = oModel;
			} else {
				this._oModel = oComponent.getModel();
			}
			this._bMessageOpen = false;
			this._sErrorText = this._oResourceBundle.getText("errorText");

			this.Router = oComponent.getRouter();

			this._oModel.attachMetadataFailed(function(oEvent) {
				var oParams = oEvent.getParameters();
				this._showServiceError(oParams.response);
			}, this);

			this._oModel.attachRequestFailed(function(oEvent) {

				var oParams = oEvent.getParameters();
				// An entity that was not found in the service is also throwing a 404 error in oData.
				// We already cover this case with a notFound target so we skip it here.
				// A request that cannot be sent to the server is a technical error that we have to handle though
				if (oParams.response.statusCode !== "404" || (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf(
						"Cannot POST") === 0)) {
					this._showServiceError(oParams.response.responseText);
				}
			}, this);
		},

		/**
		 * Shows a {@link sap.m.MessageBox} when a service call has failed.
		 * Only the first error message will be display.
		 * @param {string} sDetails a technical error to be displayed on request
		 * @private
		 */
		_showServiceError: function(errorMessage) {
			if (errorMessage[0] === "<") {
				var xmlMsg = this.StringToXMLDom(errorMessage);
				errorMessage = this.xmlToJson(xmlMsg);
				errorMessage = JSON.stringify(errorMessage);
			}

			var sMessage = "";
			var severity = "";
			if (this._bMessageOpen) {
				return;
			}
			if (jQuery.sap.startsWith(errorMessage, "{\"error\":")) {

				var oErrModel = new sap.ui.model.json.JSONModel();

				oErrModel.setJSON(errorMessage);

				var msgArray = oErrModel.getProperty("/error/innererror/errordetails");
				if (!msgArray || msgArray.length === 0) {
					sMessage = oErrModel.getProperty("/error/message/value");
				} else {
					if(!msgArray.length){
						msgArray = msgArray.errordetail;
						if(msgArray){
							for (var i = 0; i < msgArray.length; i++) {
								if (msgArray[i].code["#text"] !== "/IWBEP/CX_MGW_BUSI_EXCEPTION") {
									sMessage = sMessage + msgArray[i].message["#text"] + '\n';
									severity = msgArray[i].severity["#text"];
								}
							}
						}
					} else {
						for (var i = 0; i < msgArray.length; i++) {
							if (msgArray[i].code !== "/IWBEP/CX_MGW_BUSI_EXCEPTION") {
								sMessage = sMessage + msgArray[i].message + '\n';
								severity = msgArray[i].severity;
							}
						}
					}
				}

			}
			this._bMessageOpen = true;
			switch (severity) {
				case "error":
					MessageBox.error(
						sMessage, {
							id: "serviceErrorMessageBox",
							//details: sDetails,
							styleClass: this._oComponent.getContentDensityClass(),
							actions: [MessageBox.Action.CLOSE],
							onClose: function() {
								this._bMessageOpen = false;
						
								// if (appModel.getEmailMode()) {
								// 	var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
								// 	oCrossAppNavigator.toExternal({
								// 		target: {
								// 			semanticObject: "#"
								// 		}
								// 	});
								// }
							}.bind(this)
						}
					);

					//this.Router.navTo("NotFound", {}, true);
					break;
				case "info":
					MessageBox.information(
						sMessage, {
							id: "serviceErrorMessageBox",
							//	details: sDetails,
							styleClass: this._oComponent.getContentDensityClass(),
							actions: [MessageBox.Action.CLOSE],
							onClose: function() {
								this._bMessageOpen = false;
							}.bind(this)
						}
					);
					break;
				case "success":
					MessageBox.success(
						sMessage, {
							id: "serviceErrorMessageBox",
							//	details: sDetails,
							styleClass: this._oComponent.getContentDensityClass(),
							actions: [MessageBox.Action.CLOSE],
							onClose: function() {
								this._bMessageOpen = false;
							}.bind(this)
						}
					);
					break;

				case "warning":
					MessageBox.warning(
						sMessage, {
							id: "serviceErrorMessageBox",
							//	details: sDetails,
							styleClass: this._oComponent.getContentDensityClass(),
							actions: [MessageBox.Action.CLOSE],
							onClose: function() {
								this._bMessageOpen = false;
							}.bind(this)
						}
					);
					break;
				default:
					if (xmlMsg !== undefined && xmlMsg.getElementsByTagName("message")[0].innerHTML) {
						sMessage = xmlMsg.getElementsByTagName("message")[0].innerHTML;
					} else if (!sMessage) {
						sMessage = "Technical Error. Please contact administrator";
					}
					MessageBox.information(
						sMessage, {
							id: "serviceErrorMessageBox",
							//	details: sDetails,
							styleClass: this._oComponent.getContentDensityClass(),
							actions: [MessageBox.Action.CLOSE],
							onClose: function() {
								this._bMessageOpen = false;
							}.bind(this)
						}
					);
			}

		},

		StringToXMLDom: function(string) {
			var xmlDoc = null;
			if (window.DOMParser) {
				var parser = new DOMParser();
				xmlDoc = parser.parseFromString(string, "text/xml");
			} else // Internet Explorer
			{
				xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = "false";
				xmlDoc.loadXML(string);
			}
			return xmlDoc;
		},

		xmlToJson: function(xml) {

			// Create the return object
			var obj = {};

			if (xml.nodeType === 1) { // element
				// do attributes
				if (xml.attributes.length > 0) {
					obj["@attributes"] = {};
					for (var j = 0; j < xml.attributes.length; j++) {
						var attribute = xml.attributes.item(j);
						obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
					}
				}
			} else if (xml.nodeType === 3) { // text
				obj = xml.nodeValue;
			}

			// do children
			if (xml.hasChildNodes()) {
				for (var i = 0; i < xml.childNodes.length; i++) {
					var item = xml.childNodes.item(i);
					var nodeName = item.nodeName;
					if (typeof(obj[nodeName]) === "undefined") {
						obj[nodeName] = this.xmlToJson(item);
					} else {
						if (typeof(obj[nodeName].push) === "undefined") {
							var old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push(old);
						}
						obj[nodeName].push(this.xmlToJson(item));
					}
				}
			}
			return obj;
		}

	});

});