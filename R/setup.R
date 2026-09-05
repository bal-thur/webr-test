#### Setup

message("Iniciando setup")
setup_ok <- FALSE

## ============================================================
## 1. Instalación de librerías
## ============================================================

repos <- c(
  "https://bioc.r-universe.dev",
  "https://tidyverse.r-universe.dev",
  "https://repo.r-wasm.org"
)

packages <- c(
  "mixOmics",
  "dplyr",
  "tidyr",
  "ggplot2",
  "S4Vectors",
  "SummarizedExperiment",
  "readxl",
  "jsonlite"
)

message("Instalando paquetes...")

webr::install(
  packages,
  repos = repos
)


## ============================================================
## 2. Comprobación de paquetes
## ============================================================

message("")
message("Comprobando paquetes instalados:")

installed <- rownames(installed.packages())

for (pkg in packages) {
  
  if (pkg %in% installed) {
    
    message(
      "  OK  ",
      pkg,
      " ",
      as.character(packageVersion(pkg))
    )
    
  } else {
    
    message(
      "  ERROR  ",
      pkg,
      " no está instalado"
    )
  }
}


missing_packages <- packages[
  !packages %in% installed
]

if (length(missing_packages) > 0) {
  
  stop(
    paste0(
      "No se pudieron instalar todos los paquetes requeridos: ",
      paste(missing_packages, collapse = ", ")
    ),
    call. = FALSE
  )
}

## ============================================================
## 3. Cargar scripts R
## ============================================================

source("/R/import_data.R")
source("/R/get_process_options.R")
source("/R/process_se.R")
source("/R/rawAbundance.R")


## ============================================================
## 4. Cargar archivos de configuración
## ============================================================

#lipid_data <- read.csv(
#  "/data/lipid_data.csv",
#  stringsAsFactors = FALSE
#)

#palette <- read.csv(
#  "/data/palette.csv",
#  stringsAsFactors = FALSE
#)

process_parameters <- read.csv(
  "/data/process_parameters.csv",
  stringsAsFactors = FALSE
)



## 5. Funciones para convertir los parámetros a su tipo correcto


convert_value <- function(value, type) {
  
  if (is.na(value)) {
    return(NA)
  }
  
  switch(
    type,
    logical   = as.logical(value),
    numeric   = as.numeric(value),
    character = as.character(value),
    integer   = as.integer(value),
    stop(
      paste0(
        "Tipo de parámetro no reconocido: ",
        type
      ),
      call. = FALSE
    )
  )
}


## 6. Función para convertir NA a NULL

na_to_null <- function(x) {
  
  if (length(x) == 1 && is.na(x)) {
    NULL
  } else {
    x
  }
}


## ============================================================
## 7. Crear lista de parámetros de procesamiento
## ============================================================

processing_parameters <- list()

for (i in seq_len(nrow(process_parameters))) {
  
  process <- process_parameters$process[i]
  parameter <- process_parameters$parameter[i]
  value <- process_parameters$value[i]
  type <- process_parameters$type[i]
  
  # Convertir el valor al tipo especificado en el CSV
  converted_value <- convert_value(
    value,
    type
  )
  
  # Convertir valores ausentes a NULL
  converted_value <- na_to_null(
    converted_value
  )
  
  # Crear la lista del proceso si todavía no existe
  if (is.null(processing_parameters[[process]])) {
    processing_parameters[[process]] <- list()
  }
  
  # Guardar el parámetro dentro de su proceso
  processing_parameters[[process]][[parameter]] <-
    converted_value
}


rm(process_parameters)

setup_ok <- TRUE
message("Setup terminado")