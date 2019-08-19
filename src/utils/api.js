import * as axios from "axios"
/**
 * Gets metadata based on a workflowId
 * @param {String} workflowID
 * @returns {Object}
 */
export const fetchMetadata = workflowID => {
  var encodedURI = window.encodeURI(
    "/api/workflows/v1/" + workflowID + "/metadata?expandSubWorkflows=true"
  )

  return axios.get(encodedURI).then(function(response) {
    return response.data
  })
}
/**
 * A function that fetches a list of workflows ran on an instance of cromwell.
 * @returns {Object}
 */
export const queryWorkflows = () => {
  const uriEndpoint = window.encodeURI(
    "/api/workflows/v1/query?includeSubworkflows=false"
  )

  return axios.get(uriEndpoint).then(response => {
    return response.data
  })
}
