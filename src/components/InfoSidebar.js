import React, { Component } from "react"
import "../InfoSidebar.css"
import ReactLoading from "react-loading"

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

      <select value={props.layout} onChange={props.changeLayout}>
        <option value="breadthfirst">Breadthfirst</option>
        <option value="circle">Circle</option>
        <option value="grid">Grid</option>
        <option value="random">Random</option>
        <option value="dagre">Left Right DAG</option>
        <option value="klay">Klay</option>
      </select>

      <button onClick={props.toggleView}>{props.buttonText}</button>

      <button onClick={props.fitFnc}>Fit</button>

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
      <div>
        <p>Status: {props.currentStatus} </p>

        {props.loader}
      </div>

      <ColorStatusList />
    </div>
  )
}

class InfoSidebar extends Component {
  constructor(props) {
    super(props)

    this.changeLayout = this.changeLayout.bind(this)
  }

  changeLayout(event) {
    this.props.changeLayout(event.target.value)
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

    let loader = null
    if (currentStatus === "Submitted" || currentStatus === "Running") {
      loader = <ReactLoading type="bars" color="blue" height={30} width={30} />
    }

    let displayName = null
    let displayData = null
    if (this.props.currentSelectedNodeData !== null) {
      const nodeDataObj = JSON.parse(this.props.currentSelectedNodeData)
      displayName = nodeDataObj.id
      displayData = this.props.currentSelectedNodeData
    }

    const buttonText = this.props.isBasicView
      ? "Toggle Detailed View"
      : "Toggle Basic View"

    return (
      <RenderInfoSidebarUI
        selectedNode={displayName}
        data={displayData}
        layout={this.props.layout}
        changeLayout={this.changeLayout}
        workflowID={id}
        startTime={startWorkflow}
        endTime={endWorkflow}
        currentStatus={currentStatus}
        toggleView={this.props.toggleViewFnc}
        buttonText={buttonText}
        fitFnc={this.props.fitFnc}
        loader={loader}
      />
    )
  }
}

export default InfoSidebar
