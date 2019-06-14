var React = require('react')

let divStyle = {
  height: '100%',
  width: '20%',
  background: 'white'

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
      <div className="detailed-node-div" style={divStyle}>
        <h3>Close View</h3>
        <p>You've selected node {this.props.selectedNode}</p>
        <select value={this.state.currentSelectValue} onChange={this.changeLayout}>
          <option value="breadthfirst">Breadthfirst</option>
          <option value="circle">Circle</option>
          <option value="grid">Grid</option>
          <option value="random">Random</option>
        </select>

      </div>

    )
  }
}

module.exports = DetailedNodeView
