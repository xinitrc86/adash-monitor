sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";

	var sMockServers = [];

	return {

		init: function (bWithRandomData) {
			sMockServers.push(this.createMockServer(bWithRandomData,"ZCBC_ADASH_RESULTS_CDS"));
			sMockServers.push(this.createMockServer(bWithRandomData,"ZCBC_ADASH_SETUP_CDS"));
			sMockServers.push(this.createMockServer(bWithRandomData,"ZCBC_ADASH_TEST_METHODS_CDS"));
			return this;

		},

		setResponseDelayTime: function(delayInMs){

			for (var i = 0; i < sMockServers.length; i ++){
				sMockServers[i]._oServer.autoRespondAfter = delayInMs;
			}

		},

		terminate: function(){
			for (var i = 0; i < sMockServers.length; i ++){
				sMockServers[i].stop();

			}
			sMockServers = [];
		},

		createMockServer: function(bWithRandomData,vService){			
			var oMockServer = new MockServer({
				rootUri: "/sap/opu/odata/sap/" + vService + "/"
			});

			var oUriParameters = jQuery.sap.getUriParameters();

			MockServer.config({
				autoRespond: true,
				autoRespondAfter: oUriParameters.get("serverDelay") || 200
			});

			var sPath = jQuery.sap.getModulePath("adash.ui.monitor.localService");
			var sMockDataPath = bWithRandomData === true ? "" : sPath + "/mockdata";			
			oMockServer.simulate(sPath + "/" + vService + ".xml", {
				sMockdataBaseUrl: sMockDataPath,
				bGenerateMissingMockData: bWithRandomData
						} );

			oMockServer.start();
			return oMockServer;

		}
	};

});
