import React from 'react'
import logo from './logo.svg'
import './App.css'
import Parent from './Parent'

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
          <Parent />
        </header>
      </div>
    )
  }
}

export default App
