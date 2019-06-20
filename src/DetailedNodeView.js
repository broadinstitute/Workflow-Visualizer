var React = require('react')

let divStyle = {
  height: '100%',
  width: '20%',
  background: 'white'
}

function CreateSidebarUI (props) {
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
        <option value="circle">Circle</option>
        <option value="grid">Grid</option>
        <option value="random">Random</option>
      </select>
      <p>You've selected node {props.selectedNode}</p>
      <div style={circleStyle}></div>

    </div>
  )
}

class DetailedNodeView extends React.Component {
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
      <CreateSidebarUI selectedNode= {this.props.selectedNode}
        currentSelectValue = {this.state.currentSelectValue}
        changeLayout = {this.changeLayout} />
    )
  }
}

module.exports = DetailedNodeView
