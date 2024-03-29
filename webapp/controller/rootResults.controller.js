sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"adash/ui/monitor/controller/pathController",
	"adash/ui/monitor/controller/pathFactory",
	"sap/ui/model/json/JSONModel"
], function (Controller, PathController, PathFactory, JSONModel) {
	"use strict";

	return Controller.extend("adash.ui.monitor.controller.rootResults", {
		TYPE_PACKAGE: 1,
		TYPE_OTHERS: 2,
		executionGuid: "",
		_sorter: [],
		_watching: false,
		_autoRefresh: false,

		onInit: function () {
			this._watching = false;
			this._pathController = new PathController();
			this._pathFactory = new PathFactory();
			this._pathController.Init(
				this.getView().byId("titleBox")
			);

			let that = this;
			this._adashGroups = new JSONModel("/adash-cli.json");
			this._adashGroups.attachRequestCompleted(data => {
				let errorObject = data.getParameter('errorobject');				
				if (errorObject) {
					console.log('ADASH Cli Integration is off');
					that._applyInitialSetup();
				}
				else {
					let packageGroup = data.getSource().getData();
					let aPackages = packageGroup.map(name => {						
						return new sap.ui.model.Filter("name", "EQ", name.toUpperCase());
					});
					that._setRootDisplayPackages(aPackages);
				}
			});
		},
		onTestPackage: function(oEvent) {
			var oSource = oEvent.getSource();
			var oBinding = oSource.getBindingContext();
			var oData = oBinding.getObject();
			this._testComponentAPI(oData.typeRaw,oData.name,oSource);
		},
		_extractTestMethods(oResponse){
			let data = oResponse.DATA;
			let results = data.TESTS.map(function(oTestMethod){

				return {
					testClass: oTestMethod.TEST_CLASS,
					testName: oTestMethod.TEST_METHOD,
					header: oTestMethod.FAILURE_HEADER,
					details: oTestMethod.FAILURE_DETAILS
				};

			});
			return results;

		},
		_testComponentAPI: function(type,name,oSource){
			var oAPI = new JSONModel();
			var that = this;			
			oSource.setBusy(true);
			oSource.setBusyIndicatorDelay(50);
			oAPI.attachRequestCompleted(function(oEvent){

				if (that._watching === true) {
					let data = oEvent.getSource().getData("/")
					let newResults = that._extractTestMethods(data);

					if (JSON.stringify(newResults) !== JSON.stringify(that._oldResults)){
						that._oldResults = newResults;
						that._bindTable(that._currentPath);
					}
				}

			});
			oAPI.loadData(`/sap/zadash/${type}/${name}/test`)
			.then(function(response){			
				if (that._watching === true) {
					
					setTimeout(() => {
						oSource.setBusy(true);
						that._testComponentAPI(type,name,oSource);
					}, 2222);
				}
				
					
			})
			.catch(function(error){})
			.finally(function(data){				
				if (oSource)
					oSource.setBusy(false);				
			});
		},
		onWatchThis: function (oEvent) {
			var oSync = sap.ui.getCore().byId('isCheckingButtonId');
			this._watching = !this._watching;
			if (this._watching === true) {
				this._testComponentAPI(this._currentPath.type,this._currentPath.name,oSync)
			} 
		},

		onNavigateTo: function (oEvent) {
			this._watching = false;
			var oData = oEvent.getSource().getBindingContext().getObject();
			var oPath = this._pathFactory.buildFor(oData);
			var fNavCallback = this._goTo.bind(this, oPath);
			this._pathController.pushPath(oPath.name, oPath.type, fNavCallback);
			fNavCallback();

		},
		onToggleAutoRefresh: function (oEvent) {
			this._autoRefresh = !this._autoRefresh;
			this._setAutoRefresh(this._autoRefresh);
		},
		onFilterChange: function (oEvent) {
			var vKey = oEvent.getSource().getSelectedKey();
			this._sorter = [];
			switch (vKey) {
				case "failing":
					this._sorter.push(new sap.ui.model.Sorter("status", false));
					this._sorter.push(new sap.ui.model.Sorter("type", false));
					break;
				case "uncovered":
					this._sorter.push(new sap.ui.model.Sorter("uncovered", true));
					this._sorter.push(new sap.ui.model.Sorter("type", false));
					break;
				case "type":
					this._sorter.push(new sap.ui.model.Sorter("type", false));
					this._sorter.push(new sap.ui.model.Sorter("status", false));
					break;
			}

			this._sorter.push(new sap.ui.model.Sorter("name", false));
			this._bindTable(this._currentPath);

		},
		_getInitialSorting: function () {
			var sorter = [];
			sorter.push(new sap.ui.model.Sorter("status", false));
			sorter.push(new sap.ui.model.Sorter("type", false));
			sorter.push(new sap.ui.model.Sorter("name", false));
			return sorter;
		},
		_setAutoRefresh: function (bSet) {

			if (bSet === true) {
				this._intervalId = window.setInterval(function () {
					this._bindTable(this._currentPath);
				}.bind(this), 120000);
			} // 5 minutes
			else { window.clearInterval(this._intervalId); }

		},

		_applyInitialSetup: function () {

			var oSetup = this.getOwnerComponent().getModel("setup");
			var that = this;
			oSetup.attachBatchRequestCompleted(
				function (event, test) {

					var data = event.getSource().getData("/");
					var aPackages = [];
					for (var row in data) {
						var rowData = data[row];
						aPackages.push(new sap.ui.model.Filter("name", "EQ", rowData.name));
					}

					that._setRootDisplayPackages.bind(that)(aPackages);

				});
			oSetup.read("/ZCV_ADASH_SETUP_C");

		},
		_setRootDisplayPackages: function (aPackages) {
			var aPackageFilter = new sap.ui.model.Filter({
				and: false,
				filters: aPackages
			});
			var setupFilter = new sap.ui.model.Filter({
				and: true,
				filters: [
					new sap.ui.model.Filter("execution", "EQ", "LAST"),
					aPackageFilter
				]
			});
			this._sorter = this._getInitialSorting();
			var oInitialPath = {
				path: "/ZCV_ADASH_RESULTS_C",
				fragment: "adash.ui.monitor.fragment.testables",
				filter: setupFilter
			};
			this._setupTable();
			var fNavToInitialSetup = this._goTo.bind(this, oInitialPath);
			this._pathController.pushPath("ADASH - Abap Unit Dashboard", "root", fNavToInitialSetup);
			fNavToInitialSetup();
		},
		_goTo: function (oPath) {

			this._cancelWatchingIfNeeded();
			this._switchTablesIfNeeded(oPath);

			this._bindTable(oPath);
			this._currentPath = oPath;
		},
		_switchTablesIfNeeded: function (oPath) {

			var oPage = this.getView().byId("page");

			if ((this._currentPath && this._currentPath.fragment !== oPath.fragment) || !this._oTable) {
				oPage.destroyContent();
				this._oTable = sap.ui.xmlfragment(oPath.fragment, this);
				oPage.addContent(this._oTable);
			}

		},
		_cancelWatchingIfNeeded: function () {
			if (this._watchId) {
				window.clearInterval(this._watchId);
				this._watchId = null;
			}
		},
		_setupTable: function () {
			var oTable = this.getView().byId("resultsTable");
			oTable.setBusyIndicatorDelay(200);
			oTable.attachUpdateStarted(function () {
				oTable.setBusy(true);
			});
			oTable.attachUpdateFinished(function () {
				oTable.setBusy(false);
			});
		},

		_bindTable: function (oPath) {

			this._oTable.bindItems({
				path: oPath.path,
				template: this._oTable.getBindingInfo("items").template,
				filters: oPath.filter,
				sorter: this._sorter

			});

		}

	});
});


