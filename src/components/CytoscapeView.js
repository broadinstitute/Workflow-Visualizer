import React, {Component} from 'react';
import cytoscape from 'cytoscape';
import { SSL_OP_SINGLE_DH_USE } from 'constants';


let cyStyle = {
  height: '800px',
  width: '100%',
  background: 'white',
  borderStyle: 'solid'
};

let conf = {
  boxSelectionEnabled: false,
  autounselectify: true,
  zoomingEnabled: true,
  style: [
      {
          selector: 'node',
          style: {
            'shape' : 'circle',
            'background-color': function (ele) {
                const nodeData = ele.data();

                switch (nodeData.status) {
                    case 'SUCCESS':
                        return "#003366";
                    case 'PENDING':
                        return "#00b200";
                    case 'FAILURE':
                        return "#ff0000";
                    case 'RECEIVED':
                        return "#e59400";
                    default:
                        return "#bf00ff";

                }
            },
            'content' : 'data(name)',
            'text-valign': 'bottom',
            'width': 100,
            'height': 100,
            'opacity': '0.90' 
          }
      },
      {
          selector: 'edge',
          style: {
            'curve-style': 'bezier',
            'width': 8,
            'line-color': '#97CAEF',
            'target-arrow-color': '#97CAEF',
            'source-arrow-color': '#97CAEF',
            'target-arrow-shape': 'triangle'
          }
      }
  ],
};

class CytoscapeView extends Component{
  cy = null;

  constructor(props) {
      super(props)
      this.cyelement = React.createRef()
      
  }

  componentDidMount(){
    conf.container = this.cyelement.current
    let cy = cytoscape(conf);

    this.cy = cy;
    cy.json({elements: this.props.elements}); //renders cy based on JSON input
  }

  shouldComponentUpdate(){
    return true
  }

  componentWillReceiveProps(nextProps){
    // this.cy.json(nextProps);
  }

  componentWillUnmount(){
    this.cy.destroy();
  }

  getCy(){
    return this.cy;
  }

  render(){
    return <div style={cyStyle} ref={this.cyelement} />
  }
}

export default CytoscapeView;