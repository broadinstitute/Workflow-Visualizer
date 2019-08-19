import "sub2.wdl" as sub2

workflow nested_subworkflows_3 {

  Array[Int] ts = range(3)

  call sub2.sub2 as subN2 { input: it = ts }

  output {
    Array[Int] initial = ts
    Array[Int] result = subN2.js2
  }
}
