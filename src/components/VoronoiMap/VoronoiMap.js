'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import * as turf from '@turf/turf';
import _ from 'lodash';
import mapboxgl from 'mapbox-gl'
//import '../styles/mapox.css'; // linked in public/index.html for now

//demo token from mapbox site.
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVtYXJ0c2MiLCJhIjoiY2o4bjd4aG40MTZudTJ3bXo5aDU3dmFpMSJ9.O72JlexJ3-xy030RqsoSgA';


class VoronoiMap extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      value: ''
    };

    this.mapObject = undefined;
  }

  buildGeoJSON() {
    console.log('buildGeoJSON',this.props.data,this.mapObject);

    const data = this.props.data;
    let geoJSON = [];

    data.map(datum => (
        //console.log(datum)
        // console.log([datum.longitude,datum.latitude]),
        //console.log(turf.point([datum.longitude,datum.latitude],{id: datum.dimension})),
        geoJSON.push(turf.point([datum.longitude,datum.latitude],{id: datum.dimension, name: datum.dimension, value: parseFloat(datum.colorMetric), one: 1}))
    ))

    //build json objects for mapbox using turf
    const collection = turf.featureCollection(geoJSON);
    console.log('points', collection);

    // bbox is not returning the full thing and is in string, I need flot for grid
    const bbox = turf.bbox(collection);
    const bbox1 = [-125, 24, -66, 50];
    console.log('bbox', bbox, bbox1);
    const options = {
      bbox: bbox1
    };
    const voronoiPolygons = turf.voronoi(collection, options);
    console.log('voronoi', voronoiPolygons);

    // starting playing around with grid
    // change turf.hexGrid to turf.squareGrid or turf.triangleGrid
    let hexGridPolygons = turf.hexGrid(bbox1, 50, {units: 'miles'});
    //console.log('hexgrid before', hexGridPolygons.features);

    //add unique id to each polygon we have
    hexGridPolygons.features.forEach((currentFeature,index) => {
      currentFeature.id = index;
      currentFeature.properties = Object.assign({}, {'id': index});
    })
    console.log('hexGridPolygons', hexGridPolygons.features);

    //tag all points with polyID, not working at the moment all are 818
    const hexGridJoin = turf.tag(collection, hexGridPolygons, 'id', 'polyID');
    console.log('hexGridJoined',hexGridJoin);

    // aggregate points to polygons, ceate a dictionary for join back to polys
    // left off here just trying to group by sub features of the polygon to
    // be used after spatial join.
    const hexGridObjects = _(hexGridJoin.features)
      .map('properties')
      .groupBy('polyID')
      .map((grid, id) => ({
        id: parseInt(id),
        gridPoints: grid,
        gridValueSum: _.sumBy(grid, 'value'),
        gridValueMean: _.meanBy(grid, 'value'),
        gridMatchCount: _.sumBy(grid, 'one')
      }))
      .value()
    console.log('hexGridObjects',hexGridObjects);

    // now join that aggregated data back to the hex grid and keep one the ones that match
    // const hexGridFinal = Object.assign({}, hexGridPolygons.features, hexGridObjects);
    // console.log('hexGridFinal', hexGridFinal);
    hexGridPolygons.features.forEach((currentFeature,index) => {
      let temp = _.find(hexGridObjects, ['id',index]);
      currentFeature.properties = Object.assign({}, currentFeature.properties, temp);
    })
    console.log('hexGridPolygons2', hexGridPolygons);

    const hexGridPolygonsFinal = JSON.parse('{"type":"FeatureCollection","features":' + JSON.stringify(_.filter(hexGridPolygons.features, function(item){
      return item.properties.gridMatchCount > 0;
    })) + '}');
    console.log(hexGridPolygonsFinal);

    // add layers to the map visualization
    // layers are displayed in the z-order they are coded
    this.mapObject.addLayer({
      'id': 'hexgrid',
      'type': 'fill',
      'source': {
          'type': 'geojson',
          'data': hexGridPolygonsFinal
        },
      'layout': {},
      'paint': {
          'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'gridValueSum'],
              0, '#F2F12D',
              .5, '#EED322',
              1, '#E6B71E',
              1.5, '#DA9C20',
              2, '#CA8323',
              2.5, '#B86B25',
              3, '#A25626',
              3.5, '#8B4225'
          ],
          'fill-opacity': 0.6,
          'fill-outline-color': '#000'
      }
    });

    this.mapObject.addLayer({
      "id": "points",
      'source': {
          'type': 'geojson',
          'data': collection
        },
      "type": "circle",
      "paint": {
          "circle-radius": 2,
          "circle-color": "#ddd",
          "circle-opacity": .5
      }
    });

    this.mapObject.addLayer({
      'id': 'voronoi',
      'type': 'fill',
      'source': {
          'type': 'geojson',
          'data': voronoiPolygons
        },
      'layout': {},
      'paint': {
          'fill-color': '#CCC',
          'fill-opacity': 0.3,
          'fill-outline-color': '#444'
      }
    });

  }

  componentDidMount() {
    this.mapObject = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [-113.7208401, 36.2108363],
      zoom: 3
    });

    // this gets the map object
    console.log('map',this.mapObject);

    //run only after map is loaded completely
    this.mapObject.on('load', () => {
      //build up geoJSON
      this.buildGeoJSON();
     });
  }

  // componentDidUpdate() {
  //   //build up geoJSON
  //   this.buildGeoJSON();
  // }

  componentWillUnmount() {
    this.mapObject.remove();
  }

  render() {
    const { classes, data, width, height } = this.props;
    const style = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '100%'
    };
    //this.buildGeoJSON(data, this.map);

    return (
      <div
        style={style}
        ref={el => this.mapContainer = el}
        className="absolute top right left bottom"
      />
    );
  }
}

VoronoiMap.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default VoronoiMap;
