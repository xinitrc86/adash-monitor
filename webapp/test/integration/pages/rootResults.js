sap.ui.require([
        "sap/ui/test/Opa5",
        "adash/ui/monitor/test/testUtils/commonArrangements",
        "sap/ui/test/actions/Press",
        "sap/ui/thirdparty/sinon"

    ],
    function(Opa5, commonArrangements, Press, Sinon) {
        "use strict";
        
        var
            MAIN_VIEW_NAME    = "rootResults",
            CONTRACT          = "ContractNumberSearch",
            CONTRACTFILTERBAR = "contractFilterBar",
            PARTNER           = "ContractPartnerFilter",
            PRODUCT           = "ContractMaterialFilter",
            YEAR              = "ContractDateFilter",
            RESULTS_GRID  = "resultsTable";

        var oSharedContext = new sap.ui.test.Opa().getContext();

        Opa5.createPageObjects({
            onMainView: {
                viewName: MAIN_VIEW_NAME,
                baseClass: commonArrangements,
                actions: {
                   
                    iClickOnExportButtonCSV: function() {
                        return this.iClickOnButton({tableId: RESULTS_GRID, buttonId: "exportAsCSVButton"});
                    },

                    iClickOnFirstTile: function() {
                        return this.iClickOnTableRow(RESULTS_GRID, 1);
                    },

                    iClickOnSecondRowOfTable: function() {
                        return this.iClickOnTableRow(RESULTS_GRID, 2);
                    }

                },

                assertions: {
                    myListSizeIs: function(iItems) {
                        return this.tableHavePreciseNumberOfItems(RESULTS_GRID, iItems);
                    },

                    myListShouldHaveRecords: function() {
                        return this.gridListHasAtLeastOneTile(RESULTS_GRID);
                    },

                    myListShouldntHaveRecords: function(sTableId) {
                        //@TODO?
                        return this.tableHaveNoRecords(sTableId);
                    },

                    myFilterComboBoxShouldHaveRecords: function(comboBoxId){
                        return this.comboBoxHaveAtLeastOneRecord(comboBoxId);
                    },

                    myMultiComboBoxShouldHaveRecords: function(sMultiComboBoxId){
                        return this.multiComboBoxHaveAtLeastOneRecord(sMultiComboBoxId);
                    },

                    shouldBeBusy: function() {
                        return this.componentBusyStatusIs(true, MAIN_VIEW_NAME, RESULTS_GRID);
                    },
                    butEventuallyShouldNot: function() {
                        return this.componentBusyStatusIs(false, MAIN_VIEW_NAME, RESULTS_GRID);
                    }


                }
            }
        });
    });