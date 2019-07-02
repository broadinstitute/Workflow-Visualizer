import React, { Component } from 'react'
import CytoscapeView from './CytoscapeView'
import '../MainGraphView.css'
var DetailedNodeView = require('./InfoSidebar')
var parse = require('dotparser')
var api = require('../utils/api')

class MainGraphView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tappedNodeName: '',
      metadata: null
    }

    this.graph = React.createRef()

    this.readDotFile = this.readDotFile.bind(this)
    this.updateSelectedNode = this.updateSelectedNode.bind(this)
    this.chooseLayout = this.chooseLayout.bind(this)
    this.changeLayout = this.changeLayout.bind(this)
    this.updateUIWithLatestApiQuery = this.dynamicallyUpdateUIWithApiQuery.bind(this)
    this.parseChildrenTypesToBuildGraph = this.parseChildrenTypesToBuildGraph.bind(this)
    this.makeOrMoveNode = this.makeOrMoveNode.bind(this)
    this.parseChildArray = this.parseChildArray.bind(this)
    this.drawDirectedGraph = this.drawDirectedGraph.bind(this)
    this.distributeParentEdges = this.distributeParentEdges.bind(this)
  }

  updateSelectedNode (nodeID) {
    this.setState({
      tappedNodeName: nodeID
    })

    // Update UI whenever we click on a node
    this.dynamicallyUpdateUIWithApiQuery()
  }

  // Many more options for layouts that are specific per layout type e.g cose, breadthfirst. Something to add later?
  changeLayout (layoutType) {
    var cy = this.graph.current.getCy()
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

  dynamicallyUpdateUIWithApiQuery () {
    var cy = this.graph.current.getCy()
    api.fetchMetadata('9e652fe4-619a-4b7d-b8fc-a2c8bb716fb2')
      .then(function (jsonMetadata) {
        console.log(jsonMetadata)
        this.setState({
          metadata: jsonMetadata
        })

        var calls = jsonMetadata.data.calls

        for (var singleCall in calls) {
          if (calls.hasOwnProperty(singleCall)) {
            let nodeId = this.isolateTaskName(singleCall, '.')
            let nodeBoi = cy.getElementById(nodeId)
            let currentTaskArray = calls[singleCall]

            if (currentTaskArray.length === 0) {
              console.log('Task of length 0 observed. Nothing was done with it')
            } else if (currentTaskArray.length === 1) {
              // single tasks, so the status should just be updated
              let executionStatus = calls[singleCall][0].executionStatus
              nodeBoi.data('status', executionStatus)
            } else {
              // SCATTER CALL
              // assumed to be a scatter task. I will convert the current scattered-task into a parent and build
              // the individual sharded tasks inside the parent.
              const newParentStatus = 'Parent'
              nodeBoi.data('status', newParentStatus)
              nodeBoi.data('isScatterParent', true)

              currentTaskArray.forEach(function (singleShard) {
                let shardId = 'shard_' + singleShard.shardIndex + '_of_' + nodeId
                let shardNodeObj = cy.getElementById(shardId)
                let doesShardExist = shardNodeObj.isNode()
                if (doesShardExist) {
                  shardNodeObj.data('status', singleShard.executionStatus)
                } else {
                  cy.add([{ group: 'nodes',
                    data: { id: shardId, name: shardId, parent: nodeId, status: singleShard.executionStatus } }])
                }
              })

            }
          }
        }

        this.distributeParentEdges()
        this.chooseLayout('circle')

        
       }.bind(this))
  }

  distributeParentEdges() {
    let cy = this.graph.current.getCy()
    let parentCollection = cy.nodes().filter('[status = "Parent"]')
    for (let i = 0; i < parentCollection.length; i++) {
      let singleParentNode = parentCollection[i]
      let childrenOfParent = singleParentNode.children()
      let nodeId = singleParentNode.id()
      let listOfOutgoingNodes = this.getOutgoingNodes(singleParentNode)
      let listOfIncomingNodes = this.getIncomingNodes(singleParentNode)

      listOfOutgoingNodes.forEach(function(outgoingNodeId) {
        let removedParentEdgeId = `edge_from_${nodeId}_to_${outgoingNodeId}`
        let removeParentEdgeObj = cy.getElementById(removedParentEdgeId)
        removeParentEdgeObj.remove()
        let outgoingNode = cy.getElementById(outgoingNodeId)
        if (singleParentNode.data('isScatterParent') && outgoingNode.data('isScatterParent')) {
          //now 
          for(let n = 0; n < childrenOfParent.length; n++) {
            let sourceShardId = 'shard_' + n + '_of_' + nodeId
            let targetShardId = 'shard_' + n + '_of_' + outgoingNodeId
            cy.add([
              { group: 'edges',
                data: { id: 'edge_from_' + sourceShardId + '_to_' +
              targetShardId,
                source: sourceShardId,
                target: targetShardId } }
            ])

          }
        } else { //Parent to non-parent
          for(let m = 0; m < childrenOfParent.length; m++) {
            let childId = childrenOfParent[m].id()
            let newEdgeId = 'edge_from_' + childId + '_to_' + outgoingNodeId
            cy.add([{group: 'edges', data: {id: newEdgeId, source: childId, target: outgoingNodeId}}])
          }
        } 
      })

      listOfIncomingNodes.forEach(function(incomingNodeId) {
        let removedParentEdgeId = `edge_from_${incomingNodeId}_to_${nodeId}`
        let removeParentEdgeObj = cy.getElementById(removedParentEdgeId)
        removeParentEdgeObj.remove()
        let incomingNode = cy.getElementById(incomingNodeId)
        if (singleParentNode.data('isScatterParent') && incomingNode.data('isScatterParent')) {
          for (let n = 0; n < childrenOfParent.length; n++) {
            let sourceShardId = `shard_${n}_of_${incomingNodeId}`
            let targetShardId = `shard_${n}_of_${nodeId}`
            let newShardEdgeId = `edge_from_${sourceShardId}_to_${targetShardId}`
            cy.add([
              { group: 'edges',
                data: { id: newShardEdgeId,
                source: sourceShardId,
                target: targetShardId } }
            ])
          }
        } else { //Parent to non-parent
          for(let m = 0; m < childrenOfParent.length; m++) {
            let childId = childrenOfParent[m].id()
            let newEdgeId = `edge_from_${incomingNodeId}_to_${childId}`
            cy.add([{group: 'edges', data: {id: newEdgeId, source: incomingNodeId, target: childId}}])
          }

        }
      })
    }
  }


  getOutgoingNodes = (node) => {
    let outgoingEdgesAndNodes = node.outgoers()
    return this.parseOnlyNodes(outgoingEdgesAndNodes)
  }

  getIncomingNodes = (node) => {
    let incomingEdgesandNodes = node.incomers()
    return this.parseOnlyNodes (incomingEdgesandNodes)
  }

  parseOnlyNodes = (edgesAndNodesCollection) => {
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

  parseOutgoingAndIncomingEdges = (node) => {
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

  readDotFile () {
    var singleDOT = 'graph Dab {"Dab"}'
    var simpleDOT = 'digraph G { "Welcome" -> "To" "To" -> "Web" "To" -> "GraphViz!" }'
    var hardDOT = 'digraph forkjoin { "call forkjoin.grep" -> "String forkjoin.grep.pattern" "call forkjoin.grep" -> "output { forkjoin.grep.count = read_int(stdout()) }" "call forkjoin.grep" -> "File forkjoin.grep.in_file" "call forkjoin.wc" -> "output { forkjoin.wc.count = read_int(stdout()) }" "call forkjoin.grep" -> "call forkjoin.join" "call forkjoin.wc" -> "File forkjoin.wc.in_file" "call forkjoin.mkFile" -> "call forkjoin.grep" "call forkjoin.join" -> "output { forkjoin.join.proportion = read_int(stdout()) }" "call forkjoin.join" -> "Int forkjoin.join.wcCount" "call forkjoin.wc" -> "call forkjoin.join" "call forkjoin.mkFile" -> "output { forkjoin.mkFile.numbers = stdout() }" "call forkjoin.mkFile" -> "call forkjoin.wc" "call forkjoin.join" -> "Int forkjoin.join.grepCount" }'
    var longDOT = 'digraph prof { ratio = fill; node [style=filled]; start -> main [color="0.002 0.999 0.999"]; start -> on_exit [color="0.649 0.701 0.701"]; main -> sort [color="0.348 0.839 0.839"]; main -> merge [color="0.515 0.762 0.762"]; main -> term [color="0.647 0.702 0.702"]; main -> signal [color="0.650 0.700 0.700"]; main -> sbrk [color="0.650 0.700 0.700"]; main -> unlink [color="0.650 0.700 0.700"]; main -> newfile [color="0.650 0.700 0.700"]; main -> fclose [color="0.650 0.700 0.700"]; main -> close [color="0.650 0.700 0.700"]; main -> brk [color="0.650 0.700 0.700"]; main -> setbuf [color="0.650 0.700 0.700"]; main -> copyproto [color="0.650 0.700 0.700"]; main -> initree [color="0.650 0.700 0.700"]; main -> safeoutfil [color="0.650 0.700 0.700"]; main -> getpid [color="0.650 0.700 0.700"]; main -> sprintf [color="0.650 0.700 0.700"]; main -> creat [color="0.650 0.700 0.700"]; main -> rem [color="0.650 0.700 0.700"]; main -> oldfile [color="0.650 0.700 0.700"]; sort -> msort [color="0.619 0.714 0.714"]; sort -> filbuf [color="0.650 0.700 0.700"]; sort -> newfile [color="0.650 0.700 0.700"]; sort -> fclose [color="0.650 0.700 0.700"]; sort -> setbuf [color="0.650 0.700 0.700"]; sort -> setfil [color="0.650 0.700 0.700"]; msort -> qsort [color="0.650 0.700 0.700"]; msort -> insert [color="0.650 0.700 0.700"]; msort -> wline [color="0.650 0.700 0.700"]; msort -> div [color="0.650 0.700 0.700"]; msort -> cmpsave [color="0.650 0.700 0.700"]; merge -> insert [color="0.650 0.700 0.700"]; merge -> rline [color="0.650 0.700 0.700"]; merge -> wline [color="0.650 0.700 0.700"]; merge -> unlink [color="0.650 0.700 0.700"]; merge -> fopen [color="0.650 0.700 0.700"]; merge -> fclose [color="0.650 0.700 0.700"]; merge -> setfil [color="0.650 0.700 0.700"]; merge -> mul [color="0.650 0.700 0.700"]; merge -> setbuf [color="0.650 0.700 0.700"]; merge -> cmpsave [color="0.650 0.700 0.700"]; insert -> cmpa [color="0.650 0.700 0.700"]; wline -> flsbuf [color="0.649 0.700 0.700"]; qsort -> cmpa [color="0.650 0.700 0.700"]; rline -> filbuf [color="0.649 0.700 0.700"]; xflsbuf -> write [color="0.650 0.700 0.700"]; flsbuf -> xflsbuf [color="0.649 0.700 0.700"]; filbuf -> read [color="0.650 0.700 0.700"]; term -> unlink [color="0.650 0.700 0.700"]; term -> signal [color="0.650 0.700 0.700"]; term -> setfil [color="0.650 0.700 0.700"]; term -> exit [color="0.650 0.700 0.700"]; endopen -> open [color="0.650 0.700 0.700"]; fopen -> endopen [color="0.639 0.705 0.705"]; fopen -> findiop [color="0.650 0.700 0.700"]; newfile -> fopen [color="0.634 0.707 0.707"]; newfile -> setfil [color="0.650 0.700 0.700"]; fclose -> fflush [color="0.642 0.704 0.704"]; fclose -> close [color="0.650 0.700 0.700"]; fflush -> xflsbuf [color="0.635 0.707 0.707"]; malloc -> morecore [color="0.325 0.850 0.850"]; malloc -> demote [color="0.650 0.700 0.700"]; morecore -> sbrk [color="0.650 0.700 0.700"]; morecore -> getfreehdr [color="0.650 0.700 0.700"]; morecore -> free [color="0.650 0.700 0.700"]; morecore -> getpagesize [color="0.650 0.700 0.700"]; morecore -> putfreehdr [color="0.650 0.700 0.700"]; morecore -> udiv [color="0.650 0.700 0.700"]; morecore -> umul [color="0.650 0.700 0.700"]; on_exit -> malloc [color="0.325 0.850 0.850"]; signal -> sigvec [color="0.650 0.700 0.700"]; moncontrol -> profil [color="0.650 0.700 0.700"]; getfreehdr -> sbrk [color="0.650 0.700 0.700"]; free -> insert [color="0.650 0.700 0.700"]; insert -> getfreehdr [color="0.650 0.700 0.700"]; setfil -> div [color="0.650 0.700 0.700"]; setfil -> rem [color="0.650 0.700 0.700"]; sigvec -> sigblock [color="0.650 0.700 0.700"]; sigvec -> sigsetmask [color="0.650 0.700 0.700"]; doprnt -> urem [color="0.650 0.700 0.700"]; doprnt -> udiv [color="0.650 0.700 0.700"]; doprnt -> strlen [color="0.650 0.700 0.700"]; doprnt -> localeconv [color="0.650 0.700 0.700"]; sprintf -> doprnt [color="0.650 0.700 0.700"]; cmpa [color="0.000 1.000 1.000"]; wline [color="0.201 0.753 1.000"]; insert [color="0.305 0.625 1.000"]; rline [color="0.355 0.563 1.000"]; sort [color="0.408 0.498 1.000"]; qsort [color="0.449 0.447 1.000"]; write [color="0.499 0.386 1.000"]; read [color="0.578 0.289 1.000"]; msort [color="0.590 0.273 1.000"]; merge [color="0.603 0.258 1.000"]; unlink [color="0.628 0.227 1.000"]; filbuf [color="0.641 0.212 1.000"]; open [color="0.641 0.212 1.000"]; sbrk [color="0.647 0.204 1.000"]; signal [color="0.647 0.204 1.000"]; moncontrol [color="0.647 0.204 1.000"]; xflsbuf [color="0.650 0.200 1.000"]; flsbuf [color="0.650 0.200 1.000"]; div [color="0.650 0.200 1.000"]; cmpsave [color="0.650 0.200 1.000"]; rem [color="0.650 0.200 1.000"]; setfil [color="0.650 0.200 1.000"]; close [color="0.650 0.200 1.000"]; fclose [color="0.650 0.200 1.000"]; fflush [color="0.650 0.200 1.000"]; setbuf [color="0.650 0.200 1.000"]; endopen [color="0.650 0.200 1.000"]; findiop [color="0.650 0.200 1.000"]; fopen [color="0.650 0.200 1.000"]; mul [color="0.650 0.200 1.000"]; newfile [color="0.650 0.200 1.000"]; sigblock [color="0.650 0.200 1.000"]; sigsetmask [color="0.650 0.200 1.000"]; sigvec [color="0.650 0.200 1.000"]; udiv [color="0.650 0.200 1.000"]; urem [color="0.650 0.200 1.000"]; brk [color="0.650 0.200 1.000"]; getfreehdr [color="0.650 0.200 1.000"]; strlen [color="0.650 0.200 1.000"]; umul [color="0.650 0.200 1.000"]; doprnt [color="0.650 0.200 1.000"]; copyproto [color="0.650 0.200 1.000"]; creat [color="0.650 0.200 1.000"]; demote [color="0.650 0.200 1.000"]; exit [color="0.650 0.200 1.000"]; free [color="0.650 0.200 1.000"]; getpagesize [color="0.650 0.200 1.000"]; getpid [color="0.650 0.200 1.000"]; initree [color="0.650 0.200 1.000"]; insert [color="0.650 0.200 1.000"]; localeconv [color="0.650 0.200 1.000"]; main [color="0.650 0.200 1.000"]; malloc [color="0.650 0.200 1.000"]; morecore [color="0.650 0.200 1.000"]; oldfile [color="0.650 0.200 1.000"]; on_exit [color="0.650 0.200 1.000"]; profil [color="0.650 0.200 1.000"]; putfreehdr [color="0.650 0.200 1.000"]; safeoutfil [color="0.650 0.200 1.000"]; sprintf [color="0.650 0.200 1.000"]; term [color="0.650 0.200 1.000"]; }'
    var simpleVariantDiscovery = 'digraph SimpleVariantDiscovery { compound=true; "call selectIndels" -> "call hardFilterIndel" "call selectSNPs" -> "call hardFilterSNP" "call haplotypeCaller" -> "call selectSNPs" "call hardFilterIndel" -> "call combine" "call haplotypeCaller" -> "call selectIndels" "call hardFilterSNP" -> "call combine" "call selectSNPs" "call haplotypeCaller" "call selectIndels" "call combine" "call hardFilterSNP" "call hardFilterIndel" }'
    var scatterGather = 'digraph scattergather { compound=true; "call analysis" -> "call gather" "call prepare" -> "scatter (prepare.array)" [lhead=cluster_0] "call prepare" "call gather" subgraph cluster_0 { "call analysis" "scatter (prepare.array)" [shape=plaintext] } }'
    var arrays_scatters_if = 'digraph arrays_scatters_ifs { compound=true; subgraph cluster_0 { "call printInt" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'
    var array_io = 'digraph array_io { compound=true; "call mk_file" -> "call concat" "call concat" -> "call count_lines" "call mk_file" -> "call count_lines_array" "call count_lines" subgraph cluster_0 { "call mk_file" "scatter (rs)" [shape=plaintext] } "call count_lines_array" "call concat" "call serialize" }'
    var arrays_scatters_if_2_task_parallel = 'digraph arrays_scatters_ifs { compound=true; subgraph cluster_0 { "call printOne" "call printTwo" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'
    var arrays_scatters_if_two_series = 'digraph arrays_scatters_ifs { compound=true; "call printOne" -> "call printTwo" subgraph cluster_0 { "call printOne" "call printTwo" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'

    var abstractSyntaxTree = parse(scatterGather)

    var childArray = abstractSyntaxTree[0].children

    let graphAndIdToNodeMapObj = this.parseChildArray(childArray, {}, {}, null) 
    return graphAndIdToNodeMapObj
  }

  drawDirectedGraph(graphAndIdToNodeMapObj) {
    let graph = graphAndIdToNodeMapObj.graph
    let idToNodeMap = graphAndIdToNodeMapObj.idToNodeMap
    let arrayOfAllNodes = Object.keys(graph)

    let nodesArray = []
    let edgesArray = []

    arrayOfAllNodes.forEach(function(nodeId) {
      let nodeName = idToNodeMap[nodeId].name //should try to write the json shit
      let nodeParent = idToNodeMap[nodeId].directParent
      let isParent = idToNodeMap[nodeId].isParent
      let singleNodeJSON
      if (isParent) {
        singleNodeJSON = {data: {id: nodeId, name: nodeName, parent: nodeParent, status: 'Parent'}}
      } else {
        singleNodeJSON = {data: {id: nodeId, name: nodeName, parent: nodeParent}}
      }
      nodesArray.push(singleNodeJSON)
    })

    arrayOfAllNodes.forEach(function(sourceNodeId) {
       let targetNodeArray = graph[sourceNodeId]
       targetNodeArray.forEach(function(targetNodeId) {
        let edgeName = `edge_from_${sourceNodeId}_to_${targetNodeId}`
        let singleEdgeJSON = {data: {id: edgeName, source: sourceNodeId, target: targetNodeId}}
        edgesArray.push(singleEdgeJSON)
       })
    })

    let elementsJSONObj = {}

    elementsJSONObj['nodes'] = nodesArray
    elementsJSONObj['edges'] = edgesArray

    return elementsJSONObj

  }


  lookForParentNames = (childArray) => {
    let parentNameArray = []
    childArray.forEach(function(child) {
      if (child.type === 'node_stmt') {
        let nodeName = child.node_id.id
        if (nodeName.includes('scatter') || nodeName.includes('if')) {
          parentNameArray.push(nodeName)
        }
      }
    })
    return parentNameArray
  }


  parseChildArray(childArray, graphMap, idToNodeObj, parentId) {
    childArray.forEach(function (child) {
      if (child.type === 'attr_stmt') {

      } else if (child.type === 'node_stmt') {
        let nodeName = child.node_id.id
        let nodeId = this.isolateTaskName(nodeName, ' ')

        this.checkIfNodeIsAdded (graphMap, idToNodeObj , nodeId, nodeName, parentId)

        this.setParent(nodeId, parentId, idToNodeObj)

      } else if (child.type === 'edge_stmt') {
        let fromNodeName = child.edge_list[0].id
        let toNodeName = child.edge_list[1].id
        let fromNodeId = this.isolateTaskName(fromNodeName, ' ')
        let toNodeId = this.isolateTaskName(toNodeName, ' ')

        this.checkIfNodeIsAdded(graphMap, idToNodeObj, fromNodeId, fromNodeName, parentId)
        this.setParent(fromNodeId, parentId, idToNodeObj)
        
        this.checkIfNodeIsAdded(graphMap, idToNodeObj, toNodeId, toNodeName, parentId)
        this.setParent(toNodeId, parentId, idToNodeObj)

        graphMap[fromNodeId].push(toNodeId)

      } else if (child.type === 'subgraph') {
        if (child.id.includes('cluster')) {
          let parentNameArray = this.lookForParentNames(child.children)
          let firstParentName = parentNameArray[0]
          let firstParentId = this.isolateTaskName(firstParentName, ' ')

          this.checkIfNodeIsAdded(graphMap, idToNodeObj, firstParentId, firstParentName, parentId)
          
          idToNodeObj[firstParentId].isParent = true

          this.parseChildArray(child.children, graphMap, idToNodeObj, firstParentId)
        } else {
          this.parseChildArray(child.children, graphMap, idToNodeObj)
        }
      } else {
        console.warn('Unrecognized dot format')
      }
    }.bind(this))
    let returnGraphAndIdToNodeMap = {graph: graphMap,
                                     idToNodeMap: idToNodeObj}

    return returnGraphAndIdToNodeMap
  }

  setParent = (nodeId, parentId, idToNodeObj) => {
    if (nodeId !== parentId) {
      idToNodeObj[nodeId].directParent = parentId
    }
  }



  checkIfNodeIsAdded = (graphMap, idToNodeObjMap, potentialNodeId, potentialNodeName, parentId) => {
    if (!graphMap.hasOwnProperty(potentialNodeId)) {
      graphMap[potentialNodeId] = []
      let nodeObj = 
                  {
                    id: potentialNodeId,
                    name: potentialNodeName,
                    directParent: parentId,
                    isParent: false
                  }
      idToNodeObjMap[potentialNodeId] = nodeObj
    } 
  }

  parseChildrenTypesToBuildGraph (childArray, parentId = null) {
    var cy = this.graph.current.getCy()
    childArray.forEach(function (child) {
      if (child.type === 'attr_stmt') {
        // do nothing for now. Later, we can consider adding the styling.
      } else if (child.type === 'node_stmt') {
        let nodeId = this.isolateTaskName(child.node_id.id, ' ')
        let nodeName = child.node_id.id
        this.makeOrMoveNode(nodeId, nodeName, parentId)
      } else if (child.type === 'edge_stmt') {
        let fromNodeName = child.edge_list[0].id
        let toNodeName = child.edge_list[1].id
        let fromNodeId = this.isolateTaskName(fromNodeName, ' ')
        let toNodeId = this.isolateTaskName(toNodeName, ' ')
        this.makeOrMoveNode(fromNodeId, fromNodeName, parentId)
        this.makeOrMoveNode(toNodeId, toNodeName, parentId)

        cy.add([
          { group: 'edges',
            data: { id: 'edge_from_' + fromNodeId + '_to_' +
          toNodeId,
            source: fromNodeId,
            target: toNodeId } }
        ])
      } else if (child.type === 'subgraph') {
        if (child.id.includes('cluster')) {
          cy.add([{ group: 'nodes', data: { id: child.id, name: child.id, parent: parentId, status: 'Parent' } }])
          this.parseChildrenTypesToBuildGraph(child.children, child.id)
        } else {
          this.parseChildrenTypesToBuildGraph(child.children)
        }
      } else {
        console.warn('Unrecognized dot format')
      }
    }.bind(this))
  }

  /**
   * Will create a node or move said node to parent. Is this a good way of splitting a function?
   */
  makeOrMoveNode (nodeId, nodeName, parentId) {
    var cy = this.graph.current.getCy()
    let nodeSelected = cy.getElementById(nodeId)
    if (nodeSelected.length === 0) {
      cy.add([{ group: 'nodes', data: { id: nodeId, name: nodeName, parent: parentId } }])
    } else {
      // what happens when the length is greater than 1?
      nodeSelected.move({
        parent: parentId
      })
    }
  }

  chooseLayout (text) {
    console.log(text)
    if (text !== 'breadthfirst' && text !== 'cose' && text !== 'circle' && text !== 'grid' && text !== 'random') {
      console.warn('\"' + text + '\" is an invalid layout format')
    } else {
      this.changeLayout(text)
    }
  }

  componentDidMount () {
    var cy = this.graph.current.getCy()

    this.distributeParentEdges()


    var thisComponent = this

    cy.on('tapend', 'node', function (evt) {
      var node = evt.target
      var nodeName = node.data('name')
      thisComponent.updateSelectedNode(nodeName)
    })

   


    cy.layout({
      name: 'circle'
    }).run()



  }

  render () {
    let graphAndIdToNodeMapObj = this.readDotFile()
    let elementsJSON = this.drawDirectedGraph(graphAndIdToNodeMapObj)

    return (

      <div className='flexbox-container'>
        <CytoscapeView className="cyto-model" ref={this.graph} elements={elementsJSON} />
        <DetailedNodeView className="node-view" selectedNode={this.state.tappedNodeName} chooseLayout={this.chooseLayout} metadata={this.state.metadata}/>
      </div>

    )
  }
}

export default MainGraphView
