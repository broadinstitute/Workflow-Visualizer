import React, { Component } from "react"
import cytoscape from "cytoscape"
import dagre from "cytoscape-dagre"
import klay from "cytoscape-klay"

const cyStyle = {
  height: "800px",
  width: "100%",
  background: "white",
  borderStyle: "solid"
}

const conf = {
  boxSelectionEnabled: false,
  autounselectify: true,
  zoomingEnabled: true,

  style: [
    {
      selector: "node",
      style: {
        shape: "circle",
        "background-color": function(ele) {
          const nodeData = ele.data()
          switch (nodeData.status) {
            case "Done":
              return "#000000"
            case "Running":
              return "#00b200"
            case "Failed":
              return "#ff0000"
            default:
              return "#bf00ff"
          }
        },
        content: "data(name)",
        "text-valign": "bottom",
        width: 100,
        height: 100,
        opacity: 0.95
      }
    },
    {
      selector: "edge",
      style: {
        "curve-style": "bezier",
        width: 8,
        "line-color": "#97CAEF",
        "target-arrow-color": "#97CAEF",
        "source-arrow-color": "#97CAEF",
        "target-arrow-shape": "triangle"
      }
    },
    {
      selector: "node:parent",
      style: {
        label: "data(name)",
        "border-width": 0.5,
        "border-color": "black",
        "background-color": "#A9A9A9",
        "background-opacity": 0.222
      }
    },
    {
      selector: "node[parentType = 'scatterParent']",
      style: {
        shape: "star"
      }
    },
    {
      selector: "node[parentType = 'subworkflow']",
      style: {
        shape: "triangle"
      }
    }
  ],
  layout: {
    name: "dagre",
    rows: 1
  }
}

class CytoscapeView extends Component {
  cy = null

  constructor(props) {
    super(props)
    this.cyelement = React.createRef()
  }

  componentDidMount() {
    cytoscape.use(dagre)
    cytoscape.use(klay)
    conf.container = this.cyelement.current
    const cy1 = cytoscape(conf)

    this.cy = cy1
    this.cy.json({ elements: this.props.elements }) // renders cy based on JSON input
  }

  shouldComponentUpdate() {
    return true
  }

  componentWillReceiveProps(nextProps) {
    // this.cy.json(nextProps);
  }

  componentWillUnmount() {
    this.cy.destroy()
  }

  getCy() {
    return this.cy
  }

  render() {
    return <div style={cyStyle} ref={this.cyelement} />
  }
}

export default CytoscapeView
