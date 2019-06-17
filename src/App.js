import React from 'react'
import logo from './logo.svg'
import './App.css'
// import Parent from './Parent'
// import ParentV2 from './ParentV2'
import ParentV3 from './ParentV3'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {

    }
  }

  render () {
    return (
      <div className="App">
        <header className="App-header">
          <ParentV3 />
        </header>
      </div>
    )
  }
}

export default App
