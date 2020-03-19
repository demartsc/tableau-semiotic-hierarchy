// Copyright (c) 2020 Chris DeMartini
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React from 'react';
// import PropTypes from 'prop-types';

//semiotic
import { ResponsiveNetworkFrame } from 'semiotic';

//d3
import * as d3Scale from "d3-scale";
import * as d3Array from "d3-array";

//lodash
import _ from 'lodash';

//material ui
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

//utils 
import { 
    log
  } from '../../utils';
  

// Minimum and maximum fallback sizes for markers
const MIN_MARKER_RADIUS = 1;
const MAX_MARKER_RADIUS = 25;

// unflatten function was obtained from stack overflow link below and modified slightly for use herein
// https://stackoverflow.com/questions/18017869/build-tree-array-from-flat-array-in-javascript
function unflatten ( array, parent, seed, tree ) {
    tree = typeof tree !== 'undefined' ? tree : [];
    parent = typeof parent !== 'undefined' ? parent : { id: 0 };

    var children = _.filter( array, function(child){ return child.name === parent.child; });

    if( !_.isEmpty( children )  ){
        if( parent.child === seed ) {
            tree = Object.assign({}, parent, {"name": seed, "children": children});
        }
        else {
            parent['children'] = children;
        }
        _.each( children, (child) => { unflatten( array, child ); } );
    }  
    return tree;
}


// hierarchyDataPreped
// (the original code contained a bug which would result
// in worldDataMissing always being an empty array)
function buildhierarchyDataPreped(hierarchyData, ConfigParentField, ConfigChildField, ConfigColorField, ConfigValueField) {
    const hierarchyDataPreped = _.cloneDeep(hierarchyData);

    //now that we are in here we can rename fields as we need to in order avoid errors
    _.forEach(hierarchyDataPreped, (a) => {
        a['ConfigParentField'] = ConfigParentField;
        a['ConfigChildField'] = ConfigChildField;
        a['ConfigColorField'] = ConfigColorField;
        a['ConfigValueField'] = ConfigValueField;

        if (ConfigParentField !== "name") {
            a['name'] = a[ConfigParentField];
            delete a[ConfigParentField];    
        }

        if (ConfigChildField !== "child") {
            a['child'] = a[ConfigChildField];
            delete a[ConfigChildField];
        }
        
        if (ConfigColorField !== "colorHex") {
            a['colorHex'] = a[ConfigColorField];
            delete a[ConfigColorField];
        }

        if (ConfigValueField !== "valueMetric") {
            a['valueMetric'] = parseFloat(a[ConfigValueField]);
            delete a[ConfigValueField];
        }
    });

    log('in semiotic component mount', hierarchyDataPreped, hierarchyData);

    return hierarchyDataPreped;
}


//find the root node in the data set provided
//need to handle if there are more than one of these!!
function getRoot(hierarchyDataPreped) {
    if (!hierarchyDataPreped) {
        return () => {};
    }

    log('in get root', hierarchyDataPreped);
    let root = _.filter(hierarchyDataPreped, (o) => { return o.name === null; });
    log('root array', root[0].child, root);

    return root;
}

function buildEdgeData (hierarchyDataPreped, root) {
    if (!hierarchyDataPreped) {
        return () => {};
    }
  
    log('edgeData', hierarchyDataPreped);
    let edgeData = unflatten(hierarchyDataPreped, { ...root[0] }, root[0].child);
    log('edgeData', edgeData);

    return edgeData;
}

function buildNodeData (hierarchyDataPreped) {
    if (!hierarchyDataPreped) {
        return () => {};
    }

    let nodeData = _.uniqBy(hierarchyDataPreped, 'child'); 
    log('nodeData', nodeData);

    return nodeData;
}

function buildNodeSizeScale(nodeData, markerMinRadius, markerMaxRadius) {
    if (!nodeData) {
      return () => {};
    }
    function remapper(d) {
      return parseFloat(d["valueMetric"] || 0) || 0;
    }
    return d3Scale.scaleSqrt()
      .domain(d3Array.extent(nodeData, remapper))
      .range([
        markerMinRadius*1 || MIN_MARKER_RADIUS*1,
        markerMaxRadius*1 || MAX_MARKER_RADIUS*1,
      ]);
}

function buildNodeColorScale(nodeData, nodeFillColor) {
    if (!nodeData) {
      return () => {};
    }
    function remapper(d) {
      return parseFloat(d["valueMetric"] || 0) || 0;
    }
    return d3Scale.scaleLinear()
      .domain(d3Array.extent(nodeData, remapper))
      .range(_.split(nodeFillColor,','))
    ;
}

// Create a memoized version of each call which will (hopefully) cache the calls.
// NOTE: passing the whole "props" to these functions will make them sub-optimal as
// the memoize depends on passing an equal object to get the cached result.
let memoized = {
    buildhierarchyDataPreped: _.memoize(buildhierarchyDataPreped),
    getRoot: _.memoize(getRoot),
    buildNodeData: _.memoize(buildNodeData),
    buildEdgeData: _.memoize(buildEdgeData),
    buildNodeSizeScale: _.memoize(buildNodeSizeScale),
    buildNodeColorScale: _.memoize(buildNodeColorScale),
};

class SemioticHierarchy extends React.Component {
    constructor (props) {
      super(props);
      this.state = {
        root: "",
        edgeData: [],
        nodeData: [],
        nodeSizeScale: undefined,
        nodeColorScale: undefined
      }  
    }

  // Previously in componentDidMount, this prepares our data if possible,
  // and returns a dict that corresponds to the old componentDidMount() state changes
    preprocessData() {
        const {
            hierarchyData,
            tableauSettings,
            hoverAnnotation, 
            highlightAnnotation
        } = this.props;

        let hierarchyDataPreped = memoized.buildhierarchyDataPreped(
            hierarchyData, 
            tableauSettings.ConfigParentField, 
            tableauSettings.ConfigChildField, 
            tableauSettings.ConfigColorField, 
            tableauSettings.ConfigValueField
        );

        let root = memoized.getRoot(hierarchyDataPreped);
        let nodeData = memoized.buildNodeData(hierarchyDataPreped);
        let edgeData = memoized.buildEdgeData(hierarchyDataPreped, root);

        let nodeSizeScale = memoized.buildNodeSizeScale(nodeData, tableauSettings.markerMinRadius, tableauSettings.markerMaxRadius);
        let nodeColorScale = memoized.buildNodeColorScale(nodeData, tableauSettings.nodeFillColor);

        // create the hoverAnnotation prop for semiotic
        let hoverAnnotationProp = hoverAnnotation && highlightAnnotation ? 
            [{
                type: 'highlight',
                style : {
                    stroke: tableauSettings.highlightStrokeColor || "#222222",
                    strokeWidth: tableauSettings.highlightStrokeWidth || 2,
                    strokeOpacity: tableauSettings.highlightStrokeOpacity || 1
                }    
            }, { type: "frame-hover" }
            ] : hoverAnnotation ? 
                [{ type: "frame-hover" }]
                : highlightAnnotation ? 
                    [{
                        type: 'highlight',
                        style : {
                            stroke: tableauSettings.highlightStrokeColor || "#222222",
                            strokeWidth: tableauSettings.highlightStrokeWidth || 2,
                            strokeOpacity: tableauSettings.highlightStrokeOpacity || 1
                        }
                    }]
                : false;

        return ({
            hierarchyDataPreped: hierarchyDataPreped, 
            nodeData: nodeData,
            edgeData: edgeData,
            nodeSizeScale: nodeSizeScale, 
            nodeColorScale: nodeColorScale,
            hoverAnnotationProp: hoverAnnotationProp
        });
    }

    getColorHex = d => d.colorHex;
    getValueMetric0 = d => d.valueMetric || 0;
    getValueMetric1 = d => d.valueMetric || 1;

    getNodeSize = d => {
        let { nodeSizeScale } = this.preprocessData();
        return nodeSizeScale(this.getValueMetric0(d));
    }

    getNodeColor = d => {
        let { nodeColorScale } = this.preprocessData();
        return nodeColorScale(this.getValueMetric0(d));
    }


    getTargetNodeColor = d => {
        let { nodeColorScale } = this.preprocessData();
        return nodeColorScale(d.target.valueMetric || 0);
    }

    getTargetColorHex = d => d.target.colorHex;

    getNodeStyle = d => {
        const { tableauSettings, nodeFillColor, nodeStrokeColor, nodeFillOpacity, nodeStrokeOpacity } = this.props;
        return (
            {
                fill: tableauSettings.colorConfig === "solid" ? _.split(this.props.nodeFillColor,',')[0]
                    : tableauSettings.colorConfig === "scale" && tableauSettings.ConfigValueField !== "None" ? this.getNodeColor(d)
                    : tableauSettings.colorConfig === "field" && tableauSettings.ConfigColorField !== "None" ? this.getColorHex(d)
                    : _.split(nodeFillColor,',')[0],
                fillOpacity: nodeFillOpacity,
                stroke: tableauSettings.colorConfig === "solid" ? _.split(this.props.nodeStrokeColor,',')[0]
                    : tableauSettings.colorConfig === "scale" && tableauSettings.ConfigValueField !== "None" ? this.getNodeColor(d)
                    : tableauSettings.colorConfig === "field" && tableauSettings.ConfigColorField !== "None" ? this.getColorHex(d)
                    : _.split(nodeStrokeColor,',')[0],
                strokeOpacity: nodeStrokeOpacity        
            }
        );
    }

    getEdgeStyle = d => {
        const { tableauSettings, edgeFillColor, edgeFillOpacity, nodeStrokeColor, nodeStrokeOpacity } = this.props;
        return (
            { 
                fill: edgeFillColor,
                fillOpacity: edgeFillOpacity,
                stroke: tableauSettings.colorConfig === "solid" ? _.split(nodeStrokeColor,',')[0]
                    : tableauSettings.colorConfig === "scale" && tableauSettings.ConfigValueField !== "None" ? this.getTargetNodeColor(d)
                    : tableauSettings.colorConfig === "field" && tableauSettings.ConfigColorField !== "None" ? this.getTargetColorHex(d)
                    : _.split(nodeStrokeColor,',')[0],
                strokeOpacity: nodeStrokeOpacity*.5
            }
        );
    }

    evaluateNodesToRender = d => {
        const {
            filterRenderedNodes, 
            filterHash
        } = this.props;
        
        if ( Object.keys(filterHash).length > 0 ) {
            return filterHash[d.child] || filterHash[d.parent ? d.parent.child : null] ? true : d.parent ? d.parent.ancestors().find(childD => filterHash[childD.child]) : true
        } else {
            return d.depth > parseInt(filterRenderedNodes || -1, 10);
        }
    }

    // create the custom tooltip for semiotic
    popOver = d => {
        const {tableauSettings} = this.props;
        // log('in tooltip', d);
        if ( d.parent && tableauSettings.ConfigValueField !== "None") {
            return (
                <Paper style={{'padding': '5px'}}>
                    <Typography> {tableauSettings.ConfigParentField}: {d.parent.child} </Typography>
                    <Typography> {tableauSettings.ConfigChildField}: {d.child} </Typography>
                    <Typography> {tableauSettings.ConfigValueField}: {d.valueMetric} </Typography>
                </Paper>
            );
        } else if ( d.parent ) {
            return (
                <Paper style={{'padding': '5px'}}>
                    <Typography> {tableauSettings.ConfigParentField}: {d.parent.child} </Typography>
                    <Typography> {tableauSettings.ConfigChildField}: {d.child} </Typography>
                </Paper>
            );
        } else if (tableauSettings.ConfigValueField !== "None") {
            return (
                <Paper style={{'padding': '5px'}}>
                    <Typography> {tableauSettings.ConfigChildField}: {d.child} </Typography>
                    <Typography> {tableauSettings.ConfigValueField}: {d.valueMetric} </Typography>
                </Paper>
            );
        } else {
            return (
                <Paper style={{'padding': '5px'}}>
                    <Typography> {tableauSettings.ConfigChildField}: {d.child} </Typography>
                </Paper>
            );
        }
    }
    
    componentDidMount() {
        log('component mounted');
    }
  
    render() {
        //log('semitoic component', this.props);
        const {
            height,
            width,
            nodeRender,
            edgeRender,
            edgeType,
            networkType,
            networkProjection, 
            tableauSettings
        } = this.props;
        
        // pull in memoized stuff for use in render function
        let {
            hierarchyDataPreped, 
            edgeData,
            hoverAnnotationProp
        } = this.preprocessData();

        log('hierarchy Data in sub component', [width, height], hierarchyDataPreped, edgeData);

        // console.log('renderProps', nodeSizeScale(0), nodeData[0], (nodeData[0] ? nodeSizeScale(nodeData[0].valueMetric || 0) : null) );
        return (
            <div className="semiotic-hierarchy" style={{ padding: '1%', height: height, width: width, float: 'none', margin: '0 auto' }}>
                <ResponsiveNetworkFrame
                    responsiveWidth
                    responsiveHeight
                    edges={edgeData}
                    nodeIDAccessor={"child"}
                    nodeSizeAccessor={                
                            tableauSettings.nodeSize === "none" ? undefined
                        :   tableauSettings.ConfigType === "Circlepack" ? undefined 
                        :   tableauSettings.ConfigType === "Treemap" ? undefined
                        :   tableauSettings.ConfigValueField === "None" ? undefined
                        :   this.getNodeSize
                    }
                    nodeRenderMode={nodeRender}
                    edgeRenderMode={edgeRender}
                    edgeType={edgeType}
                    nodeStyle={this.getNodeStyle}
                    edgeStyle={this.getEdgeStyle}
                    edgeWidthAccessor={this.getValueMetric1}
                    networkType={{
                        type: networkType,
                        projection: networkProjection,
                        zoom: true,
                        nodePadding: 1,
                        forceManyBody: networkType === "force" ? -250 : -50,
                        edgeStrength: networkType === "force" ? 2 : 1,
                        iterations: networkType === "force" ? 500 : 1,
                        padding: networkType === "treemap" ? 3 : networkType === "circlepack" ? 2 : 0,
                        distanceMax: networkType === "force" ? 500 : 1,
                        hierarchySum: this.getValueMetric0
                    }}                

                    // depending on if the source sheet is filtered we do different stuff here...
                    filterRenderedNodes={this.evaluateNodesToRender}

                    interactionSettings={{ voronoiClipping: (tableauSettings.markerMaxRadius*2 || MAX_MARKER_RADIUS*2) < 25 ? 25 : (tableauSettings.markerMaxRadius*2 || MAX_MARKER_RADIUS*2) }}

                    //annotations layer which allowers for pseudo highlight
                    annotations={this.props.highlightOn}

                    // interactivity
                    hoverAnnotation={hoverAnnotationProp}
                    tooltipContent={this.popOver}
                    customClickBehavior={this.props.clickCallBack}
                    customHoverBehavior={this.props.hoverCallBack}
                />
            </div>
        );
    }
}

// SemioticHierarchy.propTypes = {
//     classes: PropTypes.object.isRequired,
// };
  
export default SemioticHierarchy;
  