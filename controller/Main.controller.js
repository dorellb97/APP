sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/BusyIndicator",
    "sap/m/BusyDialog",
  ],
  function (
    Controller,
    JSONModel,
    ResourceModel,
    History,
    Filter,
    MessageBox,
    MessageToast,
    Dialog,
    Button,
    Text,
    BusyIndicator,
    BusyDialog
  ) {
    "use strict";

    return Controller.extend("pod.controller.Main", {
      locale: navigator.language || navigator.userLanguage,
      model: new JSONModel(),
      route: "ACADEMY22/GIANMARCO/RESRCE/TRANSACTION",
      onInit: function () {
        //set model
        this.getView().setModel(this.model);

        //get url parameters
        /*var param = jQuery.sap.getUriParameters().get("dept");
			if (param && param !== "null") {
				this.model.setProperty("/dept", param.toUpperCase());
			} else {
				this.model.setProperty("/dept", "");
			}*/

        //get data
        this.getSiteAndUser();
      },

      onAfterRendering: function () {
        //set page title
        document.title = this.getView()
          .getModel("i18n")
          .getProperty("page.title");
      },

      onPress: function () {
        const data = this.getDataSync("GET_SITE", this.route, {});
        this.model.setProperty("/SITE", data);
      },

      //INITIAL FUNCTIONS//
      getSiteAndUser: function () {
        var that = this;
        var params = {
          Service: "Admin",
          Mode: "UserAttribList",
          Session: "false",
          "content-Type": "text/xml",
        };

        try {
          var req = jQuery.ajax({
            url: "https://srvmes.icms.it/XMII/Illuminator",
            data: params,
            method: "GET",
            async: true,
          });
          req.done(jQuery.proxy(that.loginSuccess, that));
          req.fail(jQuery.proxy(that.loginError, that));
        } catch (err) {
          jQuery.sap.log.debug(err.stack);
        }
      },

      loginSuccess: function (data, response) {
        var site = jQuery(data).find("DEFAULT_SITE").text();
        var user = jQuery(data).find("User").text();
        var username = jQuery(data).find("FullName").text();

        this.site = site;
        this.user = user;
        this.model.setProperty("/username", username.toUpperCase());

        // if (!this.site) {
        //   location.reload(true);
        // }

        //get data
        /*this.getInfo();*/
      },

      loginError: function (error) {
        // location.reload(true);
      },

      //DATA FUNCTIONS//
      transactionError: function (error) {
        sap.ui.core.BusyIndicator.hide();

        console.error(error);
      },

      /*getInfo: function () {
			var input = {
				SITE: this.site
			};

			this.getDataAsync("TRANSACTION_NAME", "SITE/PATH/TRANSACTION", input, this.getInfoSuccess, this.transactionError);
		},

		getInfoSuccess: function (data, response) {
			sap.ui.core.BusyIndicator.hide();

			var jsonArrStr = jQuery(data).find("Row").text();
			var jsonArr = JSON.parse(jsonArrStr);

			this.model.setProperty("/MODEL", jsonArr);
		},*/

      /*saveInfo: function () {
			var input = {
				SITE: this.site
			};

			this.getDataAsync("TRANSACTION_NAME", "SITE/PATH/TRANSACTION", input, this.saveInfoSuccess, this.transactionError);
		},

		saveInfoSuccess: function (data, response) {
			sap.ui.core.BusyIndicator.hide();

			var jsonArrStr = jQuery(data).find("JSON").text();
			var jsonArr = JSON.parse(jsonArrStr);

			if (jsonArr[0].RESULT === "0") {
				MessageToast.show("Save successful");
			} else {
				MessageBox.error(jsonArr[0].MESSAGE);
			}
		},*/

      //OTHER FUNCTIONS//

      ////UTILITIES////
      formatDate: function (arg) {
        var date = new Date(arg + "Z");
        if (!date instanceof Date || isNaN(date)) {
          return "";
        }

        var options = {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        };
        var formattedDate = date.toLocaleString(this.locale, options);

        return formattedDate;
      },

      //GENERIC CALLS//
      getDataSync: function (transaction, route, input) {
        var results;
        var transactionCall = route + "/" + transaction;

        input.TRANSACTION = transactionCall;
        input.OutputParameter = "*";

        $.ajax({
          type: "POST",
          data: input,
          dataType: "xml",
          async: false,
          url: "https://srvmes.icms.it/XMII/Runner",
          success: function (data) {
            try {
              results = eval(data.documentElement.textContent);
            } catch (err) {
              try {
                results = JSON.parse(data.documentElement.textContent);
              } catch (err2) {
                results = [];
                MessageBox.error(data.documentElement.textContent);
              }
            }
          },
          error: function searchError(xhr, err) {
            console.error("Error on ajax call: " + err);
            console.log(JSON.stringify(xhr));
          },
        });
        return results;
      },

      getDataAsync: function (
        transaction,
        route,
        input,
        successFunc,
        errorFunc
      ) {
        sap.ui.core.BusyIndicator.show();

        var transactionCall = route + "/" + transaction;
        var that = this;

        input.TRANSACTION = transactionCall;
        input.OutputParameter = "*";

        try {
          var req = jQuery.ajax({
            url: "https://srvmes.icms.it/XMII/Runner",
            data: input,
            method: "POST",
            dataType: "xml",
            async: true,
          });
          req.done(jQuery.proxy(successFunc, that));
          req.fail(jQuery.proxy(errorFunc, that));
        } catch (err) {
          jQuery.sap.log.debug(err.stack);
        }
      },

      //TOOLBAR FUNCTIONS//
      onNavBack: function () {
        window.history.back();
      },

      onLogout: function () {
        var that = this;
        var dialog = new Dialog({
          title: that.getView().getModel("i18n").getProperty("dialog.logout"),
          type: "Message",
          state: "Warning",
          content: new Text({
            text: that
              .getView()
              .getModel("i18n")
              .getProperty("dialog.logoutConfirm"),
          }),
          beginButton: new Button({
            icon: "sap-icon://undo",
            type: "Reject",
            press: function () {
              dialog.close();
            },
          }).addStyleClass("halfSizeButton"),
          endButton: new Button({
            icon: "sap-icon://accept",
            type: "Accept",
            press: function () {
              dialog.close();
              var params = {
                Service: "Logout",
                Session: "false",
                "content-Type": "text/xml",
              };
              $.ajax({
                type: "POST",
                data: params,
                async: false,
                url: "https://srvmes.icms.it/XMII/Illuminator",
                success: function (data) {
                  try {
                    var urll = window.location.href;
                    history.pushState({}, null, urll);
                    location.reload(true);
                  } catch (err) {}
                },
                error: function searchError(xhr, err) {
                  console.error("Error on ajax call: " + err);
                  console.log(JSON.stringify(xhr));
                },
              });
            },
          }).addStyleClass("halfSizeButton"),
          afterClose: function () {
            dialog.destroy();
          },
        });

        dialog.open();
      },
    });
  }
);
