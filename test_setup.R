

## ============================================================
## 4. Cargar archivos de configuración
## ============================================================

lipid_data <- read.csv(
  "data/lipid_data.csv",
  stringsAsFactors = FALSE
)

palette <- read.csv(
  "data/palette.csv",
  stringsAsFactors = FALSE
)

process_parameters <- read.csv(
  "data/process_parameters.csv",
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


## ============================================================
## 8. Comprobación de los parámetros
## ============================================================

message("")
message("Parámetros de procesamiento cargados:")

for (process in names(processing_parameters)) {
  
  message("")
  message("  ", process)
  
  for (parameter in names(processing_parameters[[process]])) {
    
    value <- processing_parameters[[process]][[parameter]]
    
    if (is.null(value)) {
      
      message(
        "    ",
        parameter,
        " = NULL"
      )
      
    } else {
      
      message(
        "    ",
        parameter,
        " = ",
        as.character(value)
      )
    }
  }
}
## ============================================================
## 9. Setup terminado
## ============================================================