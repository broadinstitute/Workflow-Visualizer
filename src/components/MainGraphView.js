import React, { Component } from "react"
import CytoscapeView from "./CytoscapeView"
import "../MainGraphView.css"
import * as dotFiles from "../utils/dotFiles"
import DetailedNodeView from "./InfoSidebar"
import * as dotparser from "dotparser"
import * as api from "../utils/api"
import {
  readDotString,
  parseChildArray
} from "../utils/dotStringParsingFunctions"

let workflowIdMetadata

let currentDotFile = dotFiles.nested_subworkflows_4

class MainGraphView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentSelectedNodeData: null,
      metadata: null
    }

    this.graph = React.createRef()

    this.updateSelectedNodeData = this.updateSelectedNodeData.bind(this)
    this.chooseLayout = this.chooseLayout.bind(this)
    this.changeLayout = this.changeLayout.bind(this)
    this.updateUIWithMetadata = this.updateUIWithMetadata.bind(this)

    this.drawDirectedGraph = this.drawDirectedGraph.bind(this)
    this.distributeParentEdges = this.distributeParentEdges.bind(this)
    this.onClickScatter = this.onClickScatter.bind(this)
  }

  updateSelectedNodeData(nodeData) {
    let nodeDataString = JSON.stringify(nodeData)
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
      let dataFieldOfJsonMetadata = jsonMetadata.data

      this.parseMetadata(dataFieldOfJsonMetadata, null)
    })
  }

  expandSubworkflow = nodeId => {
    let cy = this.graph.current.getCy()
    let node = cy.getElementById(nodeId)

    if (node.data("type") !== "parent") {
      api.fetchMetadata(workflowIdMetadata).then(jsonMetadata => {
        this.setState({
          metadata: jsonMetadata
        })

        node.data("type", "parent")

        //this chunk should probably get its own method later, but I'm lazy rn.
        //we are going to isolate for everything prior to the . to get the actual name of the workflow
        //also this I realize only works if they "as 'name x'"" is the same as the actual workflow file name.
        //Otherwise, this will not work at all.

        //CALLABLE NAME IS ACTAULLY A ROBUST WAY. WE JUST NEED TO LOOK AT IMPORTS OF METADATA
        //to match to actual file name!!!!
        let subworkflowName = node.data("callableName")
        let indexSplit = subworkflowName.indexOf(".")
        let substring = subworkflowName.substring(0, indexSplit)
        //this variable will be called via some metadata call.
        let currentSubworkflowDotString = dotFiles[substring]

        let abstractSyntaxTree = dotparser(currentSubworkflowDotString)
        let childArray = abstractSyntaxTree[0].children

        let subworkflowId = nodeId //since this is a subworkflow, the workflowId in parseChildArray in fact is this node.

        let graphAndIdToNodeMapObj = parseChildArray(
          childArray,
          {},
          {},
          nodeId,
          subworkflowId
        )

        let subworkflowJSON = this.drawDirectedGraph(graphAndIdToNodeMapObj)
        cy.add(subworkflowJSON)
      })
    }
    this.updateSelectedNodeData(node.data())
  }

  /**
   * Built to help find subworkflow nodes whose id is not just the call itself but instead
   * includes the name of the subworkflow itself AKA subworkflowParent
   *  */

  computeNodeIdFromMetadata = (subworkflowParent, singleCall) => {
    let returnNodeId
    if (subworkflowParent === null) {
      returnNodeId = singleCall
    } else {
      let isolatedNodeId = this.isolateTaskName(singleCall, ".")
      returnNodeId = `${subworkflowParent}.${isolatedNodeId}`
    }

    return returnNodeId
  }

  parseOverallShardStatus = currentTaskArray => {
    //wordValueDict is how we rank statuses. Failure is more important, hence should be display
    //over all others when unscattered and so on.
    return currentTaskArray.reduce((summarizedStatus, singleShard) => {
      let wordValueDict = { Done: 1, Running: 2, Failed: 3 }
      return wordValueDict[singleShard.executionStatus] >
        wordValueDict[summarizedStatus]
        ? singleShard.executionStatus
        : summarizedStatus
    }, "Done")
  }

  handleSingleNodeTask = (currentTaskArray, nodeBoi) => {
    let executionStatus = currentTaskArray[0].executionStatus
    nodeBoi.data("status", executionStatus)

    if (currentTaskArray[0].hasOwnProperty("subWorkflowMetadata")) {
      let subWorkflowMetadata = currentTaskArray[0].subWorkflowMetadata
      if (nodeBoi.data("type") === "parent") {
        this.parseMetadata(subWorkflowMetadata, nodeBoi.id())
      }

      nodeBoi.data("parentType", "subworkflow")
    }
  }

  handleMultiNodeTask = (currentTaskArray, nodeBoi) => {
    let cy = this.graph.current.getCy()
    nodeBoi.data("parentType", "scatterParent")
    let nodeId = nodeBoi.id()

    if (nodeBoi.data("type") === "parent") {
      currentTaskArray.forEach(function(singleShard) {
        let shardId = "shard_" + singleShard.shardIndex + "_of_" + nodeId
        let shardNodeObj = cy.getElementById(shardId)
        let doesShardExist = shardNodeObj.isNode()
        if (doesShardExist) {
          shardNodeObj.data("status", singleShard.executionStatus)
        }
      })
    } else {
      let currentStatusOfScatterParent = this.parseOverallShardStatus(
        currentTaskArray
      )
      nodeBoi.data("status", currentStatusOfScatterParent)
    }
  }

  parseMetadata = (dataFieldOfjsonMetadata, subworkflowParent) => {
    let cy = this.graph.current.getCy()
    let calls = dataFieldOfjsonMetadata.calls

    for (let singleCall in calls) {
      if (calls.hasOwnProperty(singleCall)) {
        let nodeId = this.computeNodeIdFromMetadata(
          subworkflowParent,
          singleCall
        )
        let nodeBoi = cy.getElementById(nodeId)
        let currentTaskArray = calls[singleCall]

        if (currentTaskArray.length === 0) {
          console.log("Task of length 0 observed. Nothing was done with it")
        } else if (currentTaskArray.length === 1) {
          this.handleSingleNodeTask(currentTaskArray, nodeBoi)
        } else {
          this.handleMultiNodeTask(currentTaskArray, nodeBoi)
        }
      }
    }
  }

  mapOutgoingChildEdgesToParentNode = (descendantsCollection, parentNodeId) => {
    let cy = this.graph.current.getCy()
    let outgoingNeighborsOfDescendants = descendantsCollection
      .outgoers()
      .filter("node")

    let unscatterOutgoingNeighbors = outgoingNeighborsOfDescendants.difference(
      descendantsCollection
    )

    cy.batch(() => {
      unscatterOutgoingNeighbors.forEach(outgoingNode => {
        let outgoingNodeId = outgoingNode.id()
        let edgeId = `edge_from_${parentNodeId}_to_${outgoingNodeId}`
        cy.add([
          {
            group: "edges",
            data: {
              id: edgeId,
              source: parentNodeId,
              target: outgoingNodeId
            }
          }
        ])
      })
    })
  }

  mapIncomingChildEdgesToParentNode = (descendantsCollection, parentNodeId) => {
    let cy = this.graph.current.getCy()
    let incomingNeighborsOfDescendants = descendantsCollection
      .incomers()
      .filter("node")

    let unscatterIncomingNeighbors = incomingNeighborsOfDescendants.difference(
      descendantsCollection
    )

    cy.batch(() => {
      unscatterIncomingNeighbors.forEach(incomingNode => {
        let incomingNodeId = incomingNode.id()
        let edgeId = `edge_from_${incomingNodeId}_to_${parentNodeId}`
        cy.add([
          {
            group: "edges",
            data: {
              id: edgeId,
              source: incomingNodeId,
              target: parentNodeId
            }
          }
        ])
      })
    })
  }

  mapChildEdgesBackToParentNode = (descendantsCollection, parentNodeId) => {
    this.mapOutgoingChildEdgesToParentNode(descendantsCollection, parentNodeId)
    this.mapIncomingChildEdgesToParentNode(descendantsCollection, parentNodeId)
  }

  unscatter = selectedParentNodeId => {
    let cy = this.graph.current.getCy()
    let parentNode = cy.getElementById(selectedParentNodeId)
    let descendantsCollection = parentNode.descendants()

    this.mapChildEdgesBackToParentNode(
      descendantsCollection,
      selectedParentNodeId
    )
    //by removing descendants after remapping nodes, we will remove all descendent nodes and edges which makes sense
    //after remapping descendent edges/connections back to parent.
    descendantsCollection.remove()
    this.updateSelectedNodeData(parentNode.data())
    this.distributeParentEdges()
  }

  findNodeMetadata = (
    scatterParentNodeId,
    dataFieldOfMetadata,
    isFirstCall
  ) => {
    let calls = dataFieldOfMetadata.calls
    if (calls.hasOwnProperty(scatterParentNodeId)) {
      return calls[scatterParentNodeId]
    } else {
      //just check for subworkflowmetadata. We will be truncating the subworkflowmetadata calls
      //to keep name consistency. We will be assuming that first portion of the subworkflowmetadata call
      //will always be the generic subworkflow name. This is pretty irrelevant and does not
      //get translated to the DOT file.

      for (let singleCall in calls) {
        if (calls.hasOwnProperty(singleCall)) {
          let prefixString = isFirstCall
            ? singleCall
            : this.isolateTaskName(singleCall, ".")

          let lengthOfPrefixString = prefixString.length
          let scatterParentNodeIdSubstring = scatterParentNodeId.substring(
            0,
            lengthOfPrefixString
          )

          if (scatterParentNodeIdSubstring === prefixString) {
            let remainingScatterParentNodeId = scatterParentNodeId.substring(
              lengthOfPrefixString + 1
            )
            //this means we can recurse or end here. if remainingScatterParentNodeId is empty, then
            //this singleCall is the correct one.
            if (remainingScatterParentNodeId === "") {
              return calls[singleCall]
            } else {
              let singleTask = calls[singleCall][0]
              if (singleTask.hasOwnProperty("subWorkflowMetadata")) {
                let subWorkflowMetadata = singleTask.subWorkflowMetadata
                let recurseReturn = this.findNodeMetadata(
                  remainingScatterParentNodeId,
                  subWorkflowMetadata,
                  false
                )
                if (recurseReturn != null) {
                  return recurseReturn
                }
              }
            }
          }
        }
      }

      return null
    }
  }

  onClickScatter(scatterParentNodeId) {
    let cy = this.graph.current.getCy()
    api.fetchMetadata(workflowIdMetadata).then(jsonMetadata => {
      this.setState({
        metadata: jsonMetadata
      })

      let currentTaskArray = this.findNodeMetadata(
        scatterParentNodeId,
        jsonMetadata.data,
        true
      )
      if (currentTaskArray === null) {
        console.log(scatterParentNodeId + " was not found in the metadata")
      } else {
        let scatterParentNode = cy.getElementById(scatterParentNodeId)
        scatterParentNode.data("type", "parent")

        currentTaskArray.forEach(function(singleShard) {
          let shardId = `shard_${singleShard.shardIndex}_of_${scatterParentNodeId}`
          let shardName = `shard_${singleShard.shardIndex}`
          cy.add([
            {
              group: "nodes",
              data: {
                id: shardId,
                name: shardName,
                type: "shard",
                shardIndex: singleShard.shardIndex,
                parent: scatterParentNodeId,
                status: singleShard.executionStatus
              }
            }
          ])
        })
      }
      this.distributeParentEdges()
      this.chooseLayout("circle")
    })
  }

  removeSingleEdge = edgeId => {
    let cy = this.graph.current.getCy()
    const removeEdgeObj = cy.getElementById(edgeId)
    removeEdgeObj.remove()
  }

  distributeParentEdges() {
    let cy = this.graph.current.getCy()
    let parentCollection = cy.nodes().filter('[type = "parent"]')
    for (let i = 0; i < parentCollection.length; i++) {
      let singleParentNode = parentCollection[i]
      let parentId = singleParentNode.id()
      let listOfOutgoingNodes = this.getOutgoingNodes(singleParentNode)
      let listOfIncomingNodes = this.getIncomingNodes(singleParentNode)

      this.buildEdgesForSingleParentNode(listOfOutgoingNodes, parentId, false)
      this.buildEdgesForSingleParentNode(listOfIncomingNodes, parentId, true)
    }
  }

  buildEdgesForSingleParentNode = (
    listOfNeighbors,
    parentId,
    isForIncomingNeighbors
  ) => {
    let cy = this.graph.current.getCy()
    listOfNeighbors.forEach(neighborId => {
      let removedParentEdgeId
      if (isForIncomingNeighbors) {
        removedParentEdgeId = `edge_from_${neighborId}_to_${parentId}`
      } else {
        removedParentEdgeId = `edge_from_${parentId}_to_${neighborId}`
      }
      this.removeSingleEdge(removedParentEdgeId)
      let neighborNode = cy.getElementById(neighborId)
      let parentNode = cy.getElementById(parentId)
      let childrenOfParent = parentNode.children()
      if (
        parentNode.data("parentType") === "scatterParent" &&
        neighborNode.data("type") === "shard"
      ) {
        let shardIndex = neighborNode.data("shardIndex")
        let parentShardId = `shard_${shardIndex}_of_${parentId}`
        let sourceShardId
        let targetShardId
        if (isForIncomingNeighbors) {
          sourceShardId = neighborId
          targetShardId = parentShardId
        } else {
          sourceShardId = parentShardId
          targetShardId = neighborId
        }
        let newShardEdgeId = `edge_from_${sourceShardId}_to_${targetShardId}`
        cy.add([
          {
            group: "edges",
            data: {
              id: newShardEdgeId,
              source: sourceShardId,
              target: targetShardId
            }
          }
        ])
      } else {
        for (let i = 0; i < childrenOfParent.length; i++) {
          let childId = childrenOfParent[i].id()
          let sourceId
          let targetId
          if (isForIncomingNeighbors) {
            sourceId = neighborId
            targetId = childId
          } else {
            sourceId = childId
            targetId = neighborId
          }
          let newShardEdgeId = `edge_from_${sourceId}_to_${targetId}`
          cy.add([
            {
              group: "edges",
              data: { id: newShardEdgeId, source: sourceId, target: targetId }
            }
          ])
        }
      }
    })
  }

  getOutgoingNodes = node => {
    let outgoingEdgesAndNodes = node.outgoers()
    return this.parseOnlyNodes(outgoingEdgesAndNodes)
  }

  getIncomingNodes = node => {
    let incomingEdgesandNodes = node.incomers()
    return this.parseOnlyNodes(incomingEdgesandNodes)
  }

  parseOnlyNodes = edgesAndNodesCollection => {
    let length = edgesAndNodesCollection.length
    let listOfNodes = []
    for (let i = 0; i < length; i++) {
      let nodeId = edgesAndNodesCollection[i].id()
      let isNode = edgesAndNodesCollection[i].isNode()
      if (isNode) {
        listOfNodes.push(nodeId)
      }
    }
    return listOfNodes
  }

  parseOutgoingAndIncomingEdges = node => {
    let incomingEdgesandNodes = node.incomers()
    let outgoingEdgesAndNodes = node.outgoers()
    let listOfEdges = []
    this.parseOnlyEdges(outgoingEdgesAndNodes, listOfEdges)
    this.parseOnlyEdges(incomingEdgesandNodes, listOfEdges)
    return listOfEdges
  }

  parseOnlyEdges = (edgesAndNodes, listOfEdges) => {
    for (let i = 0; i < edgesAndNodes.length; i++) {
      let edgeId = edgesAndNodes[i].id()
      let isEdge = edgesAndNodes[i].isEdge()
      if (isEdge) {
        listOfEdges.push(edgeId)
      }
    }
  }

  isolateTaskName = (fullStringName, characterSeparator) => {
    let characterIndex = fullStringName.indexOf(characterSeparator)
    return fullStringName.substring(characterIndex + 1)
  }

  drawDirectedGraph(graphAndIdToNodeMapObj) {
    let graph = graphAndIdToNodeMapObj.graph
    let idToNodeMap = graphAndIdToNodeMapObj.idToNodeMap
    let arrayOfAllNodes = Object.keys(graph)

    let nodesArray = this.initializeNodesJSON(arrayOfAllNodes, idToNodeMap)
    let edgesArray = this.initializeEdgesJSON(arrayOfAllNodes, graph)

    let elementsJSONObj = {}
    elementsJSONObj["nodes"] = nodesArray
    elementsJSONObj["edges"] = edgesArray
    return elementsJSONObj
  }

  initializeNodesJSON = (arrayOfAllNodes, idToNodeMap) => {
    let nodesArray = []
    arrayOfAllNodes.forEach(function(nodeId) {
      let nodeName = idToNodeMap[nodeId].name //should try to write the json shit
      let nodeParent = idToNodeMap[nodeId].directParent
      let isParent = idToNodeMap[nodeId].isParent
      let singleNodeJSON
      let callable = idToNodeMap[nodeId].callableName
      if (isParent) {
        singleNodeJSON = {
          data: {
            id: nodeId,
            name: nodeName,
            parent: nodeParent,
            type: "parent",
            callableName: callable
          }
        }
      } else {
        singleNodeJSON = {
          data: {
            id: nodeId,
            name: nodeName,
            parent: nodeParent,
            type: "single-task",
            callableName: callable
          }
        }
      }
      nodesArray.push(singleNodeJSON)
    })
    return nodesArray
  }

  initializeEdgesJSON = (arrayOfAllNodes, graph) => {
    let edgesArray = []
    arrayOfAllNodes.forEach(function(sourceNodeId) {
      let targetNodeArray = graph[sourceNodeId]
      targetNodeArray.forEach(function(targetNodeId) {
        let edgeName = `edge_from_${sourceNodeId}_to_${targetNodeId}`
        let singleEdgeJSON = {
          data: { id: edgeName, source: sourceNodeId, target: targetNodeId }
        }
        edgesArray.push(singleEdgeJSON)
      })
    })
    return edgesArray
  }

  // Many more options for layouts that are specific per layout type e.g cose, breadthfirst. Something to add later?
  changeLayout(layoutType) {
    let cy = this.graph.current.getCy()
    cy.layout({
      name: layoutType,
      fit: true,
      animate: true,
      animationDuration: 500,
      animationEasing: undefined,
      refresh: 20,
      animationThreshold: 250
    }).run()
  }

  chooseLayout(text) {
    console.log(text)
    if (
      text !== "breadthfirst" &&
      text !== "cose" &&
      text !== "circle" &&
      text !== "grid" &&
      text !== "random"
    ) {
      console.warn('"' + text + '" is an invalid layout format')
    } else {
      this.changeLayout(text)
    }
  }

  componentDidMount() {
    let cy = this.graph.current.getCy()
    this.distributeParentEdges()

    cy.on("tapend", "node", evt => {
      let node = evt.target
      let nodeData = node.data()
      this.updateSelectedNodeData(nodeData)
    })

    cy.on("cxttapend", "node[parentType = 'scatterParent']", evt => {
      let node = evt.target
      let nodeId = node.id()
      if (node.data("type") !== "parent") {
        this.onClickScatter(nodeId)
        node.data("type", "parent")
      } else {
        node.data("type", "single-task")
        this.unscatter(nodeId)
      }
    })

    //I do an api call to try to simulate the delay that an actual call would cause. The code is
    // a little hacky as a result.
    cy.on("cxttapend", 'node[parentType = "subworkflow"]', evt => {
      let node = evt.target
      let nodeId = node.id()
      this.expandSubworkflow(nodeId)
    })

    cy.layout({
      name: "circle"
    }).run()
  }

  updateToLatestWorkflowId = () => {
    api.queryWorkflows().then(response => {
      const id = response.data.results[0].id
      workflowIdMetadata = id
    })
  }

  render() {
    let graphAndIdToNodeMapObj = readDotString(currentDotFile)
    let elementsJSON = this.drawDirectedGraph(graphAndIdToNodeMapObj)
    this.updateToLatestWorkflowId()

    return (
      <div className="flexbox-container">
        <CytoscapeView
          className="cyto-model"
          ref={this.graph}
          elements={elementsJSON}
        />
        <DetailedNodeView
          className="node-view"
          currentSelectedNodeData={this.state.currentSelectedNodeData}
          chooseLayout={this.chooseLayout}
          metadata={this.state.metadata}
        />
      </div>
    )
  }
}

export default MainGraphView
