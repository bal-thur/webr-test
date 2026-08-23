# ============================================================
# IMPORTACIÓN DEL FORMATO CERRADO DE LA APLICACIÓN
# ============================================================


## Hojas del excel
required_sheets <- c("project_info", "abundance", "group_info")

## Datos del proyecto
required_project_keys <- c(
  "Project name",
  "Entity",
  "Researcher",
  "Organism",
  "Matrix"
)

## Datos de columnas de grupo y subgrupo
required_group_columns <- c("sample_name", "group", "subgroup")

import_error <- function(message) {
  stop(paste0("Validación del Excel fallida: ", message), call. = FALSE)
}

is_nonempty_text <- function(x) {
  !is.na(x) && nzchar(trimws(as.character(x)))
}


## Función para validar excel.

validate_analysis_excel <- function(path) {
  if (!requireNamespace("readxl", quietly = TRUE)) {
    stop("El paquete readxl no está disponible.", call. = FALSE)
  }

  sheets <- readxl::excel_sheets(path)

  if (!identical(sheets, required_sheets)) {
    import_error(
      paste0(
        "las hojas deben ser exactamente ",
        paste(required_sheets, collapse = ", "),
        ". Se encontraron: ",
        paste(sheets, collapse = ", ")
      )
    )
  }

  project_info <- readxl::read_excel(
    path,
    sheet = "project_info",
    col_names = FALSE,
    .name_repair = "minimal"
  )

  if (nrow(project_info) != length(required_project_keys) || ncol(project_info) != 2) {
    import_error("project_info debe contener exactamente cinco filas y dos columnas.")
  }

  project_keys <- as.character(project_info[[1]])
  project_values <- project_info[[2]]

  if (!identical(project_keys, required_project_keys)) {
    import_error("project_info no contiene las cinco claves esperadas en el orden requerido.")
  }

  if (any(!vapply(project_values, is_nonempty_text, logical(1)))) {
    import_error("project_info contiene valores vacíos.")
  }

  abundance <- readxl::read_excel(
    path,
    sheet = "abundance",
    .name_repair = "minimal"
  )

  if (ncol(abundance) < 2 || !identical(names(abundance)[1], "feature")) {
    import_error("abundance debe empezar por la columna feature y contener al menos una muestra.")
  }

  if (nrow(abundance) < 1) {
    import_error("abundance debe contener al menos un feature.")
  }

  features <- as.character(abundance[["feature"]])
  sample_names <- names(abundance)[-1]

  if (any(!vapply(features, is_nonempty_text, logical(1)))) {
    import_error("abundance contiene features vacíos.")
  }

  if (anyDuplicated(features)) {
    import_error("abundance contiene features duplicados.")
  }

  if (any(!vapply(sample_names, is_nonempty_text, logical(1)))) {
    import_error("abundance contiene nombres de muestra vacíos.")
  }

  if (anyDuplicated(sample_names)) {
    import_error("abundance contiene nombres de muestra duplicados.")
  }

  abundance_values <- abundance[-1]

  for (sample_name in sample_names) {
    values <- abundance_values[[sample_name]]

    if (!is.numeric(values)) {
      import_error(
        paste0("la muestra ", sample_name, " contiene valores que no son numéricos.")
      )
    }

    invalid <- !is.na(values) & (!is.finite(values) | values <= 0)

    if (any(invalid)) {
      import_error(
        paste0(
          "la muestra ",
          sample_name,
          " contiene abundancias que no son números finitos mayores que cero."
        )
      )
    }
  }
  group_info <- readxl::read_excel(
    path,
    sheet = "group_info",
    .name_repair = "minimal"
  )

  if (!identical(names(group_info), required_group_columns)) {
    import_error("group_info debe tener exactamente las columnas sample_name, group y subgroup.")
  }

  group_sample_names <- as.character(group_info[["sample_name"]])

  if (any(!vapply(group_sample_names, is_nonempty_text, logical(1)))) {
    import_error("group_info contiene sample_name vacíos.")
  }

  if (anyDuplicated(group_sample_names)) {
    import_error("group_info contiene sample_name duplicados.")
  }

  if (!identical(sample_names, group_sample_names)) {
    import_error(
      "los sample_name de group_info deben coincidir exactamente y en el mismo orden con abundance."
    )
  }

  groups <- as.character(group_info[["group"]])

  if (any(!vapply(groups, is_nonempty_text, logical(1)))) {
    import_error("group_info contiene valores group vacíos.")
  }

  subgroups <- as.character(group_info[["subgroup"]])

  list(
    project_keys = project_keys,
    project_values = as.character(project_values),
    abundance = abundance_values,
    features = features,
    sample_names = sample_names,
    group_info = group_info
  )
}

## Función para preparar "col_data" de "se"

prepare_col_data <- function(group_info) {
  
  # 1. Copiar los datos para no modificar el objeto original
  
  col_data <- group_info
  
  # 2. Asegurar que group y subgroup sean character
  
  col_data$group <- as.character(col_data$group)
  col_data$subgroup <- as.character(col_data$subgroup)
  
  # 3. Convertir cadenas vacías de subgroup en NA
  
  col_data$subgroup[
    is.na(col_data$subgroup) |
      trimws(col_data$subgroup) == ""
  ] <- NA_character_
  

  # 4. Determinar los subgrupos realmente existentes
  
  subgroup_levels <- unique(
    col_data$subgroup[
      !is.na(col_data$subgroup)
    ]
  )
  
  n_subgroups <- length(subgroup_levels)
  
  # 5. Preparar group como factor

  group_levels <- unique(col_data$group)
  
  col_data$group <- factor(
    col_data$group,
    levels = group_levels
  )
  

  # 6. Determinar si debemos utilizar subgroup
  
  if (n_subgroups >= 2) {
    
    # Hay al menos dos subgrupos: conservar subgroup como factor
    
    col_data$subgroup <- factor(
      col_data$subgroup,
      levels = subgroup_levels
    )
    
    # Crear group_subgroup

    group_subgroup <- rep(
      NA_character_,
      nrow(col_data)
    )
    
    valid_subgroup <- !is.na(col_data$subgroup)
    
    group_subgroup[valid_subgroup] <- paste(
      as.character(col_data$group[valid_subgroup]),
      as.character(col_data$subgroup[valid_subgroup]),
      sep = "_"
    )
    
    group_subgroup_levels <- unique(
      group_subgroup[
        !is.na(group_subgroup)
      ]
    )
    
    col_data$group_subgroup <- factor(
      group_subgroup,
      levels = group_subgroup_levels
    )
    
  } else {

    # No hay suficientes subgrupos para crear agrupaciones
    
    col_data$subgroup <- NULL
  }
  
  # 7. Dejar sample_name como row.names
  
  rownames(col_data) <- col_data$sample_name
  
  # 8. Devolver solamente la información necesaria
  
  col_data
}

## Función para preparar "row_data" de "se"

prepare_row_data <- function(features, lipid_info) {
  
  # 1. Comprobar que lipid_info contiene la columna feature

  if (!"feature" %in% names(lipid_info)) {
    stop(
      "lipid_info debe contener una columna llamada 'feature'.",
      call. = FALSE
    )
  }
  
  # 2. Convertir los identificadores a character
  
  features <- as.character(features)
  lipid_features <- as.character(lipid_info$feature)
  
  # 3. Validar features del catálogo
  
  if (any(
    is.na(lipid_features) |
    trimws(lipid_features) == ""
  )) {
    stop(
      "lipid_info contiene features vacíos.",
      call. = FALSE
    )
  }
  
  if (anyDuplicated(lipid_features)) {
    stop(
      "lipid_info contiene features duplicados.",
      call. = FALSE
    )
  }
  
  # 4. Validar features de abundance
  
  if (any(
    is.na(features) |
    trimws(features) == ""
  )) {
    stop(
      "abundance contiene features vacíos.",
      call. = FALSE
    )
  }
  
  if (anyDuplicated(features)) {
    stop(
      "abundance contiene features duplicados.",
      call. = FALSE
    )
  }
  
  # 5. Comprobar que todos los features de abundance existen en lipid_info
  
  match_index <- match(
    features,
    lipid_features
  )
  
  unmatched <- is.na(match_index)
  
  if (any(unmatched)) {
    
    missing_features <- features[unmatched]
    
    stop(
      paste0(
        "Los siguientes features de abundance no existen ",
        "en lipid_info: ",
        paste(missing_features, collapse = ", ")
      ),
      call. = FALSE
    )
  }
  
  # 6. Seleccionar las filas correspondientes de lipid_info
  #
  #    match_index garantiza que:
  #    - solo usamos features presentes en abundance
  #    - mantenemos exactamente el orden de abundance
  
  row_data <- lipid_info[
    match_index,
    ,
    drop = FALSE
  ]
  
  # 7. Asegurar que feature conserva exactamente los identificadores de abundance

  row_data$feature <- features

  # 8. Convertir a S4Vectors::DataFrame

  row_data <- S4Vectors::DataFrame(
    row_data
  )
  
  # 9. Utilizar feature como rownames

  rownames(row_data) <- features

  # 10. Devolver rowData
  row_data
}





## Importar datos de excel. 

import_analysis_excel <- function(path) {
  
  # 1. Comprobar paquetes necesarios

  if (!requireNamespace("SummarizedExperiment", quietly = TRUE) ||
      !requireNamespace("S4Vectors", quietly = TRUE)) {
    
    stop(
      "Los paquetes SummarizedExperiment y S4Vectors deben estar instalados.",
      call. = FALSE
    )
  }
  
  # 2. Validar y leer el Excel
  
  validated <- validate_analysis_excel(path)
  
  # 3. Crear matriz de abundancias
  
  abundance_matrix <- as.matrix(
    validated$abundance
  )
  
  storage.mode(abundance_matrix) <- "double"
  
  rownames(abundance_matrix) <- validated$features
  colnames(abundance_matrix) <- validated$sample_names
  

  # 5. Preparar rowData a partir de lipid_info
  
  row_data <- prepare_row_data(
    validated$features,
    lipid_data
  )
  
  # 6. Preparar colData a partir de group_info
  
  col_data <- prepare_col_data(
    validated$group_info
  )
  
  # 7. Crear metadata del proyecto

  project_metadata <- stats::setNames(
    as.list(validated$project_values),
    validated$project_keys
  )
  
  # 8. Crear SummarizedExperiment
  
  candidate_se <- SummarizedExperiment::SummarizedExperiment(
    assays = list(
      abundance = abundance_matrix
    ),
    rowData = row_data,
    colData = col_data,
    metadata = project_metadata
  )
  
  
  # 9. Guardar el objeto como se
  
  assign(
    "se",
    candidate_se,
    envir = .GlobalEnv
  )
  
  # 10. Devolver el objeto
  
  invisible(candidate_se)
}


## Función. Realizar resumen de "se"

summarise_imported_se <- function() {
  
  if (!exists(
    "se",
    envir = .GlobalEnv,
    inherits = FALSE
  )) {
    
    stop(
      "No existe un objeto se importado.",
      call. = FALSE
    )
  }
  
  object <- get(
    "se",
    envir = .GlobalEnv,
    inherits = FALSE
  )
  
  # Metadata del proyecto
  
  metadata_text <- vapply(
    names(S4Vectors::metadata(object)),
    function(name) {
      paste0(
        name,
        ": ",
        S4Vectors::metadata(object)[[name]]
      )
    },
    character(1)
  )
  
  # Features completamente NA
  
  abundance <- SummarizedExperiment::assay(
    object,
    "abundance"
  )
  
  completely_missing <- sum(
    rowSums(
      is.na(abundance)
    ) == ncol(abundance)
  )
  
  # Construir resumen
  
  paste(
    c(
      paste0(
        "Dimensiones de se: ",
        nrow(object),
        " features × ",
        ncol(object),
        " muestras"
      ),
      
      paste0(
        "Assays: ",
        paste(
          SummarizedExperiment::assayNames(object),
          collapse = ", "
        )
      ),
      
      paste0(
        "Número de muestras: ",
        ncol(object)
      ),
      
      paste0(
        "Número de features: ",
        nrow(object)
      ),
      
      paste0(
        "Columnas de colData: ",
        paste(
          names(
            SummarizedExperiment::colData(object)
          ),
          collapse = ", "
        )
      ),
      
      paste0(
        "Columnas de rowData: ",
        paste(
          names(
            SummarizedExperiment::rowData(object)
          ),
          collapse = ", "
        )
      ),
      
      "Metadata:",
      
      paste0(
        "  ",
        metadata_text
      ),
      
      paste0(
        "Features completamente NA: ",
        completely_missing
      )
    ),
    collapse = "\n"
  )
}

## Crea paleta
create_palettes <- function(se, palette) {
  
  # 1. Comprobar la paleta
  
  if (!"color" %in% names(palette)) {
    stop(
      "palette debe contener una columna llamada 'color'.",
      call. = FALSE
    )
  }
  
  colors <- as.character(palette$color)
  
  if (any(
    is.na(colors) |
    trimws(colors) == ""
  )) {
    stop(
      "palette contiene colores vacíos.",
      call. = FALSE
    )
  }
  
  if (length(unique(colors)) != length(colors)) {
    stop(
      "palette contiene colores duplicados.",
      call. = FALSE
    )
  }
  
  # 2. Función interna para crear una paleta
  
  make_palette <- function(values, name) {
    
    values <- as.character(values)
    
    values <- values[
      !is.na(values) &
        trimws(values) != ""
    ]
    
    levels <- unique(values)
    
    if (length(levels) > length(colors)) {
      stop(
        paste0(
          "No hay suficientes colores en la paleta para ",
          name,
          ". Se necesitan ",
          length(levels),
          " y hay ",
          length(colors),
          "."
        ),
        call. = FALSE
      )
    }
    
    setNames(
      colors[seq_along(levels)],
      levels
    )
  }
  
# 3. Crear lista de paletas
  
  palettes <- list()

  
# 4. Paleta de groups

  group <- SummarizedExperiment::colData(se)$group
  
  palettes$group <- make_palette(
    group,
    "group"
  )
  
  
# 5. Paletas de subgroup y group_subgroup. Solo existen si esas columnas existen en se.
  
  col_data_names <- names(
    SummarizedExperiment::colData(se)
  )
  
  
  if ("subgroup" %in% col_data_names) {
    
    palettes$subgroup <- make_palette(
      SummarizedExperiment::colData(se)$subgroup,
      "subgroup"
    )
  }
  
  if ("group_subgroup" %in% col_data_names) {
    
    palettes$group_subgroup <- make_palette(
      SummarizedExperiment::colData(se)$group_subgroup,
      "group_subgroup"
    )
  }
  
  palettes
}

## Ejecuta la función "crear paleta" a partir del objeto "se" y guarda la paleta como global.
create_and_store_palettes <- function() {
  
  if (!exists("se", envir = .GlobalEnv, inherits = FALSE)) {
    stop(
      "No existe un objeto se importado.",
      call. = FALSE
    )
  }
  
  if (!exists("palette", envir = .GlobalEnv, inherits = FALSE)) {
    stop(
      "No existe la paleta de colores.",
      call. = FALSE
    )
  }
  
  palettes <- create_palettes(
    se,
    palette
  )
  
  assign(
    "palettes",
    palettes,
    envir = .GlobalEnv
  )
  
  invisible(palettes)
}
