import "sub1.wdl" as sub1

workflow nested_subworkflows_4 {

  Array[Int] ts = range(3)

  call sub1.sub1 as subN1 { input: is = ts }

  output {
    Array[Int] initial = ts
    Array[Int] result = subN1.sub1Output
  }
}
