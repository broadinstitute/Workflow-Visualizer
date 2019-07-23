import { createShardId, returnDataDictionary } from "./metadataFunctions"

const scatterGatherJson = {
  workflowName: "scattergather",
  workflowProcessingEvents: [
    {
      cromwellId: "cromid-2b472a7",
      description: "Finished",
      timestamp: "2019-07-16T18:27:34.201Z",
      cromwellVersion: "42"
    },
    {
      cromwellId: "cromid-2b472a7",
      description: "PickedUp",
      timestamp: "2019-07-16T18:27:08.613Z",
      cromwellVersion: "42"
    }
  ],
  actualWorkflowLanguageVersion: "draft-2",
  submittedFiles: {
    workflow:
      'task prepare {\n command <<<\n    python3 -c "print(\'one\\ntwo\\nthree\\nfour\')"\n  >>>\n  output {\n    Array[String] array = read_lines(stdout())\n  }\n  runtime {\n    docker: "python:3.5.0"\n  }\n}\n\ntask analysis {\n  String str\n  command <<<\n    python3 -c "print(\'_${str}_\')" > a.txt\n  >>>\n  output {\n    File out = "a.txt"\n  }\n  runtime {\n    docker: "python:3.5.0"\n  }\n}\n\ntask gather {\n  Array[File] array\n  command <<<\n    cat ${sep=\' \' array}\n  >>>\n  output {\n    String str = read_string(stdout())\n  }\n  runtime {\n    docker: "ubuntu:latest"\n  }\n}\n\nworkflow scattergather {\n  call prepare\n  scatter (x in prepare.array) {\n    call analysis {input: str=x }\n  }\n  call gather {input: array=analysis.out}\n  output {\n    String gather_str =  gather.str\n  }\n}',
    root: "",
    options: "{\n\n}",
    inputs: "{}",
    workflowUrl: "",
    labels: "{}"
  },
  calls: {
    "scattergather.analysis": [
      {
        executionStatus: "Done",
        stdout:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-0/execution/stdout",
        backendStatus: "Done",
        commandLine: "python3 -c \"print('_one_')\" > a.txt",
        shardIndex: 0,
        outputs: {
          out:
            "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-0/execution/a.txt"
        },
        runtimeAttributes: {
          docker: "python:3.5.0",
          failOnStderr: "false",
          maxRetries: "0",
          continueOnReturnCode: "0"
        },
        callCaching: {
          allowResultReuse: false,
          effectiveCallCachingMode: "CallCachingOff"
        },
        inputs: {
          str: "one"
        },
        returnCode: 0,
        jobId: "60686",
        backend: "Local",
        end: "2019-07-16T18:27:26.435Z",
        dockerImageUsed:
          "python@sha256:b5314ec1d21c823b4ea4a9027f9b240d4907830808dd44126443907d27721968",
        stderr:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-0/execution/stderr",
        callRoot:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-0",
        attempt: 1,
        executionEvents: [
          {
            startTime: "2019-07-16T18:27:20.518Z",
            description: "WaitingForValueStore",
            endTime: "2019-07-16T18:27:20.519Z"
          },
          {
            startTime: "2019-07-16T18:27:20.529Z",
            description: "RunningJob",
            endTime: "2019-07-16T18:27:25.443Z"
          },
          {
            startTime: "2019-07-16T18:27:25.443Z",
            description: "UpdatingJobStore",
            endTime: "2019-07-16T18:27:26.435Z"
          },
          {
            startTime: "2019-07-16T18:27:20.519Z",
            description: "PreparingJob",
            endTime: "2019-07-16T18:27:20.529Z"
          },
          {
            startTime: "2019-07-16T18:27:19.920Z",
            description: "RequestingExecutionToken",
            endTime: "2019-07-16T18:27:20.518Z"
          },
          {
            startTime: "2019-07-16T18:27:19.920Z",
            description: "Pending",
            endTime: "2019-07-16T18:27:19.920Z"
          }
        ],
        start: "2019-07-16T18:27:19.920Z"
      },
      {
        executionStatus: "Done",
        stdout:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-1/execution/stdout",
        backendStatus: "Done",
        commandLine: "python3 -c \"print('_two_')\" > a.txt",
        shardIndex: 1,
        outputs: {
          out:
            "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-1/execution/a.txt"
        },
        runtimeAttributes: {
          docker: "python:3.5.0",
          failOnStderr: "false",
          maxRetries: "0",
          continueOnReturnCode: "0"
        },
        callCaching: {
          allowResultReuse: false,
          effectiveCallCachingMode: "CallCachingOff"
        },
        inputs: {
          str: "two"
        },
        returnCode: 0,
        jobId: "60689",
        backend: "Local",
        end: "2019-07-16T18:27:26.436Z",
        dockerImageUsed:
          "python@sha256:b5314ec1d21c823b4ea4a9027f9b240d4907830808dd44126443907d27721968",
        stderr:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-1/execution/stderr",
        callRoot:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-1",
        attempt: 1,
        executionEvents: [
          {
            startTime: "2019-07-16T18:27:20.525Z",
            description: "RunningJob",
            endTime: "2019-07-16T18:27:25.443Z"
          },
          {
            startTime: "2019-07-16T18:27:25.443Z",
            description: "UpdatingJobStore",
            endTime: "2019-07-16T18:27:26.435Z"
          },
          {
            startTime: "2019-07-16T18:27:20.518Z",
            description: "WaitingForValueStore",
            endTime: "2019-07-16T18:27:20.519Z"
          },
          {
            startTime: "2019-07-16T18:27:20.519Z",
            description: "PreparingJob",
            endTime: "2019-07-16T18:27:20.525Z"
          },
          {
            startTime: "2019-07-16T18:27:19.920Z",
            description: "RequestingExecutionToken",
            endTime: "2019-07-16T18:27:20.518Z"
          },
          {
            startTime: "2019-07-16T18:27:19.919Z",
            description: "Pending",
            endTime: "2019-07-16T18:27:19.920Z"
          }
        ],
        start: "2019-07-16T18:27:19.919Z"
      },
      {
        executionStatus: "Done",
        stdout:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-2/execution/stdout",
        backendStatus: "Done",
        commandLine: "python3 -c \"print('_three_')\" > a.txt",
        shardIndex: 2,
        outputs: {
          out:
            "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-2/execution/a.txt"
        },
        runtimeAttributes: {
          docker: "python:3.5.0",
          failOnStderr: "false",
          maxRetries: "0",
          continueOnReturnCode: "0"
        },
        callCaching: {
          allowResultReuse: false,
          effectiveCallCachingMode: "CallCachingOff"
        },
        inputs: {
          str: "three"
        },
        returnCode: 0,
        jobId: "60687",
        backend: "Local",
        end: "2019-07-16T18:27:26.435Z",
        dockerImageUsed:
          "python@sha256:b5314ec1d21c823b4ea4a9027f9b240d4907830808dd44126443907d27721968",
        stderr:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-2/execution/stderr",
        callRoot:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-2",
        attempt: 1,
        executionEvents: [
          {
            startTime: "2019-07-16T18:27:19.920Z",
            description: "Pending",
            endTime: "2019-07-16T18:27:19.921Z"
          },
          {
            startTime: "2019-07-16T18:27:20.519Z",
            description: "PreparingJob",
            endTime: "2019-07-16T18:27:20.531Z"
          },
          {
            startTime: "2019-07-16T18:27:20.531Z",
            description: "RunningJob",
            endTime: "2019-07-16T18:27:25.443Z"
          },
          {
            startTime: "2019-07-16T18:27:25.443Z",
            description: "UpdatingJobStore",
            endTime: "2019-07-16T18:27:26.435Z"
          },
          {
            startTime: "2019-07-16T18:27:20.518Z",
            description: "WaitingForValueStore",
            endTime: "2019-07-16T18:27:20.519Z"
          },
          {
            startTime: "2019-07-16T18:27:19.921Z",
            description: "RequestingExecutionToken",
            endTime: "2019-07-16T18:27:20.518Z"
          }
        ],
        start: "2019-07-16T18:27:19.920Z"
      },
      {
        executionStatus: "Done",
        stdout:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-3/execution/stdout",
        backendStatus: "Done",
        commandLine: "python3 -c \"print('_four_')\" > a.txt",
        shardIndex: 3,
        outputs: {
          out:
            "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-3/execution/a.txt"
        },
        runtimeAttributes: {
          docker: "python:3.5.0",
          failOnStderr: "false",
          maxRetries: "0",
          continueOnReturnCode: "0"
        },
        callCaching: {
          allowResultReuse: false,
          effectiveCallCachingMode: "CallCachingOff"
        },
        inputs: {
          str: "four"
        },
        returnCode: 0,
        jobId: "60688",
        backend: "Local",
        end: "2019-07-16T18:27:26.435Z",
        dockerImageUsed:
          "python@sha256:b5314ec1d21c823b4ea4a9027f9b240d4907830808dd44126443907d27721968",
        stderr:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-3/execution/stderr",
        callRoot:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-3",
        attempt: 1,
        executionEvents: [
          {
            startTime: "2019-07-16T18:27:20.519Z",
            description: "PreparingJob",
            endTime: "2019-07-16T18:27:20.527Z"
          },
          {
            startTime: "2019-07-16T18:27:19.920Z",
            description: "RequestingExecutionToken",
            endTime: "2019-07-16T18:27:20.518Z"
          },
          {
            startTime: "2019-07-16T18:27:25.443Z",
            description: "UpdatingJobStore",
            endTime: "2019-07-16T18:27:26.435Z"
          },
          {
            startTime: "2019-07-16T18:27:19.920Z",
            description: "Pending",
            endTime: "2019-07-16T18:27:19.920Z"
          },
          {
            startTime: "2019-07-16T18:27:20.518Z",
            description: "WaitingForValueStore",
            endTime: "2019-07-16T18:27:20.519Z"
          },
          {
            startTime: "2019-07-16T18:27:20.527Z",
            description: "RunningJob",
            endTime: "2019-07-16T18:27:25.443Z"
          }
        ],
        start: "2019-07-16T18:27:19.920Z"
      }
    ],
    "scattergather.prepare": [
      {
        executionStatus: "Done",
        stdout:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-prepare/execution/stdout",
        backendStatus: "Done",
        commandLine: "python3 -c \"print('one\\ntwo\\nthree\\nfour')\"",
        shardIndex: -1,
        outputs: {
          array: ["one", "two", "three", "four"]
        },
        runtimeAttributes: {
          docker: "python:3.5.0",
          failOnStderr: "false",
          maxRetries: "0",
          continueOnReturnCode: "0"
        },
        callCaching: {
          allowResultReuse: false,
          effectiveCallCachingMode: "CallCachingOff"
        },
        inputs: {},
        returnCode: 0,
        jobId: "60605",
        backend: "Local",
        end: "2019-07-16T18:27:16.433Z",
        dockerImageUsed:
          "python@sha256:b5314ec1d21c823b4ea4a9027f9b240d4907830808dd44126443907d27721968",
        stderr:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-prepare/execution/stderr",
        callRoot:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-prepare",
        attempt: 1,
        executionEvents: [
          {
            startTime: "2019-07-16T18:27:15.451Z",
            description: "UpdatingJobStore",
            endTime: "2019-07-16T18:27:16.433Z"
          },
          {
            startTime: "2019-07-16T18:27:10.517Z",
            description: "PreparingJob",
            endTime: "2019-07-16T18:27:10.956Z"
          },
          {
            startTime: "2019-07-16T18:27:09.719Z",
            description: "RequestingExecutionToken",
            endTime: "2019-07-16T18:27:10.517Z"
          },
          {
            startTime: "2019-07-16T18:27:10.517Z",
            description: "WaitingForValueStore",
            endTime: "2019-07-16T18:27:10.517Z"
          },
          {
            startTime: "2019-07-16T18:27:09.719Z",
            description: "Pending",
            endTime: "2019-07-16T18:27:09.719Z"
          },
          {
            startTime: "2019-07-16T18:27:10.956Z",
            description: "RunningJob",
            endTime: "2019-07-16T18:27:15.451Z"
          }
        ],
        start: "2019-07-16T18:27:09.718Z"
      }
    ],
    "scattergather.gather": [
      {
        executionStatus: "Done",
        stdout:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-gather/execution/stdout",
        backendStatus: "Done",
        compressedDockerSize: 26720871,
        commandLine:
          "cat /cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-gather/inputs/1333452681/a.txt /cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-gather/inputs/-463498678/a.txt /cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-gather/inputs/2034517259/a.txt /cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-gather/inputs/237565900/a.txt",
        shardIndex: -1,
        outputs: {
          str: "_one_\n_two_\n_three_\n_four_"
        },
        runtimeAttributes: {
          docker: "ubuntu:latest",
          failOnStderr: "false",
          maxRetries: "0",
          continueOnReturnCode: "0"
        },
        callCaching: {
          allowResultReuse: false,
          effectiveCallCachingMode: "CallCachingOff"
        },
        inputs: {
          array: [
            "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-0/execution/a.txt",
            "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-1/execution/a.txt",
            "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-2/execution/a.txt",
            "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-analysis/shard-3/execution/a.txt"
          ]
        },
        returnCode: 0,
        jobId: "60744",
        backend: "Local",
        end: "2019-07-16T18:27:32.433Z",
        dockerImageUsed:
          "ubuntu@sha256:9b1702dcfe32c873a770a32cfd306dd7fc1c4fd134adfb783db68defc8894b3c",
        stderr:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-gather/execution/stderr",
        callRoot:
          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db/call-gather",
        attempt: 1,
        executionEvents: [
          {
            startTime: "2019-07-16T18:27:29.813Z",
            description: "RunningJob",
            endTime: "2019-07-16T18:27:31.834Z"
          },
          {
            startTime: "2019-07-16T18:27:29.519Z",
            description: "WaitingForValueStore",
            endTime: "2019-07-16T18:27:29.520Z"
          },
          {
            startTime: "2019-07-16T18:27:29.098Z",
            description: "Pending",
            endTime: "2019-07-16T18:27:29.098Z"
          },
          {
            startTime: "2019-07-16T18:27:29.098Z",
            description: "RequestingExecutionToken",
            endTime: "2019-07-16T18:27:29.519Z"
          },
          {
            startTime: "2019-07-16T18:27:29.520Z",
            description: "PreparingJob",
            endTime: "2019-07-16T18:27:29.813Z"
          },
          {
            startTime: "2019-07-16T18:27:31.834Z",
            description: "UpdatingJobStore",
            endTime: "2019-07-16T18:27:32.433Z"
          }
        ],
        start: "2019-07-16T18:27:29.098Z"
      }
    ]
  },
  outputs: {
    "scattergather.gather_str": "_one_\n_two_\n_three_\n_four_"
  },
  workflowRoot:
    "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/scattergather/fa57795a-a7bb-4156-bb78-202645c114db",
  actualWorkflowLanguage: "WDL",
  id: "fa57795a-a7bb-4156-bb78-202645c114db",
  inputs: {},
  labels: {
    "cromwell-workflow-id": "cromwell-fa57795a-a7bb-4156-bb78-202645c114db"
  },
  submission: "2019-07-16T18:26:48.940Z",
  status: "Succeeded",
  end: "2019-07-16T18:27:34.200Z",
  start: "2019-07-16T18:27:08.617Z"
}

const nestedFourSubworkflows = {
  workflowName: "nested_subworkflows_4",
  workflowProcessingEvents: [
    {
      cromwellId: "cromid-8933a69",
      description: "PickedUp",
      timestamp: "2019-07-18T19:18:56.734Z",
      cromwellVersion: "42"
    },
    {
      cromwellId: "cromid-8933a69",
      description: "Finished",
      timestamp: "2019-07-18T19:19:17.292Z",
      cromwellVersion: "42"
    }
  ],
  actualWorkflowLanguageVersion: "draft-2",
  submittedFiles: {
    workflow:
      'import "https://raw.githubusercontent.com/rguan1/wdls/master/sub1.wdl" as sub1\n\nworkflow nested_subworkflows_4 {\n\n  Array[Int] ts = range(3)\n\n  call sub1.sub1 as subN1 { input: is = ts }\n\n  output {\n    Array[Int] initial = ts\n    Array[Int] result = subN1.js\n  }\n}\n',
    root: "",
    options: "{\n\n}",
    inputs: "{}",
    workflowUrl: "",
    labels: "{}",
    imports: {
      "https://raw.githubusercontent.com/rguan1/wdls/master/sub2.wdl":
        'import "https://raw.githubusercontent.com/rguan1/wdls/master/sub3.wdl" as sub3\n\ntask increment {\n  Int i\n  command {\n    echo $(( ${i} + 1 ))\n  }\n  output {\n    Int j = read_int(stdout())\n  }\n  runtime {\n    docker: "ubuntu:latest"\n  }\n}\n\nworkflow sub2 {\n  Array[Int] it\n  scatter (i in it) {\n    call increment { input: i = i }\n  }\n\n  call sub3.sub3 as subN3 {input: iu = it}\n  output {\n    Array[Int] js2 = increment.j\n  }\n}',
      "https://raw.githubusercontent.com/rguan1/wdls/master/sub1.wdl":
        'import "https://raw.githubusercontent.com/rguan1/wdls/master/sub2.wdl" as sub2\n\ntask increment {\n  Int i\n  command {\n    echo $(( ${i} + 1 ))\n  }\n  output {\n    Int j = read_int(stdout())\n  }\n  runtime {\n    docker: "ubuntu:latest"\n  }\n}\n\nworkflow sub1 {\n  Array[Int] is\n  scatter (i in is) {\n    call increment { input: i = i }\n  }\n\n  call sub2.sub2 as subN2 { input: it = is }\n  output {\n    Array[Int] js = increment.j\n  }\n}',
      "https://raw.githubusercontent.com/rguan1/wdls/master/sub3.wdl":
        'task increment {\n  Int i\n  command {\n    echo $(( ${i} + 1 ))\n  }\n  output {\n    Int j = read_int(stdout())\n  }\n  runtime {\n    docker: "ubuntu:latest"\n  }\n}\n\nworkflow sub3 {\n  Array[Int] iu\n  scatter (i in iu) {\n    call increment { input: i = i }\n  }\n\n  output {\n    Array[Int] js3 = increment.j\n  }\n}'
    }
  },
  calls: {
    "nested_subworkflows_4.subN1": [
      {
        executionStatus: "Done",
        subWorkflowMetadata: {
          workflowName: "sub1.sub1",
          rootWorkflowId: "d1500a83-7cd5-4292-9745-ccec8fcdd5e6",
          calls: {
            "sub1.subN2": [
              {
                executionStatus: "Done",
                subWorkflowMetadata: {
                  workflowName: "sub2.sub2",
                  rootWorkflowId: "d1500a83-7cd5-4292-9745-ccec8fcdd5e6",
                  calls: {
                    "sub2.subN3": [
                      {
                        executionStatus: "Done",
                        subWorkflowMetadata: {
                          workflowName: "sub3.sub3",
                          rootWorkflowId:
                            "d1500a83-7cd5-4292-9745-ccec8fcdd5e6",
                          calls: {
                            "sub3.increment": [
                              {
                                executionStatus: "Done",
                                stdout:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-subN3/sub3.sub3/eff25c10-64fa-4771-a23b-c369eb5e450c/call-increment/shard-0/execution/stdout",
                                backendStatus: "Done",
                                compressedDockerSize: 26720871,
                                commandLine: "echo $(( 0 + 1 ))",
                                shardIndex: 0,
                                outputs: {
                                  j: 1
                                },
                                runtimeAttributes: {
                                  docker: "ubuntu:latest",
                                  failOnStderr: "false",
                                  maxRetries: "0",
                                  continueOnReturnCode: "0"
                                },
                                callCaching: {
                                  allowResultReuse: false,
                                  effectiveCallCachingMode: "CallCachingOff"
                                },
                                inputs: {
                                  i: 0
                                },
                                returnCode: 0,
                                jobId: "48482",
                                backend: "Local",
                                end: "2019-07-18T19:19:11.162Z",
                                dockerImageUsed:
                                  "ubuntu@sha256:9b1702dcfe32c873a770a32cfd306dd7fc1c4fd134adfb783db68defc8894b3c",
                                stderr:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-subN3/sub3.sub3/eff25c10-64fa-4771-a23b-c369eb5e450c/call-increment/shard-0/execution/stderr",
                                callRoot:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-subN3/sub3.sub3/eff25c10-64fa-4771-a23b-c369eb5e450c/call-increment/shard-0",
                                attempt: 1,
                                executionEvents: [
                                  {
                                    startTime: "2019-07-18T19:19:08.111Z",
                                    description: "RequestingExecutionToken",
                                    endTime: "2019-07-18T19:19:08.252Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:08.256Z",
                                    description: "RunningJob",
                                    endTime: "2019-07-18T19:19:11.011Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:08.252Z",
                                    description: "WaitingForValueStore",
                                    endTime: "2019-07-18T19:19:08.252Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:08.111Z",
                                    description: "Pending",
                                    endTime: "2019-07-18T19:19:08.111Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:11.011Z",
                                    description: "UpdatingJobStore",
                                    endTime: "2019-07-18T19:19:11.161Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:08.252Z",
                                    description: "PreparingJob",
                                    endTime: "2019-07-18T19:19:08.256Z"
                                  }
                                ],
                                start: "2019-07-18T19:19:08.111Z"
                              },
                              {
                                executionStatus: "Done",
                                stdout:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-subN3/sub3.sub3/eff25c10-64fa-4771-a23b-c369eb5e450c/call-increment/shard-1/execution/stdout",
                                backendStatus: "Done",
                                compressedDockerSize: 26720871,
                                commandLine: "echo $(( 1 + 1 ))",
                                shardIndex: 1,
                                outputs: {
                                  j: 2
                                },
                                runtimeAttributes: {
                                  docker: "ubuntu:latest",
                                  failOnStderr: "false",
                                  maxRetries: "0",
                                  continueOnReturnCode: "0"
                                },
                                callCaching: {
                                  allowResultReuse: false,
                                  effectiveCallCachingMode: "CallCachingOff"
                                },
                                inputs: {
                                  i: 1
                                },
                                returnCode: 0,
                                jobId: "48484",
                                backend: "Local",
                                end: "2019-07-18T19:19:11.162Z",
                                dockerImageUsed:
                                  "ubuntu@sha256:9b1702dcfe32c873a770a32cfd306dd7fc1c4fd134adfb783db68defc8894b3c",
                                stderr:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-subN3/sub3.sub3/eff25c10-64fa-4771-a23b-c369eb5e450c/call-increment/shard-1/execution/stderr",
                                callRoot:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-subN3/sub3.sub3/eff25c10-64fa-4771-a23b-c369eb5e450c/call-increment/shard-1",
                                attempt: 1,
                                executionEvents: [
                                  {
                                    startTime: "2019-07-18T19:19:08.111Z",
                                    description: "Pending",
                                    endTime: "2019-07-18T19:19:08.111Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:08.259Z",
                                    description: "RunningJob",
                                    endTime: "2019-07-18T19:19:10.174Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:08.111Z",
                                    description: "RequestingExecutionToken",
                                    endTime: "2019-07-18T19:19:08.252Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:08.252Z",
                                    description: "WaitingForValueStore",
                                    endTime: "2019-07-18T19:19:08.252Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:10.174Z",
                                    description: "UpdatingJobStore",
                                    endTime: "2019-07-18T19:19:11.161Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:08.252Z",
                                    description: "PreparingJob",
                                    endTime: "2019-07-18T19:19:08.259Z"
                                  }
                                ],
                                start: "2019-07-18T19:19:08.111Z"
                              },
                              {
                                executionStatus: "Done",
                                stdout:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-subN3/sub3.sub3/eff25c10-64fa-4771-a23b-c369eb5e450c/call-increment/shard-2/execution/stdout",
                                backendStatus: "Done",
                                compressedDockerSize: 26720871,
                                commandLine: "echo $(( 2 + 1 ))",
                                shardIndex: 2,
                                outputs: {
                                  j: 3
                                },
                                runtimeAttributes: {
                                  docker: "ubuntu:latest",
                                  failOnStderr: "false",
                                  maxRetries: "0",
                                  continueOnReturnCode: "0"
                                },
                                callCaching: {
                                  allowResultReuse: false,
                                  effectiveCallCachingMode: "CallCachingOff"
                                },
                                inputs: {
                                  i: 2
                                },
                                returnCode: 0,
                                jobId: "48481",
                                backend: "Local",
                                end: "2019-07-18T19:19:11.162Z",
                                dockerImageUsed:
                                  "ubuntu@sha256:9b1702dcfe32c873a770a32cfd306dd7fc1c4fd134adfb783db68defc8894b3c",
                                stderr:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-subN3/sub3.sub3/eff25c10-64fa-4771-a23b-c369eb5e450c/call-increment/shard-2/execution/stderr",
                                callRoot:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-subN3/sub3.sub3/eff25c10-64fa-4771-a23b-c369eb5e450c/call-increment/shard-2",
                                attempt: 1,
                                executionEvents: [
                                  {
                                    startTime: "2019-07-18T19:19:08.111Z",
                                    description: "Pending",
                                    endTime: "2019-07-18T19:19:08.111Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:08.252Z",
                                    description: "PreparingJob",
                                    endTime: "2019-07-18T19:19:08.257Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:10.174Z",
                                    description: "UpdatingJobStore",
                                    endTime: "2019-07-18T19:19:11.161Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:08.111Z",
                                    description: "RequestingExecutionToken",
                                    endTime: "2019-07-18T19:19:08.252Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:08.257Z",
                                    description: "RunningJob",
                                    endTime: "2019-07-18T19:19:10.174Z"
                                  },
                                  {
                                    startTime: "2019-07-18T19:19:08.252Z",
                                    description: "WaitingForValueStore",
                                    endTime: "2019-07-18T19:19:08.252Z"
                                  }
                                ],
                                start: "2019-07-18T19:19:08.111Z"
                              }
                            ]
                          },
                          outputs: {
                            "sub3.js3": [1, 2, 3]
                          },
                          workflowRoot:
                            "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6",
                          id: "eff25c10-64fa-4771-a23b-c369eb5e450c",
                          inputs: {
                            iu: [0, 1, 2]
                          },
                          status: "Succeeded",
                          parentWorkflowId:
                            "f483d1d4-108b-4af4-ab03-21e1748a8a45",
                          end: "2019-07-18T19:19:13.210Z",
                          start: "2019-07-18T19:19:04.031Z"
                        },
                        shardIndex: -1,
                        outputs: {
                          js3: [1, 2, 3]
                        },
                        inputs: {
                          iu: [0, 1, 2]
                        },
                        end: "2019-07-18T19:19:13.210Z",
                        attempt: 1,
                        executionEvents: [
                          {
                            startTime: "2019-07-18T19:19:04.032Z",
                            description: "SubWorkflowRunningState",
                            endTime: "2019-07-18T19:19:13.210Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:04.031Z",
                            description: "SubWorkflowPreparingState",
                            endTime: "2019-07-18T19:19:04.032Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:04.030Z",
                            description: "SubWorkflowPendingState",
                            endTime: "2019-07-18T19:19:04.030Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:04.030Z",
                            description: "WaitingForValueStore",
                            endTime: "2019-07-18T19:19:04.031Z"
                          }
                        ],
                        start: "2019-07-18T19:19:04.030Z"
                      }
                    ],
                    "sub2.increment": [
                      {
                        executionStatus: "Done",
                        stdout:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-increment/shard-0/execution/stdout",
                        backendStatus: "Done",
                        compressedDockerSize: 26720871,
                        commandLine: "echo $(( 0 + 1 ))",
                        shardIndex: 0,
                        outputs: {
                          j: 1
                        },
                        runtimeAttributes: {
                          docker: "ubuntu:latest",
                          failOnStderr: "false",
                          maxRetries: "0",
                          continueOnReturnCode: "0"
                        },
                        callCaching: {
                          allowResultReuse: false,
                          effectiveCallCachingMode: "CallCachingOff"
                        },
                        inputs: {
                          i: 0
                        },
                        returnCode: 0,
                        jobId: "48452",
                        backend: "Local",
                        end: "2019-07-18T19:19:11.161Z",
                        dockerImageUsed:
                          "ubuntu@sha256:9b1702dcfe32c873a770a32cfd306dd7fc1c4fd134adfb783db68defc8894b3c",
                        stderr:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-increment/shard-0/execution/stderr",
                        callRoot:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-increment/shard-0",
                        attempt: 1,
                        executionEvents: [
                          {
                            startTime: "2019-07-18T19:19:06.070Z",
                            description: "RequestingExecutionToken",
                            endTime: "2019-07-18T19:19:06.259Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:06.260Z",
                            description: "PreparingJob",
                            endTime: "2019-07-18T19:19:06.265Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:06.265Z",
                            description: "RunningJob",
                            endTime: "2019-07-18T19:19:10.172Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:06.259Z",
                            description: "WaitingForValueStore",
                            endTime: "2019-07-18T19:19:06.260Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:06.069Z",
                            description: "Pending",
                            endTime: "2019-07-18T19:19:06.070Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:10.172Z",
                            description: "UpdatingJobStore",
                            endTime: "2019-07-18T19:19:11.161Z"
                          }
                        ],
                        start: "2019-07-18T19:19:06.069Z"
                      },
                      {
                        executionStatus: "Done",
                        stdout:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-increment/shard-1/execution/stdout",
                        backendStatus: "Done",
                        compressedDockerSize: 26720871,
                        commandLine: "echo $(( 1 + 1 ))",
                        shardIndex: 1,
                        outputs: {
                          j: 2
                        },
                        runtimeAttributes: {
                          docker: "ubuntu:latest",
                          failOnStderr: "false",
                          maxRetries: "0",
                          continueOnReturnCode: "0"
                        },
                        callCaching: {
                          allowResultReuse: false,
                          effectiveCallCachingMode: "CallCachingOff"
                        },
                        inputs: {
                          i: 1
                        },
                        returnCode: 0,
                        jobId: "48454",
                        backend: "Local",
                        end: "2019-07-18T19:19:11.161Z",
                        dockerImageUsed:
                          "ubuntu@sha256:9b1702dcfe32c873a770a32cfd306dd7fc1c4fd134adfb783db68defc8894b3c",
                        stderr:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-increment/shard-1/execution/stderr",
                        callRoot:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-increment/shard-1",
                        attempt: 1,
                        executionEvents: [
                          {
                            startTime: "2019-07-18T19:19:06.259Z",
                            description: "WaitingForValueStore",
                            endTime: "2019-07-18T19:19:06.260Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:06.070Z",
                            description: "RequestingExecutionToken",
                            endTime: "2019-07-18T19:19:06.259Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:06.267Z",
                            description: "RunningJob",
                            endTime: "2019-07-18T19:19:10.172Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:10.172Z",
                            description: "UpdatingJobStore",
                            endTime: "2019-07-18T19:19:11.161Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:06.070Z",
                            description: "Pending",
                            endTime: "2019-07-18T19:19:06.070Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:06.260Z",
                            description: "PreparingJob",
                            endTime: "2019-07-18T19:19:06.267Z"
                          }
                        ],
                        start: "2019-07-18T19:19:06.070Z"
                      },
                      {
                        executionStatus: "Done",
                        stdout:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-increment/shard-2/execution/stdout",
                        backendStatus: "Done",
                        compressedDockerSize: 26720871,
                        commandLine: "echo $(( 2 + 1 ))",
                        shardIndex: 2,
                        outputs: {
                          j: 3
                        },
                        runtimeAttributes: {
                          docker: "ubuntu:latest",
                          failOnStderr: "false",
                          maxRetries: "0",
                          continueOnReturnCode: "0"
                        },
                        callCaching: {
                          allowResultReuse: false,
                          effectiveCallCachingMode: "CallCachingOff"
                        },
                        inputs: {
                          i: 2
                        },
                        returnCode: 0,
                        jobId: "48464",
                        backend: "Local",
                        end: "2019-07-18T19:19:11.162Z",
                        dockerImageUsed:
                          "ubuntu@sha256:9b1702dcfe32c873a770a32cfd306dd7fc1c4fd134adfb783db68defc8894b3c",
                        stderr:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-increment/shard-2/execution/stderr",
                        callRoot:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-subN2/sub2.sub2/f483d1d4-108b-4af4-ab03-21e1748a8a45/call-increment/shard-2",
                        attempt: 1,
                        executionEvents: [
                          {
                            startTime: "2019-07-18T19:19:06.070Z",
                            description: "RequestingExecutionToken",
                            endTime: "2019-07-18T19:19:06.259Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:06.274Z",
                            description: "RunningJob",
                            endTime: "2019-07-18T19:19:10.175Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:06.070Z",
                            description: "Pending",
                            endTime: "2019-07-18T19:19:06.070Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:06.260Z",
                            description: "PreparingJob",
                            endTime: "2019-07-18T19:19:06.274Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:06.259Z",
                            description: "WaitingForValueStore",
                            endTime: "2019-07-18T19:19:06.260Z"
                          },
                          {
                            startTime: "2019-07-18T19:19:10.175Z",
                            description: "UpdatingJobStore",
                            endTime: "2019-07-18T19:19:11.161Z"
                          }
                        ],
                        start: "2019-07-18T19:19:06.069Z"
                      }
                    ]
                  },
                  outputs: {
                    "sub2.js2": [1, 2, 3]
                  },
                  workflowRoot:
                    "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6",
                  id: "f483d1d4-108b-4af4-ab03-21e1748a8a45",
                  inputs: {
                    it: [0, 1, 2]
                  },
                  status: "Succeeded",
                  parentWorkflowId: "acd34b7f-0f06-4528-aa27-362bbb0433c1",
                  end: "2019-07-18T19:19:14.230Z",
                  start: "2019-07-18T19:19:01.991Z"
                },
                shardIndex: -1,
                outputs: {
                  js2: [1, 2, 3]
                },
                inputs: {
                  it: [0, 1, 2]
                },
                end: "2019-07-18T19:19:14.230Z",
                attempt: 1,
                executionEvents: [
                  {
                    startTime: "2019-07-18T19:19:01.991Z",
                    description: "SubWorkflowPreparingState",
                    endTime: "2019-07-18T19:19:01.993Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:01.991Z",
                    description: "WaitingForValueStore",
                    endTime: "2019-07-18T19:19:01.991Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:01.993Z",
                    description: "SubWorkflowRunningState",
                    endTime: "2019-07-18T19:19:14.230Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:01.991Z",
                    description: "SubWorkflowPendingState",
                    endTime: "2019-07-18T19:19:01.991Z"
                  }
                ],
                start: "2019-07-18T19:19:01.990Z"
              }
            ],
            "sub1.increment": [
              {
                executionStatus: "Done",
                stdout:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-increment/shard-0/execution/stdout",
                backendStatus: "Done",
                compressedDockerSize: 26720871,
                commandLine: "echo $(( 0 + 1 ))",
                shardIndex: 0,
                outputs: {
                  j: 1
                },
                runtimeAttributes: {
                  docker: "ubuntu:latest",
                  failOnStderr: "false",
                  maxRetries: "0",
                  continueOnReturnCode: "0"
                },
                callCaching: {
                  allowResultReuse: false,
                  effectiveCallCachingMode: "CallCachingOff"
                },
                inputs: {
                  i: 0
                },
                returnCode: 0,
                jobId: "48425",
                backend: "Local",
                end: "2019-07-18T19:19:07.150Z",
                dockerImageUsed:
                  "ubuntu@sha256:9b1702dcfe32c873a770a32cfd306dd7fc1c4fd134adfb783db68defc8894b3c",
                stderr:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-increment/shard-0/execution/stderr",
                callRoot:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-increment/shard-0",
                attempt: 1,
                executionEvents: [
                  {
                    startTime: "2019-07-18T19:19:04.251Z",
                    description: "WaitingForValueStore",
                    endTime: "2019-07-18T19:19:04.251Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:04.266Z",
                    description: "RunningJob",
                    endTime: "2019-07-18T19:19:06.184Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:06.184Z",
                    description: "UpdatingJobStore",
                    endTime: "2019-07-18T19:19:07.150Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:04.031Z",
                    description: "Pending",
                    endTime: "2019-07-18T19:19:04.031Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:04.031Z",
                    description: "RequestingExecutionToken",
                    endTime: "2019-07-18T19:19:04.251Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:04.251Z",
                    description: "PreparingJob",
                    endTime: "2019-07-18T19:19:04.266Z"
                  }
                ],
                start: "2019-07-18T19:19:04.031Z"
              },
              {
                executionStatus: "Done",
                stdout:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-increment/shard-1/execution/stdout",
                backendStatus: "Done",
                compressedDockerSize: 26720871,
                commandLine: "echo $(( 1 + 1 ))",
                shardIndex: 1,
                outputs: {
                  j: 2
                },
                runtimeAttributes: {
                  docker: "ubuntu:latest",
                  failOnStderr: "false",
                  maxRetries: "0",
                  continueOnReturnCode: "0"
                },
                callCaching: {
                  allowResultReuse: false,
                  effectiveCallCachingMode: "CallCachingOff"
                },
                inputs: {
                  i: 1
                },
                returnCode: 0,
                jobId: "48426",
                backend: "Local",
                end: "2019-07-18T19:19:07.150Z",
                dockerImageUsed:
                  "ubuntu@sha256:9b1702dcfe32c873a770a32cfd306dd7fc1c4fd134adfb783db68defc8894b3c",
                stderr:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-increment/shard-1/execution/stderr",
                callRoot:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-increment/shard-1",
                attempt: 1,
                executionEvents: [
                  {
                    startTime: "2019-07-18T19:19:04.251Z",
                    description: "WaitingForValueStore",
                    endTime: "2019-07-18T19:19:04.251Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:04.031Z",
                    description: "Pending",
                    endTime: "2019-07-18T19:19:04.031Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:06.290Z",
                    description: "UpdatingJobStore",
                    endTime: "2019-07-18T19:19:07.150Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:04.251Z",
                    description: "PreparingJob",
                    endTime: "2019-07-18T19:19:04.271Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:04.031Z",
                    description: "RequestingExecutionToken",
                    endTime: "2019-07-18T19:19:04.251Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:04.271Z",
                    description: "RunningJob",
                    endTime: "2019-07-18T19:19:06.290Z"
                  }
                ],
                start: "2019-07-18T19:19:04.030Z"
              },
              {
                executionStatus: "Done",
                stdout:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-increment/shard-2/execution/stdout",
                backendStatus: "Done",
                compressedDockerSize: 26720871,
                commandLine: "echo $(( 2 + 1 ))",
                shardIndex: 2,
                outputs: {
                  j: 3
                },
                runtimeAttributes: {
                  docker: "ubuntu:latest",
                  failOnStderr: "false",
                  maxRetries: "0",
                  continueOnReturnCode: "0"
                },
                callCaching: {
                  allowResultReuse: false,
                  effectiveCallCachingMode: "CallCachingOff"
                },
                inputs: {
                  i: 2
                },
                returnCode: 0,
                jobId: "48427",
                backend: "Local",
                end: "2019-07-18T19:19:06.157Z",
                dockerImageUsed:
                  "ubuntu@sha256:9b1702dcfe32c873a770a32cfd306dd7fc1c4fd134adfb783db68defc8894b3c",
                stderr:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-increment/shard-2/execution/stderr",
                callRoot:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6/call-subN1/sub1.sub1/acd34b7f-0f06-4528-aa27-362bbb0433c1/call-increment/shard-2",
                attempt: 1,
                executionEvents: [
                  {
                    startTime: "2019-07-18T19:19:04.268Z",
                    description: "RunningJob",
                    endTime: "2019-07-18T19:19:05.843Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:04.030Z",
                    description: "Pending",
                    endTime: "2019-07-18T19:19:04.031Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:04.251Z",
                    description: "PreparingJob",
                    endTime: "2019-07-18T19:19:04.268Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:05.843Z",
                    description: "UpdatingJobStore",
                    endTime: "2019-07-18T19:19:06.157Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:04.031Z",
                    description: "RequestingExecutionToken",
                    endTime: "2019-07-18T19:19:04.251Z"
                  },
                  {
                    startTime: "2019-07-18T19:19:04.251Z",
                    description: "WaitingForValueStore",
                    endTime: "2019-07-18T19:19:04.251Z"
                  }
                ],
                start: "2019-07-18T19:19:04.030Z"
              }
            ]
          },
          outputs: {
            "sub1.js": [1, 2, 3]
          },
          workflowRoot:
            "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6",
          id: "acd34b7f-0f06-4528-aa27-362bbb0433c1",
          inputs: {
            is: [0, 1, 2]
          },
          status: "Succeeded",
          parentWorkflowId: "d1500a83-7cd5-4292-9745-ccec8fcdd5e6",
          end: "2019-07-18T19:19:15.251Z",
          start: "2019-07-18T19:18:59.949Z"
        },
        shardIndex: -1,
        outputs: {
          js: [1, 2, 3]
        },
        inputs: {
          is: [0, 1, 2]
        },
        end: "2019-07-18T19:19:15.251Z",
        attempt: 1,
        executionEvents: [
          {
            startTime: "2019-07-18T19:18:59.949Z",
            description: "SubWorkflowPreparingState",
            endTime: "2019-07-18T19:18:59.951Z"
          },
          {
            startTime: "2019-07-18T19:18:59.949Z",
            description: "SubWorkflowPendingState",
            endTime: "2019-07-18T19:18:59.949Z"
          },
          {
            startTime: "2019-07-18T19:18:59.951Z",
            description: "SubWorkflowRunningState",
            endTime: "2019-07-18T19:19:15.251Z"
          },
          {
            startTime: "2019-07-18T19:18:59.949Z",
            description: "WaitingForValueStore",
            endTime: "2019-07-18T19:18:59.949Z"
          }
        ],
        start: "2019-07-18T19:18:59.949Z"
      }
    ]
  },
  outputs: {
    "nested_subworkflows_4.initial": [0, 1, 2],
    "nested_subworkflows_4.result": [1, 2, 3]
  },
  workflowRoot:
    "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/d1500a83-7cd5-4292-9745-ccec8fcdd5e6",
  actualWorkflowLanguage: "WDL",
  id: "d1500a83-7cd5-4292-9745-ccec8fcdd5e6",
  inputs: {
    "nested_subworkflows_4.ts": [0, 1, 2]
  },
  labels: {
    "cromwell-workflow-id": "cromwell-d1500a83-7cd5-4292-9745-ccec8fcdd5e6"
  },
  submission: "2019-07-18T19:18:38.654Z",
  status: "Succeeded",
  end: "2019-07-18T19:19:17.292Z",
  start: "2019-07-18T19:18:56.735Z"
}

const nested4sbwfJustSubmitted = {
  workflowName: "nested_subworkflows_4",
  workflowProcessingEvents: [
    {
      cromwellId: "cromid-8933a69",
      description: "PickedUp",
      timestamp: "2019-07-23T18:35:25.870Z",
      cromwellVersion: "42"
    }
  ],
  actualWorkflowLanguageVersion: "draft-2",
  submittedFiles: {
    workflow:
      'import "https://raw.githubusercontent.com/rguan1/wdls/master/sub1.wdl" as sub1\n\nworkflow nested_subworkflows_4 {\n\n  Array[Int] ts = range(3)\n\n  call sub1.sub1 as subN1 { input: is = ts }\n\n  output {\n    Array[Int] initial = ts\n    Array[Int] result = subN1.js\n  }\n}\n',
    root: "",
    options: "{\n\n}",
    inputs: "{}",
    workflowUrl: "",
    labels: "{}",
    imports: {
      "https://raw.githubusercontent.com/rguan1/wdls/master/sub2.wdl":
        'import "https://raw.githubusercontent.com/rguan1/wdls/master/sub3.wdl" as sub3\n\ntask increment {\n  Int i\n  command {\n    echo $(( ${i} + 1 ))\n  }\n  output {\n    Int j = read_int(stdout())\n  }\n  runtime {\n    docker: "ubuntu:latest"\n  }\n}\n\nworkflow sub2 {\n  Array[Int] it\n  scatter (i in it) {\n    call increment { input: i = i }\n  }\n\n  call sub3.sub3 as subN3 {input: iu = it}\n  output {\n    Array[Int] js2 = increment.j\n  }\n}',
      "https://raw.githubusercontent.com/rguan1/wdls/master/sub1.wdl":
        'import "https://raw.githubusercontent.com/rguan1/wdls/master/sub2.wdl" as sub2\n\ntask increment {\n  Int i\n  command {\n    echo $(( ${i} + 1 ))\n  }\n  output {\n    Int j = read_int(stdout())\n  }\n  runtime {\n    docker: "ubuntu:latest"\n  }\n}\n\nworkflow sub1 {\n  Array[Int] is\n  scatter (i in is) {\n    call increment { input: i = i }\n  }\n\n  call sub2.sub2 as subN2 { input: it = is }\n  output {\n    Array[Int] js = increment.j\n  }\n}',
      "https://raw.githubusercontent.com/rguan1/wdls/master/sub3.wdl":
        'task increment {\n  Int i\n  command {\n    echo $(( ${i} + 1 ))\n  }\n  output {\n    Int j = read_int(stdout())\n  }\n  runtime {\n    docker: "ubuntu:latest"\n  }\n}\n\nworkflow sub3 {\n  Array[Int] iu\n  scatter (i in iu) {\n    call increment { input: i = i }\n  }\n\n  output {\n    Array[Int] js3 = increment.j\n  }\n}'
    }
  },
  calls: {},
  outputs: {},
  workflowRoot:
    "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/f5a91416-83f8-4efc-bb07-39657be2a038",
  actualWorkflowLanguage: "WDL",
  id: "f5a91416-83f8-4efc-bb07-39657be2a038",
  inputs: {
    "nested_subworkflows_4.ts": [0, 1, 2]
  },
  labels: {
    "cromwell-workflow-id": "cromwell-f5a91416-83f8-4efc-bb07-39657be2a038"
  },
  submission: "2019-07-23T18:35:20.867Z",
  status: "Running",
  start: "2019-07-23T18:35:25.870Z"
}

const nested4SbwfHalfNodesInitialized = {
  workflowName: "nested_subworkflows_4",
  workflowProcessingEvents: [
    {
      cromwellId: "cromid-8933a69",
      description: "PickedUp",
      timestamp: "2019-07-23T18:25:25.263Z",
      cromwellVersion: "42"
    }
  ],
  actualWorkflowLanguageVersion: "draft-2",
  submittedFiles: {
    workflow:
      'import "https://raw.githubusercontent.com/rguan1/wdls/master/sub1.wdl" as sub1\n\nworkflow nested_subworkflows_4 {\n\n  Array[Int] ts = range(3)\n\n  call sub1.sub1 as subN1 { input: is = ts }\n\n  output {\n    Array[Int] initial = ts\n    Array[Int] result = subN1.js\n  }\n}\n',
    root: "",
    options: "{\n\n}",
    inputs: "{}",
    workflowUrl: "",
    labels: "{}",
    imports: {
      "https://raw.githubusercontent.com/rguan1/wdls/master/sub2.wdl":
        'import "https://raw.githubusercontent.com/rguan1/wdls/master/sub3.wdl" as sub3\n\ntask increment {\n  Int i\n  command {\n    echo $(( ${i} + 1 ))\n  }\n  output {\n    Int j = read_int(stdout())\n  }\n  runtime {\n    docker: "ubuntu:latest"\n  }\n}\n\nworkflow sub2 {\n  Array[Int] it\n  scatter (i in it) {\n    call increment { input: i = i }\n  }\n\n  call sub3.sub3 as subN3 {input: iu = it}\n  output {\n    Array[Int] js2 = increment.j\n  }\n}',
      "https://raw.githubusercontent.com/rguan1/wdls/master/sub1.wdl":
        'import "https://raw.githubusercontent.com/rguan1/wdls/master/sub2.wdl" as sub2\n\ntask increment {\n  Int i\n  command {\n    echo $(( ${i} + 1 ))\n  }\n  output {\n    Int j = read_int(stdout())\n  }\n  runtime {\n    docker: "ubuntu:latest"\n  }\n}\n\nworkflow sub1 {\n  Array[Int] is\n  scatter (i in is) {\n    call increment { input: i = i }\n  }\n\n  call sub2.sub2 as subN2 { input: it = is }\n  output {\n    Array[Int] js = increment.j\n  }\n}',
      "https://raw.githubusercontent.com/rguan1/wdls/master/sub3.wdl":
        'task increment {\n  Int i\n  command {\n    echo $(( ${i} + 1 ))\n  }\n  output {\n    Int j = read_int(stdout())\n  }\n  runtime {\n    docker: "ubuntu:latest"\n  }\n}\n\nworkflow sub3 {\n  Array[Int] iu\n  scatter (i in iu) {\n    call increment { input: i = i }\n  }\n\n  output {\n    Array[Int] js3 = increment.j\n  }\n}'
    }
  },
  calls: {
    "nested_subworkflows_4.subN1": [
      {
        executionStatus: "Running",
        subWorkflowMetadata: {
          workflowName: "sub1.sub1",
          rootWorkflowId: "b7339b38-3fe3-4a96-8c33-17238cb86ad0",
          calls: {},
          workflowRoot:
            "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/b7339b38-3fe3-4a96-8c33-17238cb86ad0",
          id: "7049f9ef-5a3e-4fbd-ae11-377b55a036e0",
          inputs: {
            is: [0, 1, 2]
          },
          status: "Running",
          parentWorkflowId: "b7339b38-3fe3-4a96-8c33-17238cb86ad0",
          start: "2019-07-23T18:25:27.377Z"
        },
        shardIndex: -1,
        inputs: {
          is: [0, 1, 2]
        },
        attempt: 1,
        start: "2019-07-23T18:25:27.376Z"
      }
    ]
  },
  outputs: {},
  workflowRoot:
    "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/b7339b38-3fe3-4a96-8c33-17238cb86ad0",
  actualWorkflowLanguage: "WDL",
  id: "b7339b38-3fe3-4a96-8c33-17238cb86ad0",
  inputs: {
    "nested_subworkflows_4.ts": [0, 1, 2]
  },
  labels: {
    "cromwell-workflow-id": "cromwell-b7339b38-3fe3-4a96-8c33-17238cb86ad0"
  },
  submission: "2019-07-23T18:25:14.856Z",
  status: "Running",
  start: "2019-07-23T18:25:25.263Z"
}

const nested4sbwfStatusesDoneAndRunning = {
  workflowName: "nested_subworkflows_4",
  workflowProcessingEvents: [
    {
      cromwellId: "cromid-8933a69",
      description: "PickedUp",
      timestamp: "2019-07-23T18:38:46.085Z",
      cromwellVersion: "42"
    }
  ],
  actualWorkflowLanguageVersion: "draft-2",
  submittedFiles: {
    workflow:
      'import "https://raw.githubusercontent.com/rguan1/wdls/master/sub1.wdl" as sub1\n\nworkflow nested_subworkflows_4 {\n\n  Array[Int] ts = range(3)\n\n  call sub1.sub1 as subN1 { input: is = ts }\n\n  output {\n    Array[Int] initial = ts\n    Array[Int] result = subN1.js\n  }\n}\n',
    root: "",
    options: "{\n\n}",
    inputs: "{}",
    workflowUrl: "",
    labels: "{}",
    imports: {
      "https://raw.githubusercontent.com/rguan1/wdls/master/sub2.wdl":
        'import "https://raw.githubusercontent.com/rguan1/wdls/master/sub3.wdl" as sub3\n\ntask increment {\n  Int i\n  command {\n    echo $(( ${i} + 1 ))\n  }\n  output {\n    Int j = read_int(stdout())\n  }\n  runtime {\n    docker: "ubuntu:latest"\n  }\n}\n\nworkflow sub2 {\n  Array[Int] it\n  scatter (i in it) {\n    call increment { input: i = i }\n  }\n\n  call sub3.sub3 as subN3 {input: iu = it}\n  output {\n    Array[Int] js2 = increment.j\n  }\n}',
      "https://raw.githubusercontent.com/rguan1/wdls/master/sub1.wdl":
        'import "https://raw.githubusercontent.com/rguan1/wdls/master/sub2.wdl" as sub2\n\ntask increment {\n  Int i\n  command {\n    echo $(( ${i} + 1 ))\n  }\n  output {\n    Int j = read_int(stdout())\n  }\n  runtime {\n    docker: "ubuntu:latest"\n  }\n}\n\nworkflow sub1 {\n  Array[Int] is\n  scatter (i in is) {\n    call increment { input: i = i }\n  }\n\n  call sub2.sub2 as subN2 { input: it = is }\n  output {\n    Array[Int] js = increment.j\n  }\n}',
      "https://raw.githubusercontent.com/rguan1/wdls/master/sub3.wdl":
        'task increment {\n  Int i\n  command {\n    echo $(( ${i} + 1 ))\n  }\n  output {\n    Int j = read_int(stdout())\n  }\n  runtime {\n    docker: "ubuntu:latest"\n  }\n}\n\nworkflow sub3 {\n  Array[Int] iu\n  scatter (i in iu) {\n    call increment { input: i = i }\n  }\n\n  output {\n    Array[Int] js3 = increment.j\n  }\n}'
    }
  },
  calls: {
    "nested_subworkflows_4.subN1": [
      {
        executionStatus: "Running",
        subWorkflowMetadata: {
          workflowName: "sub1.sub1",
          rootWorkflowId: "8384469c-89a2-4832-8a50-056b6a33eb18",
          calls: {
            "sub1.subN2": [
              {
                executionStatus: "Running",
                subWorkflowMetadata: {
                  workflowName: "sub2.sub2",
                  rootWorkflowId: "8384469c-89a2-4832-8a50-056b6a33eb18",
                  calls: {
                    "sub2.subN3": [
                      {
                        executionStatus: "Running",
                        subWorkflowMetadata: {
                          workflowName: "sub3.sub3",
                          rootWorkflowId:
                            "8384469c-89a2-4832-8a50-056b6a33eb18",
                          calls: {
                            "sub3.increment": [
                              {
                                executionStatus: "Running",
                                stdout:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-subN3/sub3.sub3/64f4e6e2-ace9-47ff-b260-787ef234db1c/call-increment/shard-0/execution/stdout",
                                compressedDockerSize: 26723061,
                                commandLine: "echo $(( 0 + 1 ))",
                                shardIndex: 0,
                                runtimeAttributes: {
                                  docker: "ubuntu:latest",
                                  failOnStderr: "false",
                                  maxRetries: "0",
                                  continueOnReturnCode: "0"
                                },
                                callCaching: {
                                  allowResultReuse: false,
                                  effectiveCallCachingMode: "CallCachingOff"
                                },
                                inputs: {
                                  i: 0
                                },
                                backend: "Local",
                                stderr:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-subN3/sub3.sub3/64f4e6e2-ace9-47ff-b260-787ef234db1c/call-increment/shard-0/execution/stderr",
                                callRoot:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-subN3/sub3.sub3/64f4e6e2-ace9-47ff-b260-787ef234db1c/call-increment/shard-0",
                                attempt: 1,
                                start: "2019-07-23T18:38:56.443Z"
                              },
                              {
                                executionStatus: "Running",
                                stdout:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-subN3/sub3.sub3/64f4e6e2-ace9-47ff-b260-787ef234db1c/call-increment/shard-1/execution/stdout",
                                compressedDockerSize: 26723061,
                                commandLine: "echo $(( 1 + 1 ))",
                                shardIndex: 1,
                                runtimeAttributes: {
                                  docker: "ubuntu:latest",
                                  failOnStderr: "false",
                                  maxRetries: "0",
                                  continueOnReturnCode: "0"
                                },
                                callCaching: {
                                  allowResultReuse: false,
                                  effectiveCallCachingMode: "CallCachingOff"
                                },
                                inputs: {
                                  i: 1
                                },
                                backend: "Local",
                                stderr:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-subN3/sub3.sub3/64f4e6e2-ace9-47ff-b260-787ef234db1c/call-increment/shard-1/execution/stderr",
                                callRoot:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-subN3/sub3.sub3/64f4e6e2-ace9-47ff-b260-787ef234db1c/call-increment/shard-1",
                                attempt: 1,
                                start: "2019-07-23T18:38:56.443Z"
                              },
                              {
                                executionStatus: "Running",
                                stdout:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-subN3/sub3.sub3/64f4e6e2-ace9-47ff-b260-787ef234db1c/call-increment/shard-2/execution/stdout",
                                compressedDockerSize: 26723061,
                                commandLine: "echo $(( 2 + 1 ))",
                                shardIndex: 2,
                                runtimeAttributes: {
                                  docker: "ubuntu:latest",
                                  failOnStderr: "false",
                                  maxRetries: "0",
                                  continueOnReturnCode: "0"
                                },
                                callCaching: {
                                  allowResultReuse: false,
                                  effectiveCallCachingMode: "CallCachingOff"
                                },
                                inputs: {
                                  i: 2
                                },
                                backend: "Local",
                                stderr:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-subN3/sub3.sub3/64f4e6e2-ace9-47ff-b260-787ef234db1c/call-increment/shard-2/execution/stderr",
                                callRoot:
                                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-subN3/sub3.sub3/64f4e6e2-ace9-47ff-b260-787ef234db1c/call-increment/shard-2",
                                attempt: 1,
                                start: "2019-07-23T18:38:56.443Z"
                              }
                            ]
                          },
                          workflowRoot:
                            "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18",
                          id: "64f4e6e2-ace9-47ff-b260-787ef234db1c",
                          inputs: {
                            iu: [0, 1, 2]
                          },
                          status: "Running",
                          parentWorkflowId:
                            "ec8654c7-d92f-494f-bd3b-41996d96e3cf",
                          start: "2019-07-23T18:38:52.364Z"
                        },
                        shardIndex: -1,
                        inputs: {
                          iu: [0, 1, 2]
                        },
                        attempt: 1,
                        start: "2019-07-23T18:38:52.364Z"
                      }
                    ],
                    "sub2.increment": [
                      {
                        executionStatus: "Running",
                        stdout:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-increment/shard-0/execution/stdout",
                        compressedDockerSize: 26723061,
                        commandLine: "echo $(( 0 + 1 ))",
                        shardIndex: 0,
                        runtimeAttributes: {
                          docker: "ubuntu:latest",
                          failOnStderr: "false",
                          maxRetries: "0",
                          continueOnReturnCode: "0"
                        },
                        callCaching: {
                          allowResultReuse: false,
                          effectiveCallCachingMode: "CallCachingOff"
                        },
                        inputs: {
                          i: 0
                        },
                        backend: "Local",
                        stderr:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-increment/shard-0/execution/stderr",
                        callRoot:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-increment/shard-0",
                        attempt: 1,
                        start: "2019-07-23T18:38:54.400Z"
                      },
                      {
                        executionStatus: "Running",
                        stdout:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-increment/shard-1/execution/stdout",
                        compressedDockerSize: 26723061,
                        commandLine: "echo $(( 1 + 1 ))",
                        shardIndex: 1,
                        runtimeAttributes: {
                          docker: "ubuntu:latest",
                          failOnStderr: "false",
                          maxRetries: "0",
                          continueOnReturnCode: "0"
                        },
                        callCaching: {
                          allowResultReuse: false,
                          effectiveCallCachingMode: "CallCachingOff"
                        },
                        inputs: {
                          i: 1
                        },
                        backend: "Local",
                        stderr:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-increment/shard-1/execution/stderr",
                        callRoot:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-increment/shard-1",
                        attempt: 1,
                        start: "2019-07-23T18:38:54.401Z"
                      },
                      {
                        executionStatus: "Running",
                        stdout:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-increment/shard-2/execution/stdout",
                        compressedDockerSize: 26723061,
                        commandLine: "echo $(( 2 + 1 ))",
                        shardIndex: 2,
                        runtimeAttributes: {
                          docker: "ubuntu:latest",
                          failOnStderr: "false",
                          maxRetries: "0",
                          continueOnReturnCode: "0"
                        },
                        callCaching: {
                          allowResultReuse: false,
                          effectiveCallCachingMode: "CallCachingOff"
                        },
                        inputs: {
                          i: 2
                        },
                        backend: "Local",
                        stderr:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-increment/shard-2/execution/stderr",
                        callRoot:
                          "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-subN2/sub2.sub2/ec8654c7-d92f-494f-bd3b-41996d96e3cf/call-increment/shard-2",
                        attempt: 1,
                        start: "2019-07-23T18:38:54.401Z"
                      }
                    ]
                  },
                  workflowRoot:
                    "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18",
                  id: "ec8654c7-d92f-494f-bd3b-41996d96e3cf",
                  inputs: {
                    it: [0, 1, 2]
                  },
                  status: "Running",
                  parentWorkflowId: "d2a0fd36-373e-40c8-8532-fada3d8c1bac",
                  start: "2019-07-23T18:38:50.312Z"
                },
                shardIndex: -1,
                inputs: {
                  it: [0, 1, 2]
                },
                attempt: 1,
                start: "2019-07-23T18:38:50.311Z"
              }
            ],
            "sub1.increment": [
              {
                executionStatus: "Done",
                stdout:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-increment/shard-0/execution/stdout",
                backendStatus: "Done",
                compressedDockerSize: 26723061,
                commandLine: "echo $(( 0 + 1 ))",
                shardIndex: 0,
                outputs: {
                  j: 1
                },
                runtimeAttributes: {
                  docker: "ubuntu:latest",
                  failOnStderr: "false",
                  maxRetries: "0",
                  continueOnReturnCode: "0"
                },
                callCaching: {
                  allowResultReuse: false,
                  effectiveCallCachingMode: "CallCachingOff"
                },
                inputs: {
                  i: 0
                },
                returnCode: 0,
                jobId: "46633",
                backend: "Local",
                end: "2019-07-23T18:38:55.030Z",
                dockerImageUsed:
                  "ubuntu@sha256:c303f19cfe9ee92badbbbd7567bc1ca47789f79303ddcef56f77687d4744cd7a",
                stderr:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-increment/shard-0/execution/stderr",
                callRoot:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-increment/shard-0",
                attempt: 1,
                executionEvents: [
                  {
                    startTime: "2019-07-23T18:38:52.364Z",
                    description: "Pending",
                    endTime: "2019-07-23T18:38:52.364Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:52.364Z",
                    description: "RequestingExecutionToken",
                    endTime: "2019-07-23T18:38:53.121Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:53.121Z",
                    description: "PreparingJob",
                    endTime: "2019-07-23T18:38:53.136Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:53.121Z",
                    description: "WaitingForValueStore",
                    endTime: "2019-07-23T18:38:53.121Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:53.136Z",
                    description: "RunningJob",
                    endTime: "2019-07-23T18:38:54.823Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:54.823Z",
                    description: "UpdatingJobStore",
                    endTime: "2019-07-23T18:38:55.030Z"
                  }
                ],
                start: "2019-07-23T18:38:52.364Z"
              },
              {
                executionStatus: "Done",
                stdout:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-increment/shard-1/execution/stdout",
                backendStatus: "Done",
                compressedDockerSize: 26723061,
                commandLine: "echo $(( 1 + 1 ))",
                shardIndex: 1,
                outputs: {
                  j: 2
                },
                runtimeAttributes: {
                  docker: "ubuntu:latest",
                  failOnStderr: "false",
                  maxRetries: "0",
                  continueOnReturnCode: "0"
                },
                callCaching: {
                  allowResultReuse: false,
                  effectiveCallCachingMode: "CallCachingOff"
                },
                inputs: {
                  i: 1
                },
                returnCode: 0,
                jobId: "46634",
                backend: "Local",
                end: "2019-07-23T18:38:55.030Z",
                dockerImageUsed:
                  "ubuntu@sha256:c303f19cfe9ee92badbbbd7567bc1ca47789f79303ddcef56f77687d4744cd7a",
                stderr:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-increment/shard-1/execution/stderr",
                callRoot:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-increment/shard-1",
                attempt: 1,
                executionEvents: [
                  {
                    startTime: "2019-07-23T18:38:54.763Z",
                    description: "UpdatingJobStore",
                    endTime: "2019-07-23T18:38:55.030Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:52.364Z",
                    description: "Pending",
                    endTime: "2019-07-23T18:38:52.365Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:53.121Z",
                    description: "PreparingJob",
                    endTime: "2019-07-23T18:38:53.135Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:53.135Z",
                    description: "RunningJob",
                    endTime: "2019-07-23T18:38:54.763Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:52.365Z",
                    description: "RequestingExecutionToken",
                    endTime: "2019-07-23T18:38:53.121Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:53.121Z",
                    description: "WaitingForValueStore",
                    endTime: "2019-07-23T18:38:53.121Z"
                  }
                ],
                start: "2019-07-23T18:38:52.364Z"
              },
              {
                executionStatus: "Done",
                stdout:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-increment/shard-2/execution/stdout",
                backendStatus: "Done",
                compressedDockerSize: 26723061,
                commandLine: "echo $(( 2 + 1 ))",
                shardIndex: 2,
                outputs: {
                  j: 3
                },
                runtimeAttributes: {
                  docker: "ubuntu:latest",
                  failOnStderr: "false",
                  maxRetries: "0",
                  continueOnReturnCode: "0"
                },
                callCaching: {
                  allowResultReuse: false,
                  effectiveCallCachingMode: "CallCachingOff"
                },
                inputs: {
                  i: 2
                },
                returnCode: 0,
                jobId: "46635",
                backend: "Local",
                end: "2019-07-23T18:38:55.030Z",
                dockerImageUsed:
                  "ubuntu@sha256:c303f19cfe9ee92badbbbd7567bc1ca47789f79303ddcef56f77687d4744cd7a",
                stderr:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-increment/shard-2/execution/stderr",
                callRoot:
                  "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18/call-subN1/sub1.sub1/d2a0fd36-373e-40c8-8532-fada3d8c1bac/call-increment/shard-2",
                attempt: 1,
                executionEvents: [
                  {
                    startTime: "2019-07-23T18:38:53.121Z",
                    description: "WaitingForValueStore",
                    endTime: "2019-07-23T18:38:53.121Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:52.364Z",
                    description: "Pending",
                    endTime: "2019-07-23T18:38:52.365Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:52.365Z",
                    description: "RequestingExecutionToken",
                    endTime: "2019-07-23T18:38:53.121Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:54.846Z",
                    description: "UpdatingJobStore",
                    endTime: "2019-07-23T18:38:55.030Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:53.137Z",
                    description: "RunningJob",
                    endTime: "2019-07-23T18:38:54.846Z"
                  },
                  {
                    startTime: "2019-07-23T18:38:53.121Z",
                    description: "PreparingJob",
                    endTime: "2019-07-23T18:38:53.137Z"
                  }
                ],
                start: "2019-07-23T18:38:52.364Z"
              }
            ]
          },
          workflowRoot:
            "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18",
          id: "d2a0fd36-373e-40c8-8532-fada3d8c1bac",
          inputs: {
            is: [0, 1, 2]
          },
          status: "Running",
          parentWorkflowId: "8384469c-89a2-4832-8a50-056b6a33eb18",
          start: "2019-07-23T18:38:48.272Z"
        },
        shardIndex: -1,
        inputs: {
          is: [0, 1, 2]
        },
        attempt: 1,
        start: "2019-07-23T18:38:48.272Z"
      }
    ]
  },
  outputs: {},
  workflowRoot:
    "/Users/rguan/cromwell_tutorial/wdls/cromwell-executions/nested_subworkflows_4/8384469c-89a2-4832-8a50-056b6a33eb18",
  actualWorkflowLanguage: "WDL",
  id: "8384469c-89a2-4832-8a50-056b6a33eb18",
  inputs: {
    "nested_subworkflows_4.ts": [0, 1, 2]
  },
  labels: {
    "cromwell-workflow-id": "cromwell-8384469c-89a2-4832-8a50-056b6a33eb18"
  },
  submission: "2019-07-23T18:38:43.302Z",
  status: "Running",
  start: "2019-07-23T18:38:46.085Z"
}

test("createShardId: null inputs", () => {
  const returnShardId = createShardId(null, null)
  const expectedShardId = "null>shard_null"
  expect(returnShardId).toBe(expectedShardId)
})

test("createShardId: (empty, emptyObj)", () => {
  const returnShardId = createShardId("", { shardIndex: "" })
  const expectedShardId = ">shard_"
  expect(returnShardId).toBe(expectedShardId)
})

test("returnDataDictionary: check that all nodes are properly initialized as keys", () => {
  const returnDict = returnDataDictionary(scatterGatherJson)
  const returnKeys = Object.keys(returnDict).sort()
  const expectedKeys = [
    "scattergather>analysis",
    "scattergather>prepare",
    "scattergather>gather",
    "scattergather>analysis>shard_0",
    "scattergather>analysis>shard_1",
    "scattergather>analysis>shard_2",
    "scattergather>analysis>shard_3"
  ].sort()
  expect(returnKeys).toEqual(expectedKeys)
})

test("returnDataDictionary: check that all statuses are properly parsed", () => {
  const returnDict = returnDataDictionary(scatterGatherJson)
  Object.keys(returnDict).forEach(key => {
    const data = returnDict[key]
    expect(data.status).toBe("Done")
  })
})

test("returnDataDictionary: Testing if we correctly parse 'scatterParent' parentType", () => {
  const returnDict = returnDataDictionary(scatterGatherJson)
  const expectedDict = {
    "scattergather>analysis": "scatterParent",
    "scattergather>prepare": null,
    "scattergather>gather": null,
    "scattergather>analysis>shard_0": null,
    "scattergather>analysis>shard_1": null,
    "scattergather>analysis>shard_2": null,
    "scattergather>analysis>shard_3": null
  }

  Object.keys(returnDict).forEach(key => {
    const expectedParentType = expectedDict[key]
    const parentType = returnDict[key].parentType
    expect(parentType).toBe(expectedParentType)
  })
})

test("returnDataDictionary: Testing if we correctly can parse statuses for subworkflow wdls for completed workflow", () => {
  const returnDict = returnDataDictionary(nestedFourSubworkflows)
  Object.keys(returnDict).forEach(key => {
    const status = returnDict[key].status
    expect(status).toBe("Done")
  })
})

test("returnDataDictionary: Testing if we correctly can parse parentType for subworkflow wdls for completed workflow", () => {
  const returnDict = returnDataDictionary(nestedFourSubworkflows)
  const expectedDict = {
    "nested_subworkflows_4>subN1": "subworkflow",
    "nested_subworkflows_4>subN1>subN2": "subworkflow",
    "nested_subworkflows_4>subN1>increment": "scatterParent",
    "nested_subworkflows_4>subN1>increment>shard_0": null,
    "nested_subworkflows_4>subN1>increment>shard_1": null,
    "nested_subworkflows_4>subN1>increment>shard_2": null,
    "nested_subworkflows_4>subN1>subN2>increment": "scatterParent",
    "nested_subworkflows_4>subN1>subN2>increment>shard_0": null,
    "nested_subworkflows_4>subN1>subN2>increment>shard_1": null,
    "nested_subworkflows_4>subN1>subN2>increment>shard_2": null,
    "nested_subworkflows_4>subN1>subN2>subN3": "subworkflow",
    "nested_subworkflows_4>subN1>subN2>subN3>increment": "scatterParent",
    "nested_subworkflows_4>subN1>subN2>subN3>increment>shard_0": null,
    "nested_subworkflows_4>subN1>subN2>subN3>increment>shard_1": null,
    "nested_subworkflows_4>subN1>subN2>subN3>increment>shard_2": null
  }
  Object.keys(returnDict).forEach(key => {
    const expectedParentType = expectedDict[key]
    const parentType = returnDict[key].parentType
    expect(parentType).toBe(expectedParentType)
  })
})

test("returnDataDictionary: Testing if we correctly can parse a workflow that just got submitted", () => {
  const returnDict = returnDataDictionary(nested4sbwfJustSubmitted)
  // nothing has been initialized in the metadata, so it should be empty
  expect(returnDict).toEqual({})
})

test("returnDataDictionary: Testing for status parsing for a workflow that has all nodes computing (AKA not done)", () => {
  const returnDict = returnDataDictionary(nested4SbwfHalfNodesInitialized)
  Object.keys(returnDict).forEach(key => {
    const status = returnDict[key].status
    expect(status).toEqual("Running")
  })
})

test("returnDataDictionary: Testing for status parsing a workflow that is half done half running", () => {
  const returnDict = returnDataDictionary(nested4sbwfStatusesDoneAndRunning)
  const expectedDict = {
    "nested_subworkflows_4>subN1": "Running",
    "nested_subworkflows_4>subN1>subN2": "Running",
    "nested_subworkflows_4>subN1>increment": "Done",
    "nested_subworkflows_4>subN1>increment>shard_0": "Done",
    "nested_subworkflows_4>subN1>increment>shard_1": "Done",
    "nested_subworkflows_4>subN1>increment>shard_2": "Done",
    "nested_subworkflows_4>subN1>subN2>increment": "Running",
    "nested_subworkflows_4>subN1>subN2>increment>shard_0": "Running",
    "nested_subworkflows_4>subN1>subN2>increment>shard_1": "Running",
    "nested_subworkflows_4>subN1>subN2>increment>shard_2": "Running",
    "nested_subworkflows_4>subN1>subN2>subN3": "Running",
    "nested_subworkflows_4>subN1>subN2>subN3>increment": "Running",
    "nested_subworkflows_4>subN1>subN2>subN3>increment>shard_0": "Running",
    "nested_subworkflows_4>subN1>subN2>subN3>increment>shard_1": "Running",
    "nested_subworkflows_4>subN1>subN2>subN3>increment>shard_2": "Running"
  }
  Object.keys(returnDict).forEach(key => {
    const status = returnDict[key].status
    const expectedStatus = expectedDict[key]
    expect(status).toEqual(expectedStatus)
  })
})
