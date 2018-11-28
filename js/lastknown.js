var visitsData = {
    data: [],
    all: function() {
        return this.data;
    },
    len: function() {
        return this.data.length;
    },
    push: function(item) {
        this.data.push(item);
        return this.data;
    },
    where: function(fn) {
        var a = [];
        for (var i = 0; i < this.data.length; i++) {
            if (fn(this.data[i])) {
                a.push(this.data[i]);
            }
        };
        return a;
    },
    each: function(fn) {
        for (var i = 0; i < this.data.length; i++) {
            fn(this.data[i]);
        }
    },
    first: function(n) {
        var l = this.data.length;
        if (n > l) n = l;
        return this.data.splice(0, n - 1);
    },
    last: function(n) {
        var l = this.data.length;
        if (n > l) n = l;
        return this.data.splice(l - 1 - n);
    }
};

var dataLastKnownEntry = {
    e: null, // jquery element
    on: true, // for per-cat toggling feature
    uuid: "",
    key: "123-abc", // maybe for something with a unique hex or something
    name: "boots",
    time: "",
    aliases: [],
    lat: 0,
    long: 0,
    notes: "", // JSON
    color: "rgb(123,123,123)",
    alternateCats: {}, // for other devices, keyed on color
    visits: Object.create(visitsData),
    // identifier per cat device or accomplices
    uid: function() {
        return "|COLOR|" + this.getColor() + "|NAME|" + this.name + "|UUID|" + this.uuid;
    },
    // identifier per cat identity
    iid: function() {
        return this.getColor(); // TODO
    },
    getColor: function() {
        return catColors()[this.name] || "lightgray";
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
        this.key = this.color; // randHex(8);
        this.notes = this.parseNotes();
        this.time = this.parseTime();
        this.aliases = [this.name];
        this.elInit();
        return this;
    },
    el: function() {
        return this.e;
    },
    elInit: function(e) {
        var fly = function(e) {
            var et = $(e.target).closest(".lastKnown");
            var lat = +et.attr("data-lat");
            var lng = +et.attr("data-lng");
            if (objExists(lat) && objExists(lng)) {
                cd(lat, lng);
                var m = view.mapState.getMap();
                m.setView([lat, lng], m.getZoom());
            }
        };
        var filter = function(e) {
            cl("dobuleclick");
            var t = $(e.target).closest(".lastKnown");
            t.toggleClass("filtering");

            var filterers = [];
            $(".lastKnown.filtering").each(function(i, el) {
                var n = $(el).attr("data-iid");
                var as = model.lastKnownData.get(n).aliases;
                cd("aliases", as);
                filterers = filterers.concat(as.slice());
            });
            var fn = function(props, zoom, layer) {
                return $.inArray(props.Name, filterers) > -1;
            };
            if (filterers.length === 0) {
                fn = null;
            }
            ct.setSettingsFilter("viewables", fn);
            view.mapState.setPBFOpt(localOrDefault("l", "activity"));

            view.mapState.setLayer("visits", null);
            model.visitsParams.set("names", filterers)
                .get()
                .done(model.setVisits)
                .catch(model.errVisits);
        };

        if (!objExists(e)) {
            this.e = $(`
<div href="#" class="list-group-item list-group-item-action flex-column align-items-start lastKnown" style="border-color: ${this.getColor()} !important;">
    <div class="d-flex w-100 justify-content-between">
        <h6 class="mb-1" style="color: ${this.getColor()};">${this.name}</h6>
        <small class="text-muted" >${this.time.fromNow()}</small>
    </div>
    <div class="d-flex w-100 justify-content-between">
    </div>
</div>`)
                .attr("data-uid", this.uid())
                .attr("data-iid", this.iid())
                .attr("data-name", this.name)
                .attr("data-lat", this.lat)
                .attr("data-lng", this.long);

                // .css("color", this.getColor());
            // <p class="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
            // <small class="text-muted">Donec id elit non mi porta.</small>

            // this.e = $("<div>").addClass("row").addClass("m-0").addClass("p-1").addClass("lastKnown");
        } else {
            this.e = e;
        }

        if (this.time.isBefore(moment().add(-3, "days"))) {
            this.e.addClass("transparent50");
        }

        var flylink = $("<a>")
            .css("cursor", "pointer")
            .css("font-size", "0.8em")
            .addClass("")
            .addClass("pr-3")
            .text("flyto")
            // .css("color", "gray")
            .on("click", fly);

        var filterlink = $("<a>")
            .css("cursor", "pointer")
            .css("font-size", "0.8em")
            .addClass("")
            .addClass("pr-3")
            .text("filter")
            .on("click", filter);

        if (this.hasNoteObject()) {
            var no = this.notes;
            var subtitle = "" + no.activity + ", altitude: " + this.elevation.toFixed(0) + "m<br>" + no.numberOfSteps + " steps, distance: " + (no.distance / 1).toFixed(0) + "m since " + moment(no.currentTripStart).from(moment());
            var lastupNotes = $("<small>")
                .addClass("mb-0")
                .html(subtitle)
                .addClass("text-muted");
            this.e.find(".d-flex").last().append(lastupNotes);
        }

        var d = $("<div>").addClass("m-0 p-0").append(flylink).append(filterlink);

        this.e.append(d);

        return this.e; // .append(filterlink).append(flylink).append(metadata);
    },
    hasNoteObject: function() {
        return typeof this.notes === "object" && this.notes.hasOwnProperty("activity");
    },
};

var iconCat = L.icon({
    iconUrl: 'cat-icon.png',
    // shadowUrl: 'leaf-shadow.png',

    iconSize: [32, 32], // size of the icon
    // shadowSize:   [50, 64], // size of the shadow
    iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor: [0, -8] // point from which the popup should open relative to the iconAnchor
});

var dataLastKnownData = {
    arr: function() {
        var a = [];
        var thisKeys = Object.keys(this);
        for (var i = 0; i < thisKeys.length; i++) {
            var key = thisKeys[i];
            a.push(this[key]);
        }
        return a;
    },
    asLayerGroup: function() {
        var a = [];
        var thisKeys = Object.keys(this);
        for (var i = 0; i < thisKeys.length; i++) {
            var key = thisKeys[i];
            var v = this[key];
            a.push(L.marker([
                +v.lat, +v.long
            ], {
                title: v.name,
                alt: v.name + "_" + v.uuid,
                icon: iconCat
            }));
        }
        return L.layerGroup(a);
    }
};


var dataLastKnown = {
    data: Object.create(dataLastKnownData),
    add: function(cat) {
        if (objExists( this.get(cat.iid()) )) {
            var existCat = this.get(cat.iid());

            if (cat.time.isAfter(existCat.time)) {

                // swap cats, keeping newest as "parent"
                for (var i = 0; i < existCat.aliases.length; i++) {
                    if ($.inArray(cat.aliases, existCat.aliases[i]) < 0) cat.aliases.push(existCat.aliases[i]);
                }
                // cat.aliases = existCat.aliases.slice();
                // cat.aliases.push(existCat.name);
                existCat.aliases.push(cat.name);

                cat.alternateCats = $.extend({}, existCat.alternateCats); // shallow copy
                existCat.alternateCats = {}; // clear old

                cat.alternateCats[existCat.uid()] = existCat;
                this.data[cat.iid()] = cat;
            } else {
                // else add this cat as an alternate
                this.data[cat.iid()].alternateCats[cat.uid()] = cat;
                this.get(cat.iid()).aliases.push(cat.name);
            }
        } else {
            this.data[cat.iid()] = cat;
        }
        return this;
    },
    get: function(iid) {
        return this.data[iid];
    },
    remove: function(cat) {
        this.data[cat.iid()] = null;
        return this;
    },
    set: function(data) {
        this.data = data;
        return this;
    },
    has: function(fn) {
        for (var k in this.data) {
            if (!this.data.hasOwnProperty(k) || (typeof this.data === "function")) {
                continue;
            }
            var v = this.data[k];
            if (fn(k, v)) {
                return true;
            }
        }
        return false;
    },
    all: function() {
        return Object.assign(Object.create(dataLastKnownData), this.data);
    },
    // where returns a catsData object copy that has been filtered by the giving fn
    where: function(fn) {
        var out = Object.create(dataLastKnownData);
        for (k in this.data) {
            if (!this.data.hasOwnProperty(k)) {
                continue;
            }
            var v = this.data[k];
            if (fn(k, v)) {
                out[k] = v;
            }
        }
        return out;
    },
    // filterHard is like where, but actually modifies the object's catsdata
    filterHard: function(fn) {
        for (k in this.data) {
            var v = this.data[k];
            if (!fn(k, v)) {
                delete this.data[k];
            }
        }
        return this;
    }
};
