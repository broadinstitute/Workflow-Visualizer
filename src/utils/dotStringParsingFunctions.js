import dotparser from "dotparser"
import { buildNodeIdFromDot } from "./idGeneration"

/**
 * Exports two functions parseChildArray and readDotFile which both are functions
 * to convert dot format into a more generalized format of arrays and JSON objects
 * that can be easily read and converted into a UI via cytoscape.
 */

/**
 * Looks for parent nodes from the dotparser output.
 * Those nodes will have more information nested inside the dot parser output
 * and thus will need to be handled differently.
 * @param {Object[]} childArray
 */

const lookForParentNames = childArray => {
  const parentNameArray = []
  childArray.forEach(function(child) {
    if (child.type === "node_stmt") {
      const nodeName = child.node_id.id
      if (nodeName.includes("scatter") || nodeName.includes("if")) {
        parentNameArray.push(nodeName)
      }
    }
  })
  return parentNameArray
}

/**
 *
 *
 * Checks if node is added to the Object graphMap.
 * If not, then add the nodeObj to the Object graphMap
 * @param {Object} graphMap
 * @param {Object} idToNodeObjMap
 * @param {String} potentialNodeId
 * @param {String} potentialNodeName
 * @param {String} callable
 * @param {String} parentId
 * @param {String} variableType
 */
const checkIfNodeIsAdded = (
  graphMap,
  idToNodeObjMap,
  potentialNodeId,
  potentialNodeName,
  callable,
  parentId,
  variableType
) => {
  if (!Object.hasOwnProperty.call(graphMap, potentialNodeId)) {
    graphMap[potentialNodeId] = []
    const nodeObj = {
      id: potentialNodeId,
      name: potentialNodeName,
      directParent: parentId,
      isParent: false,
      callableName: callable,
      variableClass: variableType
    }
    idToNodeObjMap[potentialNodeId] = nodeObj
  }
}

/**
 * Parses a string for its callable and its task name.
 * The callable will be used to find subworkflows and the task name
 * will be used to id and name the node.
 * @param {String} potentialCallableAndTaskNameString
 */
const separateCallableAndTaskName = potentialCallableAndTaskNameString => {
  const separatorChar = "&"
  const returnObj = {}
  const indexOfUnderscore = potentialCallableAndTaskNameString.indexOf(
    separatorChar
  )
  let callable
  let taskName
  if (indexOfUnderscore === -1) {
    callable = ""
    taskName = potentialCallableAndTaskNameString
  } else {
    callable = potentialCallableAndTaskNameString.substring(
      0,
      indexOfUnderscore
    )
    taskName = potentialCallableAndTaskNameString.substring(
      indexOfUnderscore + 1
    )
  }

  returnObj["callable"] = callable
  returnObj["taskName"] = taskName
  return returnObj
}

/**
 * Sets the directParent field of nodeId to parentId.
 * @param {String} nodeId
 * @param {String} parentId
 * @param {Object} idToNodeObj
 */
const setParent = (nodeId, parentId, idToNodeObj) => {
  if (nodeId !== parentId) {
    idToNodeObj[nodeId].directParent = parentId
  }
}

/**
 * A helper function that parses for a substring that comes after any separator character.
 * @param {String} fullStringName
 * @param {String} characterSeparator
 */
const findStringAfterSeparator = (fullStringName, characterSeparator) => {
  if (fullStringName === null) {
    return ""
  }
  // returns full string if there is no separator
  const characterIndex = fullStringName.indexOf(characterSeparator)
  return fullStringName.substring(characterIndex + 1)
}

/**
 * A helper function that parses for a substring that comes before any separator character.
 * @param {String} fullStringName
 * @param {String} characterSeparator
 */

const findStringBeforeSeparator = (fullStringName, characterSeparator) => {
  if (fullStringName === null) {
    return ""
  }

  const characterIndex = fullStringName.indexOf(characterSeparator)
  return fullStringName.substring(0, characterIndex)
}

/**
 * Populates data onto graphMap and this specific node information onto idToNodeObj based on
 * the information contained in the originNodeIdFromDotString
 * @param {Object} graphMap
 * @param {Object} idToNodeObj
 * @param {String} parentId
 * @param {String} workflowId
 * @param {String} originalNodeIdFromDotString
 */
const parseAndSetNodeData = (
  graphMap,
  idToNodeObj,
  parentId,
  workflowId,
  originalNodeIdFromDotString
) => {
  const variableType = findStringBeforeSeparator(
    originalNodeIdFromDotString,
    " "
  )
  const callableAndTaskNameString = findStringAfterSeparator(
    originalNodeIdFromDotString,
    " "
  )
  const callableAndTaskNameObj = separateCallableAndTaskName(
    callableAndTaskNameString
  )

  const nodeId = buildNodeIdFromDot(workflowId, callableAndTaskNameObj.taskName)
  const nodeName = callableAndTaskNameObj.taskName

  checkIfNodeIsAdded(
    graphMap,
    idToNodeObj,
    nodeId,
    nodeName,
    callableAndTaskNameObj.callable,
    parentId,
    variableType
  )

  setParent(nodeId, parentId, idToNodeObj)
}
/**
 * When we encounter an edge, we compute the node id's for incident nodes on the edge.
 * Then, update the graphMap accordingly to denote a new edge
 * @param {String} fromNodeDotId
 * @param {String} toNodeDotId
 * @param {String} workflowId
 * @param {Object} graphMap
 */
const addEdgeToGraph = (fromNodeDotId, toNodeDotId, workflowId, graphMap) => {
  const callableAndTaskNameString = findStringAfterSeparator(fromNodeDotId, " ")
  const fromCallableAndTaskNameObj = separateCallableAndTaskName(
    callableAndTaskNameString
  )

  const fromNodeId = buildNodeIdFromDot(
    workflowId,
    fromCallableAndTaskNameObj.taskName
  )

  const isolatedToNodeName = findStringAfterSeparator(toNodeDotId, " ")
  const toCallableAndTaskNameObj = separateCallableAndTaskName(
    isolatedToNodeName
  )

  const toNodeId = buildNodeIdFromDot(
    workflowId,
    toCallableAndTaskNameObj.taskName
  )

  // now that we have both from and to node id generated, let's chuck it into the graph
  graphMap[fromNodeId].push(toNodeId)
}

/**
 *
 * Iterate through a childArray received from the dotparser object and for each
 * index of the array, you build a node.
 *
 * @param {Object[]} childArray
 * @param {Object} graphMap
 * @param {Object} idToNodeObj
 * @param {String} parentId
 * @param {String} workflowId
 */
const iterateChildArray = (
  childArray,
  graphMap,
  idToNodeObj,
  parentId,
  workflowId
) => {
  childArray.forEach(child => {
    if (child.type === "attr_stmt") {
    } else if (child.type === "node_stmt") {
      const originalNodeIdFromDotString = child.node_id.id

      parseAndSetNodeData(
        graphMap,
        idToNodeObj,
        parentId,
        workflowId,
        originalNodeIdFromDotString
      )
    } else if (child.type === "edge_stmt") {
      const fromOriginalNodeIdFromDotString = child.edge_list[0].id
      parseAndSetNodeData(
        graphMap,
        idToNodeObj,
        parentId,
        workflowId,
        fromOriginalNodeIdFromDotString
      )

      const toOriginalNodeIdFromDotString = child.edge_list[1].id
      parseAndSetNodeData(
        graphMap,
        idToNodeObj,
        parentId,
        workflowId,
        toOriginalNodeIdFromDotString
      )

      addEdgeToGraph(
        fromOriginalNodeIdFromDotString,
        toOriginalNodeIdFromDotString,
        workflowId,
        graphMap
      )
    } else if (child.type === "subgraph") {
      if (child.id.includes("cluster")) {
        const parentNameArray = lookForParentNames(child.children)
        const firstParentName = parentNameArray[0]
        const variableType = findStringBeforeSeparator(firstParentName, " ")
        const isolatefirstParentName = findStringAfterSeparator(
          firstParentName,
          " "
        )

        const firstParentId = buildNodeIdFromDot(
          workflowId,
          isolatefirstParentName
        )

        checkIfNodeIsAdded(
          graphMap,
          idToNodeObj,
          firstParentId,
          firstParentName,
          null,
          parentId,
          variableType
        )

        idToNodeObj[firstParentId].isParent = true

        parseChildArray(
          child.children,
          graphMap,
          idToNodeObj,
          firstParentId,
          workflowId
        )
      } else {
        parseChildArray(
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
  })
}

/**
 *
 * Parses callable string into a subworkflow alias and a workflow name.
 *
 * @param {String} callableString
 * @returns {Object}
 */

export const parseCallable = callableString => {
  if (callableString === null) {
    return { alias: null, name: null }
  }
  const dotIndex = callableString.indexOf(".")

  if (dotIndex === -1) {
    return { alias: callableString, name: "" }
  }

  const subworkflowAlias = callableString.substring(0, dotIndex)
  const workflowName = callableString.substring(dotIndex + 1)
  const returnObj = { alias: subworkflowAlias, name: workflowName }
  return returnObj
}

/**
 *
 * Parse childArray data into idToNodeObj and graphMap
 * @param {Object[]} childArray
 * @param {Object} graphMap
 * @param {Object} idToNodeObj
 * @param {String} parentId
 * @param {String} workflowId
 * @returns {Object}
 */
export const parseChildArray = (
  childArray,
  graphMap,
  idToNodeObj,
  parentId,
  workflowId
) => {
  if (childArray !== null) {
    iterateChildArray(childArray, graphMap, idToNodeObj, parentId, workflowId)
  }
  const returnGraphAndIdToNodeMap = {
    graph: graphMap,
    idToNodeMap: idToNodeObj
  }

  return returnGraphAndIdToNodeMap
}

/**
 * Reads dot string and returns an object that contains directed graph data in an easily readable format.
 * @param {String} currentDotString
 * @returns {Object}
 */
export const readDotString = currentDotString => {
  const abstractSyntaxTree = dotparser(currentDotString)
  const workflowId = abstractSyntaxTree[0].id
  const childArray = abstractSyntaxTree[0].children

  const graphAndIdToNodeMapObj = parseChildArray(
    childArray,
    {},
    {},
    null,
    workflowId
  )
  return graphAndIdToNodeMapObj
}
