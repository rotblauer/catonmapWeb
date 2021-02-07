// visits models

// Stats: {BranchPageN: 0, BranchOverflowN: 0, LeafPageN: 0, LeafOverflowN: 0, KeyN: 0, …}
// matches: 6
// scanned: 6
// visits: Array(6)
// 0: {uuid: "F1634108-A3D7-4EC4-BCE4-5BDA3814067F", name: "Rye8", ArrivalTime: "2018-11-25T21:13:41.999Z", arrivalDate: "2018-11-25T21:13:41.999Z", DepartureTime: "4001-01-01T00:00:00Z", …}
// 1: {uuid: "F1634108-A3D7-4EC4-BCE4-5BDA3814067F", name: "Rye8", ArrivalTime: "2018-11-25T21:13:41.999Z", arrivalDate: "2018-11-25T21:13:41.999Z", DepartureTime: "2018-11-25T21:22:21.999Z", …}
// 2: {uuid: "F1634108-A3D7-4EC4-BCE4-5BDA3814067F", name: "Rye8", ArrivalTime: "2018-11-25T18:45:14.999Z", arrivalDate: "2018-11-25T18:45:14.999Z", DepartureTime: "2018-11-25T18:56:43.998Z", …}
// 3: {uuid: "F1634108-A3D7-4EC4-BCE4-5BDA3814067F", name: "Rye8", ArrivalTime: "2018-11-25T18:45:13.999Z", arrivalDate: "2018-11-25T18:45:13.999Z", DepartureTime: "4001-01-01T00:00:00Z", …}
// 4: {uuid: "7C1DF911-51DC-44A9-B894-A4622D7F52F5", name: "Rye8", ArrivalTime: "2018-11-17T17:42:36Z", arrivalDate: "2018-11-17T17:42:36.000Z", DepartureTime: "4001-01-01T00:00:00Z", …}
// 5: {uuid: "7C1DF911-51DC-44A9-B894-A4622D7

var visitsP = {
    Stats: null,
    matches: 0,
    scanned: 0,
    visits: []
};

// 0:
// ArrivalTime: "2018-11-25T21:13:41.999Z"
// DepartureTime: "4001-01-01T00:00:00Z"
// Duration: 315839608673
// PlaceParsed:
// Acc: 0
// Address: "302 School Ave, 302 School Ave, Mount Pleasant, IA  52641, United States "
// Identity: "302 School Ave"
// Lat: 41.13409273
// Lng: -91.54086909
// Radius: 141.7
// ReportedTime: "2018-11-25T21:18:44.263Z"
// arrivalDate: "2018-11-25T21:13:41.999Z"
// departureDate: "4001-01-01T00:00:00.000Z"
// name: "Rye8"
// place: "302 School Ave, 302 School Ave, Mount Pleasant, IA  52641, United States @ <+41.13409273,-91.54086909> +/- 100.00m, region CLCircularRegion (identifier:'<+41.13409273,-91.54086909> radius 141.70', center:<+41.13409273,-91.54086909>, radius:141.70m)"
// uuid: "F1634108-A3D7-4EC4-BCE4-5BDA3814067F"
// validVisit: true

var visitP = {
    // parsed as moment()s
    arrivalDate: null,
    depatureDate: null,

    // in localtz
    arrivalDateLocal: null,
    departureDateLocal: null,

    // as strings
    ArrivalTime: null,
    DepartureTime: null,

    ReportedTime: "",
    reportedTime: null,

    Duration: null,
    PlaceParsed: {
        Identity: null,
        Address: null,
        Acc: 0,
        Lat: null,
        Lng: null,
        Radius: null,
    },
    name: null,
    uuid: null,
    googleNearby: {
        Results: []
    },
    exists: function() {
        return this.reportedTime !== null;
    },
    id: function() {
        return this.uuid + this.name + this.ReportedTime ; // this.ArrivalTime + this.DepartureTime;
    },
    marker: function(map) {
        var props = this;
        return L.marker([this.PlaceParsed.Lat, this.PlaceParsed.Lng], {
            icon: this.isComplete() ? iconPinRed : iconPinGreen
        }).on("click", function(e) {
            cd(e);
            cd(props);
            return visitMarker(e, props, map);
        });
    },
    // el:
    init: function() {
        this.arrivalDate = moment(this.arrivalDate);
        this.departureDate = moment(this.departureDate);

        var tzl = tzlookup(+this.PlaceParsed.Lat, +this.PlaceParsed.Lng);
        this.arrivalDateLocal = moment.tz(this.arrivalDate, tzl);
        this.departureDateLocal = moment.tz(this.departureDate, tzl);

        this.reportedTime = moment(this.ReportedTime);

        return this;
    },
    isArrival: function() {
        return this.departureDate.year() > 3000;
    },
    isDeparture: function() {
        return this.arrivalDate.year() < 1975;
    },
    isComplete: function() {
        return !this.isArrival() && !this.isDeparture();
    }
};

var visitMarker = function(e, props, map) {
    var start = props.arrivalDateLocal;
    var end = props.departureDateLocal;
    var timeSpent = end.to(start, true);

    var relTime = ", " + moment(props.ArrivalTime).from(moment());

    var str = props.name + " visited " + props.PlaceParsed.Identity + " for " + timeSpent + relTime + ", on " + start.format("dddd, MMMM Do") + ", from " + start.format("LT") + " to " + end.format("LT");
    if (end.year() >= 3000) {
        str = props.name + " arrived at " + props.PlaceParsed.Identity + relTime + ", on " + start.format("llll");
    } else if (start.year() < 1000) {
        str = props.name + " left " + props.PlaceParsed.Identity + relTime + ", on " + end.format("llll");
    }
    str += " (local time)";

    var firstphoto = "";
    var photoshtml = "";
    var photoshtmllim = 0;
    var nearly = "";
    var nearbylim = 0;

    if (props.googleNearby.Results && props.googleNearby.Results.length > 0) {
        str += "<br>";
        var results = props.googleNearby.Results;
        cd("results", results);
        // types not includes political, route, locality
        var blisttypes = ["locality"];
        for (var i = 0; i < results.length; i++) {
            var r = results[i];
            // vicinity includes comma
            // if (r.vicinity.indexOf(",") < 0) {
            //     continue;
            // }
            var blacklisted = false;
            for (var j = 0; j < blisttypes.length; j++) {
                var t = blisttypes[j];
                if (r.types.indexOf(t) >= 0) {
                    blacklisted = true;
                }
            }
            if (blacklisted) continue;

            try {
                if (!r.photos) {
                    cd("no photos", r);
                } else if (firstphoto === "") {
                  // firstphoto = "<img src='" + "https://icanhazbounce.com?url=" + trackHost + "/googleNearbyPhotos?photoreference=" + encodeURIComponent(r.photos[0]["photo_reference"]) + "' style='width: 300px;' />";
                    firstphoto = "<img src='" + trackHost + "/googleNearbyPhotos?photoreference=" + encodeURIComponent(r.photos[0]["photo_reference"]) + "' style='width: 300px;' />";
                } else {
                    // limit detail photos, and don't show dupes
                    if (photoshtmllim <= 3 && photoshtml.indexOf(r.photos[0]["photo_reference"]) < 0) {
                      // photoshtml = photoshtml + "<img src='" + "https://icanhazbounce.com?url=" +trackHost + "/googleNearbyPhotos?photoreference=" + encodeURIComponent(r.photos[0]["photo_reference"]) + "' style='max-width: 75px;' />";
                        photoshtml = photoshtml + "<img src='" + trackHost + "/googleNearbyPhotos?photoreference=" + encodeURIComponent(r.photos[0]["photo_reference"]) + "' style='max-width: 75px;' />";
                        photoshtmllim++;
                    }
                }
            } catch (err) {
                console.error("err photo", err);
            }
            var blisttypes2 = ["route", "atm"];
            if (nearbylim <= 3) {
                var n = r.name;
                var ok = true;
                for (var k = 0; k < blisttypes2.length; k++) {
                    if (r.types.indexOf(blisttypes2[k]) >= 0) {
                        ok = false;
                    }
                }
                if (ok) {
                    n = "<a target='_' href='https://www.google.com/search?q=" + encodeURIComponent(r.name.replace(/\'/g, "")) + " " + r.types[0].replace(/_/g, " ") + "+" + r.vicinity + "'>" + n + "</a>";
                }
                nearly += "<img src='" + r.icon + "' style='height: 10px;' />" + " " + n + "<br>";
                nearbylim++;
            } else {
                // break;
            }
        }
    }

    str = firstphoto + (firstphoto.length > 0 ? "<br>" : "") + photoshtml + "<p>" + str + "</p>" + "Nearby:<br>" + nearly;

    L.popup()
        .setContent(str)
        .setLatLng([props.PlaceParsed.Lat, props.PlaceParsed.Lng])
        .openOn(map);

    // clearHighlight();
    // highlight = true; // e.osm_id;
    // pbfPlacesLayer.setFeatureStyle(highlight, {
    // 	  weight: 2,
    // 	  color: 'red',
    // 	  opacity: 1,
    // 	  fillColor: 'red',
    // 	  fill: true,
    // 	  radius: 6,
    // 	  fillOpacity: 1
    // });

    L.DomEvent.stop(e);
};
