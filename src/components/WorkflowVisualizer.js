import React, { Component } from "react"
import dagre from "cytoscape-dagre"
import klay from "cytoscape-klay"
import cytoscape from "cytoscape"

import Sidebar from "./Sidebar"
import "./WorkflowVisualizer.css"

import * as api from "../utils/api"
import { returnGraphJson } from "../utils/createCytoscapeGraphJSON"
import * as dotFiles from "../utils/dotFiles"
import { readDotString } from "../utils/dotStringParsingFunctions"
import * as layoutOptions from "../utils/layoutOptions"
import CytoscapeComponent from "react-cytoscapejs"

import GraphManipulator from "../utils/GraphManipulator"
import { Box } from "@material-ui/core"
import PropTypes from "prop-types"

let graphManipulatorObj

const currentDotFile = dotFiles.nested_subworkflows_4
/**
 * Component that represents the actual directed graph of the workflow as well as a sidebar to control the graph
 *
 * The component can slowly handle a workflow with 6000 nodes and 3000 edges. It can probably handle more, but it won't be very
 * fast and might crash. However, that should be big enough for most workflows.
 */
class GraphView extends Component {
  /**
   * Constructor will set a variety of states related to the sidebar except the state cytoStyle
   * which is the styling for the graph nodes and edges. This styling can be dynamically changed
   * in toggleColoring. Hence, the need for it be stored as a state.
   * @param {*} props
   */
  constructor(props) {
    super(props)

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
                return "gray"
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
          "border-color": function(ele) {
            const nodeData = ele.data()
            switch (
              nodeData.parentType === "scatterParent" ||
                nodeData.parentType === "subworkflow"
            ) {
              case true:
                return "#468499"
              default:
                return "black"
            }
          },
          "background-opacity": function(ele) {
            const nodeData = ele.data()
            switch (
              nodeData.parentType === "scatterParent" ||
                nodeData.parentType === "subworkflow"
            ) {
              case true:
                return 0.222
              default:
                return 1
            }
          },
          "background-color": function(ele) {
            const nodeData = ele.data()
            switch (
              nodeData.parentType === "scatterParent" ||
                nodeData.parentType === "subworkflow"
            ) {
              case true:
                return "#A9A9A9"
              default:
                return "#ffffff"
            }
          }
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

    this.state = {
      currentSelectedNodeData: null,
      metadata: null,
      isDetailedView: true,
      isColorBlind: false,
      enforceFit: true,
      enforceLayout: true,
      enableAnimation: true,
      displayLayers: "zero",
      displayShards: "all",
      layout: "klay",
      cytoStyle: cytoscapeGraphStyle
    }

    this.updateSelectedNodeData = this.updateSelectedNodeData.bind(this)
    this.changeLayout = this.changeLayout.bind(this)
    this.updateUIWithMetadata = this.updateUIWithMetadata.bind(this)
  }

  /**
   * Refits the entire graph onto the viewport.
   */
  forceFit = () => {
    this.cy.fit()
  }

  /**
   * Using the current layout state of the component, the function will force the nodes
   * into that layout.
   */
  forceLayout = () => {
    this.changeLayout(this.state.layout)
  }

  /**
   * Changes the boolean animation state.
   */
  toggleAnimation = () => {
    this.setState(prevState => ({
      enableAnimation: !prevState.enableAnimation
    }))
  }

  /**
   * Changes the boolean enforceLayout state and will force graph into layout if box is checked.
   */
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

  /**
   * Changes the boolean enforceFit state and will force graph to fit viewport if the box is checked.
   */
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

  /**
   * The function has two variables normalStyle and colorBlindStyle that
   *  describe the coloring scheme of the nodes in the graph. Depending on whether or
   * not isColorBlind state is currently true or false, one of the two styles will be inserted
   * into the state cytoStyle.
   */
  toggleColoring = () => {
    const normalStyle = {
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
              return "gray"
          }
        },
        content: "data(name)",
        "text-valign": "bottom",
        width: 100,
        height: 100,
        opacity: 0.95
      }
    }

    const colorBlindStyle = {
      selector: "node",
      style: {
        shape: "circle",
        "background-color": function(ele) {
          const nodeData = ele.data()
          switch (nodeData.status) {
            case "Done":
              return "#000000"
            case "Running":
              return "#009E73"
            case "Failed":
              return "#CC79A7"
            default:
              return "#F0E442"
          }
        },
        content: "data(name)",
        "text-valign": "bottom",
        width: 100,
        height: 100,
        opacity: 0.95
      }
    }

    const newStyle = this.state.cytoStyle.slice()
    let newBool
    if (!this.state.isColorBlind) {
      newStyle[0] = colorBlindStyle
      newBool = true
    } else {
      newStyle[0] = normalStyle
      newBool = false
    }

    this.setState({
      cytoStyle: newStyle,
      isColorBlind: newBool
    })
  }

  /**
   * Checks the state of enforceLayout and enforceFit and determines whether or not to refit and re-layout
   * the graph.
   * This function is called during any modification of the nodes visible in the graph which is either a
   * toggleViewType(), scatter(), expandSubworkflow(), or collapseParent().
   */
  enforceLayoutAndFit = () => {
    if (this.state.enforceLayout) {
      this.changeLayout(this.state.layout, true)
    } else if (this.state.enforceFit) {
      this.forceFit()
    }
  }

  /**
   *  Changes the state of isDetailedView and triggers a change in the
   *  the types of nodes displayed on the directed graph. Basic view
   *  will remove all nodes that are not calls on the wdl file.
   *
   *  Function is passed to a checkbox in Sidebar.js.
   *
   */
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

  /**
   *
   * @param {Object} nodeData
   * updates the nodeData state and calls a function
   * to update the coloring / status of all the visible nodes
   * on the directed graph
   */
  updateSelectedNodeData(nodeData) {
    const nodeDataString = JSON.stringify(nodeData)
    this.setState({
      currentSelectedNodeData: nodeDataString
    })

    // Update UI whenever we click on a node
    this.updateUIWithMetadata()
  }

  /**
   *
   * This function will fetch metadata and call graphManipulatorObj
   * to update the data associated with all the nodes.
   */
  updateUIWithMetadata() {
    api.fetchMetadata(this.props.workflowId).then(jsonMetadata => {
      this.setState({
        metadata: jsonMetadata
      })

      graphManipulatorObj.updateNodes(jsonMetadata)
    })
  }

  /**
   * @param {String} subworkflowNodeId
   * Expands a subworkflow node using its node id by searching for a subworkflow's corresponding
   * wdl file.
   */
  expandSubworkflow = subworkflowNodeId => {
    const subworkflowNodeObj = this.cy.getElementById(subworkflowNodeId)

    graphManipulatorObj.expandSubworkflow(subworkflowNodeId)
    graphManipulatorObj.updateNodes(this.state.metadata) // this call is technically redundant since this function is called in updateSelectedNodeData but without this extra call there is delay when it comes to update UI

    this.updateSelectedNodeData(subworkflowNodeObj.data())
    this.enforceLayoutAndFit()
  }

  /**
   * @param {String} scatterParentNodeId
   * Expands a scatter node using its node id by generating shards from metadata.
   */
  scatter = scatterParentNodeId => {
    graphManipulatorObj.scatter(scatterParentNodeId, this.state.metadata)

    const scatterParent = this.cy.getElementById(scatterParentNodeId)
    this.updateSelectedNodeData(scatterParent.data())
    this.enforceLayoutAndFit()
  }

  /**
   * @param {String} selectedParentNodeId
   * Collapses a parent node by removing all descendants of this parent node and remapping descendant edges back to the parent.
   *  Descendants refers to any children of the parent node or children of children and so on.
   */
  collapseParent = selectedParentNodeId => {
    graphManipulatorObj.collapseParent(selectedParentNodeId)

    const parentNode = this.cy.getElementById(selectedParentNodeId)
    this.updateSelectedNodeData(parentNode.data())
  }

  /**
   *
   * @param {String} selectionOption
   * Changes the types of shards visible on the screen. We can either display no shards, all shards, or only failed shards
   * for debugging purposes
   */
  changeDisplayedShards = selectionOption => {
    this.setState({
      displayShards: selectionOption
    })

    graphManipulatorObj.displayShards(selectionOption, this.state.metadata)
  }

  /**
   *
   * @param {String} layerOptions
   *
   * Changes the number of layers currently expanded in the graph.
   */
  changeDisplayedLayers = layerOption => {
    this.setState({
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
      graphManipulatorObj.expandLayers(number, this.state.metadata)
      this.enforceLayoutAndFit()
    }
  }

  /**
   *
   * @param {String} layoutType
   * @param {Boolean} isEnforceCall
   *
   * Changes the type of layout, whether to animate the change in layout, and whether all nodes should fit on the screen
   * by modifying the options of the layout call.
   */
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

  /**
   * Initializes a GraphManipulator object that manipulates the graph by modifying the cy object, adds additional layout options
   * via npm packages, and attaches listeners onto certain types of nodes in the graph to expand and collapse nodes.
   */
  componentDidMount() {
    graphManipulatorObj = new GraphManipulator(this.cy)
    graphManipulatorObj.distributeParentEdges()

    this.toggleColoring()

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

  componentWillUnmount() {
    this.cy.destroy()
  }

  /**
   * Create a cytoscape component to display the graph and a sidebar to display data from the workflow and control the graphs
   */
  render() {
    const style = { width: "70%", height: "800px", borderStyle: "solid" }
    const graphAndIdToNodeMapObj = readDotString(currentDotFile)
    const elementsObj = returnGraphJson(graphAndIdToNodeMapObj)

    return (
      <Box id="main-container">
        <CytoscapeComponent
          stylesheet={this.state.cytoStyle}
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
          isColorBlind={this.state.isColorBlind}
          toggleColoring={this.toggleColoring}
        />
      </Box>
    )
  }
}

GraphView.propTypes = {
  workflowId: PropTypes.string
}

export default GraphView
