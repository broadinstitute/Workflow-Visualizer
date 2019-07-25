/**
 * This file provides the functions to maintain naming conventions.
 * The problem is that we are taking data from two disparate inputs, namely
 * the womtool graph function which returns a DOT file and the cromwell
 * metadata output. Hence, these functions hope to uniformly name nodes in our
 * cytoscape graph, so we can properly manipulate the nodes.
 *
 */

/**
 *
 * FUNCTIONS FOR METADATA
 *
 */

const separateWDLFileAndAlias = singleCallString => {
  if (singleCallString === null) {
    return { fileName: null, alias: null }
  }

  const dotIndex = singleCallString.indexOf(".")

  if (dotIndex === -1) {
    return { fileName: "", alias: singleCallString }
  }

  const wdlfileName = singleCallString.substring(0, dotIndex)
  const callAlias = singleCallString.substring(dotIndex + 1)
  return { fileName: wdlfileName, alias: callAlias }
}

/**
 *
 * @param {String} singleCall
 * @param {String} subworkflowParentId
 */

export const createNodeIdFromMetadata = (singleCall, subworkflowParentId) => {
  const nameAndAliasDict = separateWDLFileAndAlias(singleCall)
  const newSingleCallName =
    subworkflowParentId === null
      ? createNodeId(nameAndAliasDict.fileName, nameAndAliasDict.alias)
      : createNodeId(subworkflowParentId, nameAndAliasDict.alias)

  return newSingleCallName
}

/**
 * FUNCTIONS FOR DOT FILES
 */

export const buildNodeIdFromDot = (workflowId, taskName) => {
  return createNodeId(workflowId, taskName)
}

/**
 *
 * Helper Functions for both metadata and dot input naming transformation
 */

export const createNodeId = (parentId, childId) => {
  return `${parentId}>${childId}`
}

export const buildShardIdText = (parentId, shardIndex) => {
  const shardId = `shard_${shardIndex}`
  return createNodeId(parentId, shardId)
}

export const buildEdgeText = (sourceId, targetId) => {
  return `edge_from_${sourceId}_to_${targetId}`
}
