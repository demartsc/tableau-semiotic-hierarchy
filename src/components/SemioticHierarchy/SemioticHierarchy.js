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
        edgeData: [],
        nodeData: []
      }  
    }

    // unflatten function was obtained from stack overflow link below and modified slightly for use herein
    // https://stackoverflow.com/questions/18017869/build-tree-array-from-flat-array-in-javascript
    unflatten = ( array, parent, tree ) => {
        tree = typeof tree !== 'undefined' ? tree : [];
        parent = typeof parent !== 'undefined' ? parent : { id: 0 };
    
        var children = _.filter( array, function(child){ return child.parent == parent.child; });
    
        if( !_.isEmpty( children )  ){
            if( parent.child == 'flare' ){
            tree = children;   
            }else{
            parent['children'] = children;
            }
            _.each( children, (child) => { this.unflatten( array, child ); } );
        }  
        else { parent['children'] = []; } 

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
        
        console.log('hierarchy Data in sub component', this.state.nodeData);


        return (
            <div className="semiotic-hierarchy" style={{ padding: 10, height: height*.65, flex: 1, float: 'none', margin: '0 auto' }}>
                <div style={{ height: height, width: width, float: 'none', margin: '0 auto' }}>
                    <ResponsiveNetworkFrame
                        responsiveWidth
                        responsiveHeight
                        edges={this.state.edgeData}
                        nodes={this.state.nodeData}
                        nodeRenderMode={nodeRender}
                        edgeRenderMode={edgeRender}
                        nodeStyle={(d,i) => ({ fill: color[d.depth] || defaultColor , stroke: color[d.depth] || defaultColor })}
                        edgeStyle={(d,i) => ({ fill: defaultColor, stroke: defaultColor, opacity: 0.5 })}
                        edgeWidthAccessor={d => d.valueMetric || 0}
                        hoverAnnotation={hoverAnnotation}
                        networkType={{
                            type: "tree",
                            projection: "vertical",
                            nodePadding: 1,
                            forceManyBody: -15,
                            edgeStrength: 1.5,
                            padding: type === "treemap" ? 3 : type === "circlepack" ? 2 : 0,
                            hierarchySum: d => d.valueMetric || 0
                        }}                
                        nodeIDAccessor={d => d.child}
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
  