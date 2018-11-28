var iconCat = L.icon({
    iconUrl: 'cat-icon.png',
    // shadowUrl: 'leaf-shadow.png',

    iconSize: [32, 32], // size of the icon
    // shadowSize:   [50, 64], // size of the shadow
    iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor: [0, -8] // point from which the popup should open relative to the iconAnchor
});

var catIconSmall = L.icon({
    iconUrl: 'cat-icon.png',
    // shadowUrl: 'leaf-shadow.png',

    iconSize: [16, 16], // size of the icon
    // shadowSize:   [50, 64], // size of the shadow
    iconAnchor: [8, 8], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor: [0, -4] // point from which the popup should open relative to the iconAnchor
});

var iconPinRed = L.icon({
    iconUrl: "/map-icon-red.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [16, 16]
});

var iconPinGreen = L.icon({
    // iconUrl: "/green-map-pin.png",
    // iconUrl: "/green-pin-icon2.png",
    iconUrl: "/green-pin-icon3.png",
    // iconSize: [25,36],
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [16, 16]
});

