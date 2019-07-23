export const initializeNodesJSON = idToNodeMap => {
  const nodesArray = []
  const arrayOfAllNodes = Object.keys(idToNodeMap)
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

export const initializeEdgesJSON = graph => {
  const edgesArray = []
  const arrayOfAllNodes = Object.keys(graph)
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
