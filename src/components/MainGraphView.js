import React, { Component } from "react"
import CytoscapeView from "./CytoscapeView"
import "../MainGraphView.css"
var DetailedNodeView = require("./InfoSidebar")
var parse = require("dotparser")
var api = require("../utils/api")
let three_series = "5dac04f3-fbdb-46c0-98fb-68106c80ad49"
let aliased_subs = "480da97b-559a-4df2-9374-083e70dcb6a0"
let workflowIdMetadata = "e014bc68-5fc0-430e-96a1-2261f6549847"

let simpleVariantDiscovery =
  'digraph SimpleVariantDiscovery { compound=true; "call selectIndels" -> "call hardFilterIndel" "call selectSNPs" -> "call hardFilterSNP" "call haplotypeCaller" -> "call selectSNPs" "call hardFilterIndel" -> "call combine" "call haplotypeCaller" -> "call selectIndels" "call hardFilterSNP" -> "call combine" "call selectSNPs" "call haplotypeCaller" "call selectIndels" "call combine" "call hardFilterSNP" "call hardFilterIndel" }'
let scatterGather =
  'digraph scattergather { compound=true; "call analysis" -> "call gather" "call prepare" -> "scatter (prepare.array)" [lhead=cluster_0] "call prepare" "call gather" subgraph cluster_0 { "call analysis" "scatter (prepare.array)" [shape=plaintext] } }'
let arrays_scatters_if =
  'digraph arrays_scatters_ifs { compound=true; subgraph cluster_0 { "call printInt" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'
let array_io =
  'digraph array_io { compound=true; "call mk_file" -> "call concat" "call concat" -> "call count_lines" "call mk_file" -> "call count_lines_array" "call count_lines" subgraph cluster_0 { "call mk_file" "scatter (rs)" [shape=plaintext] } "call count_lines_array" "call concat" "call serialize" }'
let arrays_scatters_if_2_task_parallel =
  'digraph arrays_scatters_ifs { compound=true; subgraph cluster_0 { "call printOne" "call printTwo" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'
let arrays_scatters_if_two_series =
  'digraph arrays_scatters_ifs { compound=true; "call printOne" -> "call printTwo" subgraph cluster_0 { "call printOne" "call printTwo" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'
let arrays_scatters_if_three_series =
  'digraph arrays_scatters_ifs { compound=true; "call printOne" -> "call printTwo" "call printTwo" -> "call printThree" subgraph cluster_0 { "call printOne" "call printTwo" "call printThree" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'
let aliased_subworkflows =
  'digraph aliased_subworkflows { compound=true; "call subwfT" -> "Array[Int] fs" "Array[Int] fs" -> "call subwfF" "call subwfT" "Array[Int] fs" "call subwfF" }'
let subworkflow =
  'digraph subwf { compound=true; subgraph cluster_0 { "call increment" "scatter (is)" [shape=plaintext] } }'
let arrays_scatter_series_and_parallel =
  'digraph arrays_scatters_ifs { compound=true; "call printTwo" -> "call printThree" subgraph cluster_0 { "call printOne" "call printTwo" "call printThree" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'
let two_imports =
  'digraph aliased_subworkflows { compound=true; "call subwfT" -> "Array[Int] fs" "Array[Int] fs" -> "call subwfF" "call subwfT" "Array[Int] fs" "call subwfF" "call sg" }'
let three_imports_sub_scatter =
  'digraph three_imports_sub_scatter { compound=true; "call scatThree" -> "Array[Int] ts" "Array[Int] ts" -> "call subwfT" "Array[Int] fs" -> "call subwfF" "call subwfT" -> "Array[Int] fs" "call subwfF" "call scatThree" "call sg" "Array[Int] fs" "call subwfT" "Array[Int] ts" }'
let arrays_scatter_three_series_gather =
  'digraph arrays_scatter_three_series_gather { compound=true; "call printThree" -> "call gather" "call printOne" -> "call printTwo" "call printTwo" -> "call printThree" "call gather" subgraph cluster_0 { "call printOne" "call printTwo" "call printThree" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'
let sub1 =
  'digraph sub1 { compound=true; "call increment" -> "call subN2" "call subN2" subgraph cluster_0 { "call increment" "scatter (is)" [shape=plaintext] } }'
let nested_subworkflows_4 =
  'digraph nested_subworkflows_4 { compound=true; "call subN1" }'
let sub2 =
  'digraph sub2 { compound=true; "call increment" -> "call subN3" "call subN3" subgraph cluster_0 { "call increment" "scatter (it)" [shape=plaintext] } }'
let sub3 =
  'digraph sub3 { compound=true; subgraph cluster_0 { "call increment" "scatter (iu)" [shape=plaintext] } }'
let nested_subworkflows_3 =
  'digraph nested_subworkflows_3 { compound=true; "call subN2" }'

let currentDotFile = arrays_scatter_three_series_gather

class MainGraphView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tappedNodeName: "",
      metadata: null
    }

    this.graph = React.createRef()

    this.readDotFile = this.readDotFile.bind(this)
    this.updateSelectedNode = this.updateSelectedNode.bind(this)
    this.chooseLayout = this.chooseLayout.bind(this)
    this.changeLayout = this.changeLayout.bind(this)
    this.updateUIWithLatestApiQuery = this.dynamicallyUpdateUIWithApiQuery.bind(
      this
    )

    this.parseChildArray = this.parseChildArray.bind(this)
    this.drawDirectedGraph = this.drawDirectedGraph.bind(this)
    this.distributeParentEdges = this.distributeParentEdges.bind(this)
    this.onClickScatter = this.onClickScatter.bind(this)
  }

  updateSelectedNode(nodeID) {
    this.setState({
      tappedNodeName: nodeID
    })

    // Update UI whenever we click on a node
    this.dynamicallyUpdateUIWithApiQuery()
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

  dynamicallyUpdateUIWithApiQuery() {
    api.fetchMetadata(workflowIdMetadata).then(jsonMetadata => {
      this.setState({
        metadata: jsonMetadata
      })
      let dataFieldOfJsonMetadata = jsonMetadata.data

      this.parseMetadata(dataFieldOfJsonMetadata, null)
    })
  }

  parseMetadata = (dataFieldOfjsonMetadata, subworkflowParent) => {
    let cy = this.graph.current.getCy()
    let calls = dataFieldOfjsonMetadata.calls

    for (let singleCall in calls) {
      if (calls.hasOwnProperty(singleCall)) {
        let nodeId
        if (subworkflowParent === null) {
          nodeId = singleCall
        } else {
          let isolatedNodeId = this.isolateTaskName(singleCall, ".")
          nodeId = `${subworkflowParent}.${isolatedNodeId}`
        }
        let nodeBoi = cy.getElementById(nodeId)
        let currentTaskArray = calls[singleCall]

        if (currentTaskArray.length === 0) {
          console.log("Task of length 0 observed. Nothing was done with it")
        } else if (currentTaskArray.length === 1) {
          // single tasks, so the status should just be updated
          let executionStatus = currentTaskArray[0].executionStatus
          nodeBoi.data("status", executionStatus)

          if (currentTaskArray[0].hasOwnProperty("subWorkflowMetadata")) {
            let subWorkflowMetadata = currentTaskArray[0].subWorkflowMetadata
            if (nodeBoi.data("type") === "parent") {
              //then we should update the color of the subgraph including all the children
              //ya what does that even mean FAM
              this.parseMetadata(subWorkflowMetadata, nodeId)
            }

            nodeBoi.data("parentType", "subworkflow")
          }
        } else {
          // SCATTER CALL
          nodeBoi.data("parentType", "scatterParent")

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
      }
    }
  }

  parseOverallShardStatus = currentTaskArray => {
    let status = null
    currentTaskArray.forEach(function(singleShard) {
      let singleShardExecutionStatus = singleShard.executionStatus

      if (singleShardExecutionStatus === "Done") {
        if (status !== "Running" || status !== "Failed") {
          status = singleShardExecutionStatus
        }
      } else if (singleShardExecutionStatus === "Running") {
        if (status !== "Failed") {
          status = singleShardExecutionStatus
        }
      } else if (singleShardExecutionStatus === "Failed") {
        status = singleShardExecutionStatus
      }
    })
    return status
  }

  unscatter = selectedNodeId => {
    let cy = this.graph.current.getCy()
    let selectedNode = cy.getElementById(selectedNodeId)
    let descendantsCollection = selectedNode.descendants()
    let outgoingNeighborsOfDescendants = descendantsCollection
      .outgoers()
      .filter("node")
    let incomingNeighborsOfDescendants = descendantsCollection
      .incomers()
      .filter("node")
    let unscatterOutgoingNeighbors = outgoingNeighborsOfDescendants.difference(
      descendantsCollection
    )
    let unscatterIncomingNeighbors = incomingNeighborsOfDescendants.difference(
      descendantsCollection
    )
    cy.batch(function() {
      unscatterOutgoingNeighbors.forEach(outgoingNode => {
        let outgoingNodeId = outgoingNode.id()
        let edgeId = `edge_from_${selectedNodeId}_to_${outgoingNodeId}`
        cy.add([
          {
            group: "edges",
            data: {
              id: edgeId,
              source: selectedNodeId,
              target: outgoingNodeId
            }
          }
        ])
      })

      unscatterIncomingNeighbors.forEach(incomingNode => {
        let incomingNodeId = incomingNode.id()
        let edgeId = `edge_from_${incomingNodeId}_to_${selectedNodeId}`
        cy.add([
          {
            group: "edges",
            data: {
              id: edgeId,
              source: incomingNodeId,
              target: selectedNodeId
            }
          }
        ])
      })
    })

    descendantsCollection.remove()
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
          let shardId =
            "shard_" + singleShard.shardIndex + "_of_" + scatterParentNodeId
          cy.add([
            {
              group: "nodes",
              data: {
                id: shardId,
                name: shardId,
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
          let prefixString
          if (isFirstCall) {
            prefixString = singleCall
          } else {
            prefixString = this.isolateTaskName(singleCall, ".")
          }

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

  readDotFile() {
    let abstractSyntaxTree = parse(currentDotFile)
    let workflowId = abstractSyntaxTree[0].id
    let childArray = abstractSyntaxTree[0].children

    let graphAndIdToNodeMapObj = this.parseChildArray(
      childArray,
      {},
      {},
      null,
      workflowId
    )
    return graphAndIdToNodeMapObj
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
      if (isParent) {
        singleNodeJSON = {
          data: {
            id: nodeId,
            name: nodeName,
            parent: nodeParent,
            type: "parent"
          }
        }
      } else {
        singleNodeJSON = {
          data: {
            id: nodeId,
            name: nodeName,
            parent: nodeParent,
            type: "single-task"
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

  lookForParentNames = childArray => {
    let parentNameArray = []
    childArray.forEach(function(child) {
      if (child.type === "node_stmt") {
        let nodeName = child.node_id.id
        if (nodeName.includes("scatter") || nodeName.includes("if")) {
          parentNameArray.push(nodeName)
        }
      }
    })
    return parentNameArray
  }

  parseChildArray(childArray, graphMap, idToNodeObj, parentId, workflowId) {
    childArray.forEach(
      function(child) {
        if (child.type === "attr_stmt") {
        } else if (child.type === "node_stmt") {
          let nodeName = child.node_id.id
          let isolatedNodeName = this.isolateTaskName(nodeName, " ")
          let nodeId = `${workflowId}.${isolatedNodeName}`

          this.checkIfNodeIsAdded(
            graphMap,
            idToNodeObj,
            nodeId,
            nodeName,
            parentId
          )

          this.setParent(nodeId, parentId, idToNodeObj)
        } else if (child.type === "edge_stmt") {
          let fromNodeName = child.edge_list[0].id
          let isolatedFromNodeName = this.isolateTaskName(fromNodeName, " ")
          let fromNodeId = `${workflowId}.${isolatedFromNodeName}`

          let toNodeName = child.edge_list[1].id
          let isolatedToNodeName = this.isolateTaskName(toNodeName, " ")
          let toNodeId = `${workflowId}.${isolatedToNodeName}`

          this.checkIfNodeIsAdded(
            graphMap,
            idToNodeObj,
            fromNodeId,
            fromNodeName,
            parentId
          )
          this.setParent(fromNodeId, parentId, idToNodeObj)

          this.checkIfNodeIsAdded(
            graphMap,
            idToNodeObj,
            toNodeId,
            toNodeName,
            parentId
          )
          this.setParent(toNodeId, parentId, idToNodeObj)

          graphMap[fromNodeId].push(toNodeId)
        } else if (child.type === "subgraph") {
          if (child.id.includes("cluster")) {
            let parentNameArray = this.lookForParentNames(child.children)
            let firstParentName = parentNameArray[0]
            let isolatefirstParentName = this.isolateTaskName(
              firstParentName,
              " "
            )
            let firstParentId = `${workflowId}.${isolatefirstParentName}`

            this.checkIfNodeIsAdded(
              graphMap,
              idToNodeObj,
              firstParentId,
              firstParentName,
              parentId
            )

            idToNodeObj[firstParentId].isParent = true

            this.parseChildArray(
              child.children,
              graphMap,
              idToNodeObj,
              firstParentId,
              workflowId
            )
          } else {
            this.parseChildArray(
              child.children,
              graphMap,
              idToNodeObj,
              parentId,
              workflowId
            )
          }
        } else {
          console.warn("Unrecognized dot format")
        }
      }.bind(this)
    )
    let returnGraphAndIdToNodeMap = {
      graph: graphMap,
      idToNodeMap: idToNodeObj
    }

    return returnGraphAndIdToNodeMap
  }

  setParent = (nodeId, parentId, idToNodeObj) => {
    if (nodeId !== parentId) {
      idToNodeObj[nodeId].directParent = parentId
    }
  }

  checkIfNodeIsAdded = (
    graphMap,
    idToNodeObjMap,
    potentialNodeId,
    potentialNodeName,
    parentId
  ) => {
    if (!graphMap.hasOwnProperty(potentialNodeId)) {
      graphMap[potentialNodeId] = []
      let nodeObj = {
        id: potentialNodeId,
        name: potentialNodeName,
        directParent: parentId,
        isParent: false
      }
      idToNodeObjMap[potentialNodeId] = nodeObj
    }
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
      let nodeName = node.data("name")
      this.updateSelectedNode(nodeName)
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
        this.distributeParentEdges()
      }
    })

    //I do an api call to try to simulate the delay that an actual call would cause. The code is
    // a little hacky as a result.
    cy.on("cxttapend", 'node[parentType = "subworkflow"]', evt => {
      let cy = this.graph.current.getCy()
      let node = evt.target
      let nodeId = node.id()
      if (node.data("type") !== "parent") {
        api.fetchMetadata(workflowIdMetadata).then(jsonMetadata => {
          this.setState({
            metadata: jsonMetadata
          })

          node.data("type", "parent")

          let subworkflow =
            'digraph subwf { compound=true; subgraph cluster_0 { "call increment" "scatter (is)" [shape=plaintext] } }'

          let abstractSyntaxTree = parse(subworkflow)
          let childArray = abstractSyntaxTree[0].children
          let subworkflowId = nodeId

          let graphAndIdToNodeMapObj = this.parseChildArray(
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
    })

    cy.layout({
      name: "circle"
    }).run()
  }

  render() {
    let graphAndIdToNodeMapObj = this.readDotFile()
    let elementsJSON = this.drawDirectedGraph(graphAndIdToNodeMapObj)

    return (
      <div className="flexbox-container">
        <CytoscapeView
          className="cyto-model"
          ref={this.graph}
          elements={elementsJSON}
        />
        <DetailedNodeView
          className="node-view"
          selectedNode={this.state.tappedNodeName}
          chooseLayout={this.chooseLayout}
          metadata={this.state.metadata}
        />
      </div>
    )
  }
}

export default MainGraphView
