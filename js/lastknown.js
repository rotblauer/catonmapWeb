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
    lastVisit: Object.create(visitP),
    visits: Object.create(visitsData),
    COVerified: false,
    ln: null,
    // heartIcon: 0,
    // heartTime: null,
    // identifier per cat device or accomplices
    uid: function() {
        return "|COLOR|" + this.getColor() + "|NAME|" + this.name + "|UUID|" + this.uuid;
    },
    // identifier per cat identity
    iid: function() {
        return this.getColor(); // TODO
    },
    elid: function() {
        return this.getColor().replace(",", "").replace(",", "").replace("(", "").replace(")", "");
    },
    getColor: function() {
        if (objExists(catColors()[this.uuid])) {
            return catColors()[this.uuid];
        }
        return catColors()[this.name] || "lightgray";
    },
    batteryLevel: function() {
        var n = this.parseNotes();
        if (n) {
            if (n["batteryStatus"]) {
                var b = JSON.parse(n["batteryStatus"]);
                return +b.level;
            }
        }
        return -1;
    },
    batteryStatus: function() {
        var n = this.parseNotes();
        if (n) {
            if (n["batteryStatus"]) {
                var b = JSON.parse(n["batteryStatus"]);
                return b.status;
            }
        }
        return "n/a/";
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
    // heartBeat: function(hr) {
    //     if (!objExists(hr) && !objExists(this.heartIcon)) {
    //         return;
    //     }
    //     if (!objExists(this.heartIcon)) {
    //         this.heartIcon = $( this.el().find(".heart-icon").first().show() );
    //         this.heartTime = hr;
    //     }
    //     hr = hr || this.heartTime;
    //     // https://stackoverflow.com/a/23030299
    //     // .fadeTo(100, 0.3, function() { $(this).fadeTo(500, 1.0); });
    //     // hr == count/min
    //     // hr / 60 == count/sec
    //     // hr / 60 /1000 = count/millisec
    //     var cms = hr/60*1000/2;
    //     // /2 cause pomp pomp
    //     $( this.heartIcon ).fadeOut(cms).fadeIn(cms);
    //     setInterval(this.heartBeat, hr*2);
    // },
    init: function() {
        this.color = this.getColor();
        this.key = this.color; // randHex(8);
        this.notes = this.parseNotes();
        this.time = this.parseTime();
        this.aliases = [this.name];
        // this.elInit();
        return this;
    },
    el: function() {
        return this.e;
    },
    elInit: function(ln) {
        // FIXME
        if (!objExists(ln) || !objExists(this.ln)) {
            ln = view.$lastKnown;
        }

        this.ln = ln; // cache parent selector

        var follow = function(e) {
            $(".follow-highlight").removeClass("follow-highlight");
            var t = $(e.target).closest(".lastKnown");
            var iid = t.attr("data-iid");
            controller.settings.follow === iid ? (controller.settings.follow = "") : (controller.settings.follow = iid);
            controller.settings.follow === "" ? $(e.target).removeClass("follow-highlight") : $(e.target).addClass("follow-highlight");
            model.setLocalStore("fc", controller.settings.follow);
            var lat = t.attr("data-lat");
            var lng = t.attr("data-lng");

            view.mapState.getMap().flyTo([lat, lng]);
        };
        var find = function(e) {
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

            // FIXME: this should be peristable (ajax reqs every 30secs break the UI here)
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
            controller.setSettingsFilter("viewables", fn);
            view.mapState.setPBFOpt(localOrDefault("l", "activity"));

            // view.mapState.setLayer("visits", null);
            // model.visitsParams.set("names", filterers)
            //     .get()
            //     .done(model.setVisits)
            //     .catch(model.errVisits);
        };



        if (!objExists(this.el())) {
            this.e = $(`
<div id="${this.elid()}"  class="text-right lastKnown lastknown-cat" style="line-height: 1rem !important;">
<p>
    <span style="color: ${this.getColor()};">${this.name}</span>
    <img src="cat-icon.png"  style="max-height: 1.2rem; vertical-align: middle; margin-bottom: 0.3rem;"/>
    <span class="small text-muted">${minimalTimeDisplay(this.time)}</span>
</p>
<!--<p class="links"></p>-->
</div>
`)

                /*

                THE ORIGINAL

        <div href="#" id="${this.elid()}" class="list-group-item list-group-item-action flex-column align-items-start lastKnown" style="border-color: ${this.getColor()} !important;">
    <div class="d-flex w-100 justify-content-between">
        <h6 class="mb-1 catname" style="color: ${this.getColor()};">${this.name} <small class='text-${this.COVerified ? "success" : "muted"}' ><sup>${this.COVerified ? "Verified" : ""}</sup></small></h6>
        <small class="text-muted" >${minimalTimeDisplay(this.time)}</small>
    </div>
    <div class="d-flex w-100 justify-content-between links" style="">
    </div>
    <div class="d-flex w-100 justify-content-between lastVisit">
    </div>
</div>
         */

                .attr("data-uid", this.uid())
                .attr("data-iid", this.iid())
                .attr("data-name", this.name)
                .attr("data-lat", this.lat)
                .attr("data-unix", this.time.unix())
                .attr("data-lng", this.long);

                this.e.on('click', find);

            // if (this.version !== latestiOSVersion && this.uuid.indexOf("XXX") < 0) {
            //     this.e.find(".catname").append($("<a>").attr("href", "http://punktlich.rotblauer.com/install").attr("target", "_").text("Outdated Version " + this.version).addClass("badge badge-warning ml-2"));
            // }

            // FIXME
            this.ln.append(this.e);

        } else {
            var ex = this.e;
            this.e = null;
            ex.replaceWith(this.elInit());
        }

        if (this.time.isBefore(moment().add(-3, "days"))) {
            this.e.addClass("transparent50");
        }

        // var bsStyle = function(name, fn) {
        //     return $("<span>")
        //         .css("cursor", "pointer")
        //         .css("font-size", "0.8em")
        //         .css("color", "blue")
        //         .css("text-decoration", "underline")
        //         // .css("text-decoration", "underline")
        //         .addClass("mr-3 mt-2")
        //         .text(name)
        //         .on("click", fn);
        // };

        // var findlink = bsStyle("Find", find).addClass('');
        // var filterlink = bsStyle("Filter", filter).addClass('');
        // var followLink = bsStyle("follow", follow);

        // if (controller.settings.follow === this.iid()) {
        //     followLink.addClass("follow-highlight");
        // }

        if (this.hasNoteObject()) {
            var no = this.notes;
            var subtitle = `${no.activity}, speed: ${this.speed.toFixed(1)}m/s, elevation: ${this.elevation.toFixed(0)}m<br>
healthkit=(${no.numberOfSteps} steps, distance: ${no.distance.toFixed(0)}m, since: ${moment(no.currentTripStart).from(moment())})`;
            // var subtitle = "" + no.activity + ", elevation: " + this.elevation.toFixed(0) + "m<br>" + no.numberOfSteps + " steps, distance: " + (no.distance / 1).toFixed(0) + "m since " + moment(no.currentTripStart).from(moment());

            var existing = this.el().find(".lastup-notes").remove();
            this.el().find(".battery-status").remove();
            var lastupNotes = $("<small>")
                .addClass("mb-0 lastup-notes")
                .html(subtitle)
                // .addClass("text-muted");
                .addClass("text-muted");
            var batSpan = $("<small>").addClass("text-muted");
            this.el().find(".links").first().append(lastupNotes);

            // var hr = this.heartRate();
            // if (hr) {
            //     var hhr = $(`<img class='heart-icon' src="/heart2.svg" style="height: 1em; display: none; margin-right: 0.3em;"/>`);
            //     lastupNotes.prepend(hhr);
            //
            //     if (this.time.isAfter(moment().subtract(5, "minutes"))) {
            //         // var cms = hr / (60) * 1000 / 2;
            //         var cms = ((60 * 1000) / hr) / 2;
            //         hhr.flash(cms, 1000);
            //         // var bpm = $("<sub>").text(hr).css({
            //         //     color: "red",
            //         //     "font-weight": "lighter",
            //         //     "font-size": "0.7em",
            //         //     "margin-left": "-0.3em",
            //         //     "margin-right": "0.3em"
            //         // });
            //         // hhr.after(bpm);
            //     } else {
            //         hhr.attr("src", "/heart-gray.png");
            //     }
            // }

            if (this.batteryLevel() > 0) {
                var plusOrMin = "";
                switch ( this.batteryStatus() ) {
                case "full":
                    plusOrMin = "+";
                    break;
                case "charging":
                    plusOrMin = "+";
                    break;
                case "unplugged":
                    plusOrMin = "-";
                    break;
                case "unknown":
                    plusOrMin = "?";
                }
                cd(this.batteryStatus());
                lastupNotes.after($("<small>").addClass("battery-status").css({"font-size": "0.7em", "font-weight": "light"}).html( "<img src='/battery-icon.png' style='height: 0.8em;'/>" + ( this.batteryLevel()*100 ).toFixed(0)+"%"+plusOrMin));
            }

        }

        // if (this.lastVisit && this.lastVisit.exists()) {
        //     var vv = this.lastVisit;
        //     var con = vv.PlaceParsed.Identity;
        //     if (vv.isArrival()) {
        //         con = "Arrived at " + con + " " + vv.arrivalDate.fromNow();
        //     } else if (vv.isDeparture()) {
        //         con = "Departed " + con + " " + vv.arrivalDate.fromNow();
        //     } else {
        //         // con = "Spent " + vv.departureDateLocal.to(vv.arrivalDateLocal, true) + " + " at " + con "
        //         con = `Spent ${vv.departureDateLocal.to(vv.arrivalDateLocal, true)} at ${vv.PlaceParsed.Identity}, left ${vv.departureDate.fromNow()}`;
        //     }
        //     var vis = $(`<small>${con}</small>`).css("cursor", "pointer").on("click", function() {
        //         view.mapState.getMap().setView([vv.PlaceParsed.Lat, vv.PlaceParsed.Lng]);
        //     })
        //     // .css("color", "blue")
        //     // .css("text-decoration", "underline")
        //     ;
        //     this.el().find(".lastVisit").last().html("");
        //     this.el().find(".lastVisit").last().append(vis);
        // }
        //
        // this.el().children(".maplinks").remove();
        // // NOTE: 'follow' link is commented b/c not sure actually working w/r/t ajax updates
        // // and/or filtering, state persisting
        // var d = $("<div>").addClass("m-0 p-0 maplinks").append(findlink).append(filterlink); // .append(followLink);
        // this.el().append(d);

        // // init follow if following
        // if (controller.settings.follow !== "") {
        //     if (objExists(model.lastKnownData)) {
        //         var c = model.lastKnownData.get(controller.settings.follow);
        //         if (objExists(c)) {
        //             view.mapState.getMap().flyTo([c.lat, c.long]);
        //         }
        //     }
        // }

        return this.e; // .append(filterlink).append(findlink).append(metadata);
    },
    hasNoteObject: function() {
        return typeof this.notes === "object" && this.notes.hasOwnProperty("activity");
    },
    heartRate: function() {
        if (!objExists(this.notes.heartRateS)) {
            return false;
        }
        var beat = +this.notes.heartRateS.split(" ")[0];
        return beat;
    }
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
        if (objExists(this.get(cat.iid()))) {
            var existCat = this.get(cat.iid());

            if (cat.time.isAfter(existCat.time)) {

                // // swap cats, keeping newest as "parent"
                // for (var i = 0; i < existCat.aliases.length; i++) {
                //     var as = cat.aliases.slice();
                //     if (as.indexOf(existCat.aliases[i]) < 0) {
                //         cat.aliases.push(existCat.aliases[i]);
                //     }
                // }
                existCat.aliases.push(cat.name);

                existCat.aliases = existCat.aliases.filter(uniqueFilter);
                cat.aliases = cat.aliases.filter(uniqueFilter);

                cat.alternateCats = $.extend({}, existCat.alternateCats); // shallow copy
                existCat.alternateCats = {}; // clear old

                cat.alternateCats[existCat.uid()] = existCat;
                Object.assign(this.data[cat.iid()], cat);
            } else {
                // else add this cat as an alternate
                this.data[cat.iid()].alternateCats[cat.uid()] = cat;
                this.get(cat.iid()).aliases.push(cat.name);
                this.get(cat.iid()).aliases = this.get(cat.iid()).aliases.filter(uniqueFilter);
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
