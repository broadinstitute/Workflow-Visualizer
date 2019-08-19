import "sub2.wdl" as sub2

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

workflow sub1 {
  Array[Int] is

  scatter (i in is) {
    call increment { input: i = i }
  }

  call sub2.sub2 as subN2 { input: it = is }
  output {
    Array[Int] sub1Output = subN2.sub2Output
  }
}