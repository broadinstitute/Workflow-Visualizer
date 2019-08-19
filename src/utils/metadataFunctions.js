import { createNodeIdFromMetadata, buildShardIdText } from "./idGeneration"

/**
 * This file contains functions used to parse the metadata into an object that can be easily parsed to update the status of nodes
 * as well as handle subworkflows and scatters.
 */

/**
 * Generates an object containing data associated with a single call from the metadata.
 * This object ios added to nodeDictionary.
 * @param {String} singleCall
 * @param {Object} calls
 * @param {Object} nodeDictionary
 * @param {String} subworkflowParentId
 * @param {String} callableWorkflowName
 */
const addCallToDictionary = (
  singleCall,
  calls,
  nodeDictionary,
  subworkflowParentId,
  callableWorkflowName
) => {
  const newSingleCallName = createNodeIdFromMetadata(
    singleCall,
    subworkflowParentId
  )

  const singleCallObj = calls[singleCall]
  singleCallObj["callableWorkflowName"] = callableWorkflowName
  singleCallObj["parent"] = subworkflowParentId
  nodeDictionary[newSingleCallName] = singleCallObj
}

/**
 * Checks if a single call from the metadata contains a subworkflow.
 * @param {String} singleCall
 * @param {Object} calls
 * @returns {Boolean}
 */
const isThereSubworkflow = (singleCall, calls) => {
  const doesAtLeastOneIndexHaveASubworkflow = calls[singleCall].some(index => {
    return Object.prototype.hasOwnProperty.call(index, "subWorkflowMetadata")
  })
  return doesAtLeastOneIndexHaveASubworkflow
}

/**
 * Flattens a subworkflow into a map without nested maps.
 *
 * @param {String} singleCall
 * @param {Object} calls
 * @param {Object} nodeDictionary
 * @param {String} previousSubworkflowParentId
 */
const recursivelyFlattenSubworkflow = (
  singleCall,
  calls,
  nodeDictionary,
  previousSubworkflowParentId
) => {
  calls[singleCall].forEach(index => {
    const subworkflowMetadata = index.subWorkflowMetadata
    const subworkflowCalls = subworkflowMetadata.calls
    const callableWorkflowName = subworkflowMetadata.workflowName

    const subworkflowParentId = createNodeIdFromMetadata(
      singleCall,
      previousSubworkflowParentId
    )

    flattenASingleCall(
      subworkflowCalls,
      nodeDictionary,
      subworkflowParentId,
      callableWorkflowName
    )
  })
}

/**
 *
 * Converts a nested object with properties within properties to a flat map in which there is only one
 * level of key, value pairs.
 * @param {Object} calls
 * @param {Object} nodeDictionary
 * @param {String} subworkflowParentId
 * @param {String} callableWorkflowName
 */
const flattenASingleCall = (
  calls,
  nodeDictionary,
  subworkflowParentId,
  callableWorkflowName
) => {
  const filteredCallsForProperty = Object.keys(calls).filter(singleCall => {
    return Object.prototype.hasOwnProperty.call(calls, singleCall)
  })

  filteredCallsForProperty.forEach(singleCall => {
    addCallToDictionary(
      singleCall,
      calls,
      nodeDictionary,
      subworkflowParentId,
      callableWorkflowName
    )
  })

  const callsContainingSubworkflows = filteredCallsForProperty.filter(
    singleCall => {
      return isThereSubworkflow(singleCall, calls)
    }
  )

  callsContainingSubworkflows.forEach(singleCall => {
    recursivelyFlattenSubworkflow(
      singleCall,
      calls,
      nodeDictionary,
      subworkflowParentId
    )
  })
}

/**
 *
 * Returns a single status for a node based on its children because a parent node does not contain a status in the metadata.
 *  The status of a parent must be inferred from the status of its children.
 *
 * When there are multiple statuses from its children, the chosen status to be displayed in a parent is ranked in terms of
 * importance. Failed status are the most important, then running, then done.
 *
 * @param {Object} singleCallObj
 * @returns {String}
 */
const summarizeShardStatus = singleCallObj => {
  return singleCallObj.reduce((summarizedStatus, singleShard) => {
    const wordValueDict = { Done: 1, Running: 2, Failed: 3 }
    return wordValueDict[singleShard.executionStatus] >
      wordValueDict[summarizedStatus]
      ? singleShard.executionStatus
      : summarizedStatus
  }, "Done")
}

/**
 * Find the status of a call.
 * @param {Object} singleCallObj
 * @returns {String}
 */
const findStatus = singleCallObj => {
  let status
  if (Array.isArray(singleCallObj)) {
    if (singleCallObj.length === 1) {
      status = singleCallObj[0].executionStatus
    } else {
      status = summarizeShardStatus(singleCallObj)
    }
  } else {
    status = singleCallObj.executionStatus
  }
  return status
}

/**
 * Finds the parent type associated with an object
 * @param {Object} singleCallObj
 * @returns {String}
 */
const findParentType = singleCallObj => {
  let parentType = null
  if (Array.isArray(singleCallObj)) {
    if (singleCallObj.length > 1) {
      parentType = "scatterParent"
    } else if (
      Object.prototype.hasOwnProperty.call(
        singleCallObj[0],
        "subWorkflowMetadata"
      )
    ) {
      parentType = "subworkflow"
    }
  } else {
    if (
      Object.prototype.hasOwnProperty.call(singleCallObj, "subWorkflowMetadata")
    ) {
      parentType = "subworkflow"
    }
  }

  return parentType
}

/**
 * Parses singleCallObject and returns the status and parentType in an Object
 * @param {Object} singleCallObj
 * @returns {Object}
 */
const computeDataObj = singleCallObj => {
  const status = findStatus(singleCallObj)
  const parentType = findParentType(singleCallObj)

  const dataObj = { status: status, parentType: parentType }

  return dataObj
}

/**
 *
 * Add node data into statusDictionary.
 *
 * @param {Object} statusDictionary
 * @param {String} singleCallName
 * @param {Object} metadataDictionary
 */
const buildNonShardData = (
  statusDictionary,
  singleCallName,
  metadataDictionary
) => {
  const singleCallObj = metadataDictionary[singleCallName]
  const dataObj = computeDataObj(singleCallObj)
  statusDictionary[singleCallName] = dataObj
}
/**
 * computedataobj is just looking the scatterparent of the
 * shard to create the data of the scatter obj.
 *
 * This is wrong. However, at the same time, I believe I wrote this the first time
 * so you could handle the case of individual scatters being scatterParents themselves.
 * So we need to be able to handle both cases.
 */
const buildShardData = (
  statusDictionary,
  singleCallName,
  metadataDictionary
) => {
  const singleCallObj = metadataDictionary[singleCallName]

  if (singleCallObj.length > 1) {
    singleCallObj.forEach(shardObj => {
      const dataObj = computeDataObj(shardObj)
      const shardId = createShardId(singleCallName, shardObj)
      statusDictionary[shardId] = dataObj
    })
  }
}

/**
 * Function flattens metadata into a dictionary that maps a node name to its individual data rather than
 * having objects nested and nested into one another.
 * @param {Object} metadata
 * @returns {Object}
 */
export const returnFlattenedMetadataDictionary = metadata => {
  const flattenedMetadataDictionary = {}
  const calls = metadata.calls

  flattenASingleCall(calls, flattenedMetadataDictionary, null, null)
  const returnMetadataDictionary = Object.assign(
    {},
    flattenedMetadataDictionary
  )
  return returnMetadataDictionary
}

/**
 * Returns a dictionary such that the keys are node ids and the values are objects that contain
 * data related to that node id.
 * @param {Object} metadata
 * @returns {Object}
 */
export const returnDataDictionary = metadata => {
  const metadataDictionary = returnFlattenedMetadataDictionary(metadata)
  return Object.keys(metadataDictionary).reduce(
    (statusDictionary, singleCallName) => {
      buildNonShardData(statusDictionary, singleCallName, metadataDictionary)
      buildShardData(statusDictionary, singleCallName, metadataDictionary)
      return statusDictionary
    },
    {}
  )
}

/**
 * Builds and returns a properly formatted shard id
 * @param {String} parentOfShardId
 * @param {Object} shardObj
 * @returns {String}
 */
export const createShardId = (parentOfShardId, shardObj) => {
  const shardIndex = shardObj === null ? null : shardObj.shardIndex
  return buildShardIdText(parentOfShardId, shardIndex)
}
