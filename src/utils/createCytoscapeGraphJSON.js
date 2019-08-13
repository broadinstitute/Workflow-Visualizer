import { buildEdgeText } from "./idGeneration"

export const initializeNodesJSON = idToNodeMap => {
  const nodesArray = []
  const arrayOfAllNodes = Object.keys(idToNodeMap)
  arrayOfAllNodes.forEach(function(nodeId) {
    const nodeName = idToNodeMap[nodeId].name // should try to write the json shit
    const nodeParent = idToNodeMap[nodeId].directParent
    const isParent = idToNodeMap[nodeId].isParent
    const variableClass = idToNodeMap[nodeId].variableClass
    let singleNodeJSON
    const callable = idToNodeMap[nodeId].callableName
    if (isParent) {
      singleNodeJSON = {
        data: {
          id: nodeId,
          name: nodeName,
          parent: nodeParent,
          type: "parent",
          callableName: callable,
          variableClass: variableClass
        }
      }
    } else {
      singleNodeJSON = {
        data: {
          id: nodeId,
          name: nodeName,
          parent: nodeParent,
          type: "single-task",
          callableName: callable,
          variableClass: variableClass
        }
      }
    }
    nodesArray.push(singleNodeJSON)
  })
  return nodesArray
}

export const initializeEdgesJSON = graph => {
  const edgesArray = []
  const arrayOfAllNodes = Object.keys(graph)
  arrayOfAllNodes.forEach(function(sourceNodeId) {
    const targetNodeArray = graph[sourceNodeId]
    targetNodeArray.forEach(function(targetNodeId) {
      // const edgeName = `edge_from_${sourceNodeId}_to_${targetNodeId}`
      const edgeId = buildEdgeText(sourceNodeId, targetNodeId)
      const singleEdgeJSON = {
        data: { id: edgeId, source: sourceNodeId, target: targetNodeId }
      }
      edgesArray.push(singleEdgeJSON)
    })
  })
  return edgesArray
}

export const returnGraphJson = graphAndIdToNodeMapObj => {
  const graph = graphAndIdToNodeMapObj.graph
  const idToNodeMap = graphAndIdToNodeMapObj.idToNodeMap

  const nodesArray = initializeNodesJSON(idToNodeMap)
  const edgesArray = initializeEdgesJSON(graph)

  const elementsJSONObj = {}
  elementsJSONObj["nodes"] = nodesArray
  elementsJSONObj["edges"] = edgesArray
  return elementsJSONObj
}
