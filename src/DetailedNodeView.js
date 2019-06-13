var React = require('react')

let divStyle = {
  height: '100%',
  width: '20%',
  background: 'white'

}

class DetailedNodeView extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div className="detailed-node-div" style={divStyle}>
        <h3>Close View</h3>
        <p>You've selected node {this.props.selectedNode}</p>
        <select>
          <option value="Breadthfirst">Breadthfirst</option>
          <option value="Circle">Circle</option>
          <option value="Grid">Grid</option>
          <option value="random">Random</option>
        </select>

      </div>

    )
  }
}

module.exports = DetailedNodeView
