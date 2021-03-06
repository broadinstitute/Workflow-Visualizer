import * as dotparser from "dotparser"
import { returnGraphJson } from "./createCytoscapeGraphJSON"
import * as dotFiles from "./dotFiles"
import { parseCallable, parseChildArray } from "./dotStringParsingFunctions"
import { buildEdgeText, buildShardIdText } from "./idGeneration"
import {
  createShardId,
  returnDataDictionary,
  returnFlattenedMetadataDictionary
} from "./metadataFunctions"

/**
 * GraphManipulator object manipulates the cy which holds the logic and data associated with the
 * directed graph in order to create all the functionality of the graph including scatters, subworkflow expansion,
 * collapse, changing colors of nodes.
 *
 * GraphManipulator offers a level of abstraction to GraphView such that all the internal logic in the graph is on this object.
 * This enables the possibility of unit testing the internal logic.
 */
export default class GraphManipulator {
  /**
   * Passes cy which stores the data associated with the directed graph
   * Constructor also initializes the scratch field (this is a place to store extraneous data) of cy.
   * @param {Object} cy
   */
  constructor(cy) {
    this.cy = cy
    cy.scratch("removedNodes", "{}")
  }

  /**
   * Used to hide nodes when choosing the display option for shards.
   * One problem with this implementation is that the edges of the nodes are still visible in the graph and
   * the hidden nodes still take up space in the graph.
   *
   * However, the logic to properly remove the nodes entirely from the graph while still
   * keeping the rules of the graph consistent is quite difficult. So, we've
   * elected to go with this subpar implementation.
   * @param {Object[]} nodeArray
   */
  hideNodeArray = nodeArray => {
    nodeArray.forEach(node => {
      node.style("visibility", "hidden")
      // node.style("display", "none")
      // console.log(node.style())
    })
  }

  /**
   * Used to un-hiude nodes when choosing the display option for shards. As described in hideNodeArray,
   * this implementation has some problems but is the only solution that does not include convoluted logic.
   * @param {Array} nodeArray
   */
  displayNodeArray = nodeArray => {
    nodeArray.forEach(node => {
      node.style("visibility", "visible")
      // node.style("display", "element")
    })
  }

  /**
   *
   * Decides which shards to show based on typeOfDisplay.
   * @param {String} typeOfDisplay
   * @param {Object} metadata
   */
  displayShards = (typeOfDisplay, metadata) => {
    this.updateNodes(metadata)
    if (typeOfDisplay === "smart") {
    } else if (typeOfDisplay === "no") {
      const allShardCollection = this.cy.filter('node[type="shard"]')
      const allShardList = this.parseCollectionToArray(allShardCollection)
      this.hideNodeArray(allShardList)
    } else if (typeOfDisplay === "all") {
      const allShardsCollection = this.cy.filter('node[type="shard"]')

      const allShardsList = this.parseCollectionToArray(allShardsCollection)

      this.displayNodeArray(allShardsList)
    } else if (typeOfDisplay === "failed") {
      const nonFailedShardCollection = this.cy
        .filter('node[type="shard"]')
        .filter('[status!="Failed"]')

      const nonFailedShardsList = this.parseCollectionToArray(
        nonFailedShardCollection
      )

      this.hideNodeArray(nonFailedShardsList)

      const failedShardCollection = this.cy
        .filter('node[type="shard"]')
        .filter('[status="Failed"]')

      const failedList = this.parseCollectionToArray(failedShardCollection)

      this.displayNodeArray(failedList)
    }
  }

  /**
   * Collapses all the children for each parent node in this array which means we remove all
   * descendants of given parent from the graph and then change the type associated with the parent node
   * back into a single-task.
   * @param {Object[]} array
   */
  collapseNodesInArray = array => {
    const topLevelParentList = []
    array.forEach(parent => {
      const parentAttribute = parent.data("parent")
      if (parentAttribute === null) {
        topLevelParentList.push(parent)
      }
    })

    topLevelParentList.forEach(parent => {
      const parentId = parent.id()
      this.collapseParent(parentId)
    })
  }

  /**
   * Finds all active parents in the graph, removes their descendants, and reverts said parent node back into a
   * single-task node.
   */
  collapseAllParents = () => {
    const parentCollection = this.cy.filter("node:parent")

    const subworkflowParentsCollection = parentCollection.filter(
      '[parentType = "subworkflow"],[parentType = "scatterParent"]'
    )
    const subworkflowParents = this.parseCollectionToArray(
      subworkflowParentsCollection
    )
    this.collapseNodesInArray(subworkflowParents)
  }

  /**
   * Expands graph by given number layers (numberExpansions).
   * This functionality is achieved by collapsing all parents initially and then expanding layers iteratively.
   * First, we expand all of layer 1, then layer 2, and so on.
   *
   * @param {number} numberExpansions
   * @param {Object} jsonMetadata
   */
  expandLayers = (numberExpansions, jsonMetadata) => {
    // collapse all to start from the top and make sure they have statuses
    this.collapseAllParents()
    this.updateNodes(jsonMetadata)

    let loops = numberExpansions
    if (numberExpansions === -1) {
      // this will be the max number of expansions considered for expand "all". This will probably break the broswer if there a 1000 layers anyhow.
      loops = 1000
    }

    for (let i = 0; i < loops; i++) {
      const subworkflowCollection = this.cy
        .filter('node[parentType = "subworkflow"]')
        .filter('[type = "single-task"]')
      const subworkflowList = this.parseCollectionToArray(subworkflowCollection)
      const scatterCollection = this.cy
        .filter('node[parentType = "scatterParent"]')
        .filter('[type = "single-task"]')
      const scatterList = this.parseCollectionToArray(scatterCollection)

      // when there are no more layers to expand, we stop loop
      if (subworkflowList.length === 0 && scatterList.length === 0) {
        break
      }

      subworkflowList.forEach(subworkflowNode => {
        const subworkflowId = subworkflowNode.id()
        this.expandSubworkflow(subworkflowId)
      })

      scatterList.forEach(scatterNode => {
        const scatterNodeId = scatterNode.id()
        this.scatter(scatterNodeId, jsonMetadata)
      })
      this.updateNodes(jsonMetadata)
    }
  }

  /**
   * Checks if the array of node objects all have the type: shard.
   * @param {Object[]} nodeArray
   * @returns {boolean}
   */
  isScatter = nodeArray => {
    return nodeArray.every(node => {
      return node.data("type") === "shard"
    })
  }

  /**
   * Each node has its ancestors contained in its node id.
   * We are separating the parent id from the shard in this function.
   * @param {String} shardId
   * @returns {String}
   */
  findParentPrefixOfShardId = shardId => {
    const lastIndexOfGreaterThan = shardId.lastIndexOf(">")
    const parentPrefix = shardId.substring(0, lastIndexOfGreaterThan)
    return parentPrefix
  }

  /**
   *
   * Removes the node with the removedNodeId and its corresponding edges.
   * New edges are created to replace the removed edges.
   * These new edges are returned as hiddenNodesJson.
   * @param {String} removedNodeId
   * @param {String} incomingNodeId
   * @param {String} outgoingNodeId
   * @returns {String}
   */
  createHiddenNodesData = (removedNodeId, incomingNodeId, outgoingNodeId) => {
    // this is for hidden nodes field
    const edgeToIncomingNodeId = buildEdgeText(incomingNodeId, removedNodeId)
    const edgeToIncomingNode = this.cy.getElementById(edgeToIncomingNodeId)

    const incomingJson = edgeToIncomingNode.data("hiddenNodes")
    let incomingHiddenNodes
    if (incomingJson === undefined) {
      incomingHiddenNodes = []
    } else {
      incomingHiddenNodes = JSON.parse(incomingJson)
    }

    const edgeToOutgoingNodeId = buildEdgeText(removedNodeId, outgoingNodeId)
    const edgeToOutgoingNode = this.cy.getElementById(edgeToOutgoingNodeId)

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

  /**
   * Adds the removedNodeData to the cy scratch which is a place to store miscellaneous
   * data of the graph.
   * @param {String} removedNodeId
   * @param {Object} removedNodeData
   */
  updateRemovedNodeDataScratch = (removedNodeId, removedNodeData) => {
    // check if dictionary is initialized. If not, make it. If yes, get it into an object.
    const removedNodeJson = this.cy.scratch("removedNodes")
    const removedNodeDict = JSON.parse(removedNodeJson)

    removedNodeDict[removedNodeId] = removedNodeData
    const updatedRemovedNodeJson = JSON.stringify(removedNodeDict)
    this.cy.scratch("removedNodes", updatedRemovedNodeJson)
  }

  /**
   *
   * Creates scatter edges between two scatter calls when basic view is turned on.
   *
   * Creates replacement edges for all incoming / outgoing nodes of removedNodes.
   * This call is used for the specific case in which incoming and outgoing nodes are all shards.
   * The edge routing then becomes specific to shard index rather than just doing all possible edge
   * combinations.
   *
   * @param {Object[]} incomingNeighborArray
   * @param {Object[]} outgoingNeighborArray
   * @param {String} removedNodeId
   */
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

  /**
   * Creates replacement edges when basic view is turned on to replace the edges incident
   * to removedNode. Therefore, you create new edges to directly connect the incoming and outgoing nodes of
   * given removed node.
   *
   * This function is used in most cases except for when you are connecting two scatters. In that case,
   * GraphManipulator will use createBasicScatterEdges.
   *
   * @param {Object[]} incomingNeighborArray
   * @param {Object[]} outgoingNeighborArray
   * @param {String} removedNodeId
   */
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

  /**
   * Function controls the high level logic to create a basic view which is
   * removing non-call nodes+edges incident to non-call nodes and then remapping
   *  edges to account for missing nodes.
   */
  createBasicView = () => {
    const filterNonParents = this.cy.nodes('[type != "parent"]')
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
      this.cy.remove(node)
      // update scratch
      this.updateRemovedNodeDataScratch(removedNodeId, removedNodeData)
    })
  }

  /**
   * Takes in an object that has (key,value) pairs such that the keys are removed node ids and
   * values are their respective data. Then, the values of the nodes are pushed into an array to be
   * added in a batch back to the graph (thus adding nodes back to the graph).
   *
   * @param {Object} removedNodeDict
   * @returns {Object[]}
   */
  generateNodeJson = removedNodeDict => {
    const nodeArray = []
    Object.keys(removedNodeDict).forEach(nodeId => {
      const nodeData = removedNodeDict[nodeId]
      nodeArray.push({ data: nodeData })
    })
    return nodeArray
  }

  /**
   * Adds back all removedNodes contained in the scratch and then resets scratch.
   */
  addRemovedNodes = () => {
    const removedNodeString = this.cy.scratch("removedNodes")
    const removedNodeDict = JSON.parse(removedNodeString)

    const addedNodesJson = this.generateNodeJson(removedNodeDict)

    const nodesJsonObj = {}
    nodesJsonObj["nodes"] = addedNodesJson

    this.cy.batch(() => {
      this.cy.add(nodesJsonObj)
    })

    // updated scratch 'removedNodes'. It should be empty now since all nodes are added back.
    const stringifyEmptyDict = JSON.stringify({})
    this.cy.scratch("removedNodes", stringifyEmptyDict)
  }

  /**
   * Creates detailed view by adding back removed nodes based on scratch data.
   * Then, each of the new edges created when we initially switched to basic view will have
   * hidden node data. Through this hidden node data point associated with each edge,
   * we will be able to add back lost edges.
   */
  createDetailedView = () => {
    this.addRemovedNodes()

    const collection = this.cy.edges().filter("[hiddenNodes]")
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

  /**
   * Checks if a node exists in the graph
   * @param {String} nodeId
   * @returns {Boolean}
   */
  doesNodeExist = nodeId => {
    const nodeObj = this.cy.getElementById(nodeId)
    return nodeObj.length !== 0
  }

  /**
   * Scans metadata to change the data associated with each node.
   * @param {Object} metadata
   */
  updateNodeStatus = metadata => {
    const statusDictionary = returnDataDictionary(metadata)

    Object.keys(statusDictionary).forEach(nodeId => {
      if (this.doesNodeExist(nodeId)) {
        const nodeObj = this.cy.getElementById(nodeId)
        const dataObj = statusDictionary[nodeId]
        const status = dataObj["status"]
        const parentType = dataObj["parentType"]
        nodeObj.data("status", status)
        nodeObj.data("parentType", parentType)
      }
    })
  }

  /**
   * Adds a length description to a scatter node's name based on metadata results.
   * @param {Object} metadata
   */
  addScatterLengthToName = metadata => {
    const newScattersCollection = this.cy
      .filter("node[parentType = 'scatterParent']")
      .filter("[^length]")
    const newScattersList = this.parseCollectionToArray(newScattersCollection)

    const completeMetadataDict = returnFlattenedMetadataDictionary(metadata)

    newScattersList.forEach(scatterNode => {
      const scatterMetadataObj = completeMetadataDict[scatterNode.id()]
      const length = scatterMetadataObj.length
      scatterNode.data("length", length)
      const oldName = scatterNode.data("name")
      const newParentName = `${oldName} (${length} shards)`
      scatterNode.data("name", newParentName)
    })
  }

  /**
   * Function will update the data associated with each node based on metadata.
   * Then, it will add a length field to a scatter node's name.
   * @param {Object} metadata
   */
  updateNodes = metadata => {
    this.updateNodeStatus(metadata)
    this.addScatterLengthToName(metadata)
  }

  /**
   * Helper function that takes in an edgeArray and adds those edges back to the graph.
   * This function can be reused to batch-add any edges
   * @param {String[]} edgesArray
   */
  batchAddEdges = edgesArray => {
    if (edgesArray.length > 0) {
      const edgesJSONObj = {}
      edgesJSONObj["edges"] = edgesArray

      this.cy.batch(() => {
        this.cy.add(edgesJSONObj)
      })
    }
  }

  /**
   * This function finds matches the subworkflow name based on the initial dot file input. Then,
   * adds the subworkflow dot file to the workflow. Then we remap the edges accordingly.
   *
   * This function will not work in practice in its current state. What this function needs is
   * an api endpoint similiar to the metadata endpoint that can access subworkflow dot files and
   * return those dot files.
   *
   * Most of the groundwork has been laid down. You can see by the callable variable that you can specifically fetch a
   * subworkflow wdl by its file name.
   *
   * @param {String} subworkflowNodeId
   *
   */
  expandSubworkflow = subworkflowNodeId => {
    const subworkflowNodeObj = this.cy.getElementById(subworkflowNodeId)

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

    const subworkflowJSON = returnGraphJson(graphAndIdToNodeMapObj)
    this.cy.add(subworkflowJSON)

    // this is a hacky solution to distributing edges in expandSubworkflow.
    // the correct solution would be something recursive to check if we needed to do this
    // within distributeParent func

    for (let i = 0; i < 5; i++) {
      this.distributeParentEdges()
    }
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

  /**
   *
   * Converts a parent node back into a single-task node by removing all of this node's descendants (children and children's children
   * and so on).
   * @param {String} selectedParentNodeId
   */
  collapseParent = selectedParentNodeId => {
    const parentNode = this.cy.getElementById(selectedParentNodeId)
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
  }

  /**
   *
   * Checks metadata for shards associated with given node and then creates shards.
   * @param {String} scatterParentNodeId
   * @param {Object} jsonMetadata
   */
  scatter = (scatterParentNodeId, jsonMetadata) => {
    const scatterParentNode = this.cy.getElementById(scatterParentNodeId)
    scatterParentNode.data("type", "parent")

    const completeMetadataDict = returnFlattenedMetadataDictionary(jsonMetadata)

    const scatterMetadataObj = completeMetadataDict[scatterParentNodeId]

    const cy = this.cy
    this.cy.batch(function() {
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
  }

  /**
   * Removes edge without removing node associated with said edge.
   * @param {String} edgeId
   */
  removeSingleEdge = edgeId => {
    const removeEdgeObj = this.cy.getElementById(edgeId)
    removeEdgeObj.remove()
  }

  /**
   *
   * Function to create edges.
   * @param {String} incomingNodeId
   * @param {String} outgoingNodeId
   * @param {String[]} hiddenNodesData
   * @returns {Object}
   */
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

  /**
   * A helper function to distributeParentEdges(). This distributes incoming edges of
   * a parent to children nodes of the parent without incoming edges.
   *
   * This logic choice of distributing to child nodes without incoming edges generally works but may fail in
   * edge cases.
   * @param {String[]} listOfIncomingNodes
   * @param {Object[]} childrenWithoutIncomingEdges
   * @param {Object} parentNode
   * @returns {Object[]}
   */
  mapIncomingParentEdgesToChildNodes = (
    listOfIncomingNodes,
    childrenWithoutIncomingEdges,
    parentNode
  ) => {
    const parentId = parentNode.id()
    const edgeArray = []
    listOfIncomingNodes.forEach(incomingNodeId => {
      const incomingNode = this.cy.getElementById(incomingNodeId)
      // Get hiddenNode data from edge and then remove edge from incomingNode to parent
      const edgeToBeRemovedId = buildEdgeText(incomingNodeId, parentId)
      const edgeObj = this.cy.getElementById(edgeToBeRemovedId)
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

  /**
   * A helper function to distributeParentEdges(). This distributes outgoing edges of a parent
   * to the children of the parent which do not have outgoing edges.
   *
   * This logic choice of distributing top children without outgoing edges generally works, but
   * might fail in certain edge cases.
   * @param {String[]} listOfOutgoingNodes
   * @param {Object[]} childrenWithoutOutgoingEdges
   * @param {Object} parentNode
   * @returns {Object[]}
   */
  mapOutgoingParentEdgesToChildNodes = (
    listOfOutgoingNodes,
    childrenWithoutOutgoingEdges,
    parentNode
  ) => {
    const edgeArray = []

    const parentId = parentNode.id()
    listOfOutgoingNodes.forEach(outgoingNodeId => {
      const outgoingNode = this.cy.getElementById(outgoingNodeId)

      // remove edge from parent to outgoingNode
      const edgeToBeRemovedId = buildEdgeText(parentId, outgoingNodeId)
      const edgeObj = this.cy.getElementById(edgeToBeRemovedId)
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

  /**
   * A helper function that converts a collection of elements (which is the default
   * format to return data from the cy object of the cytoscape package) to a simpler format
   * of an array.
   * @param {Object} collection
   * @returns {Object[]}
   *
   */
  parseCollectionToArray = collection => {
    const array = []

    for (let i = 0; i < collection.length; i++) {
      const singleElement = collection[i]
      array.push(singleElement)
    }

    return array
  }

  /**
   * Helper function to distributeParentEdges
   * This function is used in a reduce to accumulate all new edges to batch created together.
   * @param {Object[]} accumulatedNewEdges
   * @param {Object} parentNode
   * @returns {Object[]}
   */
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
   * which are nodes who do not have an incoming edges or outgoing edges.
   *
   * The logic of the workflow visualizer will never allow parent nodes to have edges pointing directly to it.
   * Instead, we have a function that will generally remap parent edges to its children
   */

  distributeParentEdges = () => {
    const parentCollection = this.cy.nodes("").filter('[type = "parent"]')
    // const edgesArray = []

    const parentObjArray = this.parseCollectionToArray(parentCollection)

    const edgesArray = parentObjArray.reduce(
      this.parseParentDataToMakeChildEdges,
      []
    )

    this.batchAddEdges(edgesArray)
  }

  /**
   * Helper function to get outgoing nodes of a given node in array form
   * @param {Object} node
   * @returns {Object[]}
   */
  getOutgoingNodesObj = node => {
    const outgoingNodes = node.outgoers().filter("nodes")
    const outgoingNodesArray = this.parseCollectionToArray(outgoingNodes)
    return outgoingNodesArray
  }

  /**
   * Helper function to get an array of outgoing node ids from a given node object
   * @param {Object} node
   * @returns {String[]}
   */
  getOutgoingNodeIds = node => {
    const outgoingNodeIdsList = this.getOutgoingNodesObj(node).map(node => {
      return node.id()
    })
    return outgoingNodeIdsList
  }

  /**
   * Helper function to get incoming nodes of a given node in array form
   * @param {Object} node
   * @returns {Object[]}
   */
  getIncomingNodesObj = node => {
    const incomingNodes = node.incomers().filter("nodes")

    const incomingNodesArray = this.parseCollectionToArray(incomingNodes)
    return incomingNodesArray
  }

  /**
   * Helper function to get an array of incoming node ids from a given node object
   * @param {Object} node
   * @returns {String[]}
   */
  getIncomingNodeIds = node => {
    const incomingNodeIdsList = this.getIncomingNodesObj(node).map(node => {
      return node.id()
    })
    return incomingNodeIdsList
  }
}
