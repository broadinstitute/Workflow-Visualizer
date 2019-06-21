var axios = require('axios')

module.exports = {
  fetchMetadata: function (workflowID) {
    var encodedURI = window.encodeURI('/api/workflows/v1/' + workflowID + '/metadata?expandSubWorkflows=true')
    return axios.get(encodedURI)
      .then(function (response) {
        return response
      })
  }
}
