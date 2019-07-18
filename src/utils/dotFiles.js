export const simpleVariantDiscovery =
  'digraph SimpleVariantDiscovery { compound=true; "call selectIndels" -> "call hardFilterIndel" "call selectSNPs" -> "call hardFilterSNP" "call haplotypeCaller" -> "call selectSNPs" "call hardFilterIndel" -> "call combine" "call haplotypeCaller" -> "call selectIndels" "call hardFilterSNP" -> "call combine" "call selectSNPs" "call haplotypeCaller" "call selectIndels" "call combine" "call hardFilterSNP" "call hardFilterIndel" }'
export const scattergather =
  'digraph scattergather { compound=true; "call analysis" -> "call gather" "call prepare" -> "scatter (prepare.array)" [lhead=cluster_0] "call prepare" "call gather" subgraph cluster_0 { "call analysis" "scatter (prepare.array)" [shape=plaintext] } }'
export const arrays_scatters_if =
  'digraph arrays_scatters_ifs { compound=true; subgraph cluster_0 { "call printInt" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'
export const array_io =
  'digraph array_io { compound=true; "call mk_file" -> "call concat" "call concat" -> "call count_lines" "call mk_file" -> "call count_lines_array" "call count_lines" subgraph cluster_0 { "call mk_file" "scatter (rs)" [shape=plaintext] } "call count_lines_array" "call concat" "call serialize" }'
export const arrays_scatters_if_2_task_parallel =
  'digraph arrays_scatters_if_2_task_parallel { compound=true; subgraph cluster_0 { "call printOne" "call printTwo" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'
export const arrays_scatters_if_two_series =
  'digraph arrays_scatters_if_two_series { compound=true; "call printOne" -> "call printTwo" subgraph cluster_0 { "call printOne" "call printTwo" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'
export const arrays_scatters_if_three_series =
  'digraph arrays_scatters_if_three_series { compound=true; "call printOne" -> "call printTwo" "call printTwo" -> "call printThree" subgraph cluster_0 { "call printOne" "call printTwo" "call printThree" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'
export const aliased_subworkflows =
  'digraph aliased_subworkflows { compound=true; "call subwfT" -> "Array[Int] fs" "Array[Int] fs" -> "call subwfF" "call subwfT" "Array[Int] fs" "call subwfF" }'
export const subworkflow =
  'digraph subwf { compound=true; subgraph cluster_0 { "call increment" "scatter (is)" [shape=plaintext] } }'
export const arrays_scatter_series_and_parallel =
  'digraph arrays_scatter_series_and_parallel { compound=true; "call printTwo" -> "call printThree" subgraph cluster_0 { "call printOne" "call printTwo" "call printThree" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'
export const three_imports_sub_scatter =
  'digraph three_imports_sub_scatter { compound=true; "call scatThree" -> "Array[Int] ts" "Array[Int] ts" -> "call subwfT" "Array[Int] fs" -> "call subwfF" "call subwfT" -> "Array[Int] fs" "call subwfF" "call scatThree" "call sg" "Array[Int] fs" "call subwfT" "Array[Int] ts" }'
export const arrays_scatter_three_series_gather =
  'digraph arrays_scatter_three_series_gather { compound=true; "call printThree" -> "call gather" "call printOne" -> "call printTwo" "call printTwo" -> "call printThree" "call gather" subgraph cluster_0 { "call printOne" "call printTwo" "call printThree" subgraph cluster_1 { "if (length(row) == 2)" [shape=plaintext] } "scatter (table)" [shape=plaintext] } }'
export const nested_subworkflows_4 =
  'digraph nested_subworkflows_4 { compound=true; "call sub1.sub1&subN1" }'
export const modified_aliased_subworkflows =
  'digraph aliased_subworkflows { compound=true; "call subworkflow.subwf.subwfT" -> "Array[Int] fs" "Array[Int] fs" -> "call subworkflow.subwf.subwfF" "call subworkflow.subwf.subwfT" "Array[Int] fs" "call subworkflow.subwf.subwfF" }'
export const v2_aliased_subworkflows =
  'digraph aliased_subworkflows { compound=true; "call subworkflow.subwf&subwfT" -> "Array[Int] fs" "Array[Int] fs" -> "call subworkflow.subwf&subwfF" "call subworkflow.subwf&subwfT" "Array[Int] fs" "call subworkflow.subwf&subwfF" }'
export const two_imports =
  'digraph two_imports { compound=true; "call subworkflow.subwf&subwfT" -> "Array[Int] fs" "Array[Int] fs" -> "call subworkflow.subwf&subwfF" "call subworkflow.subwf&subwfT" "Array[Int] fs" "call subworkflow.subwf&subwfF" "call scattergather.scattergather&sg" }'
export const nested_subworkflows_3 =
  'digraph nested_subworkflows_3 { compound=true; "call sub2.sub2&subN2" }'

export const sub2 =
  'digraph sub2 { compound=true; "call increment&increment" -> "call sub3.sub3&subN3" "call sub3.sub3&subN3" subgraph cluster_0 { "call increment&increment" "scatter (it)" [shape=plaintext] } }'
export const sub3 =
  'digraph sub3 { compound=true; subgraph cluster_0 { "call increment&increment" "scatter (iu)" [shape=plaintext] } }'
export const sub1 =
  'digraph sub1 { compound=true; "call increment&increment" -> "call sub2.sub2&subN2" "call sub2.sub2&subN2" subgraph cluster_0 { "call increment&increment" "scatter (is)" [shape=plaintext] } }'
