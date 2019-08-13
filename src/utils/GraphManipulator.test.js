import GraphManipulator from "./GraphManipulator"
import cytoscape from "cytoscape"
import * as dotFiles from "../utils/dotFiles"
import { buildEdgeText, buildShardIdText } from "./idGeneration"

let configurations
beforeEach(() => {
  configurations = {
    elements: [],
    style: []
  }
})

test("isScatter no ele, should be true", () => {
  const cy = cytoscape(configurations)
  const graphManipulatorObj = new GraphManipulator(cy)
  const elements = []

  expect(graphManipulatorObj.isScatter(elements)).toBeTruthy()
})

describe("findParentPrefixOfShardId: ", () => {
  test("typical case", () => {
    const string = "hello>test>string"
    const graphManipulatorObj = new GraphManipulator(configurations)
    const prefix = graphManipulatorObj.findParentPrefixOfShardId(string)

    expect(prefix).toBe("hello>test")
  })

  test("empty string input", () => {
    const string = ""
    const graphManipulatorObj = new GraphManipulator(configurations)
    const prefix = graphManipulatorObj.findParentPrefixOfShardId(string)

    expect(prefix).toBe("")
  })
})

/**
 * We are testing the function that creates hiddenNodes for the basic/detailed toggle.
 * We will not need to test cases in which there are no incoming/outgoing node inputs
 * because those cases are handled higher up in the toggle logic.
 */
describe("createHiddenNodesData: ", () => {
  test("single hidden node 'a' with 'b', 'c' as incoming and outgoing neighbors", () => {
    const removeId = "a"
    const incoming = "b"
    const outgoing = "c"
    const elements = [
      {
        // node a
        data: { id: "a" }
      },
      {
        // node b
        data: { id: "b" }
      },
      { data: { id: "c" } },
      {
        // edge ab
        data: { id: "ba", source: "b", target: "a" }
      },
      {
        // edge ab
        data: { id: "ac", source: "a", target: "c" }
      }
    ]
    configurations.elements = elements

    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)

    const returnJson = graphManipulatorObj.createHiddenNodesData(
      removeId,
      incoming,
      outgoing
    )

    const expectedJson = JSON.stringify(["a"])

    expect(returnJson).toBe(expectedJson)
  })

  test("calls hidden node with incoming edge holding hiddenNode data", () => {
    const removeId = "a"
    const incoming = "b"
    const outgoing = "c"
    const elements = [
      {
        // node a
        data: { id: "a" }
      },
      {
        // node b
        data: { id: "b" }
      },
      { data: { id: "c" } },
      {
        // edge ab
        data: {
          id: buildEdgeText("b", "a"),
          source: "b",
          target: "a",
          hiddenNodes: JSON.stringify(["d"])
        }
      },
      {
        // edge ab
        data: { id: buildEdgeText("a", "c"), source: "a", target: "c" }
      }
    ]
    configurations.elements = elements

    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)

    const returnJson = graphManipulatorObj.createHiddenNodesData(
      removeId,
      incoming,
      outgoing
    )

    const expectedJson = '["d","a"]'

    expect(returnJson).toBe(expectedJson)
  })

  test("calls hidden nodes with outgoing edge holding hiddenNodes data. hiddenNodes datapoint will hold two hidden nodes.", () => {
    const removeId = "a"
    const incoming = "b"
    const outgoing = "c"
    const elements = [
      {
        // node a
        data: { id: "a" }
      },
      {
        // node b
        data: { id: "b" }
      },
      { data: { id: "c" } },
      {
        // edge ab
        data: {
          id: buildEdgeText("b", "a"),
          source: "b",
          target: "a"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("a", "c"),
          source: "a",
          target: "c",
          hiddenNodes: JSON.stringify(["d", "e"])
        }
      }
    ]
    configurations.elements = elements

    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)

    const returnJson = graphManipulatorObj.createHiddenNodesData(
      removeId,
      incoming,
      outgoing
    )

    const expectedJson = '["a","d","e"]'

    expect(returnJson).toBe(expectedJson)
  })

  test("calls hidden nodes with outgoing edge holding hiddenNodes data. hiddenNodes datapoint will hold two hidden nodes.", () => {
    const removeId = "a"
    const incoming = "b"
    const outgoing = "c"
    const elements = [
      {
        // node a
        data: { id: "a" }
      },
      {
        // node b
        data: { id: "b" }
      },
      { data: { id: "c" } },
      {
        // edge ab
        data: {
          id: buildEdgeText("b", "a"),
          source: "b",
          target: "a",
          hiddenNodes: JSON.stringify(["f", "g"])
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("a", "c"),
          source: "a",
          target: "c",
          hiddenNodes: JSON.stringify(["d", "e"])
        }
      }
    ]
    configurations.elements = elements

    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)

    const returnJson = graphManipulatorObj.createHiddenNodesData(
      removeId,
      incoming,
      outgoing
    )

    const expectedJson = '["f","g","a","d","e"]'

    expect(returnJson).toBe(expectedJson)
  })
})

describe("updateRemovedNodeScratchData: ", () => {
  test("check if node scratch is successfully updated with empty scratch", () => {
    const elements = [
      {
        // node a
        data: { id: "a", type: "shard" }
      },
      {
        // node b
        data: { id: "b" }
      },
      { data: { id: "c" } },
      {
        // edge ab
        data: {
          id: buildEdgeText("b", "a"),
          source: "b",
          target: "a",
          hiddenNodes: JSON.stringify(["f", "g"])
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("a", "c"),
          source: "a",
          target: "c",
          hiddenNodes: JSON.stringify(["d", "e"])
        }
      }
    ]
    configurations.elements = elements
    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)
    cy.scratch("removedNodes", "{}")

    const aNodeObj = cy.getElementById("a")

    const oldScratch = JSON.stringify(cy.scratch())

    graphManipulatorObj.updateRemovedNodeDataScratch("a", aNodeObj.data())

    const dataJson = JSON.stringify({ a: { id: "a", type: "shard" } })

    const expectedScratch = {
      removedNodes: dataJson
    }

    expect(cy.scratch()).not.toBe(oldScratch)
    expect(cy.scratch()).toMatchObject(expectedScratch)
  })

  test("update scratch but scratch is non-empty ", () => {
    const elements = [
      {
        // node a
        data: { id: "a", type: "shard" }
      },
      {
        // node b
        data: { id: "b" }
      },
      { data: { id: "c" } },
      {
        // edge ab
        data: {
          id: buildEdgeText("b", "a"),
          source: "b",
          target: "a",
          hiddenNodes: JSON.stringify(["f", "g"])
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("a", "c"),
          source: "a",
          target: "c",
          hiddenNodes: JSON.stringify(["d", "e"])
        }
      }
    ]
    configurations.elements = elements
    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)
    cy.scratch("removedNodes", JSON.stringify({ d: { id: "d" } }))

    const aNodeObj = cy.getElementById("a")
    graphManipulatorObj.updateRemovedNodeDataScratch("a", aNodeObj.data())

    const finalDataJson = JSON.stringify({
      d: { id: "d" },
      a: { id: "a", type: "shard" }
    })
    const expectedScratch = { removedNodes: finalDataJson }

    expect(cy.scratch()).toMatchObject(expectedScratch)
  })
})

describe("createBasicScatterEdges: ", () => {
  test("one undefined/detailed node in between two 2-shard scatters. Checking if edges are properly created between shards.", () => {
    const elements = [
      { data: { id: "f", type: "parent" } },
      { data: { id: "z", type: "parent" } },
      {
        // node a
        data: {
          id: "f>shard_0",
          type: "shard",
          shardIndex: "0",
          status: "Done",
          parent: "f"
        }
      },
      {
        // node b
        data: {
          id: "f>shard_1",
          type: "shard",
          shardIndex: "1",
          status: "Done",
          parent: "f"
        }
      },
      {
        data: {
          id: "z>shard_0",
          type: "shard",
          shardIndex: "0",
          status: "Done",
          parent: "z"
        }
      },
      {
        data: {
          id: "z>shard_1",
          type: "shard",
          shardIndex: "1",
          status: "Done",
          parent: "z"
        }
      },
      { data: { id: "e" } },
      {
        data: {
          id: buildEdgeText("f>shard_1", "e"),
          source: "f>shard_1",
          target: "e"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("f>shard_0", "e"),
          source: "f>shard_0",
          target: "e"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("e", "z>shard_1"),
          source: "e",
          target: "z>shard_1"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("e", "z>shard_0"),
          source: "e",
          target: "z>shard_0"
        }
      }
    ]
    configurations.elements = elements
    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)

    const eObj = cy.getElementById("e")

    const eIncoming = graphManipulatorObj.getIncomingNodesObj(eObj)
    const eOutgoing = graphManipulatorObj.getOutgoingNodesObj(eObj)

    graphManipulatorObj.createBasicScatterEdges(eIncoming, eOutgoing, "e")

    const zShard1 = cy.getElementById("z>shard_1")
    const zShard0 = cy.getElementById("z>shard_0")

    expect(graphManipulatorObj.getIncomingNodeIds(zShard1)).toMatchObject([
      "e",
      "f>shard_1"
    ])

    expect(graphManipulatorObj.getIncomingNodeIds(zShard0)).toMatchObject([
      "e",
      "f>shard_0"
    ])

    // expect(cy.filter("nodes")).toBe(expectedJson)
  })

  test("Undefined node in between two 2-shard scatters. Check if hiddenNodes data is properly created.", () => {
    const elements = [
      { data: { id: "f", type: "parent" } },
      { data: { id: "z", type: "parent" } },
      {
        // node a
        data: {
          id: "f>shard_0",
          type: "shard",
          shardIndex: "0",
          status: "Done",
          parent: "f"
        }
      },
      {
        // node b
        data: {
          id: "f>shard_1",
          type: "shard",
          shardIndex: "1",
          status: "Done",
          parent: "f"
        }
      },
      {
        data: {
          id: "z>shard_0",
          type: "shard",
          shardIndex: "0",
          status: "Done",
          parent: "z"
        }
      },
      {
        data: {
          id: "z>shard_1",
          type: "shard",
          shardIndex: "1",
          status: "Done",
          parent: "z"
        }
      },
      { data: { id: "e" } },
      {
        data: {
          id: buildEdgeText("f>shard_1", "e"),
          source: "f>shard_1",
          target: "e"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("f>shard_0", "e"),
          source: "f>shard_0",
          target: "e"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("e", "z>shard_1"),
          source: "e",
          target: "z>shard_1"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("e", "z>shard_0"),
          source: "e",
          target: "z>shard_0"
        }
      }
    ]
    configurations.elements = elements
    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)

    const eObj = cy.getElementById("e")

    const eIncoming = graphManipulatorObj.getIncomingNodesObj(eObj)
    const eOutgoing = graphManipulatorObj.getOutgoingNodesObj(eObj)

    graphManipulatorObj.createBasicScatterEdges(eIncoming, eOutgoing, "e")

    const fShard0ToZShard0 = cy.getElementById(
      buildEdgeText("f>shard_0", "z>shard_0")
    )
    const fShard1ToZShard1 = cy.getElementById(
      buildEdgeText("f>shard_1", "z>shard_1")
    )

    console.log(fShard0ToZShard0.data("hiddenNodes"))

    expect(fShard0ToZShard0.data("hiddenNodes")).toBe(JSON.stringify(["e"]))

    expect(fShard1ToZShard1.data("hiddenNodes")).toBe(JSON.stringify(["e"]))
  })
})

describe("createBasicEdges: ", () => {
  test("single-task node -> undefined node -> single-task node. Check that basic edge from first single-task to second single-task is created", () => {
    const elements = [
      { data: { id: "single-task-1", type: "single-task", status: "Done" } },
      { data: { id: "single-task-2", type: "single-task", status: "Done" } },
      { data: { id: "undefined" } },
      {
        data: {
          id: buildEdgeText("single-task-1", "undefined"),
          source: "single-task-1",
          target: "undefined"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("undefined", "single-task-2"),
          source: "undefined",
          target: "single-task-2"
        }
      }
    ]
    configurations.elements = elements
    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)

    const undefinedNode = cy.getElementById("undefined")

    graphManipulatorObj.createBasicEdges(
      graphManipulatorObj.getIncomingNodesObj(undefinedNode),
      graphManipulatorObj.getOutgoingNodesObj(undefinedNode),
      undefinedNode.id()
    )

    const newEdge = cy.getElementById(
      buildEdgeText("single-task-1", "single-task-2")
    )

    expect(newEdge.data("source")).toBe("single-task-1")
    expect(newEdge.data("target")).toBe("single-task-2")
  })

  test("single-task node -> undefined node -> single-task node. Check that hiddenNodes value is created inside new edge", () => {
    const elements = [
      { data: { id: "single-task-1", type: "single-task", status: "Done" } },
      { data: { id: "single-task-2", type: "single-task", status: "Done" } },
      { data: { id: "undefined" } },
      {
        data: {
          id: buildEdgeText("single-task-1", "undefined"),
          source: "single-task-1",
          target: "undefined"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("undefined", "single-task-2"),
          source: "undefined",
          target: "single-task-2"
        }
      }
    ]
    configurations.elements = elements
    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)

    const undefinedNode = cy.getElementById("undefined")

    graphManipulatorObj.createBasicEdges(
      graphManipulatorObj.getIncomingNodesObj(undefinedNode),
      graphManipulatorObj.getOutgoingNodesObj(undefinedNode),
      undefinedNode.id()
    )

    const newEdge = cy.getElementById(
      buildEdgeText("single-task-1", "single-task-2")
    )

    expect(newEdge.data("hiddenNodes")).toBe(JSON.stringify(["undefined"]))
  })

  test(`single-task node --> undefined_1 node --> undefined_2 node --> single-task.
  We will be calling create basic edges onto undefined-1. Check that edge is properly created`, () => {
    const elements = [
      { data: { id: "single-task-1", type: "single-task", status: "Done" } },
      { data: { id: "single-task-2", type: "single-task", status: "Done" } },
      { data: { id: "undefined-1" } },
      { data: { id: "undefined-2" } },
      {
        data: {
          id: buildEdgeText("single-task-1", "undefined-1"),
          source: "single-task-1",
          target: "undefined-1"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("undefined-1", "undefined-1"),
          source: "undefined-1",
          target: "undefined-2"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("undefined-2", "single-task-2"),
          source: "undefined-2",
          target: "single-task-2"
        }
      }
    ]
    configurations.elements = elements
    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)

    const undefinedNode = cy.getElementById("undefined-1")

    graphManipulatorObj.createBasicEdges(
      graphManipulatorObj.getIncomingNodesObj(undefinedNode),
      graphManipulatorObj.getOutgoingNodesObj(undefinedNode),
      undefinedNode.id()
    )

    const newEdge = cy.getElementById(
      buildEdgeText("single-task-1", "undefined-2")
    )

    expect(newEdge.data("id")).toBe(
      buildEdgeText("single-task-1", "undefined-2")
    )
    expect(newEdge.data("source")).toBe("single-task-1")
    expect(newEdge.data("target")).toBe("undefined-2")
  })

  test(`single-task node --> undefined_1 node --> undefined_2 node --> single-task.
   We will be calling create basic edges onto undefined-1. Check that hiddenNodes data is properly created`, () => {
    const elements = [
      { data: { id: "single-task-1", type: "single-task", status: "Done" } },
      { data: { id: "single-task-2", type: "single-task", status: "Done" } },
      { data: { id: "undefined-1" } },
      { data: { id: "undefined-2" } },
      {
        data: {
          id: buildEdgeText("single-task-1", "undefined-1"),
          source: "single-task-1",
          target: "undefined-1"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("undefined-1", "undefined-1"),
          source: "undefined-1",
          target: "undefined-2"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("undefined-2", "single-task-2"),
          source: "undefined-2",
          target: "single-task-2"
        }
      }
    ]
    configurations.elements = elements
    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)

    const undefinedNode = cy.getElementById("undefined-1")

    graphManipulatorObj.createBasicEdges(
      graphManipulatorObj.getIncomingNodesObj(undefinedNode),
      graphManipulatorObj.getOutgoingNodesObj(undefinedNode),
      undefinedNode.id()
    )

    const newEdge = cy.getElementById(
      buildEdgeText("single-task-1", "undefined-2")
    )

    expect(newEdge.data("hiddenNodes")).toBe(JSON.stringify(["undefined-1"]))
  })

  test(`single-task node --> undefined_1 node --> undefined_2 node --> single-task.
  Call createBasicEdges on undefined-1, then on undefined-2.
  This test will check if hiddenNode data is properly transferred`, () => {
    const elements = [
      { data: { id: "single-task-1", type: "single-task", status: "Done" } },
      { data: { id: "single-task-2", type: "single-task", status: "Done" } },
      { data: { id: "undefined-1" } },
      { data: { id: "undefined-2" } },
      {
        data: {
          id: buildEdgeText("single-task-1", "undefined-1"),
          source: "single-task-1",
          target: "undefined-1"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("undefined-1", "undefined-1"),
          source: "undefined-1",
          target: "undefined-2"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("undefined-2", "single-task-2"),
          source: "undefined-2",
          target: "single-task-2"
        }
      }
    ]
    configurations.elements = elements
    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)

    const undefinedNode1 = cy.getElementById("undefined-1")

    graphManipulatorObj.createBasicEdges(
      graphManipulatorObj.getIncomingNodesObj(undefinedNode1),
      graphManipulatorObj.getOutgoingNodesObj(undefinedNode1),
      undefinedNode1.id()
    )

    const undefinedNode2 = cy.getElementById("undefined-2")

    graphManipulatorObj.createBasicEdges(
      graphManipulatorObj.getIncomingNodesObj(undefinedNode2),
      graphManipulatorObj.getOutgoingNodesObj(undefinedNode2),
      undefinedNode2.id()
    )

    const newEdge = cy.getElementById(
      buildEdgeText("single-task-1", "single-task-2")
    )

    expect(newEdge.data("hiddenNodes")).toBe(
      JSON.stringify(["undefined-1", "undefined-2"])
    )
  })

  test("scatter node --> undefined node --> single-task node. Check that that shards point to single-task at end of function", () => {
    const elements = [
      { data: { id: "scatter", type: "parent", status: "Done" } },
      {
        data: {
          id: buildShardIdText("scatter", "0"),
          type: "shard",
          status: "Done"
        }
      },
      {
        data: {
          id: buildShardIdText("scatter", "1"),
          type: "shard",
          status: "Done"
        }
      },
      { data: { id: "single-task-2", type: "single-task", status: "Done" } },
      { data: { id: "undefined" } },
      {
        data: {
          id: buildEdgeText(buildShardIdText("scatter", "0"), "undefined"),
          source: buildShardIdText("scatter", "0"),
          target: "undefined"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText(buildShardIdText("scatter", "1"), "undefined"),
          source: buildShardIdText("scatter", "1"),
          target: "undefined"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("undefined", "single-task-2"),
          source: "undefined",
          target: "single-task-2"
        }
      }
    ]
    configurations.elements = elements
    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)

    const undefinedNode = cy.getElementById("undefined")

    graphManipulatorObj.createBasicEdges(
      graphManipulatorObj.getIncomingNodesObj(undefinedNode),
      graphManipulatorObj.getOutgoingNodesObj(undefinedNode),
      undefinedNode.id()
    )

    const shardEdge0 = cy.getElementById(
      buildEdgeText(buildShardIdText("scatter", "0"), "single-task-2")
    )
    const shardEdge1 = cy.getElementById(
      buildEdgeText(buildShardIdText("scatter", "1"), "single-task-2")
    )

    expect(shardEdge0.data("source")).toBe(buildShardIdText("scatter", "0"))
    expect(shardEdge0.data("target")).toBe("single-task-2")

    expect(shardEdge1.data("source")).toBe(buildShardIdText("scatter", "1"))
    expect(shardEdge1.data("target")).toBe("single-task-2")
  })

  test(`scatter node --> undefined node --> single-task node. 
  Check that hiddenNodes data is still created with scatter`, () => {
    const elements = [
      { data: { id: "scatter", type: "parent", status: "Done" } },
      {
        data: {
          id: buildShardIdText("scatter", "0"),
          type: "shard",
          status: "Done"
        }
      },
      {
        data: {
          id: buildShardIdText("scatter", "1"),
          type: "shard",
          status: "Done"
        }
      },
      { data: { id: "single-task-2", type: "single-task", status: "Done" } },
      { data: { id: "undefined" } },
      {
        data: {
          id: buildEdgeText(buildShardIdText("scatter", "0"), "undefined"),
          source: buildShardIdText("scatter", "0"),
          target: "undefined"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText(buildShardIdText("scatter", "1"), "undefined"),
          source: buildShardIdText("scatter", "1"),
          target: "undefined"
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("undefined", "single-task-2"),
          source: "undefined",
          target: "single-task-2"
        }
      }
    ]
    configurations.elements = elements
    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)

    const undefinedNode = cy.getElementById("undefined")

    graphManipulatorObj.createBasicEdges(
      graphManipulatorObj.getIncomingNodesObj(undefinedNode),
      graphManipulatorObj.getOutgoingNodesObj(undefinedNode),
      undefinedNode.id()
    )

    const shardEdge0 = cy.getElementById(
      buildEdgeText(buildShardIdText("scatter", "0"), "single-task-2")
    )
    const shardEdge1 = cy.getElementById(
      buildEdgeText(buildShardIdText("scatter", "1"), "single-task-2")
    )

    expect(shardEdge0.data("hiddenNodes")).toBe(JSON.stringify(["undefined"]))
    expect(shardEdge1.data("hiddenNodes")).toBe(JSON.stringify(["undefined"]))
  })

  test("single-task --> undefined node --> scatter. Check that that shards point to single-task at end of function", () => {
    const elements = [
      { data: { id: "scatter", type: "parent", status: "Done" } },
      {
        data: {
          id: buildShardIdText("scatter", "0"),
          type: "shard",
          status: "Done"
        }
      },
      {
        data: {
          id: buildShardIdText("scatter", "1"),
          type: "shard",
          status: "Done"
        }
      },
      { data: { id: "single-task-2", type: "single-task", status: "Done" } },
      { data: { id: "undefined" } },
      {
        data: {
          id: buildEdgeText("undefined", buildShardIdText("scatter", "0")),
          source: "undefined",
          target: buildShardIdText("scatter", "0")
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("undefined", buildShardIdText("scatter", "1")),
          source: "undefined",
          target: buildShardIdText("scatter", "1")
        }
      },
      {
        // edge ab
        data: {
          id: buildEdgeText("single-task-2", "undefined"),
          source: "single-task-2",
          target: "undefined"
        }
      }
    ]
    configurations.elements = elements
    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)

    const undefinedNode = cy.getElementById("undefined")

    graphManipulatorObj.createBasicEdges(
      graphManipulatorObj.getIncomingNodesObj(undefinedNode),
      graphManipulatorObj.getOutgoingNodesObj(undefinedNode),
      undefinedNode.id()
    )

    const shardEdge0 = cy.getElementById(
      buildEdgeText("single-task-2", buildShardIdText("scatter", "0"))
    )
    const shardEdge1 = cy.getElementById(
      buildEdgeText("single-task-2", buildShardIdText("scatter", "1"))
    )

    expect(shardEdge0.data("target")).toBe(buildShardIdText("scatter", "0"))
    expect(shardEdge0.data("source")).toBe("single-task-2")

    expect(shardEdge1.data("target")).toBe(buildShardIdText("scatter", "1"))
    expect(shardEdge1.data("source")).toBe("single-task-2")
  })
})
