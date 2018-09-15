import React from 'react';
import PropTypes from 'prop-types';

//semiotic
import { ResponsiveNetworkFrame } from 'semiotic';

//d3
import * as d3Scale from "d3-scale";
import * as d3Array from "d3-array";
import * as d3Interpolate from "d3-interpolate"

//lodash
import _ from 'lodash';

//material ui
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

const styles = {
  root: {
    flexGrow: 1,
  },
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

    // unflatten function was obtained from stack overflow link below and modified slightly for use herein
    // https://stackoverflow.com/questions/18017869/build-tree-array-from-flat-array-in-javascript
    unflatten = ( array, parent, seed, tree ) => {
        tree = typeof tree !== 'undefined' ? tree : [];
        parent = typeof parent !== 'undefined' ? parent : { id: 0 };
    
        var children = _.filter( array, function(child){ return child.name == parent.child; });
    
        if( !_.isEmpty( children )  ){
            if( parent.child == seed ) {
                tree = Object.assign({}, parent, {"name": seed, "children": children});
            }
            else {
                parent['children'] = children;
            }
            _.each( children, (child) => { this.unflatten( array, child ); } );
        }  
        return tree;
    }

    componentDidMount() {
        const hierarchyDataPreped = _.cloneDeep(this.props.hierarchyData);

        //now that we are in here we can rename fields as we need to in order avoid errors
        _.forEach(hierarchyDataPreped, (a) => {
            a['ConfigParentField'] = this.props.tableauSettings.ConfigParentField;
            a['ConfigChildField'] = this.props.tableauSettings.ConfigChildField;
            a['ConfigColorField'] = this.props.tableauSettings.ConfigColorField;
            a['ConfigValueField'] = this.props.tableauSettings.ConfigValueField;

            if (this.props.tableauSettings.ConfigParentField !== "name") {
                a['name'] = a[this.props.tableauSettings.ConfigParentField];
                delete a[this.props.tableauSettings.ConfigParentField];    
            }

            if (this.props.tableauSettings.ConfigChildField !== "child") {
                a['child'] = a[this.props.tableauSettings.ConfigChildField];
                delete a[this.props.tableauSettings.ConfigChildField];
            }
            
            if (this.props.tableauSettings.ConfigColorField !== "colorHex") {
                a['colorHex'] = a[this.props.tableauSettings.ConfigColorField];
                delete a[this.props.tableauSettings.ConfigColorField];
            }

            if (this.props.tableauSettings.ConfigValueField !== "valueMetric") {
                a['valueMetric'] = parseFloat(a[this.props.tableauSettings.ConfigValueField]);
                delete a[this.props.tableauSettings.ConfigValueField];
            }
        });

        console.log('in semiotic component mount', hierarchyDataPreped, this.props.hierarchyData);
        //find the root node in the data set provided
        //need to handle if there are more than one of these!!
        let root = _.filter(hierarchyDataPreped, (o) => { return o.name == null; });
        console.log('root array', root[0].child, root);

        let edgeData = this.unflatten(hierarchyDataPreped, { ...root[0] }, root[0].child);
        console.log('edgeData', edgeData);

        let nodeData = _.uniqBy(hierarchyDataPreped, 'child'); 
        console.log('nodeData', nodeData);

        const nodeSizeScale = d3Scale.scaleLinear()
            .domain(d3Array.extent(nodeData, (d) => {if (d.valueMetric) { return parseFloat(d.valueMetric);}}))
            .range([this.props.tableauSettings.markerMinRadius*1 || 1, this.props.tableauSettings.markerMaxRadius*1 || 25])
        ;

        // not using this yet, but we will need it to enable value based colors
        const nodeColorScale = d3Scale.scaleLinear()
            .domain(d3Array.extent(nodeData, (d) => {if (d[this.props.tableauSettings.ConfigValueField]) { return parseFloat(d[this.props.tableauSettings.ConfigValueField]);}}))
            .interpolate(d3Interpolate.interpolateHcl)
            .range(_.split(this.props.nodeFillColor,','))
          ;

        console.log('nodeSize'
            , this.props.tableauSettings.ConfigValueField
            , _.split(this.props.nodeFillColor,',')[0]
            , this.props.nodeFillColor
            , this.props.tableauSettings.nodeColor
            , d3Array.extent(nodeData, (d) => {if (d[this.props.tableauSettings.ConfigValueField]) { return parseFloat(d[this.props.tableauSettings.ConfigValueField]);}})
            , nodeColorScale(3555)
        );
    
        this.setState({
            root: root,
            edgeData: edgeData,
            nodeData: nodeData, 
            nodeSizeScale: nodeSizeScale,
            nodeColorScale: nodeColorScale
        })
    }
  
    render() {
        //console.log('semitoic component', this.props);
        const {
            height,
            width,
            nodeRender,
            nodeFillColor, 
            nodeFillOpacity, 
            nodeStrokeColor, 
            nodeStrokeOpacity,
            edgeRender,
            edgeType,
            edgeFillColor, 
            edgeFillOpacity, 
            edgeStrokeColor, 
            edgeStrokeOpacity,
            hoverAnnotation,
            networkType,
            networkProjection, 
            tableauSettings,
        } = this.props;
        
        //console.log('hierarchy Data in sub component', JSON.stringify(this.state.edgeData));

        // create the custom tooltip for semiotic
        const popOver = (d) => {
            // console.log('in tooltip', d);
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

        // check color props and then submit the correct props to Semiotic
        if (this.props.tableauSettings.ConfigColorField === "None") {

        } else {
            // let colorNodeProps = 
            // { 
            //     fill:  d.colorHex,
            //     fillOpacity: nodeFillOpacity,
            //     stroke: d.colorHex, 
            //     strokeOpacity: nodeStrokeOpacity
            // }
            // edgeStyle={(d,i) => ({ 
            //     fill: edgeFillColor,
            //     fillOpacity: edgeFillOpacity,
            //     stroke: d.target.colorHex || "#BDBDBD", 
            //     strokeOpacity: edgeStrokeOpacity
            // })}
        }

        return (
            <div className="semiotic-hierarchy" style={{ padding: 10, height: height*.65, flex: 1, float: 'none', margin: '0 auto' }}>
                <div style={{ height: height*.95, width: width*.95, float: 'none', margin: '0 auto' }}>
                    <ResponsiveNetworkFrame
                        responsiveWidth
                        responsiveHeight
                        edges={this.state.edgeData}
                        nodeIDAccessor={d => d.child}
                        nodeSizeAccessor={
                                tableauSettings.nodeSize === "none" ? undefined
                            :   tableauSettings.ConfigType === "Circlepack" ? undefined 
                            :   tableauSettings.ConfigType === "Treemap" ? undefined
                            :   tableauSettings.ConfigValueField === "None" ? undefined
                            :   d => this.state.nodeSizeScale(d.valueMetric)
                        } // this breaks the treemap and circlepack
                        nodeRenderMode={nodeRender}
                        edgeRenderMode={edgeRender}
                        edgeType={edgeType}
                        nodeStyle={(d,i) => ({ 
                            fill: tableauSettings.colorConfig === "solid" ? _.split(this.props.nodeFillColor,',')[0]
                                : tableauSettings.colorConfig === "scale" && tableauSettings.ConfigValueField !== "None" ? this.state.nodeColorScale(d.valueMetric || 0)
                                : tableauSettings.colorConfig === "field" && tableauSettings.ConfigColorField !== "None" ? d.colorHex 
                                : _.split(this.props.nodeFillColor,',')[0],
                            fillOpacity: nodeFillOpacity,
                            stroke: tableauSettings.colorConfig === "solid" ? _.split(this.props.strokeFillColor,',')[0]
                                : tableauSettings.colorConfig === "scale" && tableauSettings.ConfigValueField !== "None" ? this.state.nodeColorScale(d.valueMetric || 0)
                                : tableauSettings.colorConfig === "field" && tableauSettings.ConfigColorField !== "None" ? d.colorHex 
                                : _.split(this.props.strokeFillColor,',')[0],
                            strokeOpacity: nodeStrokeOpacity
                        })}
                        edgeStyle={(d,i) => ({ 
                            fill: edgeFillColor,
                            fillOpacity: edgeFillOpacity,
                            stroke: d.target.colorHex || "#BDBDBD", 
                            strokeOpacity: edgeStrokeOpacity
                        })}
                        edgeWidthAccessor={d => d.valueMetric || 1}
                        networkType={{
                            type: networkType,
                            projection: networkProjection,
                            nodePadding: 1,
                            forceManyBody: networkType === "force" ? -250 : -50,
                            edgeStrength: networkType === "force" ? 2 : 1,
                            iterations: networkType === "force" ? 500 : 1,
                            padding: networkType === "treemap" ? 3 : networkType === "circlepack" ? 2 : 0,
                            distanceMax: networkType === "force" ? 500 : 1,
                            hierarchySum: d => d.valueMetric || 0
                        }}                

                        // interactivity
                        hoverAnnotation={this.props.hoverAnnotation}
                        tooltipContent={d => popOver(d)}
                    />
                </div>
            </div>
        );
    }
}

// SemioticHierarchy.propTypes = {
//     classes: PropTypes.object.isRequired,
// };
  
export default SemioticHierarchy;
  