/* Vienna Sightseeing Beispiel */

// Stephansdom Objekt
let stephansdom = {
  lat: 48.208493,
  lng: 16.373118,
  title: "Stephansdom",
};

// Karte initialisieren
let map = L.map("map").setView([stephansdom.lat, stephansdom.lng], 12);

// BasemapAT Layer mit Leaflet provider plugin als startLayer Variable
let startLayer = L.tileLayer.provider("BasemapAT.grau");
startLayer.addTo(map);

let themaLayer = {
  sights: L.featureGroup().addTo(map),
  lines: L.featureGroup(),
  stops: L.featureGroup(),
  zones: L.featureGroup(),
  hotels: L.featureGroup(),
}
// Hintergrundlayer
L.control
  .layers({
    "BasemapAT Grau": startLayer,
    "BasemapAT Standard": L.tileLayer.provider("BasemapAT.basemap"),
    "BasemapAT High-DPI": L.tileLayer.provider("BasemapAT.highdpi"),
    "BasemapAT Gelände": L.tileLayer.provider("BasemapAT.terrain"),
    "BasemapAT Oberfläche": L.tileLayer.provider("BasemapAT.surface"),
    "BasemapAT Orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "BasemapAT Beschriftung": L.tileLayer.provider("BasemapAT.overlay"),
    "OpenRailwayMap Zugnetz": L.tileLayer.provider("OpenRailwayMap"),
  }, {
    "Sehenswürdigkeiten": themaLayer.sights,
    "Vienna Sightseeing Linien": themaLayer.lines,
    "Vienna Sightseeing Stops": themaLayer.stops,
    "Vienna Sightseeing Zones": themaLayer.zones,
    "Vienna Sightseeing Hotels": themaLayer.hotels
  })
  .addTo(map);

// Marker Stephansdom
L.marker([stephansdom.lat, stephansdom.lng])
  .addTo(map)
  .bindPopup(stephansdom.title)
  .openPopup();

// Maßstab
L.control
  .scale({
    imperial: false,
  })
  .addTo(map);

L.control
  .fullscreen()
  .addTo(map)

async function loadSights(url) {
  console.log("Loading", url);
  let response = await fetch(url);
  let geojson = await response.json();
  console.log(geojson);
  L.geoJSON(geojson, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {
        icon: L.icon({
          iconUrl: "photo.png",
          iconAnchor: [16, 37],
          popupAnchor: [0, -37]
        })
      });
    },
    onEachFeature: function (feature, layer) {
      console.log(feature);
      console.log(feature.properties.NAME);
      layer.bindPopup(`
      <img src="${feature.properties.THUMBNAIL}" alt="*">
      <h4><a href="${feature.properties.WEITERE_INF}"
      target="wien">${feature.properties.NAME}</h4>
      <address>${feature.properties.ADRESSE}</address>
      `);
    }
  }).addTo(themaLayer.sights);
}
loadSights("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SEHENSWUERDIGOGD&srsName=EPSG:4326&outputFormat=json")

async function loadLines(url) {
  console.log("Loading", url);
  let response = await fetch(url);
  let geojson = await response.json();
  console.log(geojson);
  L.geoJSON(geojson, {
    style: function (feature) {
      console.log(feature.properties.LINE_NAME)
      let lineName = feature.properties.LINE_NAME;
      let lineColor = "black";
      if (lineName == "Red Line") {
        lineColor = "#FF4136";
      } else if (lineName == "Yellow Line") {
        lineColor = "#FFDC00";
      } else if (lineName == "Blue Line") {
        lineColor = "#0074D9";
      } else if (lineName == "Grey Line") {
        lineColor = "#AAAAAA";
      } else if (lineName == "Orange Line") {
        lineColor = "#FF851B";
      } else if (lineName == "Green Line") {
        lineColor = "#2ECC40";
      } else {
        // vielleicht kommen noch andere Linien dazu
      }
      return {
        color: lineColor,
      }
    },
    onEachFeature: function (feature, layer) {
      console.log(feature);
      console.log(feature.properties.LINE_NAME);
      layer.bindPopup(`
      <h4><i class="fa-solid fa-bus"></i> ${feature.properties.LINE_NAME}</h4>
      <p><i class="fa-regular fa-circle-stop"></i> ${feature.properties.FROM_NAME}</p>
      <i class="fa-solid fa-arrow-down"></i>
      <p><i class="fa-regular fa-circle-stop"></i> ${feature.properties.TO_NAME}</p>
      `);
    }
  }).addTo(themaLayer.lines);
}
loadLines("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKLINIEVSLOGD&srsName=EPSG:4326&outputFormat=json")

async function loadStops(url) {
  console.log("Loading", url);
  let response = await fetch(url);
  let geojson = await response.json();
  console.log(geojson);
  L.geoJSON(geojson, {
    onEachFeature: function (feature, layer) {
      console.log(feature);
      console.log(feature.properties.LINE_NAME)
      layer.bindPopup(`
      <h4><i class="fa-solid fa-bus"></i> ${feature.properties.LINE_NAME}</h4>
      <p>${feature.properties.STAT_ID} ${feature.properties.STAT_NAME}</p>
      `);
    }
  }).addTo(themaLayer.stops);
}
loadStops("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKHTSVSLOGD&srsName=EPSG:4326&outputFormat=json")

async function loadZones(url) {
  console.log("Loading", url);
  let response = await fetch(url);
  let geojson = await response.json();
  console.log(geojson);
  L.geoJSON(geojson, {
    style: function (feature) {
      return {
        color: "#F012BE",
        weight: 1,
        opacity: 0.4,
        fillOpacity: 0.1,
      };
    },
    onEachFeature: function (feature, layer) {
      console.log(feature);
      console.log(feature.properties.ADRESSE)
      layer.bindPopup(`
      <h4>Fußgängerzone ${feature.properties.ADRESSE}</h4>
      <p><i class="fa-regular fa-clock"></i> ${feature.properties.ZEITRAUM || "dauerhaft"}</p>
      <p><i class="fa-solid fa-circle-info"></i> ${feature.properties.AUSN_TEXT || "ohne Ausnahme"}</p>
      `);
    }
  }).addTo(themaLayer.zones);
}
loadZones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json")


async function loadHotels(url) {
  console.log("Loading", url);
  let response = await fetch(url);
  let geojson = await response.json();
  console.log(geojson);
  L.geoJSON(geojson, {
    onEachFeature: function (feature, layer) {
      console.log(feature);
      console.log(feature.properties.BETRIEB)
      layer.bindPopup(`
      <h4>${feature.properties.BETRIEB}</h4><b>${feature.properties.BETRIEBSART_TXT}</b>
      <hr></hr>
      <p>Addr.: ${feature.properties.ADRESSE}</p>
      Tel.: <a href="tel: ${feature.properties.KONTAKT_TEL}">${feature.properties.KONTAKT_TEL}</a>
      <br><a href="${feature.properties.KONTAKT_EMAIL}" target="wien"> ${feature.properties.KONTAKT_EMAIL}</a></br>
      <a href="${feature.properties.WEBLINK1}">Homepage</a>
      `);
    }
  }).addTo(themaLayer.hotels);
}
loadHotels("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:UNTERKUNFTOGD&srsName=EPSG:4326&outputFormat=json")

