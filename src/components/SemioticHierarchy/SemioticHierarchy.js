import React from 'react';
import PropTypes from 'prop-types';

//semiotic
import { ResponsiveNetworkFrame } from 'semiotic';

//lodash
import _ from 'lodash';

//d3
import { linkHorizontal, linkVertical } from 'd3-shape';

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
        edgeData: [],
        nodeData: []
      }  
    }

    // unflatten function was obtained from stack overflow link below and modified slightly for use herein
    // https://stackoverflow.com/questions/18017869/build-tree-array-from-flat-array-in-javascript
    unflatten = ( array, parent, tree ) => {
        tree = typeof tree !== 'undefined' ? tree : [];
        parent = typeof parent !== 'undefined' ? parent : { id: 0 };
    
        var children = _.filter( array, function(child){ return child.name == parent.child; });
    
        if( !_.isEmpty( children )  ){
            if( parent.child == 'flare' ) {
                tree = Object.assign({}, parent, {"name": "flare", "children": children});
            }
            else {
                parent['children'] = children;
            }
            _.each( children, (child) => { this.unflatten( array, child ); } );
        }  
        return tree;
    }

    componentDidMount() {
        console.log('in semiotic component mount', this.props.hierarchyData);

        let edgeData = this.unflatten(this.props.hierarchyData,{child: 'flare'});
        console.log('edgeData', edgeData);

        let nodeData = _.uniqBy(this.props.hierarchyData, 'child'); //_.filter(_.uniqBy(this.props.hierarchyData, 'child'), (o) => { return o.child !== 'flare'; });
        console.log('nodeData', nodeData);

        this.setState({
            edgeData: edgeData,
            nodeData: nodeData
        })
    }
  
    render() {
        const {
            classes,
            color,
            defaultColor,
            height,
            width,
            hierarchyType,
            hierarchyData,
            nodeRender,
            edgeRender,
            hoverAnnotation,
            type
        } = this.props;
        
        console.log('hierarchy Data in sub component', JSON.stringify(this.state.edgeData));
        return (
            <div className="semiotic-hierarchy" style={{ padding: 10, height: height*.65, flex: 1, float: 'none', margin: '0 auto' }}>
                <div style={{ height: height*.95, width: width*.95, float: 'none', margin: '0 auto' }}>
                    <ResponsiveNetworkFrame
                        responsiveWidth
                        responsiveHeight
                        edges={this.state.edgeData}
                        nodeIDAccessor={d => d.name}
                        nodeSizeAccessor={3} //{d => d.depth}
                        nodeRenderMode={nodeRender}
                        edgeRenderMode={edgeRender}
                        nodeStyle={(d,i) => ({ fill: color[d.depth] || defaultColor , stroke: color[d.depth] || defaultColor })}
                        edgeStyle={(d,i) => ({ fill: "none", stroke: defaultColor, opacity: 1 })}
                        // edgeType={d => (
                        //     console.log('d', ' M' + d.source.y + ',' + d.source.x
                        //             + ' C' + (d.source.y + d.target.y) / 2 + ',' + d.source.x
                        //             + '  ' + (d.source.y + d.target.y) / 2 + d.target.x
                        //             + '  ' + d.target.y + ',' +  d.target.x ),
                        //     <path 
                        //         d = { ' M' + d.source.y + ',' + d.source.x
                        //             + ' C' + (d.source.y + d.target.y) / 2 + ',' + d.source.x
                        //             + '  ' + (d.source.y + d.target.y) / 2 + d.target.x
                        //             + '  ' + d.target.y + ',' +  d.target.x }
                        //         sytle = {{ stroke: "red", fill: "none" }}
                        //     />
                            // <line 
                            //     x1={d.source.x}
                            //     x2={d.target.x}
                            //     y1={d.source.y}
                            //     y2={d.target.y}
                            //     style={{ stroke: "red" }}
                            // />
                        // )} 

                        edgeWidthAccessor={d => d.valueMetric || 1}
                        hoverAnnotation={hoverAnnotation}
                        networkType={{
                            type: "tree",
                            projection: "vertical",
                            nodePadding: 1,
                            forceManyBody: -15,
                            edgeStrength: 1.5,
                            padding: type === "treemap" ? 3 : type === "circlepack" ? 2 : 0,
                            //hierarchySum: d => d.valueMetric || 0
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
  