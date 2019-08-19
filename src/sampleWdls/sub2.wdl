import "sub3.wdl" as sub3

task increment {
  Int i
  command {
    echo $(( ${i} + 1 ))
  }
  output {
    Int j = read_int(stdout())
  }
  runtime {
    docker: "ubuntu:latest"
  }
}

workflow sub2 {
  Array[Int] it
  scatter (i in it) {
    call increment { input: i = i }
  }

  call sub3.sub3 as subN3 {input: iu = it}
  output {
    Array[Int] sub2Output = subN3.sub3Output
  }
}