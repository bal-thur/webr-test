prepare_pca <- function() {
  
  abundance <-
    SummarizedExperiment::assay(
      processed_se,
      "processed"
    )
  
  sample_info <-
    as.data.frame(
      SummarizedExperiment::colData(
        processed_se
      )
    )
  
  if (!"group" %in% colnames(sample_info)) {
    stop(
      "colData(processed_se) debe contener 'group'.",
      call. = FALSE
    )
  }
  
  if ("group_subgroup" %in% colnames(sample_info)) {
    
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
    
  } else {
    
    groupings <- "group"
    
    grouping_names <- "Group"
    
  }
  
  grouping_data <- list()
  
  for (grouping in groupings) {
    
    levels <- unique(
      as.character(
        sample_info[[grouping]]
      )
    )
    
    levels <- levels[
      !is.na(levels) &
        levels != ""
    ]
    
    palette <- palettes[[grouping]][levels]
    
    grouping_data[[grouping]] <- list(
      levels = levels,
      palette = as.list(palette),
      n_groups = length(levels)
    )
  }
  
  feature_variance <- apply(
    abundance,
    1,
    stats::var
  )
  
  zero_variance <- feature_variance == 0
  
  n_features_removed <-
    sum(zero_variance)
  
  if (n_features_removed > 0) {
    
    abundance <- abundance[
      !zero_variance,
      ,
      drop = FALSE
    ]
    
  }
  
  pca <- stats::prcomp(
    t(abundance),
    center = TRUE,
    scale. = TRUE
  )
  
  scores <- as.data.frame(
    pca$x
  )
  
  scores$sample <-
    sample_info$sample_name
  
  scores <- scores[
    ,
    c(
      "sample",
      paste0(
        "PC",
        seq_len(
          ncol(pca$x)
        )
      )
    )
  ]
  
  variance <- pca$sdev^2
  
  variance_percent <-
    variance /
    sum(variance) *
    100
  
  variance <- data.frame(
    PC = paste0(
      "PC",
      seq_along(variance_percent)
    ),
    variance = variance_percent,
    cumulative = cumsum(
      variance_percent
    ),
    stringsAsFactors = FALSE
  )
  
  contribution <- pca$rotation^2
  
  contribution <-
    sweep(
      contribution,
      2,
      colSums(contribution),
      "/"
    )
  
  contribution <-
    contribution * 100
  
  contribution <-
    as.data.frame(
      contribution
    )
  
  contribution$feature <-
    rownames(contribution)
  
  contribution <-
    contribution[
      ,
      c(
        "feature",
        paste0(
          "PC",
          seq_len(
            ncol(pca$rotation)
          )
        )
      )
    ]
  
  scree <- data.frame(
    PC = variance$PC,
    variance = variance$variance,
    cumulative = variance$cumulative,
    stringsAsFactors = FALSE
  )
  
  if (ncol(scores) < 5) {
    stop(
      "El PCA no contiene al menos cuatro componentes principales.",
      call. = FALSE
    )
  }
  
  scores <- scores[
    ,
    c(
      "sample",
      "PC1",
      "PC2",
      "PC3",
      "PC4"
    )
  ]
  
  pca_data <- list()
  
  for (i in seq_along(groupings)) {
    
    grouping <- groupings[i]
    
    grouping_name <- grouping_names[i]
    
    levels <- grouping_data[[grouping]]$levels
    
    palette <- grouping_data[[grouping]]$palette
    
    grouping_values <- as.character(
      sample_info[[grouping]]
    )
    
    pca_scores <- scores
    
    pca_scores$group <-
      grouping_values
    
    pca_scores <- pca_scores[
      !is.na(pca_scores$group) &
        pca_scores$group != "",
      ,
      drop = FALSE
    ]
    
    pca_scores$color <-
      unname(
        unlist(
          palette[
            pca_scores$group
          ]
        )
      )
    
    pca_scores$group <-
      factor(
        pca_scores$group,
        levels = levels
      )
    
    pca_scores <- pca_scores[
      order(pca_scores$sample),
      ,
      drop = FALSE
    ]
    
    rownames(pca_scores) <-
      seq_len(
        nrow(pca_scores)
      )
    
    pca_data[[grouping]] <- list(
      
      grouping_name = grouping_name,
      
      title = "PCA",
      
      palette = palette,
      
      levels = levels,
      
      data = list(
        
        scores = pca_scores,
        
        variance = variance,
        
        contribution = contribution,
        
        scree = scree
        
      )
      
    )
  }
  
  pca_data <<- pca_data
  
  invisible(pca_data)
}


get_pca_data <- function() {
  
  jsonlite::toJSON(
    pca_data,
    pretty = TRUE,
    auto_unbox = TRUE,
    na = "null"
  )
  
}