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

workflow sub3 {
  Array[Int] iu
  scatter (i in iu) {
    call increment { input: i = i }
  }

  output {
    Array[Int] sub3Output = increment.j

  }
}