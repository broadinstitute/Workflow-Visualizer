const addCallToDictionary = (
  singleCall,
  calls,
  nodeDictionary,
  subworkflowParentId,
  callableWorkflowName
) => {
  let newSingleCallName
  if (subworkflowParentId === null) {
    newSingleCallName = singleCall
  } else {
    newSingleCallName = `${subworkflowParentId}>${singleCall}`
  }
  const singleCallObj = calls[singleCall]
  singleCallObj["callableWorkflowName"] = callableWorkflowName
  singleCallObj["parent"] = subworkflowParentId
  nodeDictionary[newSingleCallName] = singleCallObj
}

const isThereSubworkflow = (singleCall, calls) => {
  const bool = calls[singleCall].some(index => {
    return Object.prototype.hasOwnProperty.call(index, "subWorkflowMetadata")
  })
  return bool

  // return calls[singleCall].some(index => {
  //   return Object.prototype.hasOwnProperty.call(index, "subWorkflowMetadata")
  // })
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

    const subworkflowParentId =
      previousSubworkflowParentId === null
        ? singleCall
        : `${previousSubworkflowParentId}>${singleCall}`
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

const buildNonShardStatuses = (
  statusDictionary,
  singleCallName,
  metadataDictionary
) => {
  const singleCallObj = metadataDictionary[singleCallName]
  const status =
    singleCallObj.length === 1
      ? singleCallObj[0].executionStatus
      : summarizeShardStatus(singleCallObj)

  statusDictionary[singleCallName] = status
}

const buildShardStatuses = (
  statusDictionary,
  singleCallName,
  metadataDictionary
) => {
  const singleCallObj = metadataDictionary[singleCallName]

  if (singleCallObj.length > 1) {
    singleCallObj.forEach(shardObj => {
      const shardStatus = shardObj.executionStatus
      const shardIndex = shardObj.shardIndex
      const shardName = `${singleCallName}_shard_${shardIndex}`
      statusDictionary[shardName] = shardStatus
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
  const calls = metadata.data.calls

  flattenASingleCall(calls, flattenedMetadataDictionary, null, null)
  const returnMetadataDictionary = Object.assign(
    {},
    flattenedMetadataDictionary
  )
  return returnMetadataDictionary
}

export const returnStatusDictionary = metadata => {
  const metadataDictionary = returnFlattenedMetadataDictionary(metadata)
  Object.keys(metadataDictionary).reduce((statusDictionary, singleCallName) => {
    buildNonShardStatuses(statusDictionary, singleCallName, metadataDictionary)
    buildShardStatuses(statusDictionary, singleCallName, metadataDictionary)
    return statusDictionary
  }, {})
}
