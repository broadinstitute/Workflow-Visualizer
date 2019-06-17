import React, {Component} from 'react';
import cytoscape from 'cytoscape';

let cyStyle = {
  height: '800px',
  width: '100%',
  background: 'red'
};

let conf = {
  boxSelectionEnabled: false,
  autounselectify: true,
  zoomingEnabled: true,
  style: [
      {
          selector: 'node',
          style: {
            'shape' : 'square',
            'background-color' :'#FC4445',
            'content' : 'data(name)',
            'text-valign': 'center',
            'width': 100,
            'height': 100

              // 'content': 'data(data.task)',
              // 'text-opacity': 0.5,
              // 'text-valign': 'center',
              // 'text-halign': 'right',
              // 'background-color': function (ele) {
              //     const nodeData = ele.data();

              //     switch (nodeData.data.status) {
              //         case 'SUCCESS':
              //             return "#00b200";
              //         case 'PENDING':
              //             return "#737373";
              //         case 'FAILURE':
              //             return "#b20000";
              //         case 'RECEIVED':
              //             return "#e59400";
              //         default:
              //             return "#9366b4";

              //     }
              // }
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

class Cytoscape extends Component{
  cy = null;

  componentDidMount(){
    conf.container = this.refs.cyelement;
    let cy = cytoscape(conf);

    this.cy = cy;
    cy.json({elements: this.props.elements}); //renders cy based on JSON input
  }

  shouldComponentUpdate(){
    return false;
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
    return <div style={cyStyle} ref="cyelement" />
  }
}

export default Cytoscape;
