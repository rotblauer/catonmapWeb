var ct = ct || {};
var view = view || {};
var model = model || {};

view.$rawjson = $("#rawjson");
view.$processedata = $("#processedata");

ct.cats = null;

ct.setCats = function(data) {
    ct.cats = Object.create(cats).set(model.parseCatsFromData(data));
    return ct.cats;
};

var catsData = {
    arr: function() {
        var a = [];
        var thisKeys = Object.keys(this);
        for (var i = 0 ; i < thisKeys.length; i++) {
            var key = thisKeys[i];
            cd(i, this[key]);
                a.push(this[key]);
        }
        return a;
    },
    // don't use these. just use arr
    first: function(n) {
        return this.arr().splice(0, n);
    },
    last: function(n) {
        return this.arr().splice(n);
    }
};

var cats = {
    data: Object.create(catsData),
    add: function(cat) {
        this.data[cat.key] = cat;
        return this;
    },
    remove: function(cat) {
        this.data[cat.key] = null;
        return this;
    },
    set: function(data) {
        this.data = data;
        return this;
    },
    all: function() {
        return Object.assign(Object.create(catsData), this.data);
    },
    where: function(fn) {
        var out = Object.create(catsData);
        for (k in this.data) {
            var v = this.data[k];
            if (fn(k, v)) {
                out[k] = v;
            }
        }
        return out;
    },
    // filter is like where, but actually modifies the object's catsdata
    filter: function(fn) {
        for (k in this.data) {
            var v = this.data[k];
            if (!fn(k, v)) {
                delete this.data[k];
            }
        }
        return this;
    },
    length: function() {
        return this.data.length;
    },
};

var trackHost = "http://catonmap.info:3001";

// todo: or load from persister
var catColors = (function() {
    return {
        "Big Papa": "rgb(255,0,0)"
    };
});

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

var cat = {
    key: "123-abc",
    name: "boots",
    aliases: [],
    lat: 0,
    lng: 0,
    notes: "", // JSON
    color: "rgb(123,123,123)",
    getColor: function() {
        return catColors()[this.name];
    },
    parseNotes: function() {
        // parse notes
        if (this.notes !== "") {
            try {
                var jnotes = JSON.parse(this.notes);
                return jnotes;
            } catch {
                return this.notes;
            }
        }
        return false;
    },
    parseTime: function() {
        if (this.time !== "") {
            return moment(this.time);
        } else {
            return moment();
        }
    },
    init: function() {
        this.color = this.getColor();
        this.key = randHex(8);
        this.notes = this.parseNotes();
        this.time = this.parseTime();
        return this;
    },
    hasNoteObject: function() {
        return typeof this.notes === "object" && this.notes.hasOwnProperty("activity");
    },
};

model.buildCat = function(d) {
    var bp = Object.create(cat);
    Object.assign(bp, d);
    return bp;
};

model.parseCatsFromData = function(data) {
    var out = {};
    for (k in data) {
        var v = data[k];
        var bp = model.buildCat(v).init();
        out[bp.key] = bp;
    }
    return out;
};

ct.getLastKnownCats = function() {
    return $.ajax({
        type: 'GET',
        url: trackHost + "/lastknown",
        dataType: 'json'
    });
};

function filterCat(k, cat) {
    if (cat.name === "Big Papa") {
        return true;
    }
    return false;
}

ct.handleLastKnownCats = function(data) {
    ct.setCats(data); //
    // TESTING
    cl("catzz", ct.cats.all());

    var catsort = ct.cats
        .where(function(k, cat) {
            return cat.hasOwnProperty("time") &&
                cat.time !== null &&
                typeof cat.time != "undefined" &&
                cat.time.add(3, "days").isAfter(moment());
        })
        .arr()
        // .sort(function(a, b) {
        //     // -1: a < b
        //     //  0: a = b
        //     //  1: a > b
        //     cd("sort", a, b);
        //     if (a.time.isBefore(b.time)) {
        //         return 1;
        //     } else if (a.time.isAfter(b.time)) {
        //         return -1;
        //     }
        //     return 0;
        // });
    view.$rawjson.html(JSON.stringify(data));
    view.$processedata.html(JSON.stringify(catsort));
};

ct.handleError = function(err) {
    ce(err);
    cw("WARNING: mocking data instead");
    ct.handleLastKnownCats(mockLastknown);
};


var cd = console.debug;
var cl = console.log;
var cw = console.warn;
var ce = console.error;

// http://gregfranko.com/jquery-best-practices/#/8
// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // The $ is now locally scoped
    cd("$ local scope");
    cd(trackHost);
    cd($("#thing").text());

    // Listen for the jQuery ready event on the document
    $(function() {

        // The DOM is ready!
        cd("DOM ready");
        cd(trackHost);
        cd($("#thing").text());

        ct.getLastKnownCats().done(ct.handleLastKnownCats).catch(ct.handleError);
    });

    // The rest of the code goes here!
    cd("REST of code");
    cd(trackHost);
    cd($("#thing").text());

}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter
