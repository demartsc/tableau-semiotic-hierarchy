import React from 'react';
import PropTypes from 'prop-types';

//semiotic
import { ResponsiveNetworkFrame } from 'semiotic';

//lodash
import _ from 'lodash';

//material ui
import { withStyles } from '@material-ui/core/styles';
import { stackedArea } from '../../../node_modules/semiotic/lib/svg/lineDrawing';
import Grid from '@material-ui/core/Grid';
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
        nodeData: []
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

            if (this.props.tableauSettings.ConfigParentField !== "name") {
                a['name'] = a[this.props.tableauSettings.ConfigParentField];
                delete a[this.props.tableauSettings.ConfigParentField];    
            }

            if (this.props.tableauSettings.ConfigChildField !== "child") {
                a['child'] = a[this.props.tableauSettings.ConfigChildField];
                delete a[this.props.tableauSettings.ConfigChildField];
            }
        });

        console.log('in semiotic component mount', hierarchyDataPreped, this.props.hierarchyData);
        //find the root node in the data set provided
        //need to handle if there are more than one of these!!
        let root = _.filter(hierarchyDataPreped, (o) => { return o.name == null; });
        console.log('root array', root[0].child, root);

        let edgeData = this.unflatten(hierarchyDataPreped, { child: root[0].child }, root[0].child);
        console.log('edgeData', edgeData);

        let nodeData = _.uniqBy(this.props.hierarchyData, 'child'); 
        console.log('nodeData', nodeData);

        this.setState({
            root: root,
            edgeData: edgeData,
            nodeData: nodeData
        })
    }
  
    render() {
        console.log('semitoic component', this.props);
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
        } = this.props;
        
        console.log('hierarchy Data in sub component', JSON.stringify(this.state.edgeData));

        return (
            <div className="semiotic-hierarchy" style={{ padding: 10, height: height*.65, flex: 1, float: 'none', margin: '0 auto' }}>
                <div style={{ height: height*.95, width: width*.95, float: 'none', margin: '0 auto' }}>
                    <ResponsiveNetworkFrame
                        responsiveWidth
                        responsiveHeight
                        edges={this.state.edgeData}
                        nodeIDAccessor={d => d.child}
                        nodeSizeAccessor={3} //{d => d.depth}
                        nodeRenderMode={nodeRender}
                        edgeRenderMode={edgeRender}
                        edgeType={edgeType}
                        nodeStyle={(d,i) => ({ 
                            fill: nodeFillColor,
                            fillOpacity: nodeFillOpacity,
                            stroke: nodeStrokeColor, 
                            strokeOpacity: nodeStrokeOpacity
                        })}
                        edgeStyle={(d,i) => ({ 
                            fill: edgeFillColor,
                            fillOpacity: edgeFillOpacity,
                            stroke: edgeStrokeColor, 
                            strokeOpacity: edgeStrokeOpacity
                        })}
                        edgeWidthAccessor={d => d.valueMetric || 1}
                        hoverAnnotation={hoverAnnotation}
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
                        /*
                        tooltipContent={d => (
                            <div className="tooltip-content">
                            {d.parent ? <p>{d.parent.data.name}</p> : undefined}
                            <p>{d.data.name}</p>
                            </div>
                        )}
                    */
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
  