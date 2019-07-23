import React, { Component } from "react"
import "../InfoSidebar.css"

function SingleColorStatus(props) {
  const circleStyle = {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: props.colorValue
  }

  return (
    <div>
      <strong>{props.statusName}: </strong>
      <div className="circle-logo" style={circleStyle} />
    </div>
  )
}

function ColorStatusList() {
  const statusColorMap = {
    Done: "#000000",
    Uninitalized: "#bf00ff",
    Failed: "#ff0000",
    Running: "#00b200"
  }
  return (
    <div>
      <ol className="no-bullet-list">
        {Object.keys(statusColorMap).map(key => {
          const colorValue = statusColorMap[key]
          return (
            <li key={key}>
              <SingleColorStatus statusName={key} colorValue={colorValue} />
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function RenderInfoSidebarUI(props) {
  return (
    <div className="detailed-node-div">
      <h3>Close View</h3>
      <select value={props.currentSelectValue} onChange={props.changeLayout}>
        <option value="cose">Cose</option>
        <option value="breadthfirst">Breadthfirst</option>
        <option value="circle">Circle</option>
        <option value="grid">Grid</option>
        <option value="random">Random</option>
      </select>
      <p>
        You've selected node <strong>"{props.selectedNode}"</strong>
      </p>
      <p className="data-display">
        <strong>Node Data: </strong> {props.data}
      </p>

      <p>Workflow ID: {props.workflowID}</p>
      <p>
        Start Time: {props.startTime} | End Time: {props.endTime}
      </p>
      <p>Status: {props.currentStatus}</p>

      <ColorStatusList />
    </div>
  )
}

class InfoSidebar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      currentSelectValue: "circle"
    }
    this.changeLayout = this.changeLayout.bind(this)
  }

  changeLayout(event) {
    this.setState({
      currentSelectValue: event.target.value
    })
    this.props.chooseLayout(event.target.value)
  }

  render() {
    var id = null
    var startWorkflow = null
    var endWorkflow = null
    var currentStatus = null

    if (this.props.metadata !== null) {
      id = this.props.metadata.id
      startWorkflow = this.props.metadata.start
      endWorkflow = this.props.metadata.end
      currentStatus = this.props.metadata.status
    }

    let displayName = null
    let displayData = null
    if (this.props.currentSelectedNodeData !== null) {
      const nodeDataObj = JSON.parse(this.props.currentSelectedNodeData)
      displayName = nodeDataObj.id
      displayData = this.props.currentSelectedNodeData
    }

    return (
      <RenderInfoSidebarUI
        selectedNode={displayName}
        data={displayData}
        currentSelectValue={this.state.currentSelectValue}
        changeLayout={this.changeLayout}
        workflowID={id}
        startTime={startWorkflow}
        endTime={endWorkflow}
        currentStatus={currentStatus}
      />
    )
  }
}

export default InfoSidebar
