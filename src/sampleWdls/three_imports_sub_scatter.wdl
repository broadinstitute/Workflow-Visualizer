import "subworkflow.wdl" as subworkflow
import "scattergather.wdl" as scatterGatherSubworkflow
import "arrays_scatter_three_series_gather.wdl" as scatterThree

workflow three_imports_sub_scatter {

  call scatterThree.arrays_scatters_ifs as scatThree
  call scatterGatherSubworkflow.scattergather as sg
  

  Array[Int] ts = scatThree.ints
  call subworkflow.subwf as subwfT { input: is = ts }

  Array[Int] fs = subwfT.js
  call subworkflow.subwf as subwfF { input: is = fs }


  output {
    Array[Int] initial = ts
    Array[Int] intermediate = subwfT.js
    Array[Int] result = subwfF.js
  }
}
