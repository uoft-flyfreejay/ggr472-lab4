/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZmx5ZnJlZWpheSIsImEiOiJjbHI3emdhZzUyamtqMmpteXNtaGJxbGVyIn0.SrkrFYfxjCieaBwWWdMb-w'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/mapbox/standard',  // ****ADD MAP STYLE HERE *****
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 12 // starting zoom level
});



/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
//HINT: Create an empty variable
//      Use the fetch method to access the GeoJSON from your online repository
//      Convert the response to JSON format and then store the response in your new variable
let cyclegeojson;

// Fetch GeoJSON from URL and store response
fetch('https://raw.githubusercontent.com/smith-lg/ggr472-lab4/main/data/pedcyc_collision_06-21.geojson')
    .then(response => response.json())
    .then(response => {
        console.log(response); //Check response in console
        cyclegeojson = response; // Store geojson as variable using URL from fetch response
    });




/*--------------------------------------------------------------------
    Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
//HINT: All code to create and view the hexgrid will go inside a map load event handler
//      First create a bounding box around the collision point data then store as a feature collection variable
//      Access and store the bounding box coordinates as an array variable
//      Use bounding box coordinates as argument in the turf hexgrid function

//Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());


map.on('load', () => {

    //bounding box
    let bboxgeojson;
    let bbox = turf.envelope(cyclegeojson);
    bboxgeojson = {
        'type': 'FeatureCollection',
        'features': [bbox]
    };

    //hexgrid
    let bboxcoords = [bbox.geometry.coordinates[0][0][0], bbox.geometry.coordinates[0][0][1], bbox.geometry.coordinates[0][2][0], bbox.geometry.coordinates[0][2][1]];
    let options = {units: 'kilometers'}
    let hexgrid = turf.hexGrid(bboxcoords, 0.5, options);
    
    // aggregate collisions by hexgrid
    let collishex = turf.collect(hexgrid, cyclegeojson, '_id', 'collisions');
    let maxcollis = 0;
    collishex.features.forEach(function(feature) { //ierate over each feature in the collishex feature collection.
        feature.properties.COUNT = feature.properties.collisions.length;
        if (feature.properties.COUNT > maxcollis) { //check if the current hexagon's collision count is bigger than the current max
            maxcollis = feature.properties.COUNT; // if it is, update the max
        }
    });
    console.log(maxcollis);

    map.addSource('hexgrid', {
        'type': 'geojson',
        'data': hexgrid
    });

    // Add a new layer to visualize the hexgrid
    map.addLayer({
        'id': 'hexgrid-layer',
        'type': 'fill',
        'source': 'hexgrid',
        'layout': {},
        'paint': {
            // Use a 'match' expression to check the 'COUNT'. If it is 0, use transparent; otherwise, use 'interpolate'
            'fill-color': [
                'case',
                ['==', ['get', 'COUNT'], 0], 'rgba(0,0,0,0)', // Transparent for 0 count
                // Otherwise, apply a gradient based on the 'COUNT'
                ['interpolate',
                    ['linear'],
                    ['get', 'COUNT'],
                    1, '#fd8d3c',   // Adjust the starting number to 1 for the first non-zero count
                    // Adjust the following stops based on your data
                    maxcollis * 0.25, '#fc4e2a',
                    maxcollis * 0.5, '#e31a1c',
                    maxcollis, '#bd0026' // Color for the maximum count
                ],
            ],
            'fill-opacity': 0.75
        }
    });

    document.getElementById('layercheck').addEventListener('change', function() {
        // Use the checkbox's checked status to determine the layer's visibility
        var visibility = this.checked ? 'visible' : 'none';

        // Use setLayoutProperty to change the layer's visibility
        map.setLayoutProperty('hexgrid-layer', 'visibility', visibility);
    });
});

//Declare array variables for labels and colours
// Array of labels for the legend. Each represents a range of collision counts.
const legendLabels = [
    '1-10',
    '11-25',
    '26-50',
    '51+'
];

// Array of hex colors corresponding to each label/range in the legendLabels array.
const legendColors = [
    '#fd8d3c',
    '#fc4e2a',
    '#e31a1c',
    '#bd0026',
];

// Get the legend container by its ID. Make sure you have a <div id="legend"></div> in your HTML.
const legend = document.getElementById('legend');

// Iterate over each label to create a corresponding legend item.
legendLabels.forEach((label, i) => {
    // Retrieve the corresponding color for this label.
    const color = legendColors[i];

    // Create a new div element for this legend item.
    const item = document.createElement('div');

    // Create a new span for the color key.
    const key = document.createElement('span');
    key.className = 'legend-key';
    key.style.backgroundColor = color; // Set the background color to the corresponding legend color.

    // Create a new span for the label text.
    const value = document.createElement('span');
    value.innerHTML = `${label}`; // Set the innerHTML to the current label.

    // Append the color key and label text to the legend item.
    item.appendChild(key);
    item.appendChild(value);

    // Finally, append the legend item to the legend container.
    legend.appendChild(item);
});

document.getElementById('legendcheck').addEventListener('change', function() {
    document.getElementById('legend').style.display = this.checked ? 'block' : 'none'; // Change display of legend based on check box
});

// POP UP ON CLICK EVENT
map.on('click', 'hexgrid-layer', (e) => {
    if (e.features.length > 0) {
        const feature = e.features[0]; // Get the first feature from the array of returned features

        // Retrieve the COUNT property from the feature
        const count = feature.properties.COUNT;

        // Define the popup content using the count
        const popupContent = `<h3>Total Count: ${count}</h3>`;

        // Declare new popup object and set its options
        new mapboxgl.Popup()
            .setLngLat(e.lngLat) // Set the popup location to the clicked point's longitude and latitude
            .setHTML(popupContent) // Set the HTML content of the popup
            .addTo(map); // Add the popup to the map
    }
});