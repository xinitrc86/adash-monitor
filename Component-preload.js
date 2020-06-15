//@ui5-bundle adash/ui/monitor/Component-preload.js
sap.ui.predefine("adash/ui/monitor/Component",["sap/ui/core/UIComponent","sap/ui/Device","adash/ui/monitor/model/models"],function(e,i,t){"use strict";return e.extend("adash.ui.monitor.Component",{metadata:{manifest:"json"},init:function(){e.prototype.init.apply(this,arguments);this.getRouter().initialize();this.setModel(t.createDeviceModel(),"device")}})});
sap.ui.predefine("adash/ui/monitor/controller/pathController",["sap/ui/core/mvc/Controller"],function(t){"use strict";return t.extend("adash.ui.monitor.controller.pathController",{PATH_SEPARATOR:"&nbsp;>&nbsp;",_oFlexBox:{},_currentPath:null,Init:function(t){this._oFlexBox=t},onPathChosen:function(t){this._applyTitleToTitleBox(t);t.callBack();this._currentPath=t},pushPath:function(t,e,i){var n={name:t,type:e,callBack:i,title:[]};this._copyCurrentPathTitle(n);this._addNewPathToTitle(n);this._applyTitleToTitleBox(n)},_applyTitleToTitleBox:function(t){this._oFlexBox.removeAllItems();var e=this;t.title.forEach(function(t){e._oFlexBox.addItem(t)})},_copyCurrentPathTitle:function(t){if(this._currentPath){this._currentPath.title.forEach(function(e){t.title.push(e)})}},_addNewPathToTitle:function(t){var e=this.onPathChosen.bind(this,t);if(!this._currentPath){t.title.push(new sap.ui.core.Icon({size:"100%",src:"sap-icon://world",press:e}))}else{t.title.push(new sap.m.FormattedText({htmlText:this.PATH_SEPARATOR}));var i="";switch(t.type){case"DEVC":i="sap-icon://open-folder";break;default:i="sap-icon://inspection";break}t.title.push(new sap.ui.core.Icon({size:"100%",src:i,press:e}))}t.title.push(new sap.m.FormattedText({htmlText:"&nbsp;"}));t.title.push(new sap.m.Link({text:t.name,press:e}));this._currentPath=t}})});
sap.ui.predefine("adash/ui/monitor/controller/pathFactory",["sap/ui/core/mvc/Controller"],function(e){"use strict";return e.extend("adash.ui.monitor.controller.pathFactory",{TYPE_PACKAGE:"DEVC",buildFor:function(e){var t=e.name;var a=e.typeRaw;var r={};if(a!==this.TYPE_PACKAGE){r=this._buildTestMethodPath(t,a)}else{r=this._buildPackagePath(t)}return r},_buildPackagePath:function(e){var t=new sap.ui.model.Filter({and:true,filters:[new sap.ui.model.Filter("execution","EQ","LAST"),new sap.ui.model.Filter("name","NE",e),new sap.ui.model.Filter({and:false,filters:[new sap.ui.model.Filter("package_own","EQ",e),new sap.ui.model.Filter({and:true,filters:[new sap.ui.model.Filter("parent_package","EQ",e),new sap.ui.model.Filter("typeRaw","EQ","DEVC")]})]})]});return{path:"/ZCV_ADASH_RESULTS_C",name:e,type:"DEVC",fragment:"adash.ui.monitor.fragment.testables",filter:t}},_buildTestMethodPath:function(e,t){var a={path:"testMethods>/ZCV_ADASH_TEST_METHODS_C",fragment:"adash.ui.monitor.fragment.testMethods",name:e,type:t,sorter:new sap.ui.model.Sorter("testClass",false,true)};var r=new sap.ui.model.Filter({and:true,filters:[new sap.ui.model.Filter("execution","EQ","LAST"),new sap.ui.model.Filter("name","EQ",e),new sap.ui.model.Filter("type","EQ",t)]});a.filter=r;return a}})});
sap.ui.predefine("adash/ui/monitor/controller/rootResults.controller",["sap/ui/core/mvc/Controller","adash/ui/monitor/controller/pathController","adash/ui/monitor/controller/pathFactory","sap/ui/model/json/JSONModel"],function(t,e,a,s){"use strict";return t.extend("adash.ui.monitor.controller.rootResults",{TYPE_PACKAGE:1,TYPE_OTHERS:2,executionGuid:"",_sorter:[],_watching:false,_autoRefresh:false,onInit:function(){this._watching=false;this._pathController=new e;this._pathFactory=new a;this._pathController.Init(this.getView().byId("titleBox"));let t=this;this._adashGroups=new s("/adash-cli.json");this._adashGroups.attachRequestCompleted(e=>{let a=e.getParameter("errorobject");if(a){console.log("ADASH Cli Integration is off");t._applyInitialSetup()}else{let a=e.getSource().getData();let s=a.map(t=>new sap.ui.model.Filter("name","EQ",t.toUpperCase()));t._setRootDisplayPackages(s)}})},onTestPackage:function(t){var e=t.getSource();var a=e.getBindingContext();var s=a.getObject();this._testComponentAPI(s.typeRaw,s.name,e)},_testComponentAPI:function(t,e,a){var i=new s;var n=this;a.setBusy(true);a.setBusyIndicatorDelay(50);i.loadData(`/sap/zadash/${t}/${e}/test`).then(function(){if(n._watching===true){setTimeout(()=>{a.setBusy(true);n._testComponentAPI(t,e,a)},2222)}n._bindTable(n._currentPath)}).catch(function(t){}).finally(function(t){if(a)a.setBusy(false)})},onWatchThis:function(t){var e=sap.ui.getCore().byId("isCheckingButtonId");this._watching=!this._watching;if(this._watching===true){this._testComponentAPI(this._currentPath.type,this._currentPath.name,e)}},onNavigateTo:function(t){this._watching=false;var e=t.getSource().getBindingContext().getObject();var a=this._pathFactory.buildFor(e);var s=this._goTo.bind(this,a);this._pathController.pushPath(a.name,a.type,s);s()},onToggleAutoRefresh:function(t){this._autoRefresh=!this._autoRefresh;this._setAutoRefresh(this._autoRefresh)},onFilterChange:function(t){var e=t.getSource().getSelectedKey();this._sorter=[];switch(e){case"failing":this._sorter.push(new sap.ui.model.Sorter("status",false));this._sorter.push(new sap.ui.model.Sorter("type",false));break;case"uncovered":this._sorter.push(new sap.ui.model.Sorter("uncovered",true));this._sorter.push(new sap.ui.model.Sorter("type",false));break;case"type":this._sorter.push(new sap.ui.model.Sorter("type",false));this._sorter.push(new sap.ui.model.Sorter("status",false));break}this._sorter.push(new sap.ui.model.Sorter("name",false));this._bindTable(this._currentPath)},_getInitialSorting:function(){var t=[];t.push(new sap.ui.model.Sorter("status",false));t.push(new sap.ui.model.Sorter("type",false));t.push(new sap.ui.model.Sorter("name",false));return t},_setAutoRefresh:function(t){if(t===true){this._intervalId=window.setInterval(function(){this._bindTable(this._currentPath)}.bind(this),12e4)}else{window.clearInterval(this._intervalId)}},_applyInitialSetup:function(){var t=this.getOwnerComponent().getModel("setup");var e=this;t.attachBatchRequestCompleted(function(t,a){var s=t.getSource().getData("/");var i=[];for(var n in s){var r=s[n];i.push(new sap.ui.model.Filter("name","EQ",r.name))}e._setRootDisplayPackages.bind(e)(i)});t.read("/ZCV_ADASH_SETUP_C")},_setRootDisplayPackages:function(t){var e=new sap.ui.model.Filter({and:false,filters:t});var a=new sap.ui.model.Filter({and:true,filters:[new sap.ui.model.Filter("execution","EQ","LAST"),e]});this._sorter=this._getInitialSorting();var s={path:"/ZCV_ADASH_RESULTS_C",fragment:"adash.ui.monitor.fragment.testables",filter:a};this._setupTable();var i=this._goTo.bind(this,s);this._pathController.pushPath("ADASH - Abap Unit Dashboard","root",i);i()},_goTo:function(t){this._cancelWatchingIfNeeded();this._switchTablesIfNeeded(t);this._bindTable(t);this._currentPath=t},_switchTablesIfNeeded:function(t){var e=this.getView().byId("page");if(this._currentPath&&this._currentPath.fragment!==t.fragment||!this._oTable){e.destroyContent();this._oTable=sap.ui.xmlfragment(t.fragment,this);e.addContent(this._oTable)}},_cancelWatchingIfNeeded:function(){if(this._watchId){window.clearInterval(this._watchId);this._watchId=null}},_setupTable:function(){var t=this.getView().byId("resultsTable");t.setBusyIndicatorDelay(200);t.attachUpdateStarted(function(){t.setBusy(true)});t.attachUpdateFinished(function(){t.setBusy(false)})},_bindTable:function(t){this._oTable.bindItems({path:t.path,template:this._oTable.getBindingInfo("items").template,filters:t.filter,sorter:this._sorter})}})});
sap.ui.predefine("adash/ui/monitor/model/models",["sap/ui/model/json/JSONModel","sap/ui/Device"],function(e,i){"use strict";return{createDeviceModel:function(){var n=new e(i);n.setDefaultBindingMode("OneWay");return n}}});
sap.ui.require.preload({
	"adash/ui/monitor/fragment/testMethod.fragment.xml":'<core:FragmentDefinition xmlns:core="sap.ui.core" xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc"><HBox justifyContent="Start" width="100%"><HBox height="100%" alignItems="Center" justifyContent="Start" alignContent="Center"><VBox><HBox><VBox><core:Icon color="{= ${testMethods>status} === \'1\' ? \'Positive\' : \'Negative\' }" size="1.5em"\n\t\t\t\t\t\t\tsrc="{= ${testMethods>status} === \'1\' ? \'sap-icon://accept\' : \'sap-icon://decline\' }"/></VBox><VBox width="100%" alignContent="Start" justifyContent="Center" class="sapUiSmallMarginBegin"><Text text="{testMethods>testMethod}"/></VBox></HBox></VBox></HBox><VBox justifyContent="Start" alignItems="Start" class="sapUiMediumMarginBegin"><Text text="{testMethods>failureHeader}" wrapping="true" class="sapUiMediumMarginBegin"/><Text text="{testMethods>failureDetails}" wrapping="true" class="sapUiMediumMarginBegin"/></VBox></HBox></core:FragmentDefinition>',
	"adash/ui/monitor/fragment/testMethods.fragment.xml":'<core:FragmentDefinition xmlns:core="sap.ui.core" xmlns="sap.m"><Table items="{testMethods>/ZCV_ADASH_TEST_METHODS_C}"><headerToolbar><Toolbar><ToggleButton pressed="._watching" icon="sap-icon://show" text="Watch" press="onWatchThis"/><Button id=\'isCheckingButtonId\' enabled="false" type=\'Transparent\'/></Toolbar></headerToolbar><items><ColumnListItem type="Active" press="onNavigateTo" class="sapUiTinyMargin"><cells><core:Fragment fragmentName="adash.ui.monitor.fragment.testMethod" type="XML"/></cells></ColumnListItem></items><columns><Column id="colId"><header></header></Column></columns></Table></core:FragmentDefinition>',
	"adash/ui/monitor/fragment/testable.fragment.xml":'<core:FragmentDefinition xmlns:core="sap.ui.core" xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:si="sap.suite.ui.commons.statusindicator"><VBox justifyContent="SpaceBetween" width="100%" class="sapUiSmallMarginEnd"><HBox width="100%" height="100%" alignItems="Center" justifyContent="Start" alignContent="Center"><VBox class="sapUiSmallMargin" width="100%"><HBox class="sapUiTinyMarginTop" width="100%"><VBox><core:Icon color="Default" size="3em" src="{= ${type} === 1 ? \'sap-icon://folder-blank\' : \'sap-icon://document-text\' }"/></VBox><VBox width="100%" alignContent="Start" class="sapUiMediumMarginBegin"><Label text="{name}" design="Bold" /><Text text="{description}"/></VBox><Button icon="sap-icon://synchronize" type="Accept" tooltip="Test again" press=".onTestPackage"/></HBox></VBox></HBox><HBox width="100%" justifyContent="SpaceBetween" class="sapUiSmallMarginBeginEnd sapUiSmallMarginBottom"><si:StatusIndicator value="{passingPercentage}" width="6rem" height="6rem"><si:ShapeGroup><si:LibraryShape shapeId="success"/></si:ShapeGroup><si:propertyThresholds><si:PropertyThreshold fillColor="Error" toValue="99"/><si:PropertyThreshold fillColor="Good" toValue="100"/></si:propertyThresholds></si:StatusIndicator><VBox alignItems="Start" justifyContent="Center" class="sapUiTinyMarginBegin"><ObjectStatus text="{= ${failed} > 0 ? \'FAILED\' : ( ${passed} > 0 ? \'PASSED\' : \'NEUTRAL\' ) }"\n\t\t\t\t\tstate="{= ${failed} > 0 ? \'Error\' : ( ${passed} > 0 ? \'Success\' : \'None\' ) }"/><ObjectAttribute title="Total" text="{total}"/><ObjectAttribute title="Passing" text="{passed}"/><ObjectAttribute title="Failing" text="{failed}"/></VBox><si:StatusIndicator value="{coveragePercentage}" width="6rem" height="6rem"><si:ShapeGroup><si:LibraryShape shapeId="cereals"/></si:ShapeGroup><si:propertyThresholds><si:PropertyThreshold fillColor="Neutral" toValue="60"/><si:PropertyThreshold fillColor="Good" toValue="100"/></si:propertyThresholds></si:StatusIndicator><VBox alignItems="Start" justifyContent="Center" class="sapUiMediumMarginEnd"><ObjectStatus text="Coverage: {coveragePercentage} %" state="{= ${coveragePercentage} > 60 ? \'Success\' : \'None\' }"/><ObjectAttribute title="Statements" text="{statements}"/><ObjectAttribute title="Covered" text="{covered}"/><ObjectAttribute title="Uncovered" text="{uncovered}"/></VBox></HBox></VBox></core:FragmentDefinition>',
	"adash/ui/monitor/fragment/testables.fragment.xml":'<core:FragmentDefinition xmlns:core="sap.ui.core" xmlns="sap.m" xmlns:f="sap.f" xmlns:grid="sap.ui.layout.cssgrid"><f:GridList id="resultsTable" items="{/ZCV_ADASH_RESULTS_C}" busyIndicatorDelay="200" growing="true" growingScrollToLoad="true"\n\t\tgrowingThreshold="30"><f:customLayout><grid:GridBoxLayout boxesPerRowConfig="XL4 L3 M2 S1"/></f:customLayout><f:GridListItem type="Active" id="item0" press="onNavigateTo" class="sapUiTinyMargin"><core:Fragment fragmentName="adash.ui.monitor.fragment.testable" type="XML"/></f:GridListItem></f:GridList></core:FragmentDefinition>',
	"adash/ui/monitor/manifest.json":'{"_version":"1.8.0","sap.app":{"id":"adash.ui.monitor","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"1.0.0"},"title":"{{appTitle}}","description":"{{appDescription}}","sourceTemplate":{"id":"servicecatalog.connectivityComponentForManifest","version":"0.0.0"},"dataSources":{"ZCV_ADASH_SETUP_C_CDS":{"uri":"/sap/opu/odata/sap/ZCV_ADASH_SETUP_C_CDS/","type":"OData","settings":{"localUri":"localService/ZCV_ADASH_SETUP_C_CDS/metadata.xml"}},"ZCV_ADASH_RESULTS_C_CDS":{"uri":"/sap/opu/odata/sap/ZCV_ADASH_RESULTS_C_CDS/","type":"OData","settings":{"localUri":"localService/ZCV_ADASH_RESULTS_C_CDS/metadata.xml"}},"ZCV_ADASH_TEST_METHODS_C_CDS":{"uri":"/sap/opu/odata/sap/ZCV_ADASH_TEST_METHODS_C_CDS/","type":"OData","settings":{"localUri":"localService/ZCV_ADASH_TEST_METHODS_C_CDS/metadata.xml"}}}},"sap.ui":{"technology":"UI5","fullWidth":true,"config":{"fullWidth":true},"icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true},"supportedThemes":["sap_hcb","sap_belize"]},"sap.ui5":{"config":{"fullWidth":true},"rootView":{"viewName":"adash.ui.monitor.view.rootResults","type":"XML"},"dependencies":{"minUI5Version":"1.60.0","libs":{"sap.f":{"minVersion":""},"sap.m":{},"sap.ui.core":{},"sap.ui.layout":{},"sap.suite.ui.commons":{}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"adash.ui.monitor.i18n.i18n"}},"setup":{"type":"sap.ui.model.odata.v2.ODataModel","settings":{"defaultOperationMode":"Server","defaultBindingMode":"OneWay","defaultCountMode":"Request"},"dataSource":"ZCV_ADASH_SETUP_C_CDS"},"":{"type":"sap.ui.model.odata.v2.ODataModel","settings":{"defaultOperationMode":"Server","defaultBindingMode":"OneWay","defaultCountMode":"Request"},"dataSource":"ZCV_ADASH_RESULTS_C_CDS"},"testMethods":{"type":"sap.ui.model.odata.v2.ODataModel","settings":{"defaultOperationMode":"Server","defaultBindingMode":"OneWay","defaultCountMode":"Request"},"dataSource":"ZCV_ADASH_TEST_METHODS_C_CDS"}},"resources":{"css":[{"uri":"css/style.css"}]},"routing":{"config":{"routerClass":"sap.m.routing.Router","viewType":"XML","async":true,"viewPath":"adash.ui.monitor.view","controlAggregation":"pages","controlId":"idAppControl","clearControlAggregation":false},"routes":[{"name":"RouterootResults","pattern":"RouterootResults","target":["TargetrootResults"]}],"targets":{"TargetrootResults":{"viewType":"XML","transition":"slide","clearControlAggregation":false,"viewName":"rootResults"}}}},"sap.platform.abap":{"uri":"/sap/bc/ui5_ui5/sap/zadash_ui5v171/webapp","_version":"1.1.0"}}',
	"adash/ui/monitor/view/rootResults.view.xml":'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m" controllerName="adash.ui.monitor.controller.rootResults"\n\tdisplayBlock="true"><Shell id="shell" appWidthLimited="false"><App id="app" backgroundOpacity="0"><pages><Page id="page" title="{i18n>title}"><customHeader><Toolbar><HBox id="headerBox"><FlexBox id="titleBox"></FlexBox></HBox></Toolbar></customHeader><subHeader><OverflowToolbar><ToggleButton icon="sap-icon://synchronize" \n\t\t\t\t\t\t\ttooltip="Fetches results every 2 minutes"\n\t\t\t\t\t\t\tpressed="._autoRefresh" text="Auto refresh" press="onToggleAutoRefresh"/><ToolbarSpacer/><Label text="Sorting order"/><ComboBox id="sortingCombo" selectedKey="failing" change="onFilterChange"><items><core:Item key="failing" text="Failing"/><core:Item key="uncovered" text="Uncovered"/><core:Item key="type" text="Type"/></items></ComboBox></OverflowToolbar></subHeader><content><core:Fragment fragmentName="adash.ui.monitor.fragment.testables" type="XML"/></content></Page></pages></App></Shell></mvc:View>'
});
