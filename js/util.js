var cd = console.debug;
var cl = console.log;
var cw = console.warn;
var ce = console.error;

// https://codepen.io/code_monk/pen/FvpfI
//  random hex string generator
var randHex = function(len) {
    var maxlen = 8,
        min = Math.pow(16, Math.min(len, maxlen) - 1);
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
    var u = URI(host+path);

    for (var key in paramsObj) {
        if (!paramsObj.hasOwnProperty(key) || typeof paramsObj[key] === "function") {
            continue;
        }
        u.addSearch(key, paramsObj[key]);
    }

    return URI({
        protocol: "https",
        hostname: "icanhazbounce.com",
        query: "init=1&url=" + URI.encode(u.href())
    }).href();

    // return URI("https://icanhazbounce.com").addPath(u.href()).href();
    // return  + u.href();
    // q = encodeURIComponent(q);
    // if ((host+path).slice(-1) !== "?") {
    //     q = "?" + q;
    // }
    // return host + path + q;
};

var qJSON = function qJSON(url) {
    return {
        type: "GET",
        url: url,
        // data: ,
        dataType: "json",
        timeout: 10000, 
        beforeSend: function(request) {
            // request.setRequestHeader("Access-Control-Allow-Origin", "*");
            // request.setRequestHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        },
        error: function(err) {
            ce("ajax error", url, JSON.stringify(err, null, 2));
        }
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

function portraitLayout() {
        var b = $("body");
        return b.width() < b.height();
}

var uniqueFilter = function(val, i, self) {
    return self.indexOf(val) === i;
};

// Extend jquery with flashing for elements
$.fn.flash = function(duration, iterations) {
    duration = duration || 1000; // Default to 1 second
    iterations = iterations || 1; // Default to 1 iteration
    for (var i = 0; i < iterations; i++) {
        this.fadeOut(duration).fadeIn(duration);
    }
    return this;
};

// accepts _moment()_ time
var minimalTimeDisplay = function(time) {
    return time.fromNow(true).replace("a few seconds", "0m").replace("a ", "1").replace("an", "1").replace("hours", "h").replace("hour", "h").replace("minutes", "m").replace("minute", "m").replace(" ","").replace("days","d").replace("day", "d").replace("months", "M").replace("month", "M");
}
