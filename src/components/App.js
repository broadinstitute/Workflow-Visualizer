import React from "react"
// import Parent from './Parent'
// import ParentV2 from './ParentV2'
import MainGraphView from "./MainGraphView"

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <MainGraphView />
        </header>
      </div>
    )
  }
}

export default App
