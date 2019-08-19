import "subworkflow.wdl" as subworkflow

workflow aliased_subworkflows {

  Array[Int] ts = range(3)
  call subworkflow.subwf as subwfT { input: is = ts }

  Array[Int] fs = subwfT.js
  Array[Int] gs = fs

  call subworkflow.subwf as subwfF { input: is = gs }


  output {
    Array[Int] initial = ts
    Array[Int] intermediate = subwfT.js
    Array[Int] intermediate2 = gs
    Array[Int] result = subwfF.js
  }
}
