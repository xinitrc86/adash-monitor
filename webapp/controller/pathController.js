sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("adash.ui.monitor.controller.pathController", {
		//Constants
		PATH_SEPARATOR: "&nbsp;>&nbsp;",
		_oFlexBox: {},
		_currentPath: null,

		Init: function (oFlexBox) {
			this._oFlexBox = oFlexBox;

		},
		onPathChosen: function (oPath) {

			this._applyTitleToTitleBox(oPath);
			oPath.callBack();
			this._currentPath = oPath;
		},
		pushPath: function (sName, vType, callback) {

			var oPath = {
				name: sName,
				type: vType,
				callBack: callback,
				title: []
			};

			this._copyCurrentPathTitle(oPath);
			this._addNewPathToTitle(oPath);
			this._applyTitleToTitleBox(oPath);
		},
		_applyTitleToTitleBox: function (oPath) {

			this._oFlexBox.removeAllItems();
			var that = this;
			oPath.title.forEach(function (element) {
				that._oFlexBox.addItem(element);
			});

		},

		_copyCurrentPathTitle: function (oPath) {
			if (this._currentPath) {
				this._currentPath.title.forEach(function (oTitleItem) {

					oPath.title.push(oTitleItem);

				});
			}
		},
		_addNewPathToTitle: function (oPath) {

			var fCallback = this.onPathChosen.bind(this, oPath);
			if (!this._currentPath)
				{oPath.title.push(
					new sap.ui.core.Icon({
						size: "100%",
						src: "sap-icon://world",
						press: fCallback
					}));}
			else {

				oPath.title.push(new sap.m.FormattedText({
					htmlText: this.PATH_SEPARATOR
				}));

				var iconSrc = "";
				switch (oPath.type) {
				case "DEVC":
					iconSrc = "sap-icon://open-folder";
					break;
				default:
					iconSrc = "sap-icon://inspection";
					break;
				}

				oPath.title.push(new sap.ui.core.Icon({
					size: "100%",
					src: iconSrc,
					press: fCallback
				}));

			}

			oPath.title.push(new sap.m.FormattedText({
				htmlText: "&nbsp;"
			}));

			oPath.title.push(
				new sap.m.Link({
					text: oPath.name,
					press: fCallback
				})
			);

			this._currentPath = oPath;

		}

	});
});