prepare_lipid_total_abundance <- function() {
  
  # ----------------------------------------------------------
  # Extraer abundancia
  # ----------------------------------------------------------
  
  abundance <- SummarizedExperiment::assay(
    se,
    "abundance"
  )
  
  
  # ----------------------------------------------------------
  # Extraer información de las muestras
  # ----------------------------------------------------------
  
  sample_info <- as.data.frame(
    SummarizedExperiment::colData(se)
  )
  
  
  
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
  # Suma de abundancia total de lípidos
  # ----------------------------------------------------------
  
  lipid_total_abundance <-
    data.frame(
      sample = colnames(abundance),
      lipid_total_abundance = colSums(
        abundance,
        na.rm = TRUE
      ),
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
  
  
  lipid_total_abundance <- merge(
    lipid_total_abundance,
    sample_groups,
    by = "sample",
    all.x = TRUE,
    sort = FALSE
  )
  
  
  # ----------------------------------------------------------
  # Mantener el orden original de las muestras
  # ----------------------------------------------------------
  
  lipid_total_abundance$sample <- factor(
    lipid_total_abundance$sample,
    levels = sample_info$sample_name
  )
  
  lipid_total_abundance$group <- factor(
    lipid_total_abundance$group,
    levels = groups
  )
  
  
  lipid_total_abundance <- lipid_total_abundance[
    order(lipid_total_abundance$sample),
  ]
  
  
  rownames(lipid_total_abundance) <- seq_len(
    nrow(lipid_total_abundance)
  )
  
  
  # ----------------------------------------------------------
  # Añadir color
  # ----------------------------------------------------------
  
  lipid_total_abundance$color <-
    unname(
      palette[
        as.character(lipid_total_abundance$group)
      ]
    )
  
  
  # ----------------------------------------------------------
  # Preparar hover text
  # ----------------------------------------------------------
  
  lipid_total_abundance$hover_text <-
    paste0(
      "<b>",
      lipid_total_abundance$sample,
      "</b>",
      "<br>",
      legend_title,
      ": ",
      lipid_total_abundance$group,
      "<br>Total abundance: ",
      round(lipid_total_abundance$lipid_total_abundance,3),
      "<extra></extra>"
    )
  
  
  # ----------------------------------------------------------
  # Preparar resultado
  # ----------------------------------------------------------
  
  result <- list(
    data = lipid_total_abundance,
    title = "Lipid total abundance",
    title_xaxis = "",
    title_yaxis = "Total abundance",
    palette = palette,
    levels = groups,
    legend_title = legend_title,
    caption = ""
  )
  
  
  # ----------------------------------------------------------
  # Guardar globalmente
  # ----------------------------------------------------------
  
  lipid_total_abundance <<- result
  
  invisible(lipid_total_abundance)
}

# ----------------------------------------
# SERVIR LOS DATOS A JAVASCRIPT

# ============================================================
# Obtener lipid number desde javascript


get_lipid_total_abundance <- function() {
  
  jsonlite::toJSON(
    lipid_total_abundance,
    pretty = TRUE,
    auto_unbox = TRUE,
    na = "null"
  )
}