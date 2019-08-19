
task printInt {
  Int? int

  command { echo "${int}" > out.txt }
  output { Int out = read_int("out.txt") }
  runtime { docker: "ubuntu:latest" }
}

workflow arrays_scatters_if_2_task_parallel {

  Array[Array[Int]] table = [[0,0], [1,1]]
  scatter (row in table) {

    if (length(row) == 2) {
      Int int = row[1]
    }

    call printInt as printOne {input: int=int }
    call printInt as printTwo {input: int=int }
  }
  output {
    Array[Int] ints = printTwo.out
  }
}