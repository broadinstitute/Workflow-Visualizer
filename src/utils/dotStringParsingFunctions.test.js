import * as dotStringParsingFunctions from "./dotStringParsingFunctions"
import dotparser from "dotparser"

test("parseCallable: null callableString", () => {
  const returnDict = dotStringParsingFunctions.parseCallable(null)
  const correctDict = { alias: null, name: null }
  expect(returnDict).toEqual(correctDict)
})

test("parseCallable: emtpy callableString", () => {
  const returnDict = dotStringParsingFunctions.parseCallable("")
  const correctDict = { alias: "", name: "" }
  expect(returnDict).toEqual(correctDict)
})

test("parseCallable: not dot string", () => {
  const returnDict = dotStringParsingFunctions.parseCallable("noDOT")
  const correctDict = { alias: "noDOT", name: "" }
  expect(returnDict).toEqual(correctDict)
})

test("parseCallable: empty name callableString", () => {
  const returnDict = dotStringParsingFunctions.parseCallable(".a")
  const correctDict = { alias: "", name: "a" }
  expect(returnDict).toEqual(correctDict)
})

test("parseCallable: empty alias callableString", () => {
  const returnDict = dotStringParsingFunctions.parseCallable("a.")
  const correctDict = { alias: "a", name: "" }
  expect(returnDict).toEqual(correctDict)
})

test("parseCallable: '.' callableString", () => {
  const returnDict = dotStringParsingFunctions.parseCallable(".")
  const correctDict = { alias: "", name: "" }
  expect(returnDict).toEqual(correctDict)
})

test("parseCallable: typical input of callableString", () => {
  const returnDict = dotStringParsingFunctions.parseCallable("sub1.sub2")
  const correctDict = { alias: "sub1", name: "sub2" }
  expect(returnDict).toEqual(correctDict)
})

test("parseChildArray: null inputs", () => {
  const returnGraphAndIdNodeMap = dotStringParsingFunctions.parseChildArray(
    null,
    {},
    {},
    null,
    null
  )
  const correctGraphAndIdNodeMap = { graph: {}, idToNodeMap: {} }
  expect(returnGraphAndIdNodeMap).toEqual(correctGraphAndIdNodeMap)
})

test("parseChildArray: single node child array", () => {
  const childArrayString =
    '[{"type":"attr_stmt","target":"graph","attr_list":[{"type":"attr","id":"compound","eq":"true"}]},{"type":"node_stmt","node_id":{"type":"node_id","id":"call sub1.sub1&subN1"},"attr_list":[]}]'

  const childArray = JSON.parse(childArrayString)
  const returnGraphAndIdNodeMap = dotStringParsingFunctions.parseChildArray(
    childArray,
    {},
    {},
    null,
    "nested_subworkflows_4"
  )
  const correctGraphAndIdNodeMap = {
    graph: { "nested_subworkflows_4>subN1": [] },
    idToNodeMap: {
      "nested_subworkflows_4>subN1": {
        callableName: "sub1.sub1",
        directParent: null,
        id: "nested_subworkflows_4>subN1",
        isParent: false,
        name: "subN1"
      }
    }
  }
  expect(returnGraphAndIdNodeMap).toEqual(correctGraphAndIdNodeMap)
})

test("parseChildArray: no attribute array. Other typical input", () => {
  const childArrayString =
    '[{"type":"node_stmt","node_id":{"type":"node_id","id":"call sub1.sub1&subN1"},"attr_list":[]}]'

  const childArray = JSON.parse(childArrayString)
  const returnGraphAndIdNodeMap = dotStringParsingFunctions.parseChildArray(
    childArray,
    {},
    {},
    null,
    "nested_subworkflows_4"
  )
  const correctGraphAndIdNodeMap = {
    graph: { "nested_subworkflows_4>subN1": [] },
    idToNodeMap: {
      "nested_subworkflows_4>subN1": {
        callableName: "sub1.sub1",
        directParent: null,
        id: "nested_subworkflows_4>subN1",
        isParent: false,
        name: "subN1"
      }
    }
  }
  expect(returnGraphAndIdNodeMap).toEqual(correctGraphAndIdNodeMap)
})

test("parseChildArray: single node child array. Lacks a 'call' within name. But still should pass", () => {
  const childArrayString =
    '[{"type":"attr_stmt","target":"graph","attr_list":[{"type":"attr","id":"compound","eq":"true"}]},{"type":"node_stmt","node_id":{"type":"node_id","id":"sub1.sub1&subN1"},"attr_list":[]}]'

  const childArray = JSON.parse(childArrayString)
  const returnGraphAndIdNodeMap = dotStringParsingFunctions.parseChildArray(
    childArray,
    {},
    {},
    null,
    "nested_subworkflows_4"
  )
  const correctGraphAndIdNodeMap = {
    graph: { "nested_subworkflows_4>subN1": [] },
    idToNodeMap: {
      "nested_subworkflows_4>subN1": {
        callableName: "sub1.sub1",
        directParent: null,
        id: "nested_subworkflows_4>subN1",
        isParent: false,
        name: "subN1"
      }
    }
  }
  expect(returnGraphAndIdNodeMap).toEqual(correctGraphAndIdNodeMap)
})

test("readDotFile: sub3 dot file. Testing that scatter (iu) will only show one even though child array has two nested versions. Also (iu) will no longer be a nested parent due to clutter", () => {
  const sub3 =
    'digraph sub3 { compound=true; subgraph cluster_0 { "call increment&increment" "scatter (iu)" [shape=plaintext] } }'
  const returnGraphAndIdNodeMap = dotStringParsingFunctions.readDotString(sub3)
  const correctGraphAndIdNodeMap = {
    graph: { "sub3>(iu)": [], "sub3>increment": [] },
    idToNodeMap: {
      "sub3>(iu)": {
        callableName: null,
        directParent: null,
        id: "sub3>(iu)",
        isParent: true,
        name: "scatter (iu)"
      },
      "sub3>increment": {
        callableName: "increment",
        directParent: "sub3>(iu)",
        id: "sub3>increment",
        isParent: false,
        name: "increment"
      }
    }
  }
  expect(returnGraphAndIdNodeMap).toEqual(correctGraphAndIdNodeMap)
})
