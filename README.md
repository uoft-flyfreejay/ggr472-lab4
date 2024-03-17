# GGR472 Lab 4: Incorporating GIS analysis into web maps using Turf.js
 
This repository contains the starter code required to complete Lab 4. The lab is designed to help you learn how to perform spatial analysis and visualize outputs using the [Turf.js](https://turfjs.org/) and [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/) libraries.


## Repository Contents
- `data/pedcyc_collision_06-21.geojson`: Data file containing point locations of road collisions involving pedestrian and cyclists between 2006 and 2021 in Toronto 
- `instructions/GGR472_Lab4`: Instructions document explaining steps required to complete the lab
- `index.html`: HTML file to render the map
- `style.css`: CSS file for positioning the map interface
- `script.js`: JavaScript file template to be updated to include code that creates and visualizes and hexgrid map based on the collision data
   

## Technologies Used

- **Mapbox GL JS**: For rendering the interactive map and hexagonal grid.
- **Turf.js**: For geospatial analysis, including creating the hexagonal grid and aggregating collision data.
- **JavaScript**, **HTML**, **CSS**: For building and styling the web interface.


## Basic How-To Usage

- Click on each hexgrid to view the total number of collisions that happened in the area
- Toggle the visibility of legend and the hexgrids
- Use the map control movements to navigate through the map

