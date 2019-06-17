import cytoscape from 'cytoscape'
var React = require('react')

let cyStyle = {
  height: '500px',
  width: '100%',
  background: 'white'

}

let conf = {
  boxSelectionEnabled: false,
  autounselectify: true,
  zoomingEnabled: true,
  style: [
    {
      selector: 'node',
      style: {
        'shape': 'square',
        'background-color': '#FC4445',
        'content': 'data(name)',
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
  ]
}

class CytoscapeV2 extends React.Component {
  constructor (props) {
    super(props)
    this.cyElement = React.createRef()
    this.state = {
      cy: null // should this still be a global variable of cy = null?
    }
  }

  componentDidMount () {
    conf.container = this.cyElement
    this.state.cy = cytoscape(conf)

    this.state.cy.json({ elements: this.props.elements })

    // let cy = cytoscape(conf)
    // this.cy = cy
    // cy.json({elements: this.props.elements})
  }

  shouldComponentUpdate () {
    return false
  }

  componentWillReceiveProps (nextProps) {
    // this.cy.json(nextProps);
  }

  componentWillUnmount () {
    this.state.cy.destroy()
  }

  getCy () {
    return this.state.cy
    // should this just be passed in from parent? If poss that seems more "react"-like
  }

  render () {
    return <div style={cyStyle} ref={this.cyElement}></div>
  }
}

export default CytoscapeV2
