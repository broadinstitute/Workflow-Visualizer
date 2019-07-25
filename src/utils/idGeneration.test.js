import * as generator from "./idGeneration"

test("createNodeIdFromMetadata: short expected call not null", () => {
  const returnString = generator.createNodeIdFromMetadata(
    "name.alias",
    "parent"
  )
  const compareString = "parent>alias"
  expect(returnString).toBe(compareString)
})

test("createNodeIdFromMetadata: both inputs null", () => {
  const returnString = generator.createNodeIdFromMetadata(null, null)
  const compareString = "null>null"
  expect(returnString).toBe(compareString)
})

test("createNodeIdFromMetadata: subworkflowparent is null, so testing toplevel metadata parse", () => {
  const returnString = generator.createNodeIdFromMetadata("name.alias", null)
  const compareString = "name>alias"
  expect(returnString).toBe(compareString)
})

test("createNodeIdFromMetadata: empty string call and null subw-parent", () => {
  const returnString = generator.createNodeIdFromMetadata("", null)
  const compareString = ">"
  expect(returnString).toBe(compareString)
})

test("createNodeIdFromMetadata: empty alias, null subw-parent to simulate top-level", () => {
  const returnString = generator.createNodeIdFromMetadata("name.", null)
  const compareString = "name>"
  expect(returnString).toBe(compareString)
})

test("createNodeIdFromMetadata: empty alias, non-null subw-parent to simulate recursive parsing", () => {
  const returnString = generator.createNodeIdFromMetadata("name.", "recursive")
  const compareString = "recursive>"
  expect(returnString).toBe(compareString)
})

test("createNodeIdFromMetadata: both inputs empty string", () => {
  const returnString = generator.createNodeIdFromMetadata("", "")
  const compareString = ">"
  expect(returnString).toBe(compareString)
})

test("buildNodeIdFromDot: two null inputs ", () => {
  const returnNodeId = generator.buildNodeIdFromDot(null, null)
  const correctNodeId = "null>null"
  expect(returnNodeId).toBe(correctNodeId)
})

test("buildNodeIdFromDot: two empty strings ", () => {
  const returnNodeId = generator.buildNodeIdFromDot("", "")
  const correctNodeId = ">"
  expect(returnNodeId).toBe(correctNodeId)
})

test("buildNodeIdFromDot: typical inputs for workflowId and taskName", () => {
  const returnNodeId = generator.buildNodeIdFromDot("workflow", "task")
  const correctNodeId = "workflow>task"
  expect(returnNodeId).toBe(correctNodeId)
})

/**
 * Following tests ascertain consistency between dot and metadata naming conventions
 * given the proper inputs. This will ensure that any decoupling between naming conventions
 * between metadata updates and graph creations using dot files will be detected
 * during testing
 */

test("checking naming consistency between buildNodeIdFromDot and createNodeFromMetadata: normal case with singleCall separation", () => {
  const metadataNodeId = generator.createNodeIdFromMetadata(
    "single.Call",
    "swfParent"
  )
  const dotNodeId = generator.buildNodeIdFromDot("swfParent", "Call")
  expect(metadataNodeId).toBe(dotNodeId)
})

test("checking naming consistency between buildNodeIdFromDot and createNodeFromMetadata: no dot separation", () => {
  const metadataNodeId = generator.createNodeIdFromMetadata(
    "singleCall",
    "swfParent"
  )
  const dotNodeId = generator.buildNodeIdFromDot("swfParent", "singleCall")
  expect(metadataNodeId).toBe(dotNodeId)
})

test("checking naming consistency between buildNodeIdFromDot and createNodeFromMetadata: identical calls with dot", () => {
  const metadataNodeId = generator.createNodeIdFromMetadata(
    "single.Call",
    "swfParent"
  )
  const dotNodeId = generator.buildNodeIdFromDot("swfParent", "single.Call")
  expect(metadataNodeId).not.toBe(dotNodeId)
})

test("checking naming consistency between buildNodeIdFromDot and createNodeFromMetadata: inputs for calls should not correspond", () => {
  const metadataNodeId = generator.createNodeIdFromMetadata(
    "single.Call...",
    "swfParent"
  )
  const dotNodeId = generator.buildNodeIdFromDot("swfParent", "single.Call")
  expect(metadataNodeId).not.toBe(dotNodeId)
})

test("checking naming consistency between buildNodeIdFromDot and createNodeFromMetadata: singleCall has multiple dots. should be equal", () => {
  const metadataNodeId = generator.createNodeIdFromMetadata(
    "single.Call.",
    "swfParent"
  )
  const dotNodeId = generator.buildNodeIdFromDot("swfParent", "Call.")
  expect(metadataNodeId).toBe(dotNodeId)
})

test("checking naming consistency between buildNodeIdFromDot and createNodeFromMetadata: '>' separated Id. '>' should not be parsed", () => {
  const metadataNodeId = generator.createNodeIdFromMetadata(
    "single>Call",
    "swfParent"
  )
  const dotNodeId = generator.buildNodeIdFromDot("swfParent", "single>Call")
  expect(metadataNodeId).toBe(dotNodeId)
})

test("checking naming consistency between buildNodeIdFromDot and createNodeFromMetadata: '>' separated Id with '.' at end. Should fail", () => {
  const metadataNodeId = generator.createNodeIdFromMetadata(
    "single>Call.",
    "swfParent"
  )
  const dotNodeId = generator.buildNodeIdFromDot("swfParent", "single>Call.")
  expect(metadataNodeId).not.toBe(dotNodeId)
})
