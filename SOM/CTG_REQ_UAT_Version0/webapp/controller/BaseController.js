sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	var gUserId;
	var userName;
	var raisedEvent;
	var tileRole;
	var oDataUpdateCall;

	return Controller.extend("com.pfizer.ctg.CTG_REQ.controller.BaseController", {

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		setUserName: function (userId, uName) {
			gUserId = userId;
			userName = uName;
			return (gUserId, userName);
		},

		getUserName: function () {
			return userName;
		},
		getUserId: function () {
			return gUserId;
		},
		setRaisedEvent: function (eventName) {
			raisedEvent = eventName;
			return raisedEvent;
		},
		getRaisedEvent: function () {
			return raisedEvent;
		},

		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		setTileRole: function (role) {
			tileRole = role;
			return tileRole;
		},

		getTileRole: function () {
			return tileRole;
		},

		setODataCall: function (value) {
			oDataUpdateCall = value;
			return oDataUpdateCall;
		},

		getODataCall: function () {
			return oDataUpdateCall;
		},

		initializeModels: function () {
			var createRequestModel = this.getView().getModel("createRequestModel");
			createRequestModel.setData(null);

			var marketsModel = this.getView().getModel("marketsModel");
			marketsModel.setProperty("/market", null);

			var strengthsModel = this.getView().getModel("strengthsModel");
			delete strengthsModel.getData().strengths;
			strengthsModel.setData({
				strengths: [{
					Strn1: "",
					SUoM1: "",
					Strn2: "",
					SUoM2: "",
					Strn3: "",
					SUoM3: ""
				}]
			});

			var ficPricGrpModel = this.getView().getModel("ficPricGrpModel");
			ficPricGrpModel.setProperty("/grpprice", null);

			var otherNamesModel = this.getView().getModel("otherNamesModel");
			delete otherNamesModel.getData().Names;
			otherNamesModel.setData({
				Names: [{
					Qualifier: "",
					ProdName: ""
				}]
			});
			var fileAttachmentModel = this.getView().getModel("fileAttachmentModel");
			fileAttachmentModel.setProperty("/attachments", null);
		},

		onFileDownloadClick: function (oEvent, aAttachments, attachType, reqNo) {
			var fileName = oEvent.getSource().getProperty("text");
			var pad = "0000000000";
			var reqNum = (pad + reqNo).slice(-pad.length);
			var oReqNo = new sap.ui.model.Filter("ReqNo", sap.ui.model.FilterOperator.EQ, reqNum);
			var oAction = new sap.ui.model.Filter("Action", sap.ui.model.FilterOperator.EQ, "R");
			var oAttchTyp = new sap.ui.model.Filter("AttchTyp", sap.ui.model.FilterOperator.EQ, attachType);
			var oFileName = new sap.ui.model.Filter("FileName", sap.ui.model.FilterOperator.EQ, fileName);
			var aFilter = [oReqNo, oAction, oAttchTyp, oFileName];
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/ReqAttachmentSet", {
				filters: aFilter,
				success: function (oData) {
					var fileType;
					var aFileContent;
					var i = 0;
					if (oData.results.length > 0 && oData.results[0].Content !== "") {
						fileName = oData.results[0].FileName;
						fileType = oData.results[0].FileType;
						aFileContent = oData.results[0].Content;
					} else {
						for (i = 0; i < aAttachments.length; i++) {
							if (aAttachments[i].FileName === oFileName.oValue1) {
								fileName = aAttachments[i].FileName;
								fileType = aAttachments[i].FileType;
								aFileContent = aAttachments[i].Content;
								break;
							}
						}
					}
					if (aFileContent) {
						that.onSaveContent(fileName, fileType, aFileContent);
					} else {
						MessageBox.error("File failed to upload from Server!");
					}
				},
				error: function (oData) {}
			});
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		onSaveContent:	function(fileName, fileType, aFileContent){
			var browserName = sap.ui.Device.browser.name;
			if (browserName === "ie") {
				this.onDownloadFileIE(fileName, fileType, aFileContent);
			} else {
				this.onDownloadFile(fileName, fileType, aFileContent);
			}			
		},
		
		onDownloadFileIE:	function(fileName, fileType, aFileContent){
			var contentType;
			if (fileType.indexOf("sheet") >= 1 || fileType.indexOf("excel") >= 1) {
				contentType = "application/xlsx";
			}
			if (fileType.indexOf("word") >= 1) {
				contentType = "application/word";
			}			
			if (fileType.indexOf("pdf") >= 1) {
				contentType = "application/pdf";
			}
			if (fileType.indexOf("png") >= 1) {
				contentType = "image/png";
			}			
			if (fileType.indexOf("jpeg") >= 1) {
				contentType = "image/jpeg";
			}
			var txtFile = fileType.replace("/", "");
			if (txtFile === "textplain") {
				contentType = "text/plain";
			}
			var byteCharacters = window.atob(aFileContent);
			var byteArrays = [];
			var sliceSize = 1024;
			for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
				var slice = byteCharacters.slice(offset, offset + sliceSize);
				var byteNumbers = new Array(slice.length);
				for (var i = 0; i < slice.length; i++) {
					byteNumbers[i] = slice.charCodeAt(i);
				}
				/*global Uint8Array*/ //Declared global to avoid ESLINT error. - Vallabh.
				var byteArray = new Uint8Array(byteNumbers);
				byteArrays.push(byteArray);
			}
			var blob = new Blob(byteArrays, {
				type: contentType
			});
    		window.navigator.msSaveOrOpenBlob(blob, fileName);			
		},

		onDownloadFile: function (fileName, fileType, aFileContent) {
			var link;
			var fileExtn;
			if (fileType.indexOf("sheet") >= 1 || fileType.indexOf("excel") >= 1) {
				fileExtn = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
				link = document.createElement("a");
				link.setAttribute("href", fileExtn + encodeURIComponent(aFileContent));
				link.setAttribute("download", fileName);
				link.click();
			}
			if (fileType.indexOf("word") >= 1) {
				fileExtn = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,";
				link = document.createElement("a");
				link.download = fileName;
				link.href = fileExtn + aFileContent;
				link.click();
			}
			if (fileType.indexOf("pdf") >= 1) {
				fileExtn = "application/pdf";
				var byteCharacters = window.atob(aFileContent);
				var byteArrays = [];
				var sliceSize = 512;
				for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
					var slice = byteCharacters.slice(offset, offset + sliceSize);
					var byteNumbers = new Array(slice.length);
					for (var i = 0; i < slice.length; i++) {
						byteNumbers[i] = slice.charCodeAt(i);
					}
					/*global Uint8Array*/ //Declared global to avoid ESLINT error. - Vallabh.
					var byteArray = new Uint8Array(byteNumbers);
					byteArrays.push(byteArray);
				}
				var blob = new Blob(byteArrays, {
					type: fileExtn
				});
				var url = URL.createObjectURL(blob);
				window.open(url, "blank");
			}
			if (fileType.indexOf("octet-stream") >= 1) {
				fileExtn = "data:application/octet-stream;base64,";
				link = document.createElement("a");
				link.download = fileName;
				link.href = fileExtn + aFileContent;
				link.click();
			}
			if (fileType.indexOf("png") >= 1) {
				fileExtn = "data:image/png;base64,";
				link = document.createElement("a");
				link.download = fileName;
				link.href = fileExtn + aFileContent;
				link.click();
			}
			if (fileType.indexOf("jpeg") >= 1) {
				fileExtn = "data:image/jpeg;base64,";
				link = document.createElement("a");
				link.download = fileName;
				link.href = fileExtn + aFileContent;
				link.click();
			}
			var txtFile = fileType.replace("/", "");
			if (txtFile === "textplain") {
				fileExtn = "data:text/plain;base64,";
				link = document.createElement("a");
				link.download = fileName;
				link.href = fileExtn + aFileContent;
				link.click();
			}
		},
		
		onRequestPDFDownload:	function(reqNo){
			var pad = "0000000000";
			var reqNum = (pad + reqNo).slice(-pad.length);
			var urlLink = "/sap/opu/odata/sap/ZCTG_REQUEST_SRV" + "/PDFDownloadSet('" + reqNum + "')/$value";
			window.open(urlLink);
		},		

		onReturnToHome: function () {
			this.initializeModels();
			this.oRouter.navTo("MainView", true);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function () {
			// var oViewModel = (this.getModel("reqHeadModel") || this.getModel("worklistView"));
			sap.m.URLHelper.triggerEmail(
				// oViewModel.getProperty("/shareSendEmailId")
			);
		},

		/**
		 * Adds a history entry in the FLP page history
		 * @public
		 * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
		 * @param {boolean} bReset If true resets the history before the new entry is added
		 */
		addHistoryEntry: (function () {
			var aHistoryEntries = [];

			return function (oEntry, bReset) {
				if (bReset) {
					aHistoryEntries = [];
				}

				var bInHistory = aHistoryEntries.some(function (entry) {
					return entry.intent === oEntry.intent;
				});

				if (!bInHistory) {
					aHistoryEntries.push(oEntry);
					this.getOwnerComponent().getService("ShellUIService").then(function (oService) {
						oService.setHierarchy(aHistoryEntries);
					});
				}
			};
		})()
	});
});