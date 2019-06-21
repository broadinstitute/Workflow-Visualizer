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
  var stringMetadata = JSON.stringify(props.metadata)
  return (
    <div className="detailed-node-div" style={divStyle}>
      <h3>Close View</h3>
      <select value={props.currentSelectValue} onChange={props.changeLayout}>
        <option value="breadthfirst">Breadthfirst</option>
        <option value="circle">Circle</option>
        <option value="grid">Grid</option>
        <option value="random">Random</option>
      </select>
      <p>You've selected node <strong>"{props.selectedNode}"</strong></p>
      <div style={circleStyle}></div>
      <p>{stringMetadata}</p>

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
    return (
      <RenderInfoSidebarUI selectedNode= {this.props.selectedNode}
        currentSelectValue = {this.state.currentSelectValue}
        changeLayout = {this.changeLayout} metadata={this.props.metadata}/>
    )
  }
}

module.exports = InfoSidebar
