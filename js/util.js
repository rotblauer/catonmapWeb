var cd = console.debug;
var cl = console.log;
var cw = console.warn;
var ce = console.error;

// https://codepen.io/code_monk/pen/FvpfI
//  random hex string generator
var randHex = function(len) {
    var maxlen = 8,
        min = Math.pow(16, Math.min(len, maxlen) - 1)
    max = Math.pow(16, Math.min(len, maxlen)) - 1,
        n = Math.floor(Math.random() * (max - min + 1)) + min,
        r = n.toString(16);
    while (r.length < len) {
        r = r + randHex(len - maxlen);
    }
    return r;
};

var objExists = function objExists(obj) {
    return typeof obj !== "undefined" && obj !== null;
};

/**
 * Delay for a number of milliseconds
 */
function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

var queryURL = function queryURL(host, path, paramsObj) {
    var q = "?";
    if (host.indexOf(q) >=0 || path.indexOf(q) >=0) {
        q = "";
    }
    var n = 0;
    for (var key in paramsObj) {
        if (!paramsObj.hasOwnProperty(key) || typeof paramsObj[key] === "function") {
            continue;
        }
        var v = paramsObj[key];
        if (n > 0) {
            q = q + "&";
        }
        if ( typeof v === "object" ) {
            for (var j = 0; j < v.length; j++) {
                q = q + key + "=" + encodeURIComponent(v[j]);
                q = q + "&";
                n++;
            }
            q = q.substring(0, q.length-1); // remove last &
        } else {
            q = q + key + "=" + encodeURIComponent(v);
            n++;
        }
    }
    return host + path + q;
};

var qJSON = function qJSON(url) {
    return {
        type: "GET",
        url: url,
        dataType: "json",
        timeout: 3000 // sets timeout to 3 seconds
    };
};

function parseQueryVariable(url, variable) {
    if (typeof url === "undefined" || url === null || window.location.href.indexOf("=") >= 0) {
        url = window.location.search;
    } else {
        url = url.substring(url.indexOf("?"));
    }
    var query = decodeURIComponent(url.substring(1));
    // console.log("query/variable", query, variable);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (null);
}

var browserSupportsLocalStorage = (function () {
    var support = null;
    try {
        support = 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        support = false;
    }
    return support;
})();

var setWindowTitle = function() {
    if (window.location.host.includes("catonmap")) {
        document.title = "Cat On Map";
    } else if (window.location.host.includes("punktlich")) {
        document.title = "Punktlich";
    } else if (window.location.host.includes("localhost")) {
        document.title = "Development";
    } else {
        console.log("nope", window.location + "".indexOf("localhost"));
    }
};

var localOrDefault = function(key, def) {
    var q = parseQueryVariable(null, key);
    if (objExists(q)) {
        return q;
    }
    var ls = model.getLocalStore(key);
    if (!objExists(ls)) {
        return def;
    }
    return ls;
};

function assembleStateURL() {
    var latlng = map.getCenter();
    var lat = latlng.lat;
    var lng = latlng.lng;
    var z = map.getZoom();
    var wl = window.location.origin;
    var vv = $("#visits-checkbox").is(":checked") ? "yes" : "no";
    var text = wl + "?z=" + z +
        "&y=" + lng +
        "&x=" + lat +
        "&l=" + drawnLayer +
        "&t=" + getCurrentTileLayerName() +
        "&s=" + globalSinceFloor +
        "&v=" + vv;
    return text;
}

// http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function shadeRGBColor(color, percent) {
    var f = color.split(","),
        t = percent < 0 ? 0 : 255,
        p = percent < 0 ? percent * -1 : percent,
        R = parseInt(f[0].slice(4)),
        G = parseInt(f[1]),
        B = parseInt(f[2]);
    return "rgb(" + (Math.round((t - R) * p) + R) + "," + (Math.round((t - G) * p) + G) + "," + (Math.round((t - B) * p) + B) + ")";
}

function radiusFromSpeed(speed, zoom) {
    if (typeof(speed) === "undefined") {
        return 2;
    }
    if (speed < 0) {
        speed = 0;
    }
    var x = Math.abs(2 - (Math.log(speed + 0.01) / 2));
    if (zoom <= 12) {
        x++;
    }
    return x;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function isSmallScreen() {
    if (/Android|webOS|iPhone|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    }
    return false;
}