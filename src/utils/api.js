import * as axios from "axios"

export const fetchMetadata = workflowID => {
  var encodedURI = window.encodeURI(
    "/api/workflows/v1/" + workflowID + "/metadata?expandSubWorkflows=true"
  )

  return axios.get(encodedURI).then(function(response) {
    return response.data
  })
}

export const queryWorkflows = () => {
  const uriEndpoint = window.encodeURI(
    "/api/workflows/v1/query?includeSubworkflows=false"
  )

  return axios.get(uriEndpoint).then(response => {
    return response.data
  })
}
