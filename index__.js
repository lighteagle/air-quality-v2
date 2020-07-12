// Setview => 
// view pertama pas loading di koor lat 25 long 121 zoom 7 
var mymap = L.map('mapid').setView([25, 121], 7);


// background Map=======================
var _attribution = '<a href="https://itsmejelita.com" target="_blank">jelita@2020</a>';
var basemaps = [
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'ESRI | ' + _attribution
    }),
    L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Google | ' + _attribution
    }),
    L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Google | ' + _attribution
    }),
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'OSM | ' + _attribution
    }),
];

// Control Basemaps
mymap.addControl(
    L.control.basemaps({
        basemaps: basemaps,
        tileX: 0,
        tileY: 0,
        tileZ: 1
    })
);

const colorIcon = (value) => {
    const mColor = 'green-light'
    switch (value) {
        case value < 51:
            mColor = 'green-light'
            break;
        case value < 51:
            break;
        default:
            mColor = 'grey'
    }
    L.ExtraMarkers.icon({
        icon: 'fa-number',
        number: value.toString(),
        markerColor: 'mColor',
        shape: 'square',
        prefix: 'fa',
        tooltipAnchor: [15, -25]
    });
}
// get Data IOT then add to map====================================
async function getData(url) {
    const data2186 = await d3.csv(url)
    for (item of data2186) {
        // console.log(item)
        const marker = L.marker([parseFloat(item.Lat), parseFloat(item.Long)]).addTo(mymap)
        let name = item.Name.split("-")
        const txt = `
        Latitude : ${item.Lat} <br>
        Longitude :  ${item.Long} <br>
        Station ID : ${name[1]}<br>
        Station Name : ${name[2]}<br>
        <a id="data-${item.ObsID}" style="cursor:pointer" onClick="loadDataIOT(${item.ObsID})"> Show Data</a>
        `
        marker.bindPopup(txt)
    }
}

getData("MappingData2186.csv")
async function loadDataIOT(obsID) {
    const obsURL = `https://sta.ci.taiwan.gov.tw/STA_AirQuality_v2/v1.0/Datastreams(${obsID})/Observations`
    console.log(obsURL)

    const response = await fetch(obsURL)
    const data = await response.json()
    console.log(data)
}