sap.ui.require([
    "sap/ui/test/Opa5",
    "sap/ui/fip/test/testUtils/commonArrangements",
    "sap/ui/test/actions/Press"
],
function(
    Opa5,
    commonArrangements,
    Press) {

    "use strict";

    const
        VIEWNAME = "ContractDetails",
        CONSTANTS = {
            CONTRACT_DETAILS: {
                CONTRACT_NUMBER_PART: 1,
                CONTRACT_ITEM_PART: 4
            },
            CONTRACT_LIST: {
                CONTRACT_NUMBER_PART: 0,
                CONTRACT_ITEM_PART: 3
            }
        },
        ALL_FRAGMENT_IDS = [ 
            "characteristicsList", 
            "tolerancesList", 
            "optionalitiesList", 
            "fixedPricesList", 
            "DeliveriesTable", 
            "settlementsList" 
        ],

        VISIBLE_FRAGMENT_IDS = [ 
            "characteristicsList",
            "DeliveriesTable",
            "tolerancesList"
        ], 

        NOT_VISIBILE_FRAGMENT_IDS = [ 
            "optionalitiesList", 
            "fixedPricesList", 
            "settlementsList"
        ],

        ALL_NO_INFO_MESSAGE_IDS = [ 
            "characteristicsListNoInfo", 
            "tolerancesListNoInfo", 
            "optionalitiesListNoInfo", 
            "fixedPricesListNoInfo", 
            "DeliveriesTableNoInfo", 
            "settlementsListNoInfo" 
        ],

        NOT_VISIBILE_NO_INFO_MESSAGE_IDS = [ 
            "characteristicsListNoInfo",
            "DeliveriesTableNoInfo",
            "tolerancesListNoInfo"
        ], 

         VISIBLE_NO_INFO_MESSAGE_IDS = [ 
            "optionalitiesListNoInfo", 
            "fixedPricesListNoInfo", 
            "settlementsListNoInfo"
        ];

    var oSharedContext = new sap.ui.test.Opa().getContext();
    Opa5.createPageObjects({
        onDetailsView: {
            viewName: VIEWNAME,
            baseClass: commonArrangements,
            actions: {

                iClickOnFirstRowOfTable: function(sTableId) {
                    return this.iClickOnTableRow(sTableId, 1);
                },

                iNavigateBack: function() {
                    return this.iPressNavBackOnView(VIEWNAME);
                }
            },

            assertions: {

                shouldBeBusy: function() {
                    return this.viewBusyStatusIs(true, VIEWNAME);
                },

                butEventuallyShouldNot: function() {
                    return this.viewBusyStatusIs(false, VIEWNAME);
                },

                iShouldSeeTheSameContract: function() {
                    return this.waitFor({
                        id: new RegExp("contractDetailsHeader$"),
                        check: function(aControls) {
                           
                            if ( this._checkIfListAndDisplayedContractsAreTheSame(aControls,
                                CONSTANTS.CONTRACT_DETAILS.CONTRACT_NUMBER_PART,
                                CONSTANTS.CONTRACT_LIST.CONTRACT_NUMBER_PART,
                                CONSTANTS.CONTRACT_DETAILS.CONTRACT_ITEM_PART,
                                CONSTANTS.CONTRACT_LIST.CONTRACT_ITEM_PART) === true ) {
                                return true;
                            } else {
                                return false;
                            }

                        },

                        success: function(oControl) {
                            Opa5.assert.ok(true, "Details is showing same contract.");
                        },

                        errorMessage: "Details is not showing same contract."
                    });

                },                

                allTablesShouldHaveRecords: function() {
                    return this.tableHaveAtLeastOneRecord();
                },

                iShouldCheckAllBindingsAreOk: function() {
                    return this.allTextsBindingsAreOk() && this.allObjectNumberBindingsAreOk(true);
                },

                theGraphShouldHaveSameInfo: function() {
                    return this.waitFor({
                        id: "ContractExecutionId",
                        check: function(oGraphView) {
                            var oListGraphData = oSharedContext.clickedRow[1].getCells()[12].getModel("Graph").getData();
                            var oDetailsGraphData = oGraphView.getModel("Graph").getData();

                            return JSON.stringify(oListGraphData) === JSON.stringify(oDetailsGraphData);
                        },
                        success: function() {
                            Opa5.assert.ok("It is showing correct information after multiple navigations.");
                        }
                    });
                },

                theGraphIsBig: function() {
                    return this.theGraphPropertiesAre("oVizFrame","ContractExecutionId",
                    {
                        title: {
                            visible: true
                        },
                        legend: {
                            visible: true
                        },
                        interaction: {
                            noninteractiveMode: true
                        },
                        valueAxis: {
                            visible: true
                        }
                    });
                },

                iSeeAllFragments: function() {
                    return this.allObjectsHaveSameVisibility(ALL_FRAGMENT_IDS, true) &&
                           this.allObjectsHaveSameVisibility(ALL_NO_INFO_MESSAGE_IDS, false);
                },

                iSeeNoFragments: function() {
                    return this.allObjectsHaveSameVisibility(ALL_FRAGMENT_IDS, false) &&
                           this.allObjectsHaveSameVisibility(ALL_NO_INFO_MESSAGE_IDS, true);
                },

                iSeeSomeFragments: function() {
                    return this.allObjectsHaveSameVisibility(VISIBLE_FRAGMENT_IDS, true) &&
                           this.allObjectsHaveSameVisibility(NOT_VISIBILE_NO_INFO_MESSAGE_IDS, false);
                },

                iDontSeeSomeFragments: function() {
                    return this.allObjectsHaveSameVisibility(NOT_VISIBILE_FRAGMENT_IDS, false) &&
                           this.allObjectsHaveSameVisibility(VISIBLE_NO_INFO_MESSAGE_IDS, true);
                }
            }
        }
    });
});