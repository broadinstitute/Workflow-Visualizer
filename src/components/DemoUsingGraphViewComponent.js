import React from "react"
// import Parent from './Parent'
// import ParentV2 from './ParentV2'
import GraphView from "./GraphView"
import * as dotFiles from "../utils/dotFiles"
import * as api from "../utils/api"

/**
 * This is a sample usage of the graphview component.
 * The only thing you will need to do is input the workflowId of the current workflow.
 * Right now, we are inputting the latest workflow ran on localhost:8080.
 *
 * You should check the api file to see the calls. The only thing that might need to be changed
 * is the precise url of the call.
 */
class DemoUsingGraphViewComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      workflowId: null
    }
  }

  componentDidMount() {
    api.queryWorkflows().then(response => {
      this.setState({
        workflowId: response.results[0].id
      })
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <GraphView workflowId={this.state.workflowId} />
        </header>
      </div>
    )
  }
}

export default DemoUsingGraphViewComponent
