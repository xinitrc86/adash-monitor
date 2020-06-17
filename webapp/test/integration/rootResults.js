sap.ui.require(
	["sap/ui/test/opaQunit",
	 "sap/ui/thirdparty/sinon"],
	 
	function(opaTest, sinon, button) {
		"use strict";
		

		QUnit.module("ADASH Main View");

		var appSetup = {
				componentName: "adash.ui.monitor",
				withMockServer: true,
				withRandomMockData: false
			};

		opaTest("It should display tiles", function(Given, When, Then) {
			Given.iStartMyApp(appSetup);
			Then.onMainView.myListShouldHaveRecords().and.iCloseMyApp();
		});

		opaTest("It should bind texts", function(Given, When, Then) {
			Given.iStartMyApp(appSetup);
			Then.onMainView.allTextsBindingsAreOk().and.iCloseMyApp();
		});

		opaTest("It should navigate to a package details", function (Given, When, Then) {
			Given.iStartMyApp(appSetup).and.theServerResponseDelayIs(4000);
			When.onMainView.iClickOnFirstTile();
			Then.onMainView.shouldBeBusy().butEventuallyShouldNot();
		});


		// opaTest("It should call export as CSV button with correct tableId", function (Given, When, Then) {
		// 	button.prototype._exportAsCSV = sinon.spy();
		// 	Given.iStartMyApp(appSetup);
		// 	When.onMainView.iClickOnExportButtonCSV();
		// 	Then.onMainView.theExportFunctionShouldBeCalled('contractListId').and.iCloseMyApp();
		// });
	}
);