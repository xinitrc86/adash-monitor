function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZCV_ADASH_TEST_METHODS_C_CDS/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}