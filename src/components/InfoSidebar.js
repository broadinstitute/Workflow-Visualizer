var React = require('react')

let divStyle = {
  height: '100%',
  width: '20%',
  background: 'white',
  padding: '0px 0px 0px 10px'
}

function RenderInfoSidebarUI (props) {
  var circleStyle = {
    width: 50,
    height: 50,
    borderRadius: 100 / 2,
    backgroundColor: '#bf00ff'
  }

  return (
    <div className="detailed-node-div" style={divStyle}>
      <h3>Close View</h3>
      <select value={props.currentSelectValue} onChange={props.changeLayout}>
        <option value="breadthfirst">Breadthfirst</option>
        <option value="cose">Cose</option>
        <option value="circle">Circle</option>
        <option value="grid">Grid</option>
        <option value="random">Random</option>
      </select>
      <p>You've selected node <strong>"{props.selectedNode}"</strong></p>
      <div style={circleStyle}></div>
      <p>Workflow ID: {props.workflowID}</p>
      <p>Start Time: {props.startTime} | End Time: {props.endTime}</p>
      <p>Status: {props.currentStatus}</p>
    </div>
  )
}

class InfoSidebar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      currentSelectValue: 'breadthfirst'
    }
    this.changeLayout = this.changeLayout.bind(this)
  }

  changeLayout (event) {
    this.setState({
      currentSelectValue: event.target.value
    })
    this.props.chooseLayout(event.target.value)
  }

  render () {
    var id = null
    var startWorkflow = null
    var endWorkflow = null
    var currentStatus = null

    if (this.props.metadata !== null) {
      id = this.props.metadata.data.id
      startWorkflow = this.props.metadata.data.start
      endWorkflow = this.props.metadata.data.end
      currentStatus = this.props.metadata.data.status
    }

    return (
      <RenderInfoSidebarUI selectedNode= {this.props.selectedNode}
        currentSelectValue = {this.state.currentSelectValue}
        changeLayout = {this.changeLayout} workflowID = {id}
        startTime = {startWorkflow} endTime = {endWorkflow}
        currentStatus = {currentStatus}/>
    )
  }
}

module.exports = InfoSidebar
