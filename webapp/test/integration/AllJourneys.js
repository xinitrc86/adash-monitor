jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
jQuery.sap.require("sap.ui.qunit.qunit-coverage");
jQuery.sap.require("sap.ui.qunit.QUnitUtils");
QUnit.config.autostart = false;


sap.ui.require([
    "sap/ui/test/Opa5",
    "adash/ui/monitor/test/testUtils/commonArrangements",
    "adash/ui/monitor//test/integration/pages/rootResults"    
    
], function (Opa5, Arrangements, List, Details) {
    "use strict";       
        
    Opa5.extendConfig({
        arrangements: new Arrangements(),
        viewNamespace: "adash.ui.monitor.view.",
        autoWait : true     

    });

    sap.ui.require([
        "adash/ui/monitor/test/integration/rootResults"
    ], function () {
        QUnit.config.autostart = false; 
        QUnit.start();
    });
});