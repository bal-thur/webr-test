message("================================")
message("DIAGNOSTICO PACKAGES.rds")
message("================================")

path <- "/packages/PACKAGES.rds"

message("Archivo existe:")
message(file.exists(path))

message("Tamaño:")
message(file.info(path)$size)

message("Primeros bytes:")

con <- file(
  path,
  open = "rb"
)

bytes <- readBin(
  con,
  what = "raw",
  n = 32
)

close(con)

message(
  paste(
    as.character(bytes),
    collapse = " "
  )
)

message("================================")