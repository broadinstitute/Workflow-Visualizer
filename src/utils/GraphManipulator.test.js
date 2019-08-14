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

describe("removeAndSaveNodeArray: ", () => {
  const mapIdToObject = (array, cy) => {
    return array.map(id => {
      return cy.getElementById(id)
    })
  }

  test("empty array with a 3 node cy(graph)", () => {
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
    graphManipulatorObj.hideNodeArray([])

    const nodeCollection = cy.nodes()
    const nodeArray = graphManipulatorObj.parseCollectionToArray(nodeCollection)

    const nodeIdArray = nodeArray.reduce((acc, node) => {
      const id = node.id()
      return [...acc, ...[id]]
    }, [])

    // check nodes
    expect(nodeIdArray.sort()).toMatchObject(["a", "b", "c"])

    const edgeCollection = cy.edges()
    const edgeArray = graphManipulatorObj.parseCollectionToArray(edgeCollection)

    const edgeIdArray = edgeArray.reduce((acc, edge) => {
      const id = edge.id()
      return [...acc, ...[id]]
    }, [])

    expect(edgeIdArray.sort()).toMatchObject(["ac", "ba"])
  })

  // test("single node array; a 3 node cy(graph)", () => {
  //   const elements = [
  //     {
  //       // node a
  //       data: { id: "a", parentType: "scatterParent", type: "parent" }
  //     },
  //     {
  //       // node b
  //       data: { id: "b", parent: "a", type: "shard" }
  //     },
  //     { data: { id: "c" } },
  //     {
  //       // edge ab
  //       data: { id: "ba", source: "b", target: "a" }
  //     },
  //     {
  //       // edge ab
  //       data: { id: "ac", source: "a", target: "c" }
  //     }
  //   ]
  //   configurations.elements = elements

  //   const cy = cytoscape(configurations)
  //   const graphManipulatorObj = new GraphManipulator(cy)

  //   const objectArray = mapIdToObject(["b"], cy)

  //   graphManipulatorObj.hideNodeArray(objectArray)

  //   const nodeCollection = cy.filter("node:visible")
  //   const nodeArray = graphManipulatorObj.parseCollectionToArray(nodeCollection)

  //   const nodeIdArray = nodeArray.reduce((acc, node) => {
  //     node.style("display", "none")
  //     console.log(node.style("display"))
  //     const id = node.id()
  //     return [...acc, ...[id]]
  //   }, [])

  //   // check nodes
  //   expect(nodeIdArray.sort()).toMatchObject(["a", "c"])

  //   const edgeCollection = cy.edges()
  //   const edgeArray = graphManipulatorObj.parseCollectionToArray(edgeCollection)

  //   const edgeIdArray = edgeArray.reduce((acc, edge) => {
  //     const id = edge.id()
  //     return [...acc, ...[id]]
  //   }, [])

  //   expect(edgeIdArray.sort()).toMatchObject(["ac"])
  // })
})

describe("displayShards: ", () => {
  const createIdArray = array => {
    return array.reduce((acc, ele) => {
      const id = ele.id()
      return [...acc, ...[id]]
    }, [])
  }

  const unrelatedMetadata = {
    workflowProcessingEvents: [
      {
        cromwellId: "cromid-d225c52",
        description: "Finished",
        timestamp: "2019-08-14T15:02:47.805Z",
        cromwellVersion: "42"
      },
      {
        cromwellId: "cromid-d225c52",
        description: "PickedUp",
        timestamp: "2019-08-14T15:02:47.772Z",
        cromwellVersion: "42"
      }
    ],
    actualWorkflowLanguageVersion: "draft-2",
    submittedFiles: {
      workflow:
        'task increment {\n Int i\n command {\n echo $(( ${i} + 1 ))\n }\n output {\n Int j = read_int(stdout())\n }\n runtime {\n docker: "ubuntu:latest"\n }\n}\n\nworkflow subwf {\n Array[Int] is\n scatter (i in is) {\n call increment { input: i = i }\n }\n output {\n Array[Int] js = increment.j\n }\n}',
      root: "",
      options: "{\n\n}",
      inputs: "{}",
      workflowUrl: "",
      labels: "{}"
    },
    calls: {},
    outputs: {},
    actualWorkflowLanguage: "WDL",
    id: "9849f8c6-579a-4ef8-ad72-ba0bd162f8dc",
    inputs: {},
    labels: {
      "cromwell-workflow-id": "cromwell-9849f8c6-579a-4ef8-ad72-ba0bd162f8dc"
    },
    submission: "2019-08-14T15:02:42.192Z",
    status: "Failed",
    failures: [
      {
        causedBy: [
          {
            causedBy: [],
            message: "Required workflow input 'subwf.is' not specified"
          }
        ],
        message: "Workflow input processing failed"
      }
    ],
    end: "2019-08-14T15:02:47.805Z",
    start: "2019-08-14T15:02:47.772Z"
  }
  test("no shards in graph with 'NO' layout option", () => {
    const elements = [
      {
        // node a
        data: { id: "a", status: "Done" }
      },
      {
        // node b
        data: { id: "b", status: "Done" }
      },
      { data: { id: "c", status: "Done" } },
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

    graphManipulatorObj.displayShards("no", unrelatedMetadata)

    const nodeCollection = cy.nodes()
    const nodeArray = graphManipulatorObj.parseCollectionToArray(nodeCollection)

    const nodeIdArray = createIdArray(nodeArray)

    expect(nodeIdArray.sort()).toMatchObject(["a", "b", "c"])

    const edgeIdArray = createIdArray(
      graphManipulatorObj.parseCollectionToArray(cy.edges())
    )

    expect(edgeIdArray.sort()).toMatchObject(["ac", "ba"])
  })

  describe("shards in one parent in graph", () => {
    let elements

    beforeEach(() => {
      elements = [
        {
          // node a
          data: {
            id: "a",
            status: "Done",
            type: "parent",
            parentType: "scatterParent",
            length: 2
          }
        },
        {
          // node b
          data: { id: "b", type: "shard", status: "Failed", parent: "a" }
        },
        { data: { id: "c", type: "shard", status: "Done", parent: "a" } },
        {
          // edge ab
          data: { id: "ba", source: "b", target: "a" }
        },
        {
          // edge ab
          data: { id: "ac", source: "a", target: "c" }
        }
      ]
    })

    // test("'no' layout option", () => {
    //   configurations.elements = elements
    //   const cy = cytoscape(configurations)
    //   const graphManipulatorObj = new GraphManipulator(cy)

    //   graphManipulatorObj.displayShards("no", unrelatedMetadata)

    //   const nodeCollection = cy.nodes()
    //   const nodeArray = graphManipulatorObj.parseCollectionToArray(
    //     nodeCollection
    //   )

    //   const nodeIdArray = createIdArray(nodeArray)

    //   expect(nodeIdArray.sort()).toMatchObject(["a"])

    //   const edgeIdArray = createIdArray(
    //     graphManipulatorObj.parseCollectionToArray(cy.edges())
    //   )

    //   expect(edgeIdArray.sort()).toMatchObject([])
    // })

    // test("'Only Failed' layout option", () => {
    //   configurations.elements = elements
    //   const cy = cytoscape(configurations)
    //   const graphManipulatorObj = new GraphManipulator(cy)

    //   graphManipulatorObj.displayShards("failed", unrelatedMetadata)

    //   const nodeCollection = cy.nodes()
    //   const nodeArray = graphManipulatorObj.parseCollectionToArray(
    //     nodeCollection
    //   )

    //   const nodeIdArray = createIdArray(nodeArray)

    //   expect(nodeIdArray.sort()).toMatchObject(["a", "b"])

    //   const edgeIdArray = createIdArray(
    //     graphManipulatorObj.parseCollectionToArray(cy.edges())
    //   )

    //   expect(edgeIdArray.sort()).toMatchObject(["ba"])
    // })

    test("'all' layout option", () => {
      configurations.elements = elements
      const cy = cytoscape(configurations)
      const graphManipulatorObj = new GraphManipulator(cy)

      graphManipulatorObj.displayShards("all", unrelatedMetadata)

      const nodeCollection = cy.nodes()
      const nodeArray = graphManipulatorObj.parseCollectionToArray(
        nodeCollection
      )

      const nodeIdArray = createIdArray(nodeArray)

      expect(nodeIdArray.sort()).toMatchObject(["a", "b", "c"])

      const edgeIdArray = createIdArray(
        graphManipulatorObj.parseCollectionToArray(cy.edges())
      )

      expect(edgeIdArray.sort()).toMatchObject(["ac", "ba"])
    })

    test("'all' layout option after calling no shards", () => {
      configurations.elements = elements
      const cy = cytoscape(configurations)
      const graphManipulatorObj = new GraphManipulator(cy)

      graphManipulatorObj.displayShards("no", unrelatedMetadata)
      graphManipulatorObj.displayShards("all", unrelatedMetadata)

      const nodeCollection = cy.nodes()
      const nodeArray = graphManipulatorObj.parseCollectionToArray(
        nodeCollection
      )

      const nodeIdArray = createIdArray(nodeArray)

      expect(nodeIdArray.sort()).toMatchObject(["a", "b", "c"])

      const edgeIdArray = createIdArray(
        graphManipulatorObj.parseCollectionToArray(cy.edges())
      )

      expect(edgeIdArray.sort()).toMatchObject(["ac", "ba"])
    })
  })

  describe("shards in two parent in graph", () => {
    let elements
    beforeEach(() => {
      elements = [
        {
          // node a
          data: {
            id: "a",
            status: "Done",
            type: "parent",
            parentType: "scatterParent",
            length: 2
          }
        },
        {
          // node b
          data: { id: "b", type: "shard", status: "Failed", parent: "a" }
        },
        { data: { id: "c", type: "shard", status: "Failed", parent: "a" } },
        {
          // node a
          data: {
            id: "x",
            status: "Done",
            type: "parent",
            parentType: "scatterParent",
            length: 2
          }
        },
        {
          // node b
          data: { id: "y", type: "shard", status: "Running", parent: "x" }
        },
        { data: { id: "z", type: "shard", status: "Done", parent: "x" } },
        {
          // edge ab
          data: { id: "ba", source: "b", target: "a" }
        },
        {
          // edge ab
          data: { id: "ac", source: "a", target: "c" }
        }
      ]
    })

    // test("'no' layout option", () => {
    //   configurations.elements = elements

    //   const cy = cytoscape(configurations)
    //   const graphManipulatorObj = new GraphManipulator(cy)

    //   graphManipulatorObj.displayShards("no", unrelatedMetadata)

    //   const nodeCollection = cy.nodes()
    //   const nodeArray = graphManipulatorObj.parseCollectionToArray(
    //     nodeCollection
    //   )

    //   const nodeIdArray = createIdArray(nodeArray)

    //   expect(nodeIdArray.sort()).toMatchObject(["a", "x"])

    //   const edgeIdArray = createIdArray(
    //     graphManipulatorObj.parseCollectionToArray(cy.edges())
    //   )

    //   expect(edgeIdArray.sort()).toMatchObject([])
    // })

    // test("'only failed' layout option", () => {
    //   configurations.elements = elements

    //   const cy = cytoscape(configurations)
    //   const graphManipulatorObj = new GraphManipulator(cy)

    //   graphManipulatorObj.displayShards("failed", unrelatedMetadata)

    //   const nodeCollection = cy.nodes()
    //   const nodeArray = graphManipulatorObj.parseCollectionToArray(
    //     nodeCollection
    //   )

    //   const nodeIdArray = createIdArray(nodeArray)

    //   expect(nodeIdArray.sort()).toMatchObject(["a", "b", "c", "x"])

    //   const edgeIdArray = createIdArray(
    //     graphManipulatorObj.parseCollectionToArray(cy.edges())
    //   )

    //   expect(edgeIdArray.sort()).toMatchObject(["ac", "ba"])
    // })

    test("'all' layout option", () => {
      configurations.elements = elements

      const cy = cytoscape(configurations)
      const graphManipulatorObj = new GraphManipulator(cy)

      graphManipulatorObj.displayShards("all", unrelatedMetadata)

      const nodeCollection = cy.nodes()
      const nodeArray = graphManipulatorObj.parseCollectionToArray(
        nodeCollection
      )

      const nodeIdArray = createIdArray(nodeArray)

      expect(nodeIdArray.sort()).toMatchObject(["a", "b", "c", "x", "y", "z"])

      const edgeIdArray = createIdArray(
        graphManipulatorObj.parseCollectionToArray(cy.edges())
      )

      expect(edgeIdArray.sort()).toMatchObject(["ac", "ba"])
    })

    test("'all' layout option after removing all shards prior.", () => {
      configurations.elements = elements

      const cy = cytoscape(configurations)
      const graphManipulatorObj = new GraphManipulator(cy)

      graphManipulatorObj.displayShards("no", unrelatedMetadata)
      graphManipulatorObj.displayShards("all", unrelatedMetadata)

      const nodeCollection = cy.nodes()
      const nodeArray = graphManipulatorObj.parseCollectionToArray(
        nodeCollection
      )

      const nodeIdArray = createIdArray(nodeArray)

      expect(nodeIdArray.sort()).toMatchObject(["a", "b", "c", "x", "y", "z"])

      const edgeIdArray = createIdArray(
        graphManipulatorObj.parseCollectionToArray(cy.edges())
      )

      expect(edgeIdArray.sort()).toMatchObject(["ac", "ba"])
    })
  })

  describe("Hard case: shards in two parents. There is one child node that is not a shard ", () => {
    let elements
    beforeEach(() => {
      elements = [
        {
          // node a
          data: {
            id: "a",
            status: "Done",
            type: "parent",
            parentType: "scatterParent",
            length: 2
          }
        },
        {
          // node b
          data: { id: "b", type: "shard", status: "Done", parent: "a" }
        },
        { data: { id: "c", type: "shard", status: "Done", parent: "a" } },
        { data: { id: "w", status: "Done", parent: "w" } },
        {
          // node a
          data: {
            id: "x",
            status: "Done",
            type: "parent",
            parentType: "scatterParent",
            length: 2
          }
        },
        {
          // node b
          data: { id: "y", type: "shard", status: "Done", parent: "x" }
        },
        { data: { id: "z", type: "shard", status: "Done", parent: "x" } },
        {
          // edge ab
          data: { id: "by", source: "b", target: "y" }
        },
        {
          // edge ab
          data: { id: "cz", source: "c", target: "z" }
        }
      ]
      configurations.elements = elements
    })

    // test("'NO' layout option; check that non-shard child is preserved", () => {
    //   const cy = cytoscape(configurations)
    //   const graphManipulatorObj = new GraphManipulator(cy)

    //   graphManipulatorObj.displayShards("no", unrelatedMetadata)

    //   const nodeCollection = cy.nodes()
    //   const nodeArray = graphManipulatorObj.parseCollectionToArray(
    //     nodeCollection
    //   )

    //   const nodeIdArray = createIdArray(nodeArray)

    //   expect(nodeIdArray.sort()).toMatchObject(["a", "w", "x"])
    // })
  })
})

describe("Hard Case displayShards: two scatters: ", () => {
  let elements
  beforeEach(() => {
    elements = [
      {
        // node a
        data: {
          id: "a",
          status: "Done",
          type: "parent",
          parentType: "scatterParent",
          length: 2
        }
      },
      {
        // node b
        data: {
          id: "a>shard_0",
          type: "shard",
          status: "Done",
          parent: "a",
          shardIndex: 0
        }
      },
      {
        data: {
          id: "a>shard_1",
          type: "shard",
          status: "Done",
          parent: "a",
          shardIndex: 1
        }
      },
      {
        // node a
        data: {
          id: "x",
          status: "Done",
          type: "parent",
          parentType: "scatterParent",
          length: 2
        }
      },
      {
        // node b
        data: {
          id: "x>shard_0",
          type: "shard",
          status: "Failed",
          parent: "x",
          shardIndex: 0
        }
      },
      {
        data: {
          id: "x>shard_1",
          type: "shard",
          status: "Failed",
          parent: "x",
          shardIndex: 1
        }
      },
      {
        // edge ab
        data: { id: "by", source: "b", target: "y" }
      },
      {
        // edge ab
        data: { id: "cz", source: "c", target: "z" }
      }
    ]
  })

  // test("'no' layout option; check that edges go back to parent if all shards are removed", () => {
  //   configurations.elements = elements
  //   const cy = cytoscape(configurations)
  //   const graphManipulatorObj = new GraphManipulator(cy)

  //   graphManipulatorObj.displayShards("no", unrelatedMetadata)

  //   const nodeCollection = cy.nodes()
  //   const nodeArray = graphManipulatorObj.parseCollectionToArray(nodeCollection)

  //   const nodeIdArray = createIdArray(nodeArray)

  //   expect(nodeIdArray.sort()).toMatchObject(["a", "x"])

  //   const edgeIdArray = createIdArray(
  //     graphManipulatorObj.parseCollectionToArray(cy.edges())
  //   )

  //   expect(edgeIdArray.sort()).toMatchObject(["edge_from_a_to_x"])
  // })

  // test("'failed' layout option; check that edges go back to parent if all shards are removed", () => {
  //   configurations.elements = elements
  //   const cy = cytoscape(configurations)
  //   const graphManipulatorObj = new GraphManipulator(cy)

  //   graphManipulatorObj.displayShards("failed", unrelatedMetadata)

  //   const nodeCollection = cy.nodes()
  //   const nodeArray = graphManipulatorObj.parseCollectionToArray(nodeCollection)

  //   const nodeIdArray = createIdArray(nodeArray)

  //   expect(nodeIdArray.sort()).toMatchObject([
  //     "a",
  //     "a>shard_0",
  //     "a>shard_1",
  //     "x"
  //   ])

  //   const edgeIdArray = createIdArray(
  //     graphManipulatorObj.parseCollectionToArray(cy.edges())
  //   )

  //   expect(edgeIdArray.sort()).toMatchObject([
  //     "edge_from_a>shard_0_to_x",
  //     "edge_from_a>shard_1_to_x"
  //   ])
  // })
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
    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)
    const prefix = graphManipulatorObj.findParentPrefixOfShardId(string)

    expect(prefix).toBe("hello>test")
  })

  test("empty string input", () => {
    const string = ""
    const cy = cytoscape(configurations)
    const graphManipulatorObj = new GraphManipulator(cy)
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
