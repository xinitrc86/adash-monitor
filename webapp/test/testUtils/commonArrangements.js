sap.ui.define([
        "sap/ui/test/Opa5",
        "sap/ui/test/Opa",
        "adash/ui/monitor/localService/mockserver",
        "sap/ui/thirdparty/sinon"
    ],
    function(Opa5, Opa, mockserver, sinon) {
        "use strict";

        var oSharedContext = new sap.ui.test.Opa().getContext();
        var oMockServer = null;
        var oStartOptions = {};
        var STANDARD_RESPONSE_DELAY_TIME = 20;

        return Opa5.extend(
            "adash.ui.monitor.test.testUtils.commonArrangements",
            {

            constructor: function(oConfig) {
                Opa5.apply(this, arguments);

                this._oConfig = oConfig;
            },

            iStartMyApp: function(oOptions) {          
                if (this._requireMockWithDifferentSetting(oOptions)){
                    if (oMockServer){
                        oMockServer.terminate();
                    }
                    oMockServer = mockserver.init(oOptions.withRandomMockData);
                    oMockServer.setResponseDelayTime(STANDARD_RESPONSE_DELAY_TIME);
                }
                else if (this._dontRequireMock(oOptions)){                    
                    oMockServer.terminate();                    
                }

                oStartOptions = oOptions || oStartOptions;

                this.contextVariables();
                if (jQuery(".sapUiOpaComponent").length !== 0
                || oSharedContext.appIsOn) {                
                    return this.iCloseMyApp().startComponentWaiting();
                } else {
                    return this.startComponentWaiting();
                }
            },

            contextVariables: function() {
                oSharedContext.clickedRow = {};
            },

            startComponentWaiting: function() {
                var that = this;                
                oSharedContext.appIsOn = true;

                return this.waitFor({
                    success: function() {
                        that.iStartMyUIComponent({
                            componentConfig: {
                                name: oStartOptions.componentName
                            },
                            hash: oStartOptions.urlhash
                        });
                    }
                });

            },

            theServerResponseDelayIs: function(timeInMs) {

                oMockServer.setResponseDelayTime(timeInMs);
            },

            iCloseMyApp: function() {
                var that = this;                
                oSharedContext.appIsOn = false;
        
                return this.waitFor({
                    success: function() {
                        this.iTeardownMyUIComponent();
                    }
                });
            },

            //Actions
            iClickOnTableRow: function(sTableId, row) {
                var rowToClick = row,
                    that = this;

                return this.waitFor({
                    id: new RegExp(sTableId + "$"),
                    errorMessage: "Could not click on table " + sTableId,
                    actions: function(oTable) {
                        if (!oTable) {
                            return false;
                        }

                        var oRow = that._getActualDataRowAt(oTable, rowToClick);

                        if (!oRow) {
                            return false;
                        }

                        if (oSharedContext.clickedRow) {
                            oSharedContext.clickedRow[rowToClick] = oRow;
                            oSharedContext.currentRow = oRow;
                        }

                        oRow.firePress();
                        return true;
                    },
                    success: function(oControl) {
                        Opa5.assert.ok(true, "Clicked on row " + row + " of table " + sTableId);
                    }

                });
            },

            iClickOnButton: function(oParameters) {
                        var that = this;
                        return this.waitFor({
                            id: new RegExp(oParameters.buttonId + "$"),

                            check: function(oButton) {
                                return oButton[0].getExportTableId() === oParameters.tableId;
                            },

                            actions: function(oButton) {
                                return that.waitFor({
                                    success: function() {
                                        setTimeout(function() {
                                            oButton.firePress();
                                            Opa5.assert.ok(true, "Clicked on button!");
                                        }, 300); 
                                    }
                                });
                            },

                            errorMessage: "Button table ID is not correct!",

                            success: function() {
                                Opa5.assert.ok("Pressed the export button.");
                            }
                        });
                    },

            iPressNavBackOnView: function(sViewName) {
                var that = this,
                    goneBack = false;
                return this.waitFor({
                    check: function(aObjects) {
                        oSharedContext.navBackViewController = that._getViewById(sViewName).getController();
                        return oSharedContext.navBackViewController;
                    },

                    actions: function(aObjects) {
                        //it will loop all items in 
                        if (goneBack) {return;}
                        var oView = oSharedContext.navBackViewController;
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(oView);
                        oRouter.navTo(oView.getPrevRoute(), {}, true);
                        goneBack = true;
                    },

                    success: function() {
                        Opa5.assert.ok(true, "Navigated back");

                    },

                    errorMessage: "Did not find view router for pview " + sViewName
                });
            },

            iSearchOnFilter: function(sFilterbarId, sFilter, aQuery) {
                var that = this;
                return this.waitFor({
                    visible: true,
                    actions: function() {
                        var oFilterbar = that._getViewById(sFilterbarId);
                        var oFilter = that._getViewById(sFilter);
                        that._setFilterValue(oFilter, aQuery);
                        oFilter.setValue(aQuery);
                        oFilterbar.fireSearch();
                    },
                    success: function(oControl) {
                        Opa5.assert.ok(true, "Fired the search of " + aQuery + "  at the filter " + sFilter);
                    },
                    error: function() {
                        this.errorMessage = "could not fire search at the filter " + sFilter + " on the filterbar " + sFilterbarId;
                    }
                });
            },

            //assertions
            componentBusyStatusIs: function(bCheckStatus, sViewName,sComponent) {
                var statusToCompare = bCheckStatus,
                    that = this;
                return this.waitFor({
                    autoWait: false,
                    visible: true,
                    matchers: function() {
                        return true;
                    },
                    viewName: sViewName,
                    check: function(aControls) {
                        var oView = that._getViewById(sComponent);
                        if (!oView) {
                            return false;
                        }

                        return this._isExpectedStatus(bCheckStatus, oView.getBusy());
                    },
                    success: function() {
                        Opa5.assert.ok(true, "The view " + sViewName + " is " + (statusToCompare ? "" : "not") + " busy");
                    },
                    errorMessage: "View " + sViewName + " is " + (statusToCompare ? "" : "not") + " busy"
                });
            },

            theExportFunctionShouldBeCalled: function(sTableId) {
                var that = this;
                return this.waitFor({
                    id: new RegExp("exportAsCSVButton$"),
                    check: function(oButton) {
                        //method is stubbed at Journey                                            
                        return oButton[0]._exportAsCSV.calledOnce && oButton[0].getExportTableId() === sTableId;

                    },
                    errorMessage: "something went wrong on button press",
                    success: function() {
                        Opa5.assert.ok(true, "Pressed export button and function was called!");
                    }
                });
            },

            carouselHavePreciseNumberOfPages: function(sCarouselId, iSize) {
                return this.waitFor({
                    autoWait: true,
                    visible: true,
                    check: function(){
                        var oCarousel      = this._getViewById(sCarouselId);
                        var iCarouselPages = oCarousel.getPages().length;
                        return iSize === iCarouselPages;
                    },
                    error: function() {
                        this.errorMessage = "The Carousel " + sCarouselId + " doesn't have the number of pages it should";
                    },
                    success: function() {
                        Opa5.assert.ok("The Carousel " + sCarouselId + " has the exact number of pages.");

                    }
                });

            },

            tableHaveAtLeastOneRecord: function(sTableId) {
                return this._controlItemAgregationhaveAtLeastOneRecord(sTableId, "sap.m.Table");
            },
            gridListHasAtLeastOneTile: function(sGridId) {
                return this._controlItemAgregationhaveAtLeastOneRecord(sGridId, "sap.f.GridList");
            },

            multiComboBoxHaveAtLeastOneRecord: function(sMultiComboBoxId){
                return this._controlItemAgregationhaveAtLeastOneRecord(sMultiComboBoxId, "sap.m.MultiComboBox");
            },

            comboBoxHaveAtLeastOneRecord: function(sComboboxId) {
                return this._controlItemAgregationhaveAtLeastOneRecord(sComboboxId, "sap.m.ComboBox");
            },

            selectionHaveAtLeastOneRecord: function(sSelectionId) {
                return this._controlItemAgregationhaveAtLeastOneRecord(sSelectionId, "sap.m.Select");
            },

            tableHavePreciseNumberOfItems: function(sTableId,iItems) {
                return this.waitFor({
                    id: sTableId,
                    controlType: "sap.m.Table",
                    check: function(aTables) {
                        return this._checkTableAndItemsSize(aTables, sTableId, iItems);
                    },
                    error: function() {
                        this.errorMessage = sTableId === "" || sTableId === undefined ? "One or more tables don't have the necessary items size" : "Table " + sTableId + " does not have the necessary items size";
                    },
                    success: function() {
                        Opa5.assert.ok(true, sTableId === "" || sTableId === undefined ? "All tables have at the necessary number of items" : "Table " + sTableId + " have the necessary number of items");
                    }
                });
            },

            allTextsBindingsAreOk: function(bIsVisible) {
                return this._waitForBindingChecks("sap.m.Text", "Texts", bIsVisible);
            },

            allObjectNumberBindingsAreOk: function(bIsVisible) {
                return this._waitForBindingChecks("sap.m.ObjectNumber", "Object Numbers", bIsVisible);
            },

            allObjectIdentifierBindingsAreOk: function(bIsVisible) {
                return this._waitForBindingChecks("sap.m.ObjectIdentifier", "Object Identifiers", bIsVisible);
            },

            allButtonBindingsAreOk: function(bIsVisible){
                return this._waitForBindingChecks("sap.m.RadioButton", "Radio Button Group", bIsVisible);
            },

            theGraphPropertiesAre: function(sVizFrameId,sGrahViewId,oExpectedProperties) {
               
                return this.waitFor({
                    id: sGrahViewId,
                    check: function(oGraphView) {
                        oGraphView = oGraphView[0] || oGraphView;
                        var oDetailsGraph = oGraphView.byId(sVizFrameId);
                        var oGraphProperties = oDetailsGraph.getVizProperties();
                        return this._oneHasExpectedPropertiesValue(oGraphProperties,oExpectedProperties);
                    },

                    success: function() {
                        Opa5.assert.ok(oExpectedProperties, "Either properties are not as expected or no properties found!");
                    }
                });
            },

            allObjectsHaveSameVisibility: function(aObjectIds, bShouldBeVisible) {
                
                return this.waitFor({

                    check: function() {
                        if (aObjectIds === undefined){
                            return false;
                        } else {
                            for (var sObjectId in aObjectIds){
                                var bObjectVisibile = this._getVisibleById(aObjectIds[sObjectId]);
                                // XOR Gate
                                if ((bObjectVisibile && !bShouldBeVisible) || (!bObjectVisibile && bShouldBeVisible)){
                                    return false;
                                }
                            }
                            return true;
                        }
                    },

                    success: function() {
                         Opa5.assert.ok(true, "All fragments " + aObjectIds + " have the same visibility: " + bShouldBeVisible);
                    }
                });  
            },

            //Auxiliary methods     

            _requireMockWithDifferentSetting: function(oOptions){

                return (oOptions && oOptions.withMockServer) 
                    && (oOptions.withRandomMockData !== oStartOptions.withRandomMockData);
            },

            _dontRequireMock: function(oOptions){
                return ((oOptions === undefined) || (oOptions && oOptions.withMockServer === false && oMockServer));
            },

            _getVisibleById: function(sId){
                var oObject = this._getViewById(sId);
                return oObject === undefined ? false : oObject.getVisible();
            },

            _oneHasExpectedPropertiesValue: function(oActual,oExpected){
                if (!oExpected && !oActual) {return true;}
                else if (!oExpected || !oActual) {return false;}

                for (var property in oExpected){
                    if(!oActual[property]) {return false;}
                    if (oExpected[property] instanceof Object && !(oExpected[property] instanceof String)) 
                        {this._oneHasExpectedPropertiesValue(oActual[property],oExpected[property]);} //deep object, keep loking
                    else if (oExpected[property] != oActual[property]) {return false;}
                }

                return true;
            },

            _waitForBindingChecks: function(sControlType, sControlTypeName, bIsVisible) {
                var that = this;
                return this.waitFor({
                    controlType: sControlType,
                    visible: (bIsVisible || typeof bIsVisible === "undefined" || bIsVisible === "" ? true : false),
                    check: function(aControls) {
                        return this._checkBindings(aControls);
                    },
                    error: function(othis, aControls) {
                        if (oSharedContext.oError.objectId.length > 0) {
                            this.errorMessage = that._standardErrorRecording(sControlTypeName);
                        } else {
                            this.errorMessage = "Could not find any " + sControlTypeName;
                        }
                    },
                    success: function() {
                        Opa5.assert.ok(true, "All binded " + sControlTypeName + " have data");
                    }

                });
            },

            _controlItemAgregationhaveAtLeastOneRecord: function(sId, sControlType) {
                return this.waitFor({
                    id: sId === "" || sId === undefined ? null : new RegExp(sId + "$"),
                    controlType: sControlType,
                    check: function(aTables) {
                        return this._checkItemsAggregation(aTables);
                    },
                    error: function() {

                        this.errorMessage = sId === "" || sId === undefined ? "One or more item of" + sControlType + " don´t have records" : sControlType + ", of id " + sId + " does not have a record";
                    },
                    success: function() {
                        Opa5.assert.ok(true, sId === "" || sId === undefined ? "All items of " + sControlType + " have at least one record" : sControlType + ", of id " + sId + " has at least one rcord");
                    }
                });
            },

            _checkBindings: function(aControls) {
                for (var counter = 0; counter < aControls.length; counter++) {
                    for (var sBindingName in aControls[counter].mBindingInfos) {
                        if (!this._checkBindingValueOfControl(aControls[counter],
                                sBindingName)) {
                            return false;
                        }
                    }
                }

                return true;
            },

            _checkItemsAggregation: function(aTables) {
                for (var counter = 0; counter < aTables.length; counter++) {
                    var aItems = aTables[counter].getItems();
                    if (aItems.length === 0) {
                        this._storeErrorObject({
                            objectId: aTables[counter].getId()
                        });
                        return false;
                    }
                }

                return true;
            },

            _storeErrorObject: function(oObject) {
                oSharedContext.oError = oObject;
            },

            _checkBindingValueOfControl: function(oControl, sBindingName) {
                var oBindingInfo = oControl.getBindingInfo(sBindingName);
                if (oBindingInfo && oBindingInfo.parts.length > 0) {

                    for (var partCounter = 0; partCounter < oBindingInfo.parts.length; partCounter++) {

                        var oPart = oBindingInfo.parts[partCounter],
                            oBindingValue = {};
                        //It is a part but not bound to anything...
                        if (!oPart.model) {continue;}
                        //@Todo refactor this part, 
                        //controls under a groupheader list item have no binding object
                        //and there is no way telling the parent is a groupheaderlistitem   
                        if (oBindingInfo && oBindingInfo.binding) {
                            oBindingValue = oBindingInfo.binding.oValue || null;
                            if (!oBindingValue && oBindingInfo.binding.aValues) {
                                oBindingValue = oBindingInfo.binding.aValues[partCounter];
                            }
                            if (!oBindingValue // is undefined
                                ||
                                (oBindingValue && oBindingValue.length === 0) //is empty
                                ||
                                oPart.path === oBindingValue) { //i18n Models
                                this._storeErrorObject({
                                    objectId: oControl.getId(),
                                    model: oPart.model,
                                    path: oPart.path,
                                    binding: sBindingName
                                });
                                return false;
                            }
                        }
                    }
                }
                return true;
            },

            _checkTableAndItemsSize: function(oTable, sTableId, iExpectedSize) {
                if (typeof iExpectedSize !== "number" || !oTable) {
                    return false;
                }
                var aItems = oTable.getItems();
                var iActualSize = aItems.length;
                for (var i = 0; i < aItems.length; i++) {
                    var oRow = oTable.getItems()[i];
                    if (oRow instanceof sap.m.GroupHeaderListItem) {
                        iActualSize--;
                    }
                }
                if (iExpectedSize !== iActualSize) {
                    this._storeErrorObject({
                        objectId: oTable.getId()
                    });
                    return false;
                } else {
                    return true;
                }
            },

            _standardErrorRecording: function(sObjectTypeName) {
                return sObjectTypeName + " path " + oSharedContext.oError.path +
                    " for model " + oSharedContext.oError.model +
                    " has no Value on object " + oSharedContext.oError.objectId +
                    " for binding " + oSharedContext.oError.binding;
            },

            _getActualDataRowAt: function(oTable, index) {
                var lines = oTable.getItems();
                var actualRowToClick = index - 1;
                for (var i = 0; i <= actualRowToClick; i++) {
                    if (lines[i] instanceof sap.m.GroupHeaderListItem)
                        {actualRowToClick++;}
                }
                return lines[actualRowToClick];
            },

            _setFilterValue: function(oFilter, query) {
                var sFilterType = oFilter.getMetadata().getName();
                
                switch (sFilterType) {
                    case "sap.m.ComboBox":
                        oFilter.setValue(query);
                        break;
                    case "sap.m.MultiComboBox":
                        oFilter.setSelectedKeys(query);
                        break;
                    case "sap.m.SearchField":
                        oFilter.setValue(query);
                        break;
                    case "sap.m.Select":
                        oFilter.setSelectedKey(query);
                        break;
                    default:
                        break;
                }           
            },

            _isExpectedStatus: function(bExpected, bActual) {
                return bExpected === bActual;
            },

            _getViewById: function(sId) {
                var sViewId = $("[id$=" + sId).attr("id");
                return sap.ui.getCore().byId(sViewId);
            },

            _checkIfListAndDisplayedContractsAreTheSame: function(aControls,iDetailsNumber,iListNumber,iDetailsItem,iListItem) {
                var _oPageHeader     = aControls[0],
                    _oTitleBinding   = _oPageHeader.getBinding("objectTitle"),
                    _sDetailsNumber  = iDetailsNumber === 0 ? _oTitleBinding.oValue : _oTitleBinding.aBindings[iDetailsNumber].oValue,                     
                    _oRowClicked     = oSharedContext.clickedRow[1],
                    _oCell           = _oRowClicked.getCells()[0],
                    _oCellBinding    = _oCell.getBinding("text"),
                    _sListNumber     = _oCellBinding.aBindings[iListNumber].oValue;
                if ( iDetailsItem !== undefined && iListItem !== undefined  ) {
                    var sDetailsItem = _oTitleBinding.aBindings[iDetailsItem].oValue,
                        sListItem = _oCellBinding.aBindings[iListItem].oValue;  
                    if (_sDetailsNumber === _sListNumber &&
                        sDetailsItem === sListItem) {
                        return true;
                    } else {
                        return false;
                    }          
                } else {
                    if (_sDetailsNumber === _sListNumber) {
                        return true;
                    } else {
                        return false;
                    }          
                }                    
            }         
        });
    });