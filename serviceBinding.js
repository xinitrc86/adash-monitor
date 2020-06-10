function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZCBC_ADASH_TEST_METHODS_CDS/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}