import React, { Component } from 'react'
import CytoscapeView from './CytoscapeView'
import '../MainGraphView.css'
var DetailedNodeView = require('./InfoSidebar')
var parse = require('dotparser')
var api = require('../utils/api')

class MainGraphView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tappedNode: '',
      metadata: ''
    }

    this.graph = React.createRef()

    this.readDotFile = this.readDotFile.bind(this)
    this.updateSelectedNode = this.updateSelectedNode.bind(this)
    this.chooseLayout = this.chooseLayout.bind(this)
    this.changeLayout = this.changeLayout.bind(this)
  }

  updateSelectedNode (nodeID) {
    this.setState({
      tappedNode: nodeID
    })
  }

  changeLayout (layoutType) {
    var myCy = this.graph.current.getCy()
    myCy.layout({
      name: layoutType
    }).run()
  }

  readDotFile (cy) {
    var singleDOT = 'graph Dab {"Dab"}'
    var simpleDOT = 'digraph G { "Welcome" -> "To" "To" -> "Web" "To" -> "GraphViz!" }'
    var hardDOT = 'digraph forkjoin { "call forkjoin.grep" -> "String forkjoin.grep.pattern" "call forkjoin.grep" -> "output { forkjoin.grep.count = read_int(stdout()) }" "call forkjoin.grep" -> "File forkjoin.grep.in_file" "call forkjoin.wc" -> "output { forkjoin.wc.count = read_int(stdout()) }" "call forkjoin.grep" -> "call forkjoin.join" "call forkjoin.wc" -> "File forkjoin.wc.in_file" "call forkjoin.mkFile" -> "call forkjoin.grep" "call forkjoin.join" -> "output { forkjoin.join.proportion = read_int(stdout()) }" "call forkjoin.join" -> "Int forkjoin.join.wcCount" "call forkjoin.wc" -> "call forkjoin.join" "call forkjoin.mkFile" -> "output { forkjoin.mkFile.numbers = stdout() }" "call forkjoin.mkFile" -> "call forkjoin.wc" "call forkjoin.join" -> "Int forkjoin.join.grepCount" }'
    var longDOT = 'digraph prof { ratio = fill; node [style=filled]; start -> main [color="0.002 0.999 0.999"]; start -> on_exit [color="0.649 0.701 0.701"]; main -> sort [color="0.348 0.839 0.839"]; main -> merge [color="0.515 0.762 0.762"]; main -> term [color="0.647 0.702 0.702"]; main -> signal [color="0.650 0.700 0.700"]; main -> sbrk [color="0.650 0.700 0.700"]; main -> unlink [color="0.650 0.700 0.700"]; main -> newfile [color="0.650 0.700 0.700"]; main -> fclose [color="0.650 0.700 0.700"]; main -> close [color="0.650 0.700 0.700"]; main -> brk [color="0.650 0.700 0.700"]; main -> setbuf [color="0.650 0.700 0.700"]; main -> copyproto [color="0.650 0.700 0.700"]; main -> initree [color="0.650 0.700 0.700"]; main -> safeoutfil [color="0.650 0.700 0.700"]; main -> getpid [color="0.650 0.700 0.700"]; main -> sprintf [color="0.650 0.700 0.700"]; main -> creat [color="0.650 0.700 0.700"]; main -> rem [color="0.650 0.700 0.700"]; main -> oldfile [color="0.650 0.700 0.700"]; sort -> msort [color="0.619 0.714 0.714"]; sort -> filbuf [color="0.650 0.700 0.700"]; sort -> newfile [color="0.650 0.700 0.700"]; sort -> fclose [color="0.650 0.700 0.700"]; sort -> setbuf [color="0.650 0.700 0.700"]; sort -> setfil [color="0.650 0.700 0.700"]; msort -> qsort [color="0.650 0.700 0.700"]; msort -> insert [color="0.650 0.700 0.700"]; msort -> wline [color="0.650 0.700 0.700"]; msort -> div [color="0.650 0.700 0.700"]; msort -> cmpsave [color="0.650 0.700 0.700"]; merge -> insert [color="0.650 0.700 0.700"]; merge -> rline [color="0.650 0.700 0.700"]; merge -> wline [color="0.650 0.700 0.700"]; merge -> unlink [color="0.650 0.700 0.700"]; merge -> fopen [color="0.650 0.700 0.700"]; merge -> fclose [color="0.650 0.700 0.700"]; merge -> setfil [color="0.650 0.700 0.700"]; merge -> mul [color="0.650 0.700 0.700"]; merge -> setbuf [color="0.650 0.700 0.700"]; merge -> cmpsave [color="0.650 0.700 0.700"]; insert -> cmpa [color="0.650 0.700 0.700"]; wline -> flsbuf [color="0.649 0.700 0.700"]; qsort -> cmpa [color="0.650 0.700 0.700"]; rline -> filbuf [color="0.649 0.700 0.700"]; xflsbuf -> write [color="0.650 0.700 0.700"]; flsbuf -> xflsbuf [color="0.649 0.700 0.700"]; filbuf -> read [color="0.650 0.700 0.700"]; term -> unlink [color="0.650 0.700 0.700"]; term -> signal [color="0.650 0.700 0.700"]; term -> setfil [color="0.650 0.700 0.700"]; term -> exit [color="0.650 0.700 0.700"]; endopen -> open [color="0.650 0.700 0.700"]; fopen -> endopen [color="0.639 0.705 0.705"]; fopen -> findiop [color="0.650 0.700 0.700"]; newfile -> fopen [color="0.634 0.707 0.707"]; newfile -> setfil [color="0.650 0.700 0.700"]; fclose -> fflush [color="0.642 0.704 0.704"]; fclose -> close [color="0.650 0.700 0.700"]; fflush -> xflsbuf [color="0.635 0.707 0.707"]; malloc -> morecore [color="0.325 0.850 0.850"]; malloc -> demote [color="0.650 0.700 0.700"]; morecore -> sbrk [color="0.650 0.700 0.700"]; morecore -> getfreehdr [color="0.650 0.700 0.700"]; morecore -> free [color="0.650 0.700 0.700"]; morecore -> getpagesize [color="0.650 0.700 0.700"]; morecore -> putfreehdr [color="0.650 0.700 0.700"]; morecore -> udiv [color="0.650 0.700 0.700"]; morecore -> umul [color="0.650 0.700 0.700"]; on_exit -> malloc [color="0.325 0.850 0.850"]; signal -> sigvec [color="0.650 0.700 0.700"]; moncontrol -> profil [color="0.650 0.700 0.700"]; getfreehdr -> sbrk [color="0.650 0.700 0.700"]; free -> insert [color="0.650 0.700 0.700"]; insert -> getfreehdr [color="0.650 0.700 0.700"]; setfil -> div [color="0.650 0.700 0.700"]; setfil -> rem [color="0.650 0.700 0.700"]; sigvec -> sigblock [color="0.650 0.700 0.700"]; sigvec -> sigsetmask [color="0.650 0.700 0.700"]; doprnt -> urem [color="0.650 0.700 0.700"]; doprnt -> udiv [color="0.650 0.700 0.700"]; doprnt -> strlen [color="0.650 0.700 0.700"]; doprnt -> localeconv [color="0.650 0.700 0.700"]; sprintf -> doprnt [color="0.650 0.700 0.700"]; cmpa [color="0.000 1.000 1.000"]; wline [color="0.201 0.753 1.000"]; insert [color="0.305 0.625 1.000"]; rline [color="0.355 0.563 1.000"]; sort [color="0.408 0.498 1.000"]; qsort [color="0.449 0.447 1.000"]; write [color="0.499 0.386 1.000"]; read [color="0.578 0.289 1.000"]; msort [color="0.590 0.273 1.000"]; merge [color="0.603 0.258 1.000"]; unlink [color="0.628 0.227 1.000"]; filbuf [color="0.641 0.212 1.000"]; open [color="0.641 0.212 1.000"]; sbrk [color="0.647 0.204 1.000"]; signal [color="0.647 0.204 1.000"]; moncontrol [color="0.647 0.204 1.000"]; xflsbuf [color="0.650 0.200 1.000"]; flsbuf [color="0.650 0.200 1.000"]; div [color="0.650 0.200 1.000"]; cmpsave [color="0.650 0.200 1.000"]; rem [color="0.650 0.200 1.000"]; setfil [color="0.650 0.200 1.000"]; close [color="0.650 0.200 1.000"]; fclose [color="0.650 0.200 1.000"]; fflush [color="0.650 0.200 1.000"]; setbuf [color="0.650 0.200 1.000"]; endopen [color="0.650 0.200 1.000"]; findiop [color="0.650 0.200 1.000"]; fopen [color="0.650 0.200 1.000"]; mul [color="0.650 0.200 1.000"]; newfile [color="0.650 0.200 1.000"]; sigblock [color="0.650 0.200 1.000"]; sigsetmask [color="0.650 0.200 1.000"]; sigvec [color="0.650 0.200 1.000"]; udiv [color="0.650 0.200 1.000"]; urem [color="0.650 0.200 1.000"]; brk [color="0.650 0.200 1.000"]; getfreehdr [color="0.650 0.200 1.000"]; strlen [color="0.650 0.200 1.000"]; umul [color="0.650 0.200 1.000"]; doprnt [color="0.650 0.200 1.000"]; copyproto [color="0.650 0.200 1.000"]; creat [color="0.650 0.200 1.000"]; demote [color="0.650 0.200 1.000"]; exit [color="0.650 0.200 1.000"]; free [color="0.650 0.200 1.000"]; getpagesize [color="0.650 0.200 1.000"]; getpid [color="0.650 0.200 1.000"]; initree [color="0.650 0.200 1.000"]; insert [color="0.650 0.200 1.000"]; localeconv [color="0.650 0.200 1.000"]; main [color="0.650 0.200 1.000"]; malloc [color="0.650 0.200 1.000"]; morecore [color="0.650 0.200 1.000"]; oldfile [color="0.650 0.200 1.000"]; on_exit [color="0.650 0.200 1.000"]; profil [color="0.650 0.200 1.000"]; putfreehdr [color="0.650 0.200 1.000"]; safeoutfil [color="0.650 0.200 1.000"]; sprintf [color="0.650 0.200 1.000"]; term [color="0.650 0.200 1.000"]; }'
    var tutorialCombineDot = 'digraph SimpleVariantDiscovery { compound=true; "call selectIndels" -> "call hardFilterIndel" "call selectSNPs" -> "call hardFilterSNP" "call haplotypeCaller" -> "call selectSNPs" "call hardFilterIndel" -> "call combine" "call haplotypeCaller" -> "call selectIndels" "call hardFilterSNP" -> "call combine" "call selectSNPs" "call haplotypeCaller" "call selectIndels" "call combine" "call hardFilterSNP" "call hardFilterIndel" }'

    var ast = parse(tutorialCombineDot)

    var childArray = ast[0].children

    for (var i = 0; i < childArray.length; i++) {
      // var child = childArray[i].edge_list
      var child = childArray[i]

      if (child.type === 'attr_stmt') {
        // do nothing for now. Later, we can consider messing with the CSS and displaying, but that seems more trouble than its worth.
      } else if (child.type === 'node_stmt') {
        var node_id = child.node_id.id
        cy.add([{ group: 'nodes', data: { id: node_id, name: node_id }, position: { x: 0, y: 0 } }])
      } else if (child.type === 'edge_stmt') {
        var fromNode = child.edge_list[0]
        var toNode = child.edge_list[1]
        cy.add([
          { group: 'nodes', data: { id: fromNode.id, name: fromNode.id }, position: { x: 0, y: 0 } },
          { group: 'nodes', data: { id: toNode.id, name: toNode.id }, position: { x: 0, y: 0 } },
          { group: 'edges', data: { id: 'edge' + i, source: fromNode.id, target: toNode.id } }
        ])
      } else {
        console.warn('Unrecognized dot format')
      }
    }
  }

  chooseLayout (text) {
    console.log(text)
    if (text !== 'breadthfirst' && text !== 'circle' && text !== 'grid' && text !== 'random') {
      console.warn('\"' + text + '\" is an invalid layout format')
    } else {
      this.changeLayout(text)
    }
  }

  componentDidMount () {
    // this is a good place for events
    // this.refs.graph.getCy().on(....)
    var refCy = this.graph.current.getCy()

    refCy.add([
      { group: 'nodes', data: { id: 'hello', name: 'hello', status: 'PENDING' }, position: { x: 0, y: 0 } },
      { group: 'nodes', data: { id: 'bye', name: 'bye', status: 'RECEIVED' }, position: { x: 0, y: 0 } },
      { group: 'edges', data: { id: 'edge', source: 'hello', target: 'bye' } }
    ])

    this.readDotFile(refCy)

    var thisComponent = this

    refCy.on('tapend', 'node', function (evt) {
      var node = evt.target
      thisComponent.updateSelectedNode(node.id())
    })

    refCy.layout({
      name: 'breadthfirst'
    }).run()

    api.fetchMetadata('85d710ba-cf2c-4a40-9ab9-b825f506222c')
      .then(function (jsonMetadata) {
        console.log(jsonMetadata)
        this.setState({
          metadata: jsonMetadata
        })
      }.bind(this))
  }

  render () {
    return (

      <div className='flexbox-container'>
        <CytoscapeView className="cyto-model" ref={this.graph} elements={[{ data: { id: 'a', name: 'a' } }]} />
        <DetailedNodeView className="node-view" selectedNode={this.state.tappedNode} chooseLayout={this.chooseLayout} metadata={this.state.metadata}/>
      </div>

    )
  }
}

export default MainGraphView
