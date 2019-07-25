import dotparser from "dotparser"
import { buildNodeIdFromDot } from "./idGeneration"

/**
 * Exports two functions parseChildArray and readDotFile which both are functions
 * to convert dot format into a more generalized format of arrays and JSON objects
 * that can be easily read and converted into a UI via cytoscape.
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

const checkIfNodeIsAdded = (
  graphMap,
  idToNodeObjMap,
  potentialNodeId,
  potentialNodeName,
  callable,
  parentId
) => {
  if (!Object.hasOwnProperty.call(graphMap, potentialNodeId)) {
    graphMap[potentialNodeId] = []
    const nodeObj = {
      id: potentialNodeId,
      name: potentialNodeName,
      directParent: parentId,
      isParent: false,
      callableName: callable
    }
    idToNodeObjMap[potentialNodeId] = nodeObj
  }
}

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

const setParent = (nodeId, parentId, idToNodeObj) => {
  if (nodeId !== parentId) {
    idToNodeObj[nodeId].directParent = parentId
  }
}

const findStringAfterSeparator = (fullStringName, characterSeparator) => {
  if (fullStringName === null) {
    return ""
  }
  // returns full string if there is no separator
  const characterIndex = fullStringName.indexOf(characterSeparator)
  return fullStringName.substring(characterIndex + 1)
}

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
      const isolatedNodeName = findStringAfterSeparator(
        originalNodeIdFromDotString,
        " "
      )
      const callableAndTaskNameObj = separateCallableAndTaskName(
        isolatedNodeName
      )

      const nodeId = buildNodeIdFromDot(
        workflowId,
        callableAndTaskNameObj.taskName
      )
      const nodeName = callableAndTaskNameObj.taskName

      checkIfNodeIsAdded(
        graphMap,
        idToNodeObj,
        nodeId,
        nodeName,
        callableAndTaskNameObj.callable,
        parentId
      )

      setParent(nodeId, parentId, idToNodeObj)
    } else if (child.type === "edge_stmt") {
      const fromOriginalNodeIdFromDotString = child.edge_list[0].id
      const isolatedFromNodeName = findStringAfterSeparator(
        fromOriginalNodeIdFromDotString,
        " "
      )
      const fromCallableAndTaskNameObj = separateCallableAndTaskName(
        isolatedFromNodeName
      )

      const fromNodeId = buildNodeIdFromDot(
        workflowId,
        fromCallableAndTaskNameObj.taskName
      )
      const fromNodeName = fromCallableAndTaskNameObj.taskName

      const toOriginalNodeIdFromDotString = child.edge_list[1].id
      const isolatedToNodeName = findStringAfterSeparator(
        toOriginalNodeIdFromDotString,
        " "
      )
      const toCallableAndTaskNameObj = separateCallableAndTaskName(
        isolatedToNodeName
      )

      const toNodeId = buildNodeIdFromDot(
        workflowId,
        toCallableAndTaskNameObj.taskName
      )
      const toNodeName = toCallableAndTaskNameObj.taskName
      checkIfNodeIsAdded(
        graphMap,
        idToNodeObj,
        fromNodeId,
        fromNodeName,
        fromCallableAndTaskNameObj.callable,
        parentId
      )
      setParent(fromNodeId, parentId, idToNodeObj)

      checkIfNodeIsAdded(
        graphMap,
        idToNodeObj,
        toNodeId,
        toNodeName,
        toCallableAndTaskNameObj.callable,
        parentId
      )
      setParent(toNodeId, parentId, idToNodeObj)

      graphMap[fromNodeId].push(toNodeId)
    } else if (child.type === "subgraph") {
      if (child.id.includes("cluster")) {
        const parentNameArray = lookForParentNames(child.children)
        const firstParentName = parentNameArray[0]
        const isolatefirstParentName = findStringAfterSeparator(
          firstParentName,
          " "
        )
        // const firstParentId = `${workflowId}>${isolatefirstParentName}`

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
          parentId
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
