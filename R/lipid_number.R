# ---------------------------------------------
# PREPARAR LOS DATOS EN R.

# ============================================================
### Cálculo de número de lípidos totales.


prepare_lipid_number <- function() {
  
  # ----------------------------------------------------------
  # Extraer abundancia
  abundance <- SummarizedExperiment::assay(
    se,
    "abundance"
  )
  
  # ----------------------------------------------------------
  # Extraer información de las muestras
  
  sample_info <- as.data.frame(
    SummarizedExperiment::colData(se)
  )
  
  # ----------------------------------------------------------
  # Determinar variable de agrupación
  # ----------------------------------------------------------
  
  # ----------------------------------------------------------
  # Determinar variable de agrupación
  # ----------------------------------------------------------
  
  if ("group_subgroup" %in% colnames(sample_info)) {
    
    grouping_variable <- "group_subgroup"
    legend_title <- "Group + Subgroup"
    
  } else if ("group" %in% colnames(sample_info)) {
    
    grouping_variable <- "group"
    legend_title <- "Group"
    
  } else {
    
    stop(
      "colData(se) debe contener 'group' o 'group_subgroup'.",
      call. = FALSE
    )
  }
  
  groups <- unique(
    as.character(
      sample_info[[grouping_variable]]
    )
  )
  
  palette <- as.list(
    palettes[[grouping_variable]]
  )
  
  # ----------------------------------------------------------
  # Número de lípidos detectados por muestra
  # ----------------------------------------------------------
  
  lipid_number <-
    data.frame(
      sample = colnames(abundance),
      lipid_number = colSums(!is.na(abundance)),
      stringsAsFactors = FALSE
    )
  
  # ----------------------------------------------------------
  # Añadir información de grupo
  # ----------------------------------------------------------
  
  sample_groups <-
    data.frame(
      sample = sample_info$sample_name,
      group = as.character(
        sample_info[[grouping_variable]]
      ),
      stringsAsFactors = FALSE
    )
  
  lipid_number <- merge(
    lipid_number,
    sample_groups,
    by = "sample",
    all.x = TRUE,
    sort = FALSE
  )
  
  # ----------------------------------------------------------
  # Mantener el orden original de las muestras
  # ----------------------------------------------------------
  
  lipid_number$sample <- factor(
    lipid_number$sample,
    levels = sample_info$sample_name
  )
  
  lipid_number$group <- factor(
    lipid_number$group,
    levels = unique(
      as.character(
        sample_info[[grouping_variable]]
      )
    )
  )
  
  lipid_number <- lipid_number[
    order(lipid_number$sample),
  ]
  
  rownames(lipid_number) <- seq_len(
    nrow(lipid_number)
  )
  
  # ----------------------------------------------------------
  # Preparar resultado
  # ----------------------------------------------------------
  
  result <- list(
    lipid_number = lipid_number,
    palette = palette,
    legend_title = legend_title
  )
  
  # ----------------------------------------------------------
  # Guardar globalmente
  # ----------------------------------------------------------
  
  lipid_number_data <<- result
  
  invisible(lipid_number_data)
}

# ----------------------------------------
# SERVIR LOS DATOS A JAVASCRIPT

# ============================================================
# Obtener lipid number desde javascript


get_lipid_number <- function() {
  
  jsonlite::toJSON(
    lipid_number_data,
    pretty = TRUE,
    auto_unbox = TRUE,
    na = "null"
  )
}