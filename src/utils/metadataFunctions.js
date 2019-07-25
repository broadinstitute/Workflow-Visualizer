import { createNodeIdFromMetadata, buildShardIdText } from "./idGeneration"

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

const isThereSubworkflow = (singleCall, calls) => {
  const doesAtLeastOneIndexHaveASubworkflow = calls[singleCall].some(index => {
    return Object.prototype.hasOwnProperty.call(index, "subWorkflowMetadata")
  })
  return doesAtLeastOneIndexHaveASubworkflow
}

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

const summarizeShardStatus = singleCallObj => {
  return singleCallObj.reduce((summarizedStatus, singleShard) => {
    const wordValueDict = { Done: 1, Running: 2, Failed: 3 }
    return wordValueDict[singleShard.executionStatus] >
      wordValueDict[summarizedStatus]
      ? singleShard.executionStatus
      : summarizedStatus
  }, "Done")
}

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

const computeDataObj = singleCallObj => {
  const status = findStatus(singleCallObj)
  const parentType = findParentType(singleCallObj)

  const dataObj = { status: status, parentType: parentType }

  return dataObj
}

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
 * @param {*Object} metadata
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

export const createShardId = (parentOfShardId, shardObj) => {
  const shardIndex = shardObj === null ? null : shardObj.shardIndex
  return buildShardIdText(parentOfShardId, shardIndex)
}
