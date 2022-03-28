sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
	"use strict";

	var navigationWithContext = {

	};

	return UIComponent.extend("pod.Component", {

		metadata: {
			manifest: "json"
		},

		_sLocale: sap.ui.getCore().getConfiguration().getLanguage(),

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();

			// set language
			this.setLanguage();
		},

		createContent: function () {
			var app = new sap.m.App({
				id: "App"
			});

			return app;
		},

		getNavigationPropertyForNavigationWithContext: function (sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations == null ? null : entityNavigations[targetPageName];
		},

		setLanguage: function() {
			var self = this;
			//set language bundles
			self.setModel(new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties",
				bundleLocale: this._sLocale
				}), "i18n");
			sap.ui.getCore().setModel(new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties",
				bundleLocale: this._sLocale
				}), "i18n");
			//alert legacy pages that language has been changed
			/*sap.ui.getCore().getModel("session").fireMessageChange({
				lang: self.getSession().getLanguage()
			});*/
		}
	});

}, /* bExport= */ true);
