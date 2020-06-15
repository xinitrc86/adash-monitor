sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("adash.ui.monitor.controller.pathFactory", {

		TYPE_PACKAGE: "DEVC",
		buildFor: function (oEntry) {
			var sName = oEntry.name;
			var vType = oEntry.typeRaw;

			var oPath = {};
			if (vType !== this.TYPE_PACKAGE) {
				oPath = this._buildTestMethodPath(sName, vType);
			} else
				{oPath = this._buildPackagePath(sName);}

			return oPath;
		},
		_buildPackagePath: function (sPackage) {
			var showPackageContentFilter = new sap.ui.model.Filter({
				and: true,
				filters: [
					new sap.ui.model.Filter("execution", "EQ", "LAST"),
					new sap.ui.model.Filter("name", "NE", sPackage),
					new sap.ui.model.Filter({
						and: false,
						filters: [
							new sap.ui.model.Filter("package_own", "EQ", sPackage),
							new sap.ui.model.Filter({
								and: true,
								filters: [
									new sap.ui.model.Filter("parent_package", "EQ", sPackage),
									new sap.ui.model.Filter("typeRaw", "EQ", "DEVC")

								]

							})
						]

					})
				]
			});
			return {
				path: "/ZCV_ADASH_RESULTS",
				name: sPackage,
				type: "DEVC",
				fragment: "adash.ui.monitor.fragment.testables",
				filter: showPackageContentFilter

			};
		},
		_buildTestMethodPath: function (sName, sType) {
			var oPath = {
				path: "testMethods>/ZCV_ADASH_TEST_METHODS",
				fragment: "adash.ui.monitor.fragment.testMethods",
				name: sName,
				type: sType,
				sorter: new sap.ui.model.Sorter("testClass", false, true)
			};
			var oEntryFilter = new sap.ui.model.Filter({
				and: true,
				filters: [
					new sap.ui.model.Filter("execution", "EQ", "LAST"),
					new sap.ui.model.Filter("name", "EQ", sName),
					new sap.ui.model.Filter("type", "EQ", sType)
				]
			});

			oPath.filter = oEntryFilter;

			return oPath;
		}

	});
});