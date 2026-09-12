# ============================================================
# HIERARCHICAL CLUSTERING
# ============================================================


prepare_hclustering <- function() {
  
  
  # ============================================================
  # 1. VALIDAR GROUPINGS
  # ============================================================
  sample_info <- as.data.frame(
    SummarizedExperiment::colData(processed_se)
  )
  
  groupings <- c(
    "group",
    "subgroup",
    "group_subgroup"
  )
  
  grouping_names <- c(
    "Group",
    "Subgroup",
    "Group + Subgroup"
  )
  
  valid <- vapply(
    groupings,
    function(grouping) {
      
      if (!grouping %in% colnames(sample_info)) {
        return(FALSE)
      }
      
      values <- as.character(
        sample_info[[grouping]]
      )
      
      length(
        unique(
          values[
            !is.na(values) &
              values != ""
          ]
        )
      ) >= 2
    },
    logical(1)
  )
  
  valid_groupings <- groupings[valid]
  
  valid_grouping_names <- grouping_names[valid]
  
  # ============================================================
  # 2. DATOS BASE
  # ============================================================
  
  abundance <- SummarizedExperiment::assay(
    processed_se,
    "processed"
  )
  
  
  lipid_info <- as.data.frame(
    SummarizedExperiment::rowData(processed_se)
  )
  
  
  lipid_info <- lipid_info |>
    dplyr::select(
      feature,
      class = Class,
      category = Category
    )
  
  
  sample_info <- as.data.frame(
    SummarizedExperiment::colData(processed_se)
  )
  
  
  # ============================================================
  # 3. CALCULAR Z-SCORE POR ESPECIE
  # ============================================================
  
  lipid_mean <- rowMeans(
    abundance,
    na.rm = TRUE
  )
  
  
  z_matrix <- sweep(
    abundance,
    1,
    lipid_mean
  )
  
  
  lipid_sd <- apply(
    z_matrix,
    1,
    sd,
    na.rm = TRUE
  )
  
  
  z_matrix <- sweep(
    z_matrix,
    1,
    lipid_sd,
    "/"
  )
  
  
  # ============================================================
  # 4. CREAR DATAFRAME DE SPECIES
  # ============================================================
  
  species_df <- as.data.frame(
    z_matrix
  )
  
  
  species_df$feature <- rownames(
    z_matrix
  )
  
  
  species_df <- species_df |>
    dplyr::select(
      feature,
      dplyr::everything()
    )
  
  
  # ============================================================
  # 5. CREAR DATAFRAME POR CLASS
  # ============================================================
  
  species_df$class <- lipid_info$class
  
  
  class_df <- species_df |>
    dplyr::group_by(class) |>
    dplyr::summarise(
      dplyr::across(
        dplyr::where(is.numeric),
        ~ mean(.x, na.rm = TRUE)
      ),
      .groups = "drop"
    )
  
  
  # ============================================================
  # 6. CREAR DATAFRAME POR CATEGORY
  # ============================================================
  
  species_df$category <-
    lipid_info$category
  
  
  category_df <- species_df |>
    dplyr::group_by(category) |>
    dplyr::summarise(
      dplyr::across(
        dplyr::where(is.numeric),
        ~ mean(.x, na.rm = TRUE)
      ),
      .groups = "drop"
    )
  
  
  # ============================================================
  # 7. PREPARAR DATAFRAMES DE SAMPLE
  # ============================================================
  
  species_df <- species_df |>
    dplyr::select(
      feature,
      dplyr::all_of(colnames(abundance))
    )
  
  
  # ============================================================
  # 8. CREAR ESTRUCTURA BASE
  # ============================================================
  
  hclustering_data <- list(
    
    sample = list(
      grouping_name = "Sample",
      species = species_df,
      class = class_df,
      category = category_df
    )
  )
  
  
  # ============================================================
  # 9. AGRUPAR LAS MUESTRAS
  # ============================================================
  
  for (i in seq_along(valid_groupings)) {
    
    
    grouping_name <- valid_grouping_names[i]
    grouping <- valid_groupings[i]
    
    
    sample_info_grouping <- sample_info
    
    sample_info_grouping$group <-
      sample_info[[grouping]]
    
    
    groups <- unique(
      sample_info_grouping$group
    )
    
    
    # ----------------------------------------------------------
    # DATAFRAME DE SPECIES
    # ----------------------------------------------------------
    
    grouped_species <- species_df |>
      dplyr::select(feature)
    
    
    for (group in groups) {
      
      selected_samples <-
        sample_info_grouping$sample_name[
          sample_info_grouping$group == group
        ]
      
      
      grouped_species[[group]] <-
        rowMeans(
          species_df[
            ,
            selected_samples,
            drop = FALSE
          ],
          na.rm = TRUE
        )
    }
    
    
    # ----------------------------------------------------------
    # DATAFRAME DE CLASS
    # ----------------------------------------------------------
    
    grouped_class <- class_df |>
      dplyr::select(class)
    
    
    for (group in groups) {
      
      selected_samples <-
        sample_info_grouping$sample_name[
          sample_info_grouping$group == group
        ]
      
      
      grouped_class[[group]] <-
        rowMeans(
          class_df[
            ,
            selected_samples,
            drop = FALSE
          ],
          na.rm = TRUE
        )
    }
    
    
    # ----------------------------------------------------------
    # DATAFRAME DE CATEGORY
    # ----------------------------------------------------------
    
    grouped_category <- category_df |>
      dplyr::select(category)
    
    
    for (group in groups) {
      
      selected_samples <-
        sample_info_grouping$sample_name[
          sample_info_grouping$group == group
        ]
      
      
      grouped_category[[group]] <-
        rowMeans(
          category_df[
            ,
            selected_samples,
            drop = FALSE
          ],
          na.rm = TRUE
        )
    }
    
    
    # ----------------------------------------------------------
    # GUARDAR AGRUPACIÓN
    # ----------------------------------------------------------
    
    hclustering_data[[grouping]] <- list(
      
      grouping_name = grouping_name,
      
      species = grouped_species,
      
      class = grouped_class,
      
      category = grouped_category
    )
  }
  
  
  # ============================================================
  # 10. RESULTADO FINAL
  # ============================================================
  
  hclustering_result <- list(
    
    lipid_metadata = lipid_info,
    
    hclustering_data = hclustering_data
  )
  
  
  hclustering_result <<- hclustering_result
  
  invisible(hclustering_result)
}


get_hclustering <- function() {
  
  jsonlite::toJSON(
    hclustering_result,
    pretty = TRUE,
    auto_unbox = TRUE,
    na = "null"
  )
  
}
