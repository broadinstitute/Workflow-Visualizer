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
  ExpansionPanelDetails,
  Box,
  InputLabel,
  FormHelperText
} from "@material-ui/core"
import "../Sidebar.css"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { Done, Error } from "@material-ui/icons"

/**
 * Sidebar presents additional information about the workflow and controls.
 */

const ExpandOptions = props => {
  return (
    <Box>
      <Grid container direction="column" spacing={1}>
        <Grid item>
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
        </Grid>
        <Grid item>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  // checked={props.enableAnimation}
                  // onChange={props.toggleAnimation}
                  //   value="checkedA"
                  color="primary"
                />
              }
              label="Expand subworkflows"
            />
            <FormControlLabel
              control={
                <Checkbox
                  // checked={props.enableAnimation}
                  // onChange={props.toggleAnimation}
                  //   value="checkedA"
                  color="primary"
                />
              }
              label="Expand scatters"
            />
          </FormGroup>
        </Grid>
      </Grid>
    </Box>
  )
}

const SelectShardDisplay = props => {
  return (
    <Box>
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
              // checked={props.enableAnimation}
              // onChange={props.toggleAnimation}
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
          <Grid item>
            <Typography variant="subtitle2">
              All controls at default are set to smart which automatically
              adjusts graph display based on the number of nodes in the graph.
            </Typography>
          </Grid>
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
            <ColorBlindMode />
          </Grid>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
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
      <Typography style={{ padding: "10px 15px 0px 15px" }}>
        Current Node: <strong>{props.selectedNode}</strong>
      </Typography>
      <ListItem>
        <Typography>Status: </Typography>
        {props.status}
        {/* <ReactLoading type="bars" color="blue" height={30} width={30} /> */}
      </ListItem>
      <ListItem>
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
            <MenuItem value="dagre">Left Right DAG</MenuItem>
            <MenuItem value="klay">Klay</MenuItem>
          </Select>
          <FormHelperText>Click to select layout formats</FormHelperText>
        </FormControl>
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

      <AdvancedControls
        displayLayers={props.displayLayers}
        changeDisplayedLayers={props.changeDisplayedLayers}
        displayShards={props.displayShards}
        changeDisplayedShards={props.changeDisplayedShards}
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
      <Grid container direction="row" alignItems="center" spacing={1}>
        <Grid item>{statusSymbol}</Grid>
        <Grid item>
          <Typography variant="body2">{statusText}</Typography>
        </Grid>
      </Grid>
    )

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
      />
    )
  }
}

export default Sidebar
