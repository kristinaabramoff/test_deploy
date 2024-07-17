// Creating the map object with worldCopyJump set to false
let myMap = L.map("map", {
    center: [0, 0], // Center the map at the equator and prime meridian
    zoom: 2.5, // Set an initial zoom level to show the whole world
});

// Adding the street layer and topo layer
let streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

let topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
});

// Store our API endpoint as queryUrl
let earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Function to determine marker color by depth
function chooseColor(depth){
    if (depth < 10) return "#00FF00";
    else if (depth < 30) return "greenyellow";
    else if (depth < 50) return "yellow";
    else if (depth < 70) return "orange";
    else if (depth < 90) return "orangered";
    else return "#FF0000";
}

// Function to create features for earthquakes
function createFeatures(earthquakeData) {
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    // Create a GeoJSON layer with earthquake data
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 2, // Scale with magnitude level
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.6
            });
        }
    });

    // Add the earthquake layer to the map
    earthquakes.addTo(myMap);
    
    // Add the earthquake layer to layer control
    layerControl.addOverlay(earthquakes, "Earthquakes");

    // Create the legend
    createLegend(myMap);
}

// Function to create the legend
function createLegend(map) {
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend'),
            depth = [-10, 10, 30, 50, 70, 90];

        div.innerHTML += "<h4 style='text-align: center'>Depth</h4>";

        // Loop through our depth intervals and generate a label with a colored square for each interval
        for (let i = 0; i < depth.length; i++) {
            div.innerHTML +=
                '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(map);
}

// Function to create features for tectonic plates
function createTectonicPlates(tectonicData) {
    let tectonicPlates = L.geoJSON(tectonicData, {
        style: {
            color: "orange",
            weight: 2
        }
    });

    // Add the tectonic plates layer to the map
    tectonicPlates.addTo(myMap);

    // Add the tectonic plates layer to layer control
    layerControl.addOverlay(tectonicPlates, "Tectonic Plates");
}

// Add layer control to the map
let baseMaps = {
    "Street Map": streetLayer,
    "Topographic Map": topoLayer
};

let layerControl = L.control.layers(baseMaps, {}).addTo(myMap);

// Fetch the earthquake data and create features
d3.json(earthquakeURL).then(function (data) {
    console.log(data);
    createFeatures(data.features);
});

// Fetch the tectonic plate data and create features
d3.json(tectonicPlatesURL).then(function (data) {
    console.log(data);
    createTectonicPlates(data);
});