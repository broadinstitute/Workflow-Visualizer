import "subworkflow.wdl" as subworkflow

workflow aliased_subworkflows {

  Array[Int] ts = range(3)
  call subworkflow.subwf as subwfT { input: is = ts }

  Array[Int] fs = subwfT.js
  call subworkflow.subwf as subwfF { input: is = fs }

  Array[Int] gs = subwfF.js

  output {
    Array[Int] initial = ts
    Array[Int] intermediate = subwfT.js
    Array[Int] intermediate2 = subwfF.js
    Array[Int] result = gs
  }
}
