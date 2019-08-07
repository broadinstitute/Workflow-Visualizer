import React, { Component } from "react"
import ReactLoading from "react-loading"
import Container from "@material-ui/core/Container"
import Typography from "@material-ui/core/Typography"
import List from "@material-ui/core/List"
import {
  ListItem,
  Divider,
  Select,
  MenuItem,
  Button,
  FormControlLabel,
  Grid,
  FormControl,
  Checkbox,
  FormGroup,
  FormLabel,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails
} from "@material-ui/core"
import "../Sidebar.css"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { Done, Error } from "@material-ui/icons"

/**
 * Sidebar presents additional information about the workflow and controls.
 */

const ControlPanel = props => {
  return (
    <List>
      <ListItem>
        <Typography variant="h6" align="center">
          Job Manager Visualization
        </Typography>
      </ListItem>
      <Divider />
      <Typography style={{ padding: "10px 15px 0px 15px" }}>
        Current Node: <strong>{props.selectedNode}</strong>
      </Typography>
      <ListItem>
        <Typography>Status: </Typography>
        {props.status}
        {/* <ReactLoading type="bars" color="blue" height={30} width={30} /> */}
      </ListItem>
      <ListItem>
        <Grid container direction="row" alignItems="center" spacing={1}>
          <Grid item>
            <Typography>Layout: </Typography>
          </Grid>
          <Grid item>
            <Select
              value={props.layout}
              color="primary"
              onChange={props.changeLayout}
            >
              <MenuItem value="breadthfirst">Breadthfirst</MenuItem>
              <MenuItem value="circle">Circle</MenuItem>
              <MenuItem value="grid">Grid</MenuItem>
              <MenuItem value="random">Random</MenuItem>
              <MenuItem value="dagre">Left Right DAG</MenuItem>
              <MenuItem value="klay">Klay</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </ListItem>
      <ListItem>
        <FormControl>
          <FormLabel component="legend" align="center">
            Enable
          </FormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={props.enableAnimation}
                  onChange={props.toggleAnimation}
                  //   value="checkedA"
                  color="primary"
                />
              }
              label="Animation"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={props.viewBoolean}
                  onChange={props.changeViewTypeFnc}
                  //   value="checkedA"
                  color="primary"
                />
              }
              label="Detailed View"
            />
          </FormGroup>
          <FormLabel component="legend" align="center">
            Enforce
          </FormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={props.enforceLayoutBoolean}
                  onChange={props.toggleEnforceLayoutFnc}
                  //   value="checkedA"
                  color="primary"
                />
              }
              label="Layout"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={props.enforceFitBoolean}
                  onChange={props.toggleEnforceFitFnc}
                  //   value="checkedA"
                  color="primary"
                />
              }
              label="Fit"
            />
          </FormGroup>
        </FormControl>
      </ListItem>

      <ListItem>
        <Grid
          container
          direction="row"
          alignItems="center"
          justify="space-evenly"
        >
          <Grid item>
            <Button color="primary" onClick={props.forceLayoutFnc}>
              Fix Layout
            </Button>
          </Grid>
          <Grid item>
            <Button color="primary" onClick={props.fitFnc}>
              Fix Fit
            </Button>
          </Grid>
        </Grid>
      </ListItem>
    </List>
  )
}

const WorkflowDataExpansionPanel = props => {
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography color="primary">Workflow Data</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Grid container direction="column">
          <Grid item>
            <Typography>Workflow ID: {props.workflowId}</Typography>
          </Grid>
          <Grid item>
            <Typography>Start time: {props.startTime}</Typography>
          </Grid>
          <Grid item>
            <Typography>End time: {props.endTime}</Typography>
          </Grid>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

const SingleGridItem = props => {
  const extraStyle = {
    backgroundColor: props.color
  }
  return (
    <Grid item>
      <Grid container direction="column" alignItems="center">
        <Grid item>
          <Typography variant="caption">{props.caption}</Typography>
        </Grid>
        <Grid item>
          <div id={props.id} style={extraStyle} />
        </Grid>
      </Grid>
    </Grid>
  )
}

const NodeTypeShapeList = () => {
  return (
    <div>
      <Typography variant="subtitle1">Node Status Color</Typography>
      <Grid container direction="row" justify="space-evenly">
        <SingleGridItem caption="Single Task" id="circle" />
        <SingleGridItem caption="Scatter" id="star" />
        <SingleGridItem caption="Subworkflow" id="triangle" />
        <SingleGridItem caption="Parent" id="rectangle" />
      </Grid>
    </div>
  )
}

const ColorStatusList = () => {
  return (
    <div>
      <Typography variant="subtitle1">Node Status Color</Typography>
      <Grid container direction="row" justify="space-evenly">
        <SingleGridItem caption="Done" id="circle" color="#000000" />
        <SingleGridItem caption="Running" id="circle" color="#00b200" />
        <SingleGridItem caption="Failed" id="circle" color="#ff0000" />
        <SingleGridItem caption="Uninitialized" id="circle" color="#bf00ff" />
      </Grid>
    </div>
  )
}

const HelpExpansionPanel = () => {
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography color="primary">Help</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Grid container direction="column">
          <Grid item>
            <Typography paragraph={true}>
              {" "}
              Left click to drag and select nodes. Right click (two finger click
              on Mac) to expand and collapse scatter nodes (stars) and
              subworkflows (triangles)
            </Typography>
          </Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <ColorStatusList />
          </Grid>
          <Grid item>
            <NodeTypeShapeList />
          </Grid>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

const RenderSidebar = props => {
  return (
    <div className="sidebar-div">
      <ControlPanel
        selectedNode={props.selectedNode}
        status={props.status}
        layout={props.layout}
        changeLayout={props.changeLayout}
        fitFnc={props.fitFnc}
        forceLayoutFnc={props.forceLayoutFnc}
        changeViewTypeFnc={props.changeViewTypeFnc}
        viewBoolean={props.viewBoolean}
        toggleEnforceFitFnc={props.toggleEnforceFitFnc}
        enforceFitBoolean={props.enforceFitBoolean}
        toggleEnforceLayoutFnc={props.toggleEnforceLayoutFnc}
        enforceLayoutBoolean={props.enforceLayoutBoolean}
        toggleAnimation={props.toggleAnimation}
        enableAnimation={props.enableAnimation}
      />
      <WorkflowDataExpansionPanel
        workflowId={props.workflowId}
        startTime={props.startTime}
        endTime={props.endTime}
      />
      <HelpExpansionPanel />
    </div>
  )
}

class Sidebar extends Component {
  constructor(props) {
    super(props)

    this.changeLayout = this.changeLayout.bind(this)
  }

  changeLayout(event) {
    this.props.changeLayout(event.target.value)
  }

  render() {
    let id = null
    let startWorkflow = null
    let endWorkflow = null
    let currentStatus = null

    if (this.props.metadata !== null) {
      id = this.props.metadata.id
      startWorkflow = this.props.metadata.start
      endWorkflow = this.props.metadata.end
      currentStatus = this.props.metadata.status
    }

    let statusSymbol = null
    let statusText = `(${currentStatus})`
    if (currentStatus === "Submitted" || currentStatus === "Running") {
      let color = null
      if (currentStatus === "Submitted") {
        color = "blue"
      } else {
        color = "green"
      }

      statusSymbol = (
        <ReactLoading type="bars" color={color} height={30} width={30} />
      )
    } else if (currentStatus === "Succeeded") {
      statusSymbol = <Done color="primary" />
    } else if (currentStatus === null) {
      statusSymbol = (
        <Typography variant="body2">Workflow not running</Typography>
      )
      statusText = ""
    } else {
      statusSymbol = <Error color="error" />
    }

    const status = (
      <Grid container direction="row" alignItems="center" spacing={5}>
        <Grid item>{statusSymbol}</Grid>
        <Grid item>
          <Typography variant="body2">{statusText}</Typography>
        </Grid>
      </Grid>
    )

    let displayName = null
    let displayData = null
    if (this.props.currentSelectedNodeData !== null) {
      const nodeDataObj = JSON.parse(this.props.currentSelectedNodeData)
      displayName = nodeDataObj.id
      displayData = this.props.currentSelectedNodeData
    }

    return (
      <RenderSidebar
        selectedNode={displayName}
        status={status}
        layout={this.props.layout}
        changeLayout={this.changeLayout}
        workflowId={id}
        startTime={startWorkflow}
        endTime={endWorkflow}
        fitFnc={this.props.fitFnc}
        forceLayoutFnc={this.props.forceLayoutFnc}
        changeViewTypeFnc={this.props.toggleViewFnc}
        viewBoolean={this.props.viewBoolean}
        toggleEnforceFitFnc={this.props.toggleEnforceFitFnc}
        enforceFitBoolean={this.props.enforceFitBoolean}
        toggleEnforceLayoutFnc={this.props.toggleEnforceLayoutFnc}
        enforceLayoutBoolean={this.props.enforceLayoutBoolean}
        toggleAnimation={this.props.toggleAnimation}
        enableAnimation={this.props.enableAnimation}
      />
    )
  }
}

export default Sidebar
