import React, { Component } from "react"
import dagre from "cytoscape-dagre"
import klay from "cytoscape-klay"
import cytoscape from "cytoscape"

import Sidebar from "./Sidebar"
import "../MainGraphView.css"

import * as api from "../utils/api"
import { returnGraphJson } from "../utils/createCytoscapeGraphJSON"
import * as dotFiles from "../utils/dotFiles"
import { readDotString } from "../utils/dotStringParsingFunctions"
import { returnDataDictionary } from "../utils/metadataFunctions"
import * as layoutOptions from "../utils/layoutOptions"
import CytoscapeComponent from "react-cytoscapejs"

import GraphManipulator from "../utils/GraphManipulator"

let workflowIdMetadata
let graphManipulatorObj

const currentDotFile = dotFiles.purple_neighbors

class MainGraphView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentSelectedNodeData: null,
      metadata: null,
      isDetailedView: true,
      layout: "dagre",
      enforceFit: true,
      enforceLayout: true,
      enableAnimation: true,
      displayLayers: "smart",
      displayShards: "smart"
    }

    this.updateSelectedNodeData = this.updateSelectedNodeData.bind(this)
    this.changeLayout = this.changeLayout.bind(this)
    this.updateUIWithMetadata = this.updateUIWithMetadata.bind(this)
  }

  // stressTest = () => {
  //   for (let i = 0; i < 3000; i++) {
  //     const node1 = `n${i}`
  //     const node2 = `n${i}${i}`

  //     this.cy.add([
  //       { group: "nodes", data: { id: node1 } },
  //       { group: "nodes", data: { id: node2 } },
  //       { group: "edges", data: { id: i, source: node1, target: node2 } }
  //     ])
  //   }
  // }

  forceFit = () => {
    this.cy.fit()
  }

  forceLayout = () => {
    this.changeLayout(this.state.layout)
  }

  toggleAnimation = () => {
    this.setState(prevState => ({
      enableAnimation: !prevState.enableAnimation
    }))
    console.log("animation!!")
  }

  toggleEnforceLayout = () => {
    this.setState(prevState => ({
      enforceLayout: !prevState.enforceLayout
    }))
    // if enforceLayout state is currently false, then by activating this function, we want enforce layout enabled.
    // So we should call enforce layout right now
    if (!this.state.enforceLayout) {
      this.forceLayout()
    }
  }

  toggleEnforceFit = () => {
    this.setState(prevState => ({
      enforceFit: !prevState.enforceFit
    }))

    // if enforceFit state is currently false, then we are about to change it to true by running this function
    // So we should call forceFit() right now
    if (!this.state.enforceFit) {
      this.forceFit()
    }
  }

  enforceLayoutAndFit = () => {
    if (this.state.enforceLayout) {
      this.changeLayout(this.state.layout, true)
    } else if (this.state.enforceFit) {
      this.forceFit()
    }
  }

  toggleViewType = () => {
    // logic is inverted because this is the state prior to changing
    // so if state isBasicView = false, then, since in the immediate future it will be true,
    // cytoscape model should display basicview

    if (this.state.isDetailedView) {
      graphManipulatorObj.createBasicView()
    } else {
      graphManipulatorObj.createDetailedView()
    }

    this.enforceLayoutAndFit()

    this.setState(prevState => ({
      isDetailedView: !prevState.isDetailedView
    }))
  }

  updateSelectedNodeData(nodeData) {
    const nodeDataString = JSON.stringify(nodeData)
    this.setState({
      currentSelectedNodeData: nodeDataString
    })

    // Update UI whenever we click on a node
    this.updateUIWithMetadata()
  }

  updateUIWithMetadata() {
    api.fetchMetadata(workflowIdMetadata).then(jsonMetadata => {
      this.setState({
        metadata: jsonMetadata
      })

      graphManipulatorObj.updateNodes(jsonMetadata)
    })
  }

  expandSubworkflow = subworkflowNodeId => {
    const subworkflowNodeObj = this.cy.getElementById(subworkflowNodeId)

    api.fetchMetadata(workflowIdMetadata).then(jsonMetadata => {
      this.setState({
        metadata: jsonMetadata
      })

      graphManipulatorObj.expandSubworkflow(subworkflowNodeId)
      graphManipulatorObj.updateNodes(jsonMetadata) // this call is technically redundant since this function is called in updateSelectedNodeData but without this extra call there is delay when it comes to update UI

      this.updateSelectedNodeData(subworkflowNodeObj.data())
      this.enforceLayoutAndFit()
    })
  }

  scatter = scatterParentNodeId => {
    api.fetchMetadata(workflowIdMetadata).then(jsonMetadata => {
      this.setState({
        metadata: jsonMetadata
      })

      graphManipulatorObj.scatter(scatterParentNodeId, jsonMetadata)

      const scatterParent = this.cy.getElementById(scatterParentNodeId)
      this.updateSelectedNodeData(scatterParent.data())
      this.enforceLayoutAndFit()
    })
  }

  collapseParent = selectedParentNodeId => {
    graphManipulatorObj.collapseParent(selectedParentNodeId)

    const parentNode = this.cy.getElementById(selectedParentNodeId)
    this.updateSelectedNodeData(parentNode.data())
  }

  changeDisplayedShards = selectionOption => {
    this.setState({
      displayShards: selectionOption
    })

    graphManipulatorObj.displayShards(selectionOption, this.state.metadata)
  }

  changeDisplayedLayers = layerOption => {
    api.fetchMetadata(workflowIdMetadata).then(jsonMetadata => {
      this.setState({
        metadata: jsonMetadata,
        displayLayers: layerOption
      })

      if (layerOption === "smart") {
        // lead to smart workflow
      } else {
        let number = 0
        if (layerOption === "all") {
          number = -1
        } else if (layerOption === "zero") {
          number = 0
        } else if (layerOption === "one") {
          number = 1
        } else if (layerOption === "two") {
          number = 2
        } else if (layerOption === "three") {
          number = 3
        } else if (layerOption === "four") {
          number = 4
        } else if (layerOption === "five") {
          number = 5
        }

        graphManipulatorObj.expandLayers(number, jsonMetadata)
        this.enforceLayoutAndFit()
      }
    })
  }

  changeLayout(layoutType, isEnforceCall = false) {
    this.setState({
      layout: layoutType
    })

    let options = {
      name: layoutType,
      fit: false,
      animate: true,
      animationDuration: 500,
      animationEasing: undefined,
      refresh: 20,
      animationThreshold: 250
    }
    if (layoutType === "breadthfirst") {
      options = layoutOptions.breadthfirstOptions
    } else if (layoutType === "grid") {
      options = layoutOptions.gridOptions
    } else if (layoutType === "random") {
      options = layoutOptions.randomOptions
    } else if (layoutType === "circle") {
      options = layoutOptions.cirlceOptions
    } else if (layoutType === "dagre") {
      options = layoutOptions.dagreOptions
    } else if (layoutType === "klay") {
      options = layoutOptions.klayOptions
    }

    // should layout be animated
    if (isEnforceCall || !this.state.enableAnimation) {
      options.animate = false
    } else {
      options.animate = true
    }

    // should layout fit
    if (this.state.enforceFit) {
      options.fit = true
    } else {
      options.fit = false
    }

    this.cy.layout(options).run()
  }

  componentDidMount() {
    graphManipulatorObj = new GraphManipulator(this.cy)

    graphManipulatorObj.distributeParentEdges()

    cytoscape.use(dagre)
    cytoscape.use(klay)

    this.cy.on("tapend", "node", evt => {
      const node = evt.target
      const nodeData = node.data()
      this.updateSelectedNodeData(nodeData)
    })

    this.cy.on("cxttapend", "node[parentType = 'scatterParent']", evt => {
      const node = evt.target
      const nodeId = node.id()
      if (node.data("type") !== "parent") {
        this.scatter(nodeId)
      } else {
        this.collapseParent(nodeId)
      }
    })

    this.cy.on("cxttapend", 'node[parentType = "subworkflow"]', evt => {
      const node = evt.target
      const nodeId = node.id()
      if (node.data("type") !== "parent") {
        this.expandSubworkflow(nodeId)
      } else {
        this.collapseParent(nodeId)
      }
    })

    this.forceLayout()
  }

  updateToLatestWorkflowId = () => {
    api
      .queryWorkflows()
      .then(response => {
        const id = response.results[0].id
        workflowIdMetadata = id
      })
      .catch(err => {
        console.warn(err)
        workflowIdMetadata = null
      })
  }

  render() {
    const cytoscapeGraphStyle = [
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
    ]

    const style = { width: "100%", height: "800px", borderStyle: "solid" }
    const graphAndIdToNodeMapObj = readDotString(currentDotFile)
    const elementsObj = returnGraphJson(graphAndIdToNodeMapObj)

    this.updateToLatestWorkflowId()

    return (
      <div className="flexbox-container">
        <CytoscapeComponent
          stylesheet={cytoscapeGraphStyle}
          elements={CytoscapeComponent.normalizeElements(elementsObj)}
          style={style}
          cy={cy => {
            this.cy = cy
          }}
        />

        <Sidebar
          currentSelectedNodeData={this.state.currentSelectedNodeData}
          changeLayout={this.changeLayout}
          layout={this.state.layout}
          changeDisplayedLayers={this.changeDisplayedLayers}
          displayLayers={this.state.displayLayers}
          changeDisplayedShards={this.changeDisplayedShards}
          displayShards={this.state.displayShards}
          metadata={this.state.metadata}
          fitFnc={this.forceFit}
          forceLayoutFnc={this.forceLayout}
          toggleViewFnc={this.toggleViewType}
          viewBoolean={this.state.isDetailedView}
          toggleEnforceFitFnc={this.toggleEnforceFit}
          enforceFitBoolean={this.state.enforceFit}
          toggleEnforceLayoutFnc={this.toggleEnforceLayout}
          enforceLayoutBoolean={this.state.enforceLayout}
          toggleAnimation={this.toggleAnimation}
          enableAnimation={this.state.enableAnimation}
        />
      </div>
    )
  }
}

export default MainGraphView
