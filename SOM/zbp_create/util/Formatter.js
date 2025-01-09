jQuery.sap.declare("ZBP_CREATE.util.Formatter");

ZBP_CREATE.util.Formatter = {

  uppercaseFirstChar : function(sStr) {

    return sStr.charAt(0).toUpperCase() + sStr.slice(1);

  },

  discontinuedStatusState : function(sStatus) {

    return sStatus ? "Error" : "None";

  },

  discontinuedStatusValue : function(sStatus) {

    return sStatus ? "Discontinued" : "";

  },

  convertDateTime : function(sDate) {

    if (sDate !== null && sDate !== "" && Date.parse(sDate)) {

      var oDate = new Date(sDate);

      //var sDateString = oDate.toLocaleString();
      var sDateString = (oDate.getUTCMonth() + 1) + "/" + oDate.getUTCDate() + "/" + oDate.getUTCFullYear();

      return sDateString;

    }

    else {

      return sDate;

    }

  },

getStatusText : function(msg) {

    if (msg === "Approved") {

        return "{i18n>approvedStatusInfo}";

    }

},

  convertStatusState : function(sStatus) {

      if (sStatus === "In-Progress" || sStatus === "New" || sStatus === "Not Yet Available") {

          return "Warning";

      }

      else if (sStatus === "Blocked" || sStatus === "Denied") {

          return "Error";

      }

      else if (sStatus === "Approved") {

          return "Success";

      }

  },

  convertDate : function(sDate) {

        if (sDate !== null && sDate !== "" && Date.parse(sDate)) {

      var oDate = new Date(sDate);

      //var sDateString = oDate.toLocaleDateString();
      var sDateString = (oDate.getUTCMonth() + 1) + "/" + oDate.getUTCDate() + "/" + oDate.getUTCFullYear();

      return sDateString;

    }

    else {

      return sDate;

    }

  },

  currencyValue : function(value) {

    return parseFloat(value).toFixed(2);

  }

};