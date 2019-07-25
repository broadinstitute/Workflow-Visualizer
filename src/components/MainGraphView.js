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

import {
  initializeEdgesJSON,
  initializeNodesJSON
} from "../utils/createCytoscapeGraphJSON"
import { buildShardIdText, buildEdgeText } from "../utils/idGeneration"

let workflowIdMetadata

const currentDotFile = dotFiles.arrays_scatters_if_2_task_parallel

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

        this.updateSelectedNodeData(subworkflowNodeObj.data())

        // this is a hacky solution to distributing edges in expandSubworkflow.
        // the correct solution would be something recursive to check if we needed to do this
        // within distributeParent func

        for (let i = 0; i < 5; i++) {
          this.distributeParentEdges()
        }
      })
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
    this.distributeParentEdges()
    this.updateSelectedNodeData(parentNode.data())
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

      this.distributeParentEdges()
      this.updateSelectedNodeData(scatterParentNode.data())
    })
  }

  removeSingleEdge = edgeId => {
    const cy = this.graph.current.getCy()
    const removeEdgeObj = cy.getElementById(edgeId)
    removeEdgeObj.remove()
  }

  createEdgeJSON = (incomingNodeId, outgoingNodeId) => {
    const edgeId = buildEdgeText(incomingNodeId, outgoingNodeId)
    const singleEdgeJSON = {
      data: { id: edgeId, source: incomingNodeId, target: outgoingNodeId }
    }

    return singleEdgeJSON
  }

  mapIncomingParentEdgesToChildNodes = (
    listOfIncomingNodes,
    childrenWithoutIncomingEdges,
    parentNode
  ) => {
    const cy = this.graph.current.getCy()
    const parentId = parentNode.id()
    const edgeArray = []
    listOfIncomingNodes.forEach(incomingNodeId => {
      const incomingNode = cy.getElementById(incomingNodeId)
      // remove edge from incomingNode to parent
      this.removeSingleEdge(buildEdgeText(incomingNodeId, parentId))

      if (
        parentNode.data("parentType") === "scatterParent" &&
        incomingNode.data("type") === "shard"
      ) {
        const incomingShardIndex = incomingNode.data("shardIndex")
        // the outgoingShardId is a shard of the current parent
        const outgoingShardId = buildShardIdText(parentId, incomingShardIndex)

        edgeArray.push(this.createEdgeJSON(incomingNodeId, outgoingShardId))
        // add the edgeId to something and batch later
      } else {
        childrenWithoutIncomingEdges.forEach(child => {
          const childId = child.id()
          edgeArray.push(this.createEdgeJSON(incomingNodeId, childId))

          // add the edgeId to something and batch later
        })
      }
    })
    return edgeArray
  }

  mapOutgoingParentEdgesToChildNodes = (
    listOfOutgoingNodes,
    childrenWithoutOutgoingEdges,
    parentNode
  ) => {
    const edgeArray = []
    const cy = this.graph.current.getCy()
    const parentId = parentNode.id()
    listOfOutgoingNodes.forEach(outgoingNodeId => {
      const outgoingNode = cy.getElementById(outgoingNodeId)

      // remove edge from parent to outgoingNode
      this.removeSingleEdge(buildEdgeText(parentId, outgoingNodeId))

      if (
        parentNode.data("parentType") === "scatterParent" &&
        outgoingNode.data("type") === "shard"
      ) {
        const outgoingShardIndex = outgoingNode.data("shardIndex")
        const incomingShardId = buildShardIdText(parentId, outgoingShardIndex)
        edgeArray.push(this.createEdgeJSON(incomingShardId, outgoingNodeId))

        // deal with the object
      } else {
        childrenWithoutOutgoingEdges.forEach(child => {
          const childId = child.id()
          edgeArray.push(this.createEdgeJSON(childId, outgoingNodeId))

          // add the edgeId to something and batch later
        })
      }
    })

    return edgeArray
  }

  parseCollectionToArray = collection => {
    const array = []

    for (let i = 0; i < collection.length; i++) {
      const singleNode = collection[i]
      array.push(singleNode)
    }

    return array
  }

  parseParentDataToMakeChildEdges = (accumulatedNewEdges, parentNode) => {
    const listOfOutgoingNodes = this.getOutgoingNodes(parentNode)
    const listOfIncomingNodes = this.getIncomingNodes(parentNode)

    const childrenCollection = parentNode.children()

    const childrenArray = this.parseCollectionToArray(childrenCollection)

    const childrenWithoutIncomingEdges = childrenArray.filter(function(child) {
      return child.incomers().length === 0
    })

    const childrenWithoutOutgoingEdges = childrenArray.filter(function(child) {
      return child.outgoers().length === 0
    })

    const newIncomingEdges = this.mapIncomingParentEdgesToChildNodes(
      listOfIncomingNodes,
      childrenWithoutIncomingEdges,
      parentNode
    )

    const newOutgoingEdges = this.mapOutgoingParentEdgesToChildNodes(
      listOfOutgoingNodes,
      childrenWithoutOutgoingEdges,
      parentNode
    )

    const newEdges = [...newIncomingEdges, ...newOutgoingEdges]
    return [...accumulatedNewEdges, ...newEdges]
  }

  /**
   * This function distributes edges point at a parent and remaps it towards the correct child
   * which are nodes who do not have an incoming edge.
   */

  distributeParentEdges = () => {
    const cy = this.graph.current.getCy()
    const parentCollection = cy.nodes().filter('[type = "parent"]')
    // const edgesArray = []

    const parentObjArray = this.parseCollectionToArray(parentCollection)

    const edgesArray = parentObjArray.reduce(
      this.parseParentDataToMakeChildEdges,
      []
    )

    // add all new edges to the directed graph

    const edgesJSONObj = {}
    edgesJSONObj["edges"] = edgesArray
    cy.add(edgesJSONObj)
    // cy.batch(() => {
    //   cy.add(edgesJSONObj)
    // })
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
        const parentShardId = `${parentId}>shard_${shardIndex}`
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

  drawDirectedGraph(graphAndIdToNodeMapObj) {
    const graph = graphAndIdToNodeMapObj.graph
    const idToNodeMap = graphAndIdToNodeMapObj.idToNodeMap

    const nodesArray = initializeNodesJSON(idToNodeMap)
    const edgesArray = initializeEdgesJSON(graph)

    const elementsJSONObj = {}
    elementsJSONObj["nodes"] = nodesArray
    elementsJSONObj["edges"] = edgesArray
    return elementsJSONObj
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
      const id = response.results[0].id
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
