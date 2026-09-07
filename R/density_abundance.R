# ----------------------------------------------------------
# Preparar los datos en R.

prepare_abundance_density <- function() {
  
  # ----------------------------------------------------------
  # BEFORE PROCESSING
  # ----------------------------------------------------------
  
  sample_info_before <-
    as.data.frame(
      SummarizedExperiment::colData(se)
    )
  
  
  if ("group_subgroup" %in% colnames(sample_info_before)) {
    
    grouping_variable_before <- "group_subgroup"
    legend_title_before <- "Group + Subgroup"
    
  } else if ("group" %in% colnames(sample_info_before)) {
    
    grouping_variable_before <- "group"
    legend_title_before <- "Group"
    
  } else {
    
    stop(
      "colData(se) debe contener 'group' o 'group_subgroup'.",
      call. = FALSE
    )
  }
  
  
  groups_before <-
    unique(
      as.character(
        sample_info_before[[grouping_variable_before]]
      )
    )
  
  
  palette_before <-
    as.list(
      palettes[[grouping_variable_before]]
    )
  
  
  abundance_before <-
    SummarizedExperiment::assay(
      se,
      "abundance"
    )
  
  
  # ----------------------------------------------------------
  # Calcular densidad por muestra
  # ----------------------------------------------------------
  
  density_before <-
    lapply(
      colnames(abundance_before),
      function(sample) {
        
        values <-
          abundance_before[, sample]
        
        values <-
          values[
            !is.na(values)
          ]
        
        
        if (length(values) < 2) {
          
          return(
            NULL
          )
        }
        
        
        d <-
          density(
            values
          )
        
        
        data.frame(
          sample = sample,
          abundance = d$x,
          density = d$y,
          stringsAsFactors = FALSE
        )
      }
    )
  
  
  density_before <-
    do.call(
      rbind,
      density_before
    )
  
  
  # ----------------------------------------------------------
  # Añadir grupos
  # ----------------------------------------------------------
  
  sample_groups_before <-
    data.frame(
      sample = sample_info_before$sample_name,
      group = as.character(
        sample_info_before[[grouping_variable_before]]
      ),
      stringsAsFactors = FALSE
    )
  
  
  density_before <-
    merge(
      density_before,
      sample_groups_before,
      by = "sample",
      all.x = TRUE,
      sort = FALSE
    )
  
  
  density_before$sample <-
    factor(
      density_before$sample,
      levels = sample_info_before$sample_name
    )
  
  
  density_before$group <-
    factor(
      density_before$group,
      levels = groups_before
    )
  
  
  density_before$color <-
    unname(
      palette_before[
        as.character(
          density_before$group
        )
      ]
    )
  
  
  density_before$hover_text <-
    paste0(
      "<b>Sample:</b> ",
      density_before$sample,
      "<br><b>",
      legend_title_before,
      ":</b> ",
      density_before$group,
      "<br><b>Abundance:</b> ",
      signif(
        density_before$abundance,
        4
      ),
      "<br><b>Density:</b> ",
      signif(
        density_before$density,
        4
      ),
      "<extra></extra>"
    )
  
  
  density_before <-
    density_before[
      order(
        density_before$sample,
        density_before$abundance
      ),
    ]
  
  
  rownames(density_before) <-
    seq_len(
      nrow(density_before)
    )
  
  
  before <-
    list(
      data = density_before,
      samples = sample_info_before$sample_name,
      levels = groups_before,
      legend_title = legend_title_before,
      title = "Density plot before processing",
      title_xaxis = "Abundance",
      title_yaxis = "Density",
      caption = ""
    )
  
  
  # ----------------------------------------------------------
  # AFTER PROCESSING
  # ----------------------------------------------------------
  
  sample_info_after <-
    as.data.frame(
      SummarizedExperiment::colData(processed_se)
    )
  
  
  if ("group_subgroup" %in% colnames(sample_info_after)) {
    
    grouping_variable_after <- "group_subgroup"
    legend_title_after <- "Group + Subgroup"
    
  } else if ("group" %in% colnames(sample_info_after)) {
    
    grouping_variable_after <- "group"
    legend_title_after <- "Group"
    
  } else {
    
    stop(
      "colData(processed_se) debe contener 'group' o 'group_subgroup'.",
      call. = FALSE
    )
  }
  
  
  groups_after <-
    unique(
      as.character(
        sample_info_after[[grouping_variable_after]]
      )
    )
  
  
  palette_after <-
    as.list(
      palettes[[grouping_variable_after]]
    )
  
  
  abundance_after <-
    SummarizedExperiment::assay(
      processed_se,
      "processed"
    )
  
  
  # ----------------------------------------------------------
  # Calcular densidad por muestra
  # ----------------------------------------------------------
  
  density_after <-
    lapply(
      colnames(abundance_after),
      function(sample) {
        
        values <-
          abundance_after[, sample]
        
        values <-
          values[
            !is.na(values)
          ]
        
        
        if (length(values) < 2) {
          
          return(
            NULL
          )
        }
        
        
        d <-
          density(
            values
          )
        
        
        data.frame(
          sample = sample,
          abundance = d$x,
          density = d$y,
          stringsAsFactors = FALSE
        )
      }
    )
  
  
  density_after <-
    do.call(
      rbind,
      density_after
    )
  
  
  # ----------------------------------------------------------
  # Añadir grupos
  # ----------------------------------------------------------
  
  sample_groups_after <-
    data.frame(
      sample = sample_info_after$sample_name,
      group = as.character(
        sample_info_after[[grouping_variable_after]]
      ),
      stringsAsFactors = FALSE
    )
  
  
  density_after <-
    merge(
      density_after,
      sample_groups_after,
      by = "sample",
      all.x = TRUE,
      sort = FALSE
    )
  
  
  density_after$sample <-
    factor(
      density_after$sample,
      levels = sample_info_after$sample_name
    )
  
  
  density_after$group <-
    factor(
      density_after$group,
      levels = groups_after
    )
  
  
  density_after$color <-
    unname(
      palette_after[
        as.character(
          density_after$group
        )
      ]
    )
  
  
  density_after$hover_text <-
    paste0(
      "<b>Sample:</b> ",
      density_after$sample,
      "<br><b>",
      legend_title_after,
      ":</b> ",
      density_after$group,
      "<br><b>Abundance:</b> ",
      signif(
        density_after$abundance,
        4
      ),
      "<br><b>Density:</b> ",
      signif(
        density_after$density,
        4
      ),
      "<extra></extra>"
    )
  
  
  density_after <-
    density_after[
      order(
        density_after$sample,
        density_after$abundance
      ),
    ]
  
  
  rownames(density_after) <-
    seq_len(
      nrow(density_after)
    )
  
  
  after <-
    list(
      data = density_after,
      samples = sample_info_after$sample_name,
      levels = groups_after,
      legend_title = legend_title_after,
      title = "Density plot after processing",
      title_xaxis = "Abundance",
      title_yaxis = "Density",
      caption = ""
    )
  
  
  # ----------------------------------------------------------
  # RESULT
  # ----------------------------------------------------------
  
  result <-
    list(
      before = before,
      after = after
    )
  
  
  abundance_density_data <<- result
  
  invisible(
    abundance_density_data
  )
}


# ----------------------------------------------------------
# Enviar los datos a javascript.

get_abundance_density <- function() {
  
  jsonlite::toJSON(
    abundance_density_data,
    pretty = TRUE,
    auto_unbox = TRUE,
    na = "null"
  )
}