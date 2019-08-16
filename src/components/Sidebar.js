import React, { Component } from "react"
import ReactLoading from "react-loading"
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
  ExpansionPanelDetails,
  Box,
  InputLabel,
  FormHelperText
} from "@material-ui/core"
import "./Sidebar.css"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { Done, Error } from "@material-ui/icons"

/**
 * Sidebar presents additional information about the workflow and controls.
 */

const ExpandOptions = props => {
  return (
    <Box>
      {/* <Typography>
        Expand first&nbsp;
        <Select
          value={props.displayLayers}
          color="primary"
          onChange={props.changeDisplayedLayers}
        >
          <MenuItem value="zero">0</MenuItem>
          <MenuItem value="one">1</MenuItem>
          <MenuItem value="two">2</MenuItem>
          <MenuItem value="three">3</MenuItem>
          <MenuItem value="four">4</MenuItem>
          <MenuItem value="five">5</MenuItem>
          <MenuItem value="all">ALL (∞)</MenuItem>
        </Select>
        layers
      </Typography> */}
      <Grid container direction="row" alignItems="center" spacing={1}>
        <Grid item>
          <Typography>Expand first</Typography>
        </Grid>
        <Grid item>
          <Select
            value={props.displayLayers}
            color="primary"
            onChange={props.changeDisplayedLayers}
          >
            <MenuItem value="zero">0</MenuItem>
            <MenuItem value="one">1</MenuItem>
            <MenuItem value="two">2</MenuItem>
            <MenuItem value="three">3</MenuItem>
            <MenuItem value="four">4</MenuItem>
            <MenuItem value="five">5</MenuItem>
            <MenuItem value="all">ALL (∞)</MenuItem>
            <MenuItem value="smart">smart</MenuItem>
          </Select>
        </Grid>
        <Grid item>
          <Typography>layers</Typography>
        </Grid>
      </Grid>
    </Box>
  )
}

const SelectShardDisplay = props => {
  return (
    <Box className="flex-row">
      <Grid container direction="row" alignItems="center" spacing={1}>
        <Grid item>
          <Typography>Display</Typography>
        </Grid>
        <Grid item>
          <Select
            value={props.displayShards}
            color="primary"
            onChange={props.changeDisplayedShards}
          >
            <MenuItem value="no">no</MenuItem>
            <MenuItem value="all">all</MenuItem>
            <MenuItem value="failed">only failed</MenuItem>
            <MenuItem value="smart">smart</MenuItem>
          </Select>
        </Grid>
        <Grid item>
          <Typography>shards in a scatter</Typography>
        </Grid>
      </Grid>
    </Box>
  )
}

const ColorBlindMode = props => {
  return (
    <Box>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              checked={props.isColorBlind}
              onChange={props.toggleColoring}
              //   value="checkedA"
              color="primary"
            />
          }
          label="Enable color blind mode"
        />
      </FormGroup>
    </Box>
  )
}

const AdvancedControls = props => {
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography color="primary">Advanced Controls</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Grid container direction="column" spacing={2}>
          <Divider />
          <Grid item>
            <ExpandOptions
              displayLayers={props.displayLayers}
              changeDisplayedLayers={props.changeDisplayedLayers}
            />
          </Grid>
          <Grid item>
            <SelectShardDisplay
              displayShards={props.displayShards}
              changeDisplayedShards={props.changeDisplayedShards}
            />
          </Grid>
          <Grid item>
            <ColorBlindMode
              isColorBlind={props.isColorBlind}
              toggleColoring={props.toggleColoring}
            />
          </Grid>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

const SelectLayout = props => {
  return (
    <FormControl>
      <InputLabel>Layout</InputLabel>
      <Select
        value={props.layout}
        color="primary"
        onChange={props.changeLayout}
      >
        <MenuItem value="breadthfirst">Breadthfirst</MenuItem>
        <MenuItem value="circle">Circle</MenuItem>
        <MenuItem value="grid">Grid</MenuItem>
        <MenuItem value="random">Random</MenuItem>
        <MenuItem value="dagre">Left-Right DAG</MenuItem>
        <MenuItem value="klay">Top-Down DAG</MenuItem>
      </Select>
      <FormHelperText>Click to select layout formats</FormHelperText>
    </FormControl>
  )
}

const EnableAndEnforceCheckboxes = props => {
  return (
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
              color="primary"
            />
          }
          label="Fit"
        />
      </FormGroup>
    </FormControl>
  )
}

const LayoutFitButtons = props => {
  return (
    <Grid container direction="row" alignItems="center" justify="space-evenly">
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
  )
}

const ControlPanel = props => {
  return (
    <List>
      <ListItem>
        <Typography variant="h6" align="center" color="primary">
          Job Manager Visualization
        </Typography>
      </ListItem>
      <Divider />
      <ListItem>
        <Typography className="overflow-text">
          Current Node: <strong>{props.selectedNode}</strong>
        </Typography>
      </ListItem>
      <ListItem>
        <Typography>Status:&nbsp; </Typography>
        {props.status}
      </ListItem>
      <ListItem>
        <SelectLayout layout={props.layout} changeLayout={props.changeLayout} />
      </ListItem>
      <ListItem>
        <EnableAndEnforceCheckboxes
          enableAnimation={props.enableAnimation}
          toggleAnimation={props.toggleAnimation}
          viewBoolean={props.viewBoolean}
          changeViewTypeFnc={props.changeViewTypeFnc}
          enforceLayoutBoolean={props.enforceLayoutBoolean}
          toggleEnforceLayoutFnc={props.toggleEnforceLayoutFnc}
          enforceFitBoolean={props.enforceFitBoolean}
          toggleEnforceFitFnc={props.toggleEnforceFitFnc}
        />
      </ListItem>

      <ListItem>
        <LayoutFitButtons
          forceLayoutFnc={props.forceLayoutFnc}
          fitFnc={props.fitFnc}
        />
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
        <Box className="overflow-text">
          <Typography>Workflow ID: {props.workflowId}</Typography>
          <Divider />
          <Typography>Start time: {props.startTime}</Typography>
          <Divider />
          <Typography>End time: {props.endTime}</Typography>
          <Divider />
          <Typography>Inputs: {props.inputs}</Typography>
          <Divider />
          <Typography>Outputs: {props.outputs}</Typography>
        </Box>
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

const ColorStatusList = props => {
  let grid
  if (props.isColorBlind) {
    grid = (
      <Grid container direction="row" justify="space-evenly">
        <SingleGridItem caption="Done" id="circle" color="#000000" />
        <SingleGridItem caption="Running" id="circle" color="#009E73" />
        <SingleGridItem caption="Failed" id="circle" color="#CC79A7" />
        <SingleGridItem caption="Uninitialized" id="circle" color="#F0E442" />
      </Grid>
    )
  } else {
    grid = (
      <Grid container direction="row" justify="space-evenly">
        <SingleGridItem caption="Done" id="circle" color="#000000" />
        <SingleGridItem caption="Running" id="circle" color="#00b200" />
        <SingleGridItem caption="Failed" id="circle" color="#ff0000" />
        <SingleGridItem caption="Uninitialized" id="circle" color="gray" />
      </Grid>
    )
  }

  return (
    <Box>
      <Typography variant="subtitle1">Node Status Color</Typography>
      {grid}
    </Box>
  )
}

const HelpExpansionPanel = props => {
  return (
    <ExpansionPanel defaultExpanded={true}>
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
              on Mac) to expand scatters (stars) and subworkflows (triangles).
              Then, right click again on gray areas to collapse subworkflows and
              scatters
            </Typography>
          </Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <ColorStatusList isColorBlind={props.isColorBlind} />
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
    <Box className="sidebar-div">
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

      <AdvancedControls
        displayLayers={props.displayLayers}
        changeDisplayedLayers={props.changeDisplayedLayers}
        displayShards={props.displayShards}
        changeDisplayedShards={props.changeDisplayedShards}
        isColorBlind={props.isColorBlind}
        toggleColoring={props.toggleColoring}
      />
      <WorkflowDataExpansionPanel
        workflowId={props.workflowId}
        startTime={props.startTime}
        endTime={props.endTime}
        inputs={props.inputs}
        outputs={props.outputs}
      />
      <HelpExpansionPanel isColorBlind={props.isColorBlind} />
    </Box>
  )
}

class Sidebar extends Component {
  constructor(props) {
    super(props)

    this.changeLayout = this.changeLayout.bind(this)
    this.changeDisplayedLayers = this.changeDisplayedLayers.bind(this)
    this.changeDisplayedShards = this.changeDisplayedShards.bind(this)
  }

  changeLayout(event) {
    this.props.changeLayout(event.target.value)
  }

  changeDisplayedLayers(event) {
    this.props.changeDisplayedLayers(event.target.value)
  }

  changeDisplayedShards(event) {
    this.props.changeDisplayedShards(event.target.value)
  }

  prepareStatus(currentStatus) {
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

    return (
      <Grid container direction="row" alignItems="center" spacing={1}>
        <Grid item>{statusSymbol}</Grid>
        <Grid item>
          <Typography variant="body2">{statusText}</Typography>
        </Grid>
      </Grid>
    )
  }

  render() {
    let id = null
    let startWorkflow = null
    let endWorkflow = null
    let currentStatus = null
    let inputs = null
    let outputs = null
    if (this.props.metadata !== null) {
      id = this.props.metadata.id
      startWorkflow = this.props.metadata.start
      endWorkflow = this.props.metadata.end
      currentStatus = this.props.metadata.status
      inputs = JSON.stringify(this.props.metadata.inputs)
      outputs = JSON.stringify(this.props.metadata.outputs)
    }

    const status = this.prepareStatus(currentStatus)

    let displayName = null
    if (this.props.currentSelectedNodeData !== null) {
      const nodeDataObj = JSON.parse(this.props.currentSelectedNodeData)
      displayName = nodeDataObj.id
    }

    return (
      <RenderSidebar
        selectedNode={displayName}
        status={status}
        layout={this.props.layout}
        changeLayout={this.changeLayout}
        displayLayers={this.props.displayLayers}
        changeDisplayedLayers={this.changeDisplayedLayers}
        displayShards={this.props.displayShards}
        changeDisplayedShards={this.changeDisplayedShards}
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
        isColorBlind={this.props.isColorBlind}
        toggleColoring={this.props.toggleColoring}
        inputs={inputs}
        outputs={outputs}
      />
    )
  }
}

export default Sidebar
