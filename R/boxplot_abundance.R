# --------------------------------------------------------
## Preparar datos en R
# --------------------------------------------------------

prepare_abundance_boxplot <- function() {
  
## Se preparan listas con datos independientes.
## Before processing <- a partir de datos "se"
## after processing <- a partir de datos "processed_se".  
  
  # ----------------------------------------------------------
  # BEFORE PROCESSING
  
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
  
  boxplot_before <-
    data.frame(
      sample = rep(
        colnames(abundance_before),
        each = nrow(abundance_before)
      ),
      abundance = as.vector(abundance_before),
      stringsAsFactors = FALSE
    )
  
  sample_groups_before <-
    data.frame(
      sample = sample_info_before$sample_name,
      group = as.character(
        sample_info_before[[grouping_variable_before]]
      ),
      stringsAsFactors = FALSE
    )
  
  boxplot_before <-
    merge(
      boxplot_before,
      sample_groups_before,
      by = "sample",
      all.x = TRUE,
      sort = FALSE
    )
  
  boxplot_before <-
    boxplot_before[
      !is.na(boxplot_before$abundance),
    ]
  
  boxplot_before$sample <-
    factor(
      boxplot_before$sample,
      levels = sample_info_before$sample_name
    )
  
  boxplot_before$group <-
    factor(
      boxplot_before$group,
      levels = groups_before
    )
  
  boxplot_before$color <-
    unname(
      palette_before[
        as.character(boxplot_before$group)
      ]
    )
  
  boxplot_before <-
    boxplot_before[
      order(boxplot_before$sample),
    ]
  
  rownames(boxplot_before) <-
    seq_len(
      nrow(boxplot_before)
    )
  
  
  before <-
    list(
      data = boxplot_before,
      samples = sample_info_before$sample_name,
      levels = groups_before,
      legend_title = legend_title_before,
      title = "Boxplot before processing",
      title_xaxis = "Abundance",
      title_yaxis = "",
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
  
  abundance_after <- SummarizedExperiment::assay(
    processed_se,
    "processed"
  )
  
  boxplot_after <-
    data.frame(
      sample = rep(
        colnames(abundance_after),
        each = nrow(abundance_after)
      ),
      abundance = as.vector(abundance_after),
      stringsAsFactors = FALSE
    )
  
  sample_groups_after <-
    data.frame(
      sample = sample_info_after$sample_name,
      group = as.character(
        sample_info_after[[grouping_variable_after]]
      ),
      stringsAsFactors = FALSE
    )
  
  boxplot_after <-
    merge(
      boxplot_after,
      sample_groups_after,
      by = "sample",
      all.x = TRUE,
      sort = FALSE
    )
  
  boxplot_after <-
    boxplot_after[
      !is.na(boxplot_after$abundance),
    ]
  
  boxplot_after$sample <-
    factor(
      boxplot_after$sample,
      levels = sample_info_after$sample_name
    )
  
  boxplot_after$group <-
    factor(
      boxplot_after$group,
      levels = groups_after
    )
  
  boxplot_after$color <-
    unname(
      palette_after[
        as.character(boxplot_after$group)
      ]
    )
  
  boxplot_after <-
    boxplot_after[
      order(boxplot_after$sample),
    ]
  
  rownames(boxplot_after) <-
    seq_len(
      nrow(boxplot_after)
    )
  
  
  after <-
    list(
      data = boxplot_after,
      samples = sample_info_after$sample_name,
      levels = groups_after,
      legend_title = legend_title_after,
      title = "Boxplot after processing",
      title_xaxis = "Abundance",
      title_yaxis = "",
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
  
  abundance_boxplot_data <<- result
  
  invisible(abundance_boxplot_data)
}


# --------------------------------------------------------
## SERVIR DATOS A JAVASCRIPT
# --------------------------------------------------------


get_abundance_boxplot <- function() {
  
  jsonlite::toJSON(
    abundance_boxplot_data,
    pretty = TRUE,
    auto_unbox = TRUE,
    na = "null"
  )
}