# ============================================================
# OPCIONES DISPONIBLES PARA EL PROCESAMIENTO

get_processing_option_definitions <- function() {
  
  list(
    
    remove_features = list(
      list(
        value = "none",
        label = "No feature filtering"
      ),
      list(
        value = "25",
        label = "More than 25% missing values"
      ),
      list(
        value = "50",
        label = "More than 50% missing values"
      ),
      list(
        value = "75",
        label = "More than 75% missing values"
      ),
      list(
        value = "90",
        label = "More than 90% missing values"
      )
    ),
    
    imputation = list(
      list(
        value = "min_0.1",
        label = "1/10 min value"
      ),
      list(
        value = "min_0.5",
        label = "1/2 min value"
      ),
      list(
        value = "mean",
        label = "Mean"
      ),
      list(
        value = "median",
        label = "Median"
      )
    ),
    
    normalization = list(
      list(
        value = "none",
        label = "None"
      ),
      list(
        value = "percentage",
        label = "Percentage"
      )
    ),
    
    transform = list(
      list(
        value = "none",
        label = "None"
      ),
      list(
        value = "log2",
        label = "log2"
      ),
      list(
        value = "log10",
        label = "log10"
      )
    )
  )
}

# ============================================================
# OPCIONES DISPONIBLES de grupo

get_se_groups <- function(se) {
  
  col_data <- SummarizedExperiment::colData(se)
  
  groups <- unique(
    as.character(col_data$group)
  )
  
  groups <- groups[
    !is.na(groups) &
      trimws(groups) != ""
  ]
  
  groups
}

# ============================================================
# OPCIONES DISPONIBLES de subgrupo


get_se_subgroups <- function(se) {
  
  col_data <- SummarizedExperiment::colData(se)
  
  # Puede que subgroup no exista en colData
  if (!"subgroup" %in% names(col_data)) {
    return(character(0))
  }
  
  subgroups <- unique(
    as.character(col_data$subgroup)
  )
  
  subgroups <- subgroups[
    !is.na(subgroups) &
      trimws(subgroups) != ""
  ]
  
  subgroups
}


# ============================================================
# ============================================================
# OPCIONES DISPONIBLES DE MUESTRA
# ============================================================

get_se_samples <- function(se) {
  
  col_data <- SummarizedExperiment::colData(se)
  
  sample_names <- as.character(
    col_data$sample_name
  )
  
  groups <- as.character(
    col_data$group
  )
  
  if ("subgroup" %in% names(col_data)) {
    
    subgroups <- as.character(
      col_data$subgroup
    )
    
  } else {
    
    subgroups <- rep(
      NA_character_,
      length(sample_names)
    )
  }
  
  
  # ----------------------------------------------------------
  # Eliminar muestras sin sample_name válido
  # ----------------------------------------------------------
  
  valid <- !is.na(sample_names) &
    trimws(sample_names) != ""
  
  
  sample_names <- sample_names[valid]
  groups <- groups[valid]
  subgroups <- subgroups[valid]
  
  
  # ----------------------------------------------------------
  # Crear información de cada muestra
  # ----------------------------------------------------------
  
  samples <- lapply(
    seq_along(sample_names),
    function(i) {
      
      list(
        sample = sample_names[i],
        group = groups[i],
        subgroup = subgroups[i]
      )
    }
  )
  
  
  samples
}

# ============================================================
# Guardar todas las opciones en una lista


get_processing_options <- function(se) {
  
  if (!inherits(se, "SummarizedExperiment")) {
    stop(
      "se debe ser un objeto SummarizedExperiment.",
      call. = FALSE
    )
  }
  
  options <- get_processing_option_definitions()
  
  options$groups <- get_se_groups(se)
  
  options$subgroups <- get_se_subgroups(se)
  
  options$samples <- get_se_samples(se)
  
  options
}


# ============================================================
# Funcion global. Guardar todas las opciones en una lista y guardar en jsonlite

get_processing_options_json <- function(se) {
  
  options <- get_processing_options(se)
  
  jsonlite::toJSON(
    options,
    auto_unbox = TRUE
  )
}