// Setview => 
// view pertama pas loading di koor lat 25 long 121 zoom 7 
var mymap = L.map('mapid').setView([24, 121], 7);


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
/* Legenda */
var legend = new L.Control({
    position: 'bottomleft'
});
legend.onAdd = function (mymap) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};
legend.update = function () {
    this._div.innerHTML = '<h5>Legend</h5><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(103, 171, 57);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">0</text></svg> 000 - 050 Good<br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(255, 204, 0);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">51</text></svg> 051 - 100 Moderate<br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(238, 138, 25);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">101</text></svg> 101 - 150 Unhealthy for Sensitive Groups<br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(156, 39, 43);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">151</text></svg> 151 - 200 Unhealthy<br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(102, 0, 102);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">201</text></svg> 201 - 300 Very Unhealthy <br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(102, 51, 104);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">301</text></svg> 301 - 500 Hazardous<hr><small>Data Source:<br><a href="https://ci.taiwan.gov.tw/dsp/en/environmental_en.aspx/" target="_blank">Civil Taiwan Government</a></small>'
};
legend.addTo(mymap);

// get Data IOT
// $expand : 
//      Thing/Locations
//      Observations order by phenomenonTime (desc = urutkan data dari waktu terdekat; top=1 => 1 data teratas )
// $filter :
//      Datastreams/name = PM2.5 
//      Thing/properties/authority eq '中研院'
//      substringof('空品微型感測器',Thing/name)
const url_IOT = "https://sta.ci.taiwan.gov.tw/STA_AirQuality_v2/v1.0/Datastreams?$expand=Thing($expand=Locations($select=location)),Observations($orderby=phenomenonTime%20desc;$top=1)&$filter=name%20eq%27PM2.5%27%20and%20Thing/properties/authority%20eq%20%27%E4%B8%AD%E7%A0%94%E9%99%A2%27%20and%20substringof(%27%E7%A9%BA%E5%93%81%E5%BE%AE%E5%9E%8B%E6%84%9F%E6%B8%AC%E5%99%A8%27,Thing/name)&$count=true"

const url_EPA = "https://sta.ci.taiwan.gov.tw/STA_AirQuality_v2/v1.0/Datastreams?$expand=Thing/Locations,Observations($orderby=phenomenonTime%20desc;$top=1)&$filter=name%20eq%20%27PM2.5%27%20and%20Thing/properties/authority%20eq%20%27%E8%A1%8C%E6%94%BF%E9%99%A2%E7%92%B0%E5%A2%83%E4%BF%9D%E8%AD%B7%E7%BD%B2%27%20and%20substringof(%27%E7%A9%BA%E6%B0%A3%E5%93%81%E8%B3%AA%E6%B8%AC%E7%AB%99%27,Thing/name)&$count=true"

async function getData(url, maintener) {
    const response = await fetch(url)
    const data = await response.json()
    data["@iot.nextLink"] && getData(data["@iot.nextLink"])
    for (item of data.value) {
        // console.log(item)
        const long = item['Thing']['Locations'][0]['location']['coordinates'][0]
        const lat = item['Thing']['Locations'][0]['location']['coordinates'][1]

        let pm25 = 'NaN'
        let mColor = 'black'
        let iShape = 'star'
        maintener === 'EPA' ? iShape = 'star' : iShape = 'square'

        if (item['Observations'].length > 0) {
            pm25 = item['Observations'][0]['result'].toString()
            if (item['Observations'][0]['result'] <= 50) {
                mColor = 'green-light'
            } else if (item['Observations'][0]['result'] <= 100) {
                mColor = 'yellow'
            } else if (item['Observations'][0]['result'] <= 150) {
                mColor = 'orange'
            } else if (item['Observations'][0]['result'] <= 200) {
                mColor = 'red'
            } else if (item['Observations'][0]['result'] <= 300) {
                mColor = 'purple'
            } else {
                mColor = 'violet'
            }
        }
        var lightgreenMarker = L.ExtraMarkers.icon({
            icon: 'fa-number',
            number: pm25,
            markerColor: mColor,
            shape: iShape,
            prefix: 'fa',
            tooltipAnchor: [15, -25]
        });
        const marker = L.marker([lat, long], {
            icon: lightgreenMarker
        }).addTo(mymap)
        const txt = `
        <table style="border:1px">
            <tr>
                <th> Info </th>
                <th> Desc </th>
            </tr>
            <tr>
                <td> Lat </td>
                <td> ${lat} </td>
            </tr>
            <tr>
                <td> Long </td>
                <td> ${long} </td>
            </tr>
            <tr>
                <td> Authority </td>
                <td> ${item.Thing.properties.authority} </td>
            </tr>
            <tr>
                <td> Station ID </td>
                <td> ${item.Thing.properties.stationID} </td>
            </tr>
            <tr>
                <td> Station Name </td>
                <td> ${item.Thing.properties.stationName} </td>
            </tr>
        </table>
        <a style="cursor:pointer" onClick=showChart('${item['Observations@iot.navigationLink']}?$count=true','${item['Thing']['properties']['stationName']}','${item['Thing']['properties']['stationID']}','${maintener}')>Show Graph</a>
        `
        marker.bindPopup(txt)
    }
}


async function showChart(url, stationName, stationID, maintener) {
    let dataGraph = []
    const response = await fetch(url)
    const data = await response.json()

    const startDate = data.value[0]["phenomenonTime"]
    const tahun = parseInt(startDate.slice(0, 4))
    const bulan = parseInt(startDate.slice(5, 7))
    const tanggal = parseInt(startDate.slice(8, 10))
    const jam = parseInt(startDate.slice(11, 13))
    const menit = parseInt(startDate.slice(14, 16))
    const detik = parseInt(startDate.slice(17, 19))

    const pInterval = maintener === "EPA" ? 3600 * 1000 : 300 * 1000

    dataGraph = await data.value.map(data => data.result)

    if (data["@iot.nextLink"]) {
        const response2 = await fetch(data["@iot.nextLink"])
        const data2 = await response2.json()
        console.log(data2)
        dataGraph = await dataGraph.concat(data2.value.map(data => data.result))
    }

    // console.log(startDate, tahun, bulan, tanggal, jam, menit, detik)

    var myChart = await Highcharts.chart('h-chart', {
        chart: {
            type: 'spline'
        },
        title: {
            text: `${stationName} - PM.25 - Maintener (${maintener}) `
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'PM 2.5 (μg/m3)'
            }
        },
        series: [{
            name: 'PM 2.5',
            data: dataGraph,
            pointStart: Date.UTC(tahun, bulan, tanggal, jam, menit, detik),
            pointInterval: pInterval
        }],
        legend: {
            enabled: false
        }
    });
}








async function getDataEPA(url) {
    const response = await fetch(url)
    const data = await response.json()
    console.log(data)
    for (item of data.value) {

    }
}


getData(url_IOT, "AcademiaSinica")
getData(url_EPA, "EPA")