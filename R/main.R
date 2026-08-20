

message("================================")
message("EJECUTANDO MAIN.R NUEVO")
message("================================")

message("Contenido del archivo CSV:")

lines <- readLines("/data/test_data.csv")

message(
  paste(
    lines,
    collapse = "\n"
  )
)

message("================================")

message("Número de líneas:")
message(length(lines))

message("================================")

message("Leyendo CSV con sep=','")

data <- read.table(
  "/data/test_data.csv",
  header = TRUE,
  sep = ",",
  dec = ".",
  stringsAsFactors = FALSE
)

message("Número de filas:")
message(nrow(data))

message("Número de columnas:")
message(ncol(data))

message("Nombres de columnas:")
message(
  paste(
    names(data),
    collapse = " | "
  )
)

message("================================")

message("Estructura:")
message(
  paste(
    capture.output(str(data)),
    collapse = "\n"
  )
)

message("================================")

message("Datos:")
message(
  paste(
    capture.output(print(data)),
    collapse = "\n"
  )
)

message("================================")


message("main.R cargado")
message("Datos cargados desde CSV")
message("Columnas:")
message(paste(names(data), collapse = " | "))

