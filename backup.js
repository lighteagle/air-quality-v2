// // let data2 = "https://sta.ci.taiwan.gov.tw/STA_AirQuality_v2/v1.0/Datastreams?$expand=Thing,Observations&$filter=name eq 'PM2.5' and Thing/properties/authority eq '中研院' and substringof('空品微型感測器',Thing/name)&$count=true"
// // let station_url = "https://sta.ci.taiwan.gov.tw/STA_AirQuality_v2/v1.0/Things?$expand=Locations&$select=name,properties&$count=true&$filter=properties/authority%20eq%20%27%E4%B8%AD%E7%A0%94%E9%99%A2%27%20and%20substringof(%27%E7%A9%BA%E5%93%81%E5%BE%AE%E5%9E%8B%E6%84%9F%E6%B8%AC%E5%99%A8%27,name)"

let dataBase = []

// let data_url = "https://sta.ci.taiwan.gov.tw/STA_AirQuality_v2/v1.0/Datastreams?$expand=Thing,Observations&$filter=name%20eq%20%27PM2.5%27%20and%20Thing/properties/authority%20eq%20%27%E4%B8%AD%E7%A0%94%E9%99%A2%27%20and%20substringof(%27%E7%A9%BA%E5%93%81%E5%BE%AE%E5%9E%8B%E6%84%9F%E6%B8%AC%E5%99%A8%27,Thing/name)&$count=true"

// const urlThing = "https://sta.ci.taiwan.gov.tw/STA_AirQuality_v2/v1.0/Things"

// async function getData(url) {
//     const response = await fetch(url)
//     const data = await response.json()
//     // console.log(data)
//     data["@iot.nextLink"] && getData(data["@iot.nextLink"])
//     dataBase = dataBase.concat(data.value.map(item => [item.Thing["@iot.id"], item["@iot.id"]]))
//     if (dataBase.length >= data["@iot.count"]) {
//         console.log(dataBase)
//         var csv = 'ThingID,ObsID\n';
//         dataBase.forEach(function (row) {
//             csv += row.join(',');
//             csv += "\n";
//         });

//         console.log(csv);
//         var hiddenElement = document.createElement('a');
//         hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
//         hiddenElement.target = '_blank';
//         hiddenElement.download = 'MappingData.csv';
//         hiddenElement.click();
//     } else {
//         console.log("on progress - " + (dataBase.length / data["@iot.count"] * 100) + " %")
//     }


// }

// getData(data_url)

async function getData() {
    // https://sta.ci.taiwan.gov.tw/STA_AirQuality_v2/v1.0/Things(1)
    const url = "https://sta.ci.taiwan.gov.tw/STA_AirQuality_v2/v1.0/Things"

    const mappingData = await d3.csv("MappingData.csv")
    // const data = await fetch(url + `(${mappingData[0]["ThingID"]})/Locations`).then(response => response.json())

    mappingData.map(async (item) => {
        const response = await fetch(url + `(${item["ThingID"]})/Locations`)
        const data = await response.json()
        dataBase = [...dataBase, [item["ThingID"], data.value[0].name, data.value[0].location.coordinates[1], data.value[0].location.coordinates[0], item["ObsID"]]]
        console.log(dataBase)
        if (dataBase.length >= 1186) {
            // console.log(dataBase)
            var csv = 'ThingID,Name,Lat,Long,ObsID\n';
            dataBase.forEach(function (row) {
                csv += row.join(',');
                csv += "\n";
            });

            console.log(csv);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'MappingData3.csv';
            hiddenElement.click();
            return
        } else {
            console.log("on progress - " + (dataBase.length / data["@iot.count"] * 100) + " %")
        }
    })
    // console.log(dataBase.length)
}
getData()