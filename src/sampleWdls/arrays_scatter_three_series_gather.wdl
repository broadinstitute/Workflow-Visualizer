
task printInt {
  Int? int

  command { echo "${int}" > out.txt }
  output { Int out = read_int("out.txt") }
  runtime { docker: "ubuntu:latest" }
}

task gather {
  Array[File] array
  command <<<
    cat ${sep=' ' array}
  >>>
  output {
    String str = read_string(stdout())
  }
  runtime {
    docker: "ubuntu:latest"
  }
}

workflow arrays_scatter_three_series_gather {

  Array[Array[Int]] table = [[0,0], [1,1]]
  scatter (row in table) {

    if (length(row) == 2) {
      Int int = row[1]
    }

    call printInt as printOne {input: int=int }
    call printInt as printTwo {input: int=printOne.out }
    call printInt as printThree {input: int=printTwo.out}
  }

  call gather {input: array=printThree.out}
  output {
    Array[Int] ints = printTwo.out
  }
}