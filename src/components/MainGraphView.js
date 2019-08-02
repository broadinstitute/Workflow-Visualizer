import * as dotparser from "dotparser"
import React, { Component } from "react"
import "../MainGraphView.css"
import * as api from "../utils/api"
import {
  initializeEdgesJSON,
  initializeNodesJSON
} from "../utils/createCytoscapeGraphJSON"
import * as dotFiles from "../utils/dotFiles"
import {
  parseCallable,
  parseChildArray,
  readDotString
} from "../utils/dotStringParsingFunctions"
import { buildEdgeText, buildShardIdText } from "../utils/idGeneration"
import {
  createShardId,
  returnDataDictionary,
  returnFlattenedMetadataDictionary
} from "../utils/metadataFunctions"
import CytoscapeView from "./CytoscapeView"
import DetailedNodeView from "./InfoSidebar"
import * as layoutOptions from "../utils/layoutOptions"

let workflowIdMetadata

const currentDotFile = dotFiles.purple_neighbors

class MainGraphView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentSelectedNodeData: null,
      metadata: null,
      isBasicView: false,
      layout: "grid"
    }

    this.graph = React.createRef()

    this.updateSelectedNodeData = this.updateSelectedNodeData.bind(this)
    this.changeLayout = this.changeLayout.bind(this)
    this.updateUIWithMetadata = this.updateUIWithMetadata.bind(this)

    this.drawDirectedGraph = this.drawDirectedGraph.bind(this)
  }

  fit = () => {
    const cy = this.graph.current.getCy()
    cy.fit()
  }

  isScatter = nodeArray => {
    return nodeArray.every(node => {
      return node.data("type") === "shard"
    })
  }

  findParentPrefixOfShardId = shardId => {
    const lastIndexOfGreaterThan = shardId.lastIndexOf(">")
    const parentPrefix = shardId.substring(0, lastIndexOfGreaterThan)
    return parentPrefix
  }

  createHiddenNodesData = (removedNodeId, incomingNodeId, outgoingNodeId) => {
    const cy = this.graph.current.getCy()
    // this is for hidden nodes field
    const edgeToIncomingNodeId = buildEdgeText(incomingNodeId, removedNodeId)
    const edgeToIncomingNode = cy.getElementById(edgeToIncomingNodeId)

    const incomingJson = edgeToIncomingNode.data("hiddenNodes")
    let incomingHiddenNodes
    if (incomingJson === undefined) {
      incomingHiddenNodes = []
    } else {
      incomingHiddenNodes = JSON.parse(incomingJson)
    }

    const edgeToOutgoingNodeId = buildEdgeText(removedNodeId, outgoingNodeId)
    const edgeToOutgoingNode = cy.getElementById(edgeToOutgoingNodeId)

    const outgoingJson = edgeToOutgoingNode.data("hiddenNodes")
    let outgoingHiddenNodes
    if (outgoingJson === undefined) {
      outgoingHiddenNodes = []
    } else {
      outgoingHiddenNodes = JSON.parse(outgoingJson)
    }
    // es6 spread function to concat arrays together.
    const hiddenNodesArray = [
      ...[...incomingHiddenNodes, ...[removedNodeId]],
      ...outgoingHiddenNodes
    ]

    const hiddenNodesJson = JSON.stringify(hiddenNodesArray)

    return hiddenNodesJson
  }

  updateRemovedNodeDataScratch = (removedNodeId, removedNodeData) => {
    const cy = this.graph.current.getCy()
    // check if dictionary is initialized. If not, make it. If yes, get it into an object.
    const removedNodeJson = cy.scratch("removedNodes")
    const removedNodeDict = JSON.parse(removedNodeJson)

    removedNodeDict[removedNodeId] = removedNodeData
    const updatedRemovedNodeJson = JSON.stringify(removedNodeDict)
    cy.scratch("removedNodes", updatedRemovedNodeJson)
  }

  createBasicScatterEdges = (
    incomingNeighborArray,
    outgoingNeighborArray,
    removedNodeId
  ) => {
    const incomingNode = incomingNeighborArray[0]
    const incomingNodeId = incomingNode.id()
    const parentPrefix = this.findParentPrefixOfShardId(incomingNodeId)

    const edgesJsonArray = []
    outgoingNeighborArray.forEach(outgoingNode => {
      const shardIndex = outgoingNode.data("shardIndex")
      const incomingShardId = buildShardIdText(parentPrefix, shardIndex)
      const outgoingShardId = outgoingNode.id()

      const hiddenNodesJson = this.createHiddenNodesData(
        removedNodeId,
        incomingShardId,
        outgoingShardId
      )

      const singleEdgeJson = this.createEdgeJSON(
        incomingShardId,
        outgoingShardId,
        hiddenNodesJson
      )
      edgesJsonArray.push(singleEdgeJson)
    })

    this.batchAddEdges(edgesJsonArray)
  }

  createBasicEdges = (
    incomingNeighborArray,
    outgoingNeighborArray,
    removedNodeId
  ) => {
    const edgeJsonArray = []

    outgoingNeighborArray.forEach(outgoingNode => {
      incomingNeighborArray.forEach(incomingNode => {
        const hiddenNodesJson = this.createHiddenNodesData(
          removedNodeId,
          incomingNode.id(),
          outgoingNode.id()
        )

        const singleEdgeJson = this.createEdgeJSON(
          incomingNode.id(),
          outgoingNode.id(),
          hiddenNodesJson
        )

        edgeJsonArray.push(singleEdgeJson)
      })
    })

    this.batchAddEdges(edgeJsonArray)
  }

  createBasicView = () => {
    const cy = this.graph.current.getCy()

    const removedNodeJson = cy.scratch("removedNodes")
    if (removedNodeJson === undefined) {
      cy.scratch("removedNodes", "{}")
    }

    // const nodesOnlyInAdvancedViewCollection = cy.nodes(
    //   '[variableClass != "call"][variableClass != "scatter"][variableClass != "if"][type != "shard"]'
    // )

    const filterNonParents = cy.nodes('[type != "parent"]')
    const nodesOnlyInAdvancedViewCollection = filterNonParents.filter(
      "[^status]"
    )
    const nodesToRemoveArray = this.parseCollectionToArray(
      nodesOnlyInAdvancedViewCollection
    )

    nodesToRemoveArray.forEach(node => {
      const outgoingNeighborArray = this.getOutgoingNodesObj(node)
      const incomingNeighborArray = this.getIncomingNodesObj(node)

      const removedNodeId = node.id()
      const removedNodeData = node.data()

      // check for scatter case
      if (
        this.isScatter(outgoingNeighborArray) &&
        this.isScatter(incomingNeighborArray) &&
        outgoingNeighborArray.length > 0 &&
        incomingNeighborArray.length > 0 &&
        outgoingNeighborArray.length === incomingNeighborArray.length
      ) {
        this.createBasicScatterEdges(
          incomingNeighborArray,
          outgoingNeighborArray,
          removedNodeId
        )
      } else {
        this.createBasicEdges(
          incomingNeighborArray,
          outgoingNeighborArray,
          removedNodeId
        )
      }

      // remove node now.
      cy.remove(node)
      // update scratch
      this.updateRemovedNodeDataScratch(removedNodeId, removedNodeData)
    })
  }

  generateNodeJson = removedNodeDict => {
    const nodeArray = []
    Object.keys(removedNodeDict).forEach(nodeId => {
      const nodeData = removedNodeDict[nodeId]
      nodeArray.push({ data: nodeData })
    })
    return nodeArray
  }

  addRemovedNodes = () => {
    const cy = this.graph.current.getCy()
    const removedNodeString = cy.scratch("removedNodes")
    const removedNodeDict = JSON.parse(removedNodeString)

    const addedNodesJson = this.generateNodeJson(removedNodeDict)

    const nodesJsonObj = {}
    nodesJsonObj["nodes"] = addedNodesJson

    cy.batch(() => {
      cy.add(nodesJsonObj)
    })

    // updated scratch 'removedNodes'. It should be empty now since all nodes are added back.
    const stringifyEmptyDict = JSON.stringify({})
    cy.scratch("removedNodes", stringifyEmptyDict)
  }

  createDetailedView = () => {
    const cy = this.graph.current.getCy()

    const removedNodeJson = cy.scratch("removedNodes")
    if (removedNodeJson === undefined) {
      cy.scratch("removedNodes", "{}")
    }

    this.addRemovedNodes()

    const collection = cy.edges().filter("[hiddenNodes]")
    const edgesWithHiddenNodes = this.parseCollectionToArray(collection)
    const edgeJson = []
    edgesWithHiddenNodes.forEach(edge => {
      const hiddenNodesString = edge.data("hiddenNodes")
      const hiddenNodesArray = JSON.parse(hiddenNodesString)

      hiddenNodesArray.forEach((nodeId, index, array) => {
        if (index === 0) {
          // skip this index
        } else {
          const prevNodeId = array[index - 1]
          const singleEdgeJson = this.createEdgeJSON(prevNodeId, nodeId, null)
          edgeJson.push(singleEdgeJson)
        }
      })

      // now add the source edge and target edge.
      const sourceNodeId = edge.data("source")
      const sourceEdgeJson = this.createEdgeJSON(
        sourceNodeId,
        hiddenNodesArray[0]
      )
      edgeJson.push(sourceEdgeJson)

      const targetNodeId = edge.data("target")
      const targetEdgeJson = this.createEdgeJSON(
        hiddenNodesArray[hiddenNodesArray.length - 1],
        targetNodeId
      )
      edgeJson.push(targetEdgeJson)

      // after building new edge, remove the old edge.
      this.removeSingleEdge(edge.id())
    })

    this.batchAddEdges(edgeJson)
  }

  toggleViewType = () => {
    // logic is inverted because this is the state prior to changing
    // so if state isBasicView = false, then, since in the immediate future it will be true,
    // cytoscape model should display basicview

    if (this.state.isBasicView) {
      this.createDetailedView()
    } else {
      this.createBasicView()
    }

    this.setState(prevState => ({
      isBasicView: !prevState.isBasicView
    }))
    console.log("I changed views!")
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

  batchAddEdges = edgesArray => {
    const cy = this.graph.current.getCy()
    if (edgesArray.length > 0) {
      const edgesJSONObj = {}
      edgesJSONObj["edges"] = edgesArray

      cy.batch(() => {
        cy.add(edgesJSONObj)
      })
    }
  }

  expandSubworkflow = subworkflowNodeId => {
    const cy = this.graph.current.getCy()
    const subworkflowNodeObj = cy.getElementById(subworkflowNodeId)

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

  mapChildEdgesToParentNode = (
    descendantsCollection,
    parentNodeId,
    isForIncomingChildren
  ) => {
    let selectNeighborsOfDescendants
    if (isForIncomingChildren) {
      // for incoming nodes
      selectNeighborsOfDescendants = descendantsCollection
        .incomers()
        .filter("node")
    } else {
      selectNeighborsOfDescendants = descendantsCollection
        .outgoers()
        .filter("node")
    }

    // the equivalent operation: selectNeighborsOfDescendants - descendants
    // we do this because we want to remap edges from descendants of parent node
    // back to parent node. Thus, we don't care about internal edges of
    // the descendants of parentNode. We only care about edges from descendents
    // that go to non-descendents
    const nonDescendantNeighbors = selectNeighborsOfDescendants.difference(
      descendantsCollection
    )

    const nonDescendantNeighborsArray = this.parseCollectionToArray(
      nonDescendantNeighbors
    )

    const edgeJsonArray = []

    nonDescendantNeighborsArray.forEach(node => {
      const edgeCollection = node.edgesWith(descendantsCollection)
      const edgeArray = this.parseCollectionToArray(edgeCollection)
      const singleEdge = edgeArray[0]
      const hiddenNodes = singleEdge.data("hiddenNodes")

      const nodeId = node.id()
      let singleEdgeJson

      if (isForIncomingChildren) {
        singleEdgeJson = this.createEdgeJSON(nodeId, parentNodeId, hiddenNodes)
      } else {
        singleEdgeJson = this.createEdgeJSON(parentNodeId, nodeId, hiddenNodes)
      }

      edgeJsonArray.push(singleEdgeJson)
    })

    this.batchAddEdges(edgeJsonArray)
  }

  mapOutgoingChildEdgesToParentNode = (descendantsCollection, parentNodeId) => {
    this.mapChildEdgesToParentNode(descendantsCollection, parentNodeId, false)
  }

  mapIncomingChildEdgesToParentNode = (descendantsCollection, parentNodeId) => {
    this.mapChildEdgesToParentNode(descendantsCollection, parentNodeId, true)
  }

  collapseParent = selectedParentNodeId => {
    const cy = this.graph.current.getCy()
    const parentNode = cy.getElementById(selectedParentNodeId)
    parentNode.data("type", "single-task")

    const descendantsCollection = parentNode.descendants()

    this.mapIncomingChildEdgesToParentNode(
      descendantsCollection,
      selectedParentNodeId
    )
    this.mapOutgoingChildEdgesToParentNode(
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

  createEdgeJSON = (incomingNodeId, outgoingNodeId, hiddenNodesData = null) => {
    const edgeId = buildEdgeText(incomingNodeId, outgoingNodeId)
    let singleEdgeJSON
    if (hiddenNodesData === null || hiddenNodesData === undefined) {
      singleEdgeJSON = {
        data: { id: edgeId, source: incomingNodeId, target: outgoingNodeId }
      }
    } else {
      singleEdgeJSON = {
        data: {
          id: edgeId,
          source: incomingNodeId,
          target: outgoingNodeId,
          hiddenNodes: hiddenNodesData
        }
      }
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
      // Get hiddenNode data from edge and then remove edge from incomingNode to parent
      const edgeToBeRemovedId = buildEdgeText(incomingNodeId, parentId)
      const edgeObj = cy.getElementById(edgeToBeRemovedId)
      const hiddenNodes = edgeObj.data("hiddenNodes")
      this.removeSingleEdge(edgeToBeRemovedId)

      if (
        parentNode.data("parentType") === "scatterParent" &&
        incomingNode.data("type") === "shard"
      ) {
        const incomingShardIndex = incomingNode.data("shardIndex")
        // the outgoingShardId is a shard of the current parent
        const outgoingShardId = buildShardIdText(parentId, incomingShardIndex)

        edgeArray.push(
          this.createEdgeJSON(incomingNodeId, outgoingShardId, hiddenNodes)
        )
      } else {
        childrenWithoutIncomingEdges.forEach(child => {
          const childId = child.id()
          edgeArray.push(
            this.createEdgeJSON(incomingNodeId, childId, hiddenNodes)
          )
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
      const edgeToBeRemovedId = buildEdgeText(parentId, outgoingNodeId)
      const edgeObj = cy.getElementById(edgeToBeRemovedId)
      const hiddenNodes = edgeObj.data("hiddenNodes")
      this.removeSingleEdge(edgeToBeRemovedId)

      if (
        parentNode.data("parentType") === "scatterParent" &&
        outgoingNode.data("type") === "shard"
      ) {
        const outgoingShardIndex = outgoingNode.data("shardIndex")
        const incomingShardId = buildShardIdText(parentId, outgoingShardIndex)
        edgeArray.push(
          this.createEdgeJSON(incomingShardId, outgoingNodeId, hiddenNodes)
        )

        // deal with the object
      } else {
        childrenWithoutOutgoingEdges.forEach(child => {
          const childId = child.id()
          edgeArray.push(
            this.createEdgeJSON(childId, outgoingNodeId, hiddenNodes)
          )

          // add the edgeId to something and batch later
        })
      }
    })

    return edgeArray
  }

  parseCollectionToArray = collection => {
    const array = []

    for (let i = 0; i < collection.length; i++) {
      const singleElement = collection[i]
      array.push(singleElement)
    }

    return array
  }

  parseParentDataToMakeChildEdges = (accumulatedNewEdges, parentNode) => {
    const listOfOutgoingNodes = this.getOutgoingNodeIds(parentNode)
    const listOfIncomingNodes = this.getIncomingNodeIds(parentNode)

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

    // const edgesJSONObj = {}
    // edgesJSONObj["edges"] = edgesArray

    // cy.batch(() => {
    //   cy.add(edgesJSONObj)
    // })

    this.batchAddEdges(edgesArray)
  }

  getOutgoingNodesObj = node => {
    const outgoingNodes = node.outgoers().filter("nodes")
    const outgoingNodesArray = this.parseCollectionToArray(outgoingNodes)
    return outgoingNodesArray
  }

  getOutgoingNodeIds = node => {
    const outgoingNodeIdsList = this.getOutgoingNodesObj(node).map(node => {
      return node.id()
    })
    return outgoingNodeIdsList
  }

  getIncomingNodesObj = node => {
    const incomingNodes = node.incomers().filter("nodes")
    const incomingNodesArray = this.parseCollectionToArray(incomingNodes)
    return incomingNodesArray
  }

  getIncomingNodeIds = node => {
    const incomingNodeIdsList = this.getIncomingNodesObj(node).map(node => {
      return node.id()
    })
    return incomingNodeIdsList
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
    this.setState({
      layout: layoutType
    })
    const cy = this.graph.current.getCy()

    let options = {
      name: layoutType,
      fit: true,
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

    cy.layout(options).run()
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
        this.collapseParent(nodeId)
      }
    })

    // I do an api call to try to simulate the delay that an actual call would cause. The code is
    // a little hacky as a result.
    cy.on("cxttapend", 'node[parentType = "subworkflow"]', evt => {
      const node = evt.target
      const nodeId = node.id()
      if (node.data("type") !== "parent") {
        this.expandSubworkflow(nodeId)
      } else {
        this.collapseParent(nodeId)
      }
    })

    this.changeLayout(this.state.layout)
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
          changeLayout={this.changeLayout}
          metadata={this.state.metadata}
          toggleViewFnc={this.toggleViewType}
          isBasicView={this.state.isBasicView}
          layout={this.state.layout}
          fitFnc={this.fit}
        />
      </div>
    )
  }
}

export default MainGraphView
