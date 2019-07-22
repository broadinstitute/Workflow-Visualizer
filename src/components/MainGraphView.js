import React, { Component } from "react"
import CytoscapeView from "./CytoscapeView"
import "../MainGraphView.css"
import * as dotFiles from "../utils/dotFiles"
import DetailedNodeView from "./InfoSidebar"
import * as dotparser from "dotparser"
import * as api from "../utils/api"
import {
  returnFlattenedMetadataDictionary,
  returnDataDictionary,
  createShardId
} from "../utils/metadataFunctions"
import {
  readDotString,
  parseChildArray,
  parseCallable
} from "../utils/dotStringParsingFunctions"

let workflowIdMetadata

const currentDotFile = dotFiles.nested_subworkflows_4

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
      const dict = returnFlattenedMetadataDictionary(jsonMetadata)
      console.log(dict)
      // this.parseMetadata(dataFieldOfJsonMetadata, null)
      this.updateNodeStatus(jsonMetadata)
    })
  }

  doesNodeExist = nodeId => {
    const cy = this.graph.current.getCy()
    const nodeObj = cy.getElementById(nodeId)
    return nodeObj.length !== 0
  }

  updateNodeStatus = metadata => {
    const cy = this.graph.current.getCy()
    const statusDictionary = returnDataDictionary(metadata)
    Object.keys(statusDictionary).forEach(nodeId => {
      if (this.doesNodeExist(nodeId)) {
        const nodeObj = cy.getElementById(nodeId)
        const dataObj = statusDictionary[nodeId]
        const status = dataObj["status"]
        const parentType = dataObj["parentType"]
        nodeObj.data("status", status)
        nodeObj.data("parentType", parentType)
      }
    })
  }

  expandSubworkflow = subworkflowNodeId => {
    const cy = this.graph.current.getCy()
    const subworkflowNodeObj = cy.getElementById(subworkflowNodeId)
    if (subworkflowNodeObj.data("type") !== "parent") {
      api.fetchMetadata(workflowIdMetadata).then(jsonMetadata => {
        this.setState({
          metadata: jsonMetadata
        })
        subworkflowNodeObj.data("type", "parent")

        const callable = subworkflowNodeObj.data("callableName")
        const aliasAndNameOfCallableDict = parseCallable(callable)
        const alias = aliasAndNameOfCallableDict.alias

        const currentSubworkflowDotString = dotFiles[alias]

        const abstractSyntaxTree = dotparser(currentSubworkflowDotString)
        const childArray = abstractSyntaxTree[0].children

        const graphAndIdToNodeMapObj = parseChildArray(
          childArray,
          {},
          {},
          subworkflowNodeId,
          subworkflowNodeId
        )

        const subworkflowJSON = this.drawDirectedGraph(graphAndIdToNodeMapObj)
        cy.add(subworkflowJSON)
      })
    }
    this.updateSelectedNodeData(subworkflowNodeObj.data())
  }

  // expandSubworkflow = nodeId => {
  //   const cy = this.graph.current.getCy()
  //   const node = cy.getElementById(nodeId)

  //   if (node.data("type") !== "parent") {
  //     api.fetchMetadata(workflowIdMetadata).then(jsonMetadata => {
  //       this.setState({
  //         metadata: jsonMetadata
  //       })

  //       node.data("type", "parent")

  //       // this chunk should probably get its own method later, but I'm lazy rn.
  //       // we are going to isolate for everything prior to the . to get the actual name of the workflow
  //       // also this I realize only works if they "as 'name x'"" is the same as the actual workflow file name.
  //       // Otherwise, this will not work at all.

  //       // CALLABLE NAME IS ACTAULLY A ROBUST WAY. WE JUST NEED TO LOOK AT IMPORTS OF METADATA
  //       // to match to actual file name!!!!
  //       const subworkflowName = node.data("callableName")
  //       const indexSplit = subworkflowName.indexOf(".")
  //       const substring = subworkflowName.substring(0, indexSplit)
  //       // this variable will be called via some metadata call.
  //       const currentSubworkflowDotString = dotFiles[substring]

  //       const abstractSyntaxTree = dotparser(currentSubworkflowDotString)
  //       const childArray = abstractSyntaxTree[0].children

  //       const subworkflowId = nodeId // since this is a subworkflow, the workflowId in parseChildArray in fact is this node.

  //       const graphAndIdToNodeMapObj = parseChildArray(
  //         childArray,
  //         {},
  //         {},
  //         nodeId,
  //         subworkflowId
  //       )

  //       const subworkflowJSON = this.drawDirectedGraph(graphAndIdToNodeMapObj)
  //       cy.add(subworkflowJSON)
  //     })
  //   }
  //   this.updateSelectedNodeData(node.data())
  // }

  /**
   * Built to help find subworkflow nodes whose id is not just the call itself but instead
   * includes the name of the subworkflow itself AKA subworkflowParent
   *  */

  computeNodeIdFromMetadata = (subworkflowParent, singleCall) => {
    let returnNodeId
    if (subworkflowParent === null) {
      returnNodeId = singleCall
    } else {
      const isolatedNodeId = this.isolateTaskName(singleCall, ".")
      returnNodeId = `${subworkflowParent}.${isolatedNodeId}`
    }

    return returnNodeId
  }

  parseOverallShardStatus = currentTaskArray => {
    // wordValueDict is how we rank statuses. Failure is more important, hence should be display
    // over all others when unscattered and so on.
    return currentTaskArray.reduce((summarizedStatus, singleShard) => {
      const wordValueDict = { Done: 1, Running: 2, Failed: 3 }
      return wordValueDict[singleShard.executionStatus] >
        wordValueDict[summarizedStatus]
        ? singleShard.executionStatus
        : summarizedStatus
    }, "Done")
  }

  handleSingleNodeTask = (currentTaskArray, nodeBoi) => {
    const executionStatus = currentTaskArray[0].executionStatus
    nodeBoi.data("status", executionStatus)

    if (currentTaskArray[0].hasOwnProperty("subWorkflowMetadata")) {
      const subWorkflowMetadata = currentTaskArray[0].subWorkflowMetadata
      if (nodeBoi.data("type") === "parent") {
        this.parseMetadata(subWorkflowMetadata, nodeBoi.id())
      }

      nodeBoi.data("parentType", "subworkflow")
    }
  }

  handleMultiNodeTask = (currentTaskArray, nodeBoi) => {
    const cy = this.graph.current.getCy()
    nodeBoi.data("parentType", "scatterParent")
    const nodeId = nodeBoi.id()

    if (nodeBoi.data("type") === "parent") {
      currentTaskArray.forEach(function(singleShard) {
        const shardId = "shard_" + singleShard.shardIndex + "_of_" + nodeId
        const shardNodeObj = cy.getElementById(shardId)
        const doesShardExist = shardNodeObj.isNode()
        if (doesShardExist) {
          shardNodeObj.data("status", singleShard.executionStatus)
        }
      })
    } else {
      const currentStatusOfScatterParent = this.parseOverallShardStatus(
        currentTaskArray
      )
      nodeBoi.data("status", currentStatusOfScatterParent)
    }
  }

  parseMetadata = (dataFieldOfjsonMetadata, subworkflowParent) => {
    const cy = this.graph.current.getCy()
    const calls = dataFieldOfjsonMetadata.calls

    for (const singleCall in calls) {
      if (calls.hasOwnProperty(singleCall)) {
        const nodeId = this.computeNodeIdFromMetadata(
          subworkflowParent,
          singleCall
        )
        const nodeBoi = cy.getElementById(nodeId)
        const currentTaskArray = calls[singleCall]

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
    const cy = this.graph.current.getCy()
    const outgoingNeighborsOfDescendants = descendantsCollection
      .outgoers()
      .filter("node")

    const unscatterOutgoingNeighbors = outgoingNeighborsOfDescendants.difference(
      descendantsCollection
    )

    cy.batch(() => {
      unscatterOutgoingNeighbors.forEach(outgoingNode => {
        const outgoingNodeId = outgoingNode.id()
        const edgeId = `edge_from_${parentNodeId}_to_${outgoingNodeId}`
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
    const cy = this.graph.current.getCy()
    const incomingNeighborsOfDescendants = descendantsCollection
      .incomers()
      .filter("node")

    const unscatterIncomingNeighbors = incomingNeighborsOfDescendants.difference(
      descendantsCollection
    )

    cy.batch(() => {
      unscatterIncomingNeighbors.forEach(incomingNode => {
        const incomingNodeId = incomingNode.id()
        const edgeId = `edge_from_${incomingNodeId}_to_${parentNodeId}`
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
    const cy = this.graph.current.getCy()
    const parentNode = cy.getElementById(selectedParentNodeId)
    const descendantsCollection = parentNode.descendants()

    this.mapChildEdgesBackToParentNode(
      descendantsCollection,
      selectedParentNodeId
    )
    // by removing descendants after remapping nodes, we will remove all descendent nodes and edges which makes sense
    // after remapping descendent edges/connections back to parent.
    descendantsCollection.remove()
    this.updateSelectedNodeData(parentNode.data())
    this.distributeParentEdges()
  }

  findNodeMetadata = (
    scatterParentNodeId,
    dataFieldOfMetadata,
    isFirstCall
  ) => {
    const calls = dataFieldOfMetadata.calls
    if (calls.hasOwnProperty(scatterParentNodeId)) {
      return calls[scatterParentNodeId]
    } else {
      // just check for subworkflowmetadata. We will be truncating the subworkflowmetadata calls
      // to keep name consistency. We will be assuming that first portion of the subworkflowmetadata call
      // will always be the generic subworkflow name. This is pretty irrelevant and does not
      // get translated to the DOT file.

      for (const singleCall in calls) {
        if (calls.hasOwnProperty(singleCall)) {
          const prefixString = isFirstCall
            ? singleCall
            : this.isolateTaskName(singleCall, ".")

          const lengthOfPrefixString = prefixString.length
          const scatterParentNodeIdSubstring = scatterParentNodeId.substring(
            0,
            lengthOfPrefixString
          )

          if (scatterParentNodeIdSubstring === prefixString) {
            const remainingScatterParentNodeId = scatterParentNodeId.substring(
              lengthOfPrefixString + 1
            )
            // this means we can recurse or end here. if remainingScatterParentNodeId is empty, then
            // this singleCall is the correct one.
            if (remainingScatterParentNodeId === "") {
              return calls[singleCall]
            } else {
              const singleTask = calls[singleCall][0]
              if (singleTask.hasOwnProperty("subWorkflowMetadata")) {
                const subWorkflowMetadata = singleTask.subWorkflowMetadata
                const recurseReturn = this.findNodeMetadata(
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

  scatter = scatterParentNodeId => {
    const cy = this.graph.current.getCy()
    api.fetchMetadata(workflowIdMetadata).then(jsonMetadata => {
      this.setState({
        metadata: jsonMetadata
      })

      const scatterParentNode = cy.getElementById(scatterParentNodeId)
      scatterParentNode.data("type", "parent")

      const completeMetadataDict = returnFlattenedMetadataDictionary(
        jsonMetadata
      )

      const scatterMetadataObj = completeMetadataDict[scatterParentNodeId]
      cy.batch(function() {
        scatterMetadataObj.forEach(shard => {
          const shardId = createShardId(scatterParentNodeId, shard)
          const shardName = `shard_${shard.shardIndex}`
          cy.add([
            {
              group: "nodes",
              data: {
                id: shardId,
                name: shardName,
                type: "shard",
                shardIndex: shard.shardIndex,
                parent: scatterParentNodeId,
                status: shard.executionStatus
              }
            }
          ])
        })
      })
    })
  }

  onClickScatter(scatterParentNodeId) {
    const cy = this.graph.current.getCy()
    api.fetchMetadata(workflowIdMetadata).then(jsonMetadata => {
      this.setState({
        metadata: jsonMetadata
      })

      const currentTaskArray = this.findNodeMetadata(
        scatterParentNodeId,
        jsonMetadata.data,
        true
      )
      if (currentTaskArray === null) {
        console.log(scatterParentNodeId + " was not found in the metadata")
      } else {
        const scatterParentNode = cy.getElementById(scatterParentNodeId)
        scatterParentNode.data("type", "parent")

        currentTaskArray.forEach(function(singleShard) {
          const shardId = `shard_${singleShard.shardIndex}_of_${scatterParentNodeId}`
          const shardName = `shard_${singleShard.shardIndex}`
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
    const cy = this.graph.current.getCy()
    const removeEdgeObj = cy.getElementById(edgeId)
    removeEdgeObj.remove()
  }

  distributeParentEdges() {
    const cy = this.graph.current.getCy()
    const parentCollection = cy.nodes().filter('[type = "parent"]')
    for (let i = 0; i < parentCollection.length; i++) {
      const singleParentNode = parentCollection[i]
      const parentId = singleParentNode.id()
      const listOfOutgoingNodes = this.getOutgoingNodes(singleParentNode)
      const listOfIncomingNodes = this.getIncomingNodes(singleParentNode)

      this.buildEdgesForSingleParentNode(listOfOutgoingNodes, parentId, false)
      this.buildEdgesForSingleParentNode(listOfIncomingNodes, parentId, true)
    }
  }

  buildEdgesForSingleParentNode = (
    listOfNeighbors,
    parentId,
    isForIncomingNeighbors
  ) => {
    const cy = this.graph.current.getCy()
    listOfNeighbors.forEach(neighborId => {
      let removedParentEdgeId
      if (isForIncomingNeighbors) {
        removedParentEdgeId = `edge_from_${neighborId}_to_${parentId}`
      } else {
        removedParentEdgeId = `edge_from_${parentId}_to_${neighborId}`
      }
      this.removeSingleEdge(removedParentEdgeId)
      const neighborNode = cy.getElementById(neighborId)
      const parentNode = cy.getElementById(parentId)
      const childrenOfParent = parentNode.children()
      if (
        parentNode.data("parentType") === "scatterParent" &&
        neighborNode.data("type") === "shard"
      ) {
        const shardIndex = neighborNode.data("shardIndex")
        const parentShardId = `shard_${shardIndex}_of_${parentId}`
        let sourceShardId
        let targetShardId
        if (isForIncomingNeighbors) {
          sourceShardId = neighborId
          targetShardId = parentShardId
        } else {
          sourceShardId = parentShardId
          targetShardId = neighborId
        }
        const newShardEdgeId = `edge_from_${sourceShardId}_to_${targetShardId}`
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
          const childId = childrenOfParent[i].id()
          let sourceId
          let targetId
          if (isForIncomingNeighbors) {
            sourceId = neighborId
            targetId = childId
          } else {
            sourceId = childId
            targetId = neighborId
          }
          const newShardEdgeId = `edge_from_${sourceId}_to_${targetId}`
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
    const outgoingEdgesAndNodes = node.outgoers()
    return this.parseOnlyNodes(outgoingEdgesAndNodes)
  }

  getIncomingNodes = node => {
    const incomingEdgesandNodes = node.incomers()
    return this.parseOnlyNodes(incomingEdgesandNodes)
  }

  parseOnlyNodes = edgesAndNodesCollection => {
    const length = edgesAndNodesCollection.length
    const listOfNodes = []
    for (let i = 0; i < length; i++) {
      const nodeId = edgesAndNodesCollection[i].id()
      const isNode = edgesAndNodesCollection[i].isNode()
      if (isNode) {
        listOfNodes.push(nodeId)
      }
    }
    return listOfNodes
  }

  parseOutgoingAndIncomingEdges = node => {
    const incomingEdgesandNodes = node.incomers()
    const outgoingEdgesAndNodes = node.outgoers()
    const listOfEdges = []
    this.parseOnlyEdges(outgoingEdgesAndNodes, listOfEdges)
    this.parseOnlyEdges(incomingEdgesandNodes, listOfEdges)
    return listOfEdges
  }

  parseOnlyEdges = (edgesAndNodes, listOfEdges) => {
    for (let i = 0; i < edgesAndNodes.length; i++) {
      const edgeId = edgesAndNodes[i].id()
      const isEdge = edgesAndNodes[i].isEdge()
      if (isEdge) {
        listOfEdges.push(edgeId)
      }
    }
  }

  isolateTaskName = (fullStringName, characterSeparator) => {
    const characterIndex = fullStringName.indexOf(characterSeparator)
    return fullStringName.substring(characterIndex + 1)
  }

  drawDirectedGraph(graphAndIdToNodeMapObj) {
    const graph = graphAndIdToNodeMapObj.graph
    const idToNodeMap = graphAndIdToNodeMapObj.idToNodeMap
    const arrayOfAllNodes = Object.keys(graph)

    const nodesArray = this.initializeNodesJSON(arrayOfAllNodes, idToNodeMap)
    const edgesArray = this.initializeEdgesJSON(arrayOfAllNodes, graph)

    const elementsJSONObj = {}
    elementsJSONObj["nodes"] = nodesArray
    elementsJSONObj["edges"] = edgesArray
    return elementsJSONObj
  }

  initializeNodesJSON = (arrayOfAllNodes, idToNodeMap) => {
    const nodesArray = []
    arrayOfAllNodes.forEach(function(nodeId) {
      const nodeName = idToNodeMap[nodeId].name // should try to write the json shit
      const nodeParent = idToNodeMap[nodeId].directParent
      const isParent = idToNodeMap[nodeId].isParent
      let singleNodeJSON
      const callable = idToNodeMap[nodeId].callableName
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
    const edgesArray = []
    arrayOfAllNodes.forEach(function(sourceNodeId) {
      const targetNodeArray = graph[sourceNodeId]
      targetNodeArray.forEach(function(targetNodeId) {
        const edgeName = `edge_from_${sourceNodeId}_to_${targetNodeId}`
        const singleEdgeJSON = {
          data: { id: edgeName, source: sourceNodeId, target: targetNodeId }
        }
        edgesArray.push(singleEdgeJSON)
      })
    })
    return edgesArray
  }

  // Many more options for layouts that are specific per layout type e.g cose, breadthfirst. Something to add later?
  changeLayout(layoutType) {
    const cy = this.graph.current.getCy()
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
    const cy = this.graph.current.getCy()
    this.distributeParentEdges()

    cy.on("tapend", "node", evt => {
      const node = evt.target
      const nodeData = node.data()
      this.updateSelectedNodeData(nodeData)
    })

    cy.on("cxttapend", "node[parentType = 'scatterParent']", evt => {
      const node = evt.target
      const nodeId = node.id()
      if (node.data("type") !== "parent") {
        // this.onClickScatter(nodeId)
        this.scatter(nodeId)
      } else {
        node.data("type", "single-task")
        this.unscatter(nodeId)
      }
    })

    // I do an api call to try to simulate the delay that an actual call would cause. The code is
    // a little hacky as a result.
    cy.on("cxttapend", 'node[parentType = "subworkflow"]', evt => {
      const node = evt.target
      const nodeId = node.id()
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
    const graphAndIdToNodeMapObj = readDotString(currentDotFile)
    const elementsJSON = this.drawDirectedGraph(graphAndIdToNodeMapObj)
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
