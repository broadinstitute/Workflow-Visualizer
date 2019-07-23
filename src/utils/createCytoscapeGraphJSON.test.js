import {
  initializeEdgesJSON,
  initializeNodesJSON
} from "./createCytoscapeGraphJSON"

// we should never input null because we are taking inputs from the file dotStringParsingFucntions,
// so graph obj should be at least empty not null
test("initializeEdgesJSON: test null input", () => {
  expect(() => {
    initializeEdgesJSON(null)
  }).toThrow(TypeError)
})

test("initializeEdgesJSON: test empty graph", () => {
  const actualEdgeArray = initializeEdgesJSON({})
  expect(actualEdgeArray).toEqual([])
})

test("initializeEdgesJSON: test single edge graph obj", () => {
  const actualEdgeArray = initializeEdgesJSON({ A: ["B"], B: [] })
  const expectedEdgeArray = [
    { data: { id: "edge_from_A_to_B", source: "A", target: "B" } }
  ]
  expect(actualEdgeArray).toEqual(expectedEdgeArray)
})

// You should be able to draw parallel edges as long as they go opposite directions
// the edge id convention should be able to handle that with 'to', 'from' placement
test("initializeEdgesJSON: test two edges from A to B & B to A", () => {
  const actualEdgeArray = initializeEdgesJSON({ A: ["B"], B: ["A"] })
  const expectedEdgeArray = [
    { data: { id: "edge_from_A_to_B", source: "A", target: "B" } },
    { data: { id: "edge_from_B_to_A", source: "B", target: "A" } }
  ]
  expect(actualEdgeArray).toEqual(expectedEdgeArray)
})

test("initializeEdgesJSON: test 4 edges, with four nodes", () => {
  const actualEdgeArray = initializeEdgesJSON({
    A: ["B"],
    B: ["C"],
    C: ["D"],
    D: ["E"]
  })
  const expectedEdgeArray = [
    { data: { id: "edge_from_A_to_B", source: "A", target: "B" } },
    { data: { id: "edge_from_B_to_C", source: "B", target: "C" } },
    { data: { id: "edge_from_C_to_D", source: "C", target: "D" } },
    { data: { id: "edge_from_D_to_E", source: "D", target: "E" } }
  ]
  expect(actualEdgeArray).toEqual(expectedEdgeArray)
})

test("initializeNodesJSON: test null input. It should just throw a type error", () => {
  expect(() => {
    initializeNodesJSON(null)
  }).toThrow(TypeError)
})

test("initializeNodesJSON: test empty array input.", () => {
  const actualNodesArray = initializeNodesJSON({})
  expect(actualNodesArray).toEqual([])
})

test("initializeNodesJSON: test single node input, should return a formatted node in json format", () => {
  const actualNodesArray = initializeNodesJSON({
    A: {
      name: "As",
      directParent: null,
      isParent: false,
      callableName: "Call As"
    }
  })
  const expectedNodesArray = [
    {
      data: {
        id: "A",
        name: "As",
        parent: null,
        type: "single-task",
        callableName: "Call As"
      }
    }
  ]
  expect(actualNodesArray).toEqual(expectedNodesArray)
})

test("initializeNodesJSON: test two node input in which one is parent to other", () => {
  const actualNodesArray = initializeNodesJSON({
    A: {
      name: "As",
      directParent: null,
      isParent: true,
      callableName: "Call As"
    },
    B: {
      name: "Bs",
      directParent: "A",
      isParent: false,
      callableName: "Call Bs"
    }
  }).sort()
  const expectedNodesArray = [
    {
      data: {
        id: "A",
        name: "As",
        parent: null,
        type: "parent",
        callableName: "Call As"
      }
    },
    {
      data: {
        id: "B",
        name: "Bs",
        parent: "A",
        type: "single-task",
        callableName: "Call Bs"
      }
    }
  ].sort()
  expect(actualNodesArray).toEqual(expectedNodesArray)
})

test("initializeNodesJSON: test two node input who are not parent-child", () => {
  const actualNodesArray = initializeNodesJSON({
    A: {
      name: "As",
      directParent: null,
      isParent: false,
      callableName: "Call As"
    },
    B: {
      name: "Bs",
      directParent: null,
      isParent: false,
      callableName: "Call Bs"
    }
  }).sort()
  const expectedNodesArray = [
    {
      data: {
        id: "A",
        name: "As",
        parent: null,
        type: "single-task",
        callableName: "Call As"
      }
    },
    {
      data: {
        id: "B",
        name: "Bs",
        parent: null,
        type: "single-task",
        callableName: "Call Bs"
      }
    }
  ].sort()
  expect(actualNodesArray).toEqual(expectedNodesArray)
})
