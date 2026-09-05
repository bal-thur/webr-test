# ============================================================
# OBTENER MÁSCARA DE MUESTRAS A CONSERVAR
# ============================================================

.get_keep_samples <- function(
    se,
    remove_groups = NULL,
    remove_subgroups = NULL,
    remove_samples = NULL
) {
  
  col_data <- SummarizedExperiment::colData(se)
  
  # Inicialmente conservamos todas las muestras
  keep <- rep(TRUE, ncol(se))
  
  # ----------------------------------------------------------
  # Eliminar grupos
  # ----------------------------------------------------------
  
  if (!is.null(remove_groups)) {
    
    remove_groups <- as.character(remove_groups)
    
    keep <- keep &
      !(as.character(col_data$group) %in% remove_groups)
  }
  
  # ----------------------------------------------------------
  # Eliminar subgrupos
  # ----------------------------------------------------------
  
  if (!is.null(remove_subgroups)) {
    
    remove_subgroups <- as.character(remove_subgroups)
    
    keep <- keep &
      !(as.character(col_data$subgroup) %in% remove_subgroups)
  }
  
  # ----------------------------------------------------------
  # Eliminar muestras
  # ----------------------------------------------------------
  
  if (!is.null(remove_samples)) {
    
    remove_samples <- as.character(remove_samples)
    
    keep <- keep &
      !(as.character(col_data$sample_name) %in% remove_samples)
  }
  
  keep
}

# ============================================================
# ELIMINAR GRUPOS

remove_groups <- function(
    se,
    groups = NULL
) {
  
  if (!inherits(se, "SummarizedExperiment")) {
    stop(
      "se debe ser un objeto SummarizedExperiment.",
      call. = FALSE
    )
  }
  
  # Si no se especifican grupos, no hacemos nada
  if (is.null(groups)) {
    return(se)
  }
  
  keep <- .get_keep_samples(
    se,
    remove_groups = groups
  )
  
  se_filtered <- se[, keep, drop = FALSE]
  
  return(se_filtered)
}

# ============================================================
# ELIMINAR SUBGRUPOS

remove_subgroups <- function(
    se,
    subgroups = NULL
) {
  
  if (!inherits(se, "SummarizedExperiment")) {
    stop(
      "se debe ser un objeto SummarizedExperiment.",
      call. = FALSE
    )
  }
  
  # Si no se especifican subgrupos, no hacemos nada
  if (is.null(subgroups)) {
    return(se)
  }
  
  keep <- .get_keep_samples(
    se,
    remove_subgroups = subgroups
  )
  
  se_filtered <- se[, keep, drop = FALSE]
  
  return(se_filtered)
}


# ============================================================
# ELIMINAR MUESTRAS

remove_samples <- function(
    se,
    samples = NULL
) {
  
  if (!inherits(se, "SummarizedExperiment")) {
    stop(
      "se debe ser un objeto SummarizedExperiment.",
      call. = FALSE
    )
  }
  
  # Si no se especifican muestras, no hacemos nada
  if (is.null(samples)) {
    return(se)
  }
  
  keep <- .get_keep_samples(
    se,
    remove_samples = samples
  )
  
  se_filtered <- se[, keep, drop = FALSE]
  
  return(se_filtered)
}


# ----------------------------------
# FILTRADO DE FEATURES POR MISSINGNESS

filter_features <- function(
    se,
    threshold = "none"
) {
  
  # ----------------------------------------------------------
  # Comprobaciones básicas
  
  if (!inherits(se, "SummarizedExperiment")) {
    stop(
      "se debe ser un objeto SummarizedExperiment.",
      call. = FALSE
    )
  }
  
  if (!"abundance" %in% SummarizedExperiment::assayNames(se)) {
    stop(
      "se no contiene el assay 'abundance'.",
      call. = FALSE
    )
  }
  
  
  # ----------------------------------------------------------
  # Comprobar threshold
  
  allowed_thresholds <- c(
    "none",
    "25",
    "50",
    "75",
    "90"
  )
  
  if (!threshold %in% allowed_thresholds) {
    stop(
      "threshold debe ser 'none', '25', '50', '75' o '90'.",
      call. = FALSE
    )
  }
  
  
  # ----------------------------------------------------------
  # Sin filtrado
  
  if (threshold == "none") {
    return(se)
  }
  
  
  # ----------------------------------------------------------
  # Convertir threshold a numeric
  
  threshold <- as.numeric(threshold)
  
  
  # ----------------------------------------------------------
  # Obtener abundance
  
  abundance <- SummarizedExperiment::assay(
    se,
    "abundance"
  )
  
  
  # ----------------------------------------------------------
  # Calcular porcentaje de NA por feature
  
  missing_percentage <- rowMeans(
    is.na(abundance)
  ) * 100
  
  
  # ----------------------------------------------------------
  # Conservar features cuyo missingness
  # NO supere el umbral
  
  keep <- missing_percentage <= threshold
  
  
  # ----------------------------------------------------------
  # Filtrar el SummarizedExperiment
  #
  # Esto mantiene automáticamente alineados:
  #
  #   assays
  #   rowData
  
  se_filtered <- se[
    keep,
    ,
    drop = FALSE
  ]
  
  
  return(se_filtered)
}


# ============================================================
# IMPUTACIÓN
# ============================================================

impute_abundance <- function(
    abundance,
    method
) {
  

  # Comprobaciones
  
  if (!is.matrix(abundance)) {
    abundance <- as.matrix(abundance)
  }
  
  allowed_methods <- c(
    "min_0.1",
    "min_0.5",
    "mean",
    "median"
  )
  
  if (!method %in% allowed_methods) {
    stop(
      paste0(
        "method debe ser uno de: ",
        paste(allowed_methods, collapse = ", ")
      ),
      call. = FALSE
    )
  }
  

  # Comprobar si existen NA

  if (!anyNA(abundance)) {
    return(abundance)
  }
  
  # ----------------------------------------------------------
  # Mínimo global positivo
  #
  # Igual que en LipidSigR:
  # se calcula utilizando todos los valores positivos
  # de la matriz.
  # ----------------------------------------------------------
  
  positive_values <- abundance[
    is.finite(abundance) & abundance > 0
  ]
  
  if (length(positive_values) == 0) {
    stop(
      "No existen valores positivos para realizar la imputación.",
      call. = FALSE
    )
  }
  
  min_value <- min(
    positive_values,
    na.rm = TRUE
  )
  

  # Imputación por una fracción del mínimo
  
  if (method == "min_0.1") {
    
    replacement <- 0.1 * min_value
    
    abundance[is.na(abundance)] <- replacement
  }
  
  # ----------------------------------------------------------
  
  else if (method == "min_0.5") {
    
    replacement <- 0.5 * min_value
    
    abundance[is.na(abundance)] <- replacement
  }
  
  # ----------------------------------------------------------
  # Promedio por feature
  # ----------------------------------------------------------
  
  else if (method == "mean") {
    
    for (i in seq_len(nrow(abundance))) {
      
      missing <- is.na(abundance[i, ])
      
      if (any(missing)) {
        
        observed <- abundance[i, !missing]
        
        if (length(observed) == 0) {
          stop(
            paste0(
              "El feature '",
              rownames(abundance)[i],
              "' no tiene valores observados."
            ),
            call. = FALSE
          )
        }
        
        abundance[i, missing] <- mean(
          observed,
          na.rm = TRUE
        )
      }
    }
  }
  
  # Mediana por feature
  
  else if (method == "median") {
    
    for (i in seq_len(nrow(abundance))) {
      
      missing <- is.na(abundance[i, ])
      
      if (any(missing)) {
        
        observed <- abundance[i, !missing]
        
        if (length(observed) == 0) {
          stop(
            paste0(
              "El feature '",
              rownames(abundance)[i],
              "' no tiene valores observados."
            ),
            call. = FALSE
          )
        }
        
        abundance[i, missing] <- stats::median(
          observed,
          na.rm = TRUE
        )
      }
    }
  }
  
  return(abundance)
}


# ============================================================
# NORMALIZACIÓN
# ============================================================

normalize_abundance <- function(
    abundance,
    method = "none"
) {
  
  # ----------------------------------------------------------
  # Comprobaciones
  # ----------------------------------------------------------
  
  if (!is.matrix(abundance)) {
    abundance <- as.matrix(abundance)
  }
  
  allowed_methods <- c(
    "none",
    "percentage"
  )
  
  if (!method %in% allowed_methods) {
    stop(
      "method debe ser 'none' o 'percentage'.",
      call. = FALSE
    )
  }
  
  # Sin normalización
  
  if (method == "none") {
    return(abundance)
  }
  
  # ----------------------------------------------------------
  # Percentage / TIC
  #
  # Cada valor se divide por la suma total de su muestra
  # y se multiplica por 100.
  #
  # Las muestras son las columnas.
  # ----------------------------------------------------------
  
  if (method == "percentage") {
    
    sample_totals <- colSums(
      abundance,
      na.rm = TRUE
    )
    
    if (any(sample_totals <= 0)) {
      stop(
        "No se puede realizar la normalización Percentage: una o más muestras tienen suma <= 0.",
        call. = FALSE
      )
    }
    
    abundance <- sweep(
      abundance,
      MARGIN = 2,
      STATS = sample_totals,
      FUN = "/"
    )
    
    abundance <- abundance * 100
  }
  
  return(abundance)
}

# ============================================================
# TRANSFORMACIÓN
# ============================================================

transform_abundance <- function(
    abundance,
    method = "none"
) {
  
  # ----------------------------------------------------------
  # Comprobaciones
  # ----------------------------------------------------------
  
  if (!is.matrix(abundance)) {
    abundance <- as.matrix(abundance)
  }
  
  allowed_methods <- c(
    "none",
    "log2",
    "log10"
  )
  
  if (!method %in% allowed_methods) {
    stop(
      "method debe ser 'none', 'log2' o 'log10'.",
      call. = FALSE
    )
  }
  

  # Sin transformación
  
  if (method == "none") {
    return(abundance)
  }
  
  # ----------------------------------------------------------
  # Comprobar valores
  #
  # Logaritmos solamente admiten valores > 0.
  # ----------------------------------------------------------
  
  if (any(!is.finite(abundance)) || any(abundance <= 0)) {
    stop(
      "La transformación logarítmica requiere valores finitos mayores que cero.",
      call. = FALSE
    )
  }
  

  # Log2
  
  if (method == "log2") {
    
    abundance <- log2(abundance)
  }
  
  # Log10
  
  else if (method == "log10") {
    
    abundance <- log10(abundance)
  }
  
  return(abundance)
}


# ============================================================
# PROCESAMIENTO COMPLETO DEL SUMMARIZED EXPERIMENT
# ============================================================

process_se <- function(
    se,
    remove_groups = NULL,
    remove_subgroups = NULL,
    remove_samples = NULL,
    remove_features = "none",
    imputation = "min_0.1",
    normalization = "none",
    transform = "none"
) {

  # ----------------------------------------------------------
  # 1. Comprobaciones iniciales
  # ----------------------------------------------------------

  if (!inherits(se, "SummarizedExperiment")) {
    stop(
      "se debe ser un objeto SummarizedExperiment.",
      call. = FALSE
    )
  }

  if (!"abundance" %in% SummarizedExperiment::assayNames(se)) {
    stop(
      "se no contiene el assay 'abundance'.",
      call. = FALSE
    )
  }


  # ----------------------------------------------------------
  # 2. Eliminar grupos, subgrupos y muestras
  # ----------------------------------------------------------

  keep <- .get_keep_samples(
    se,
    remove_groups = remove_groups,
    remove_subgroups = remove_subgroups,
    remove_samples = remove_samples
  )

  filtered_se <- se[, keep, drop = FALSE]


  # ----------------------------------------------------------
  # 3. Comprobar que quedan al menos 2 grupos
  # ----------------------------------------------------------

  remaining_groups <- unique(
    as.character(
      SummarizedExperiment::colData(filtered_se)$group
    )
  )

  remaining_groups <- remaining_groups[
    !is.na(remaining_groups)
  ]

  #if (length(remaining_groups) < 2) {
#
  #  stop(
  #    "Analysis requires at least two groups after filtering.",
  #    call. = FALSE
  #  )
  #}


  # ----------------------------------------------------------
  # 4. Filtrar features
  # ----------------------------------------------------------

  filtered_se <- filter_features(
    filtered_se,
    threshold = remove_features
  )


  # ----------------------------------------------------------
  # 5. Comprobar que quedan features
  # ----------------------------------------------------------

  if (nrow(filtered_se) == 0) {

    stop(
      "All features were removed during filtering.",
      call. = FALSE
    )
  }


  # ----------------------------------------------------------
  # 6. Extraer abundance
  # ----------------------------------------------------------

  abundance <- SummarizedExperiment::assay(
    filtered_se,
    "abundance"
  )


  # ----------------------------------------------------------
  # 7. Imputación
  # ----------------------------------------------------------

  processed_abundance <- impute_abundance(
    abundance,
    method = imputation
  )


  # ----------------------------------------------------------
  # 8. Normalización
  # ----------------------------------------------------------

  processed_abundance <- normalize_abundance(
    processed_abundance,
    method = normalization
  )


  # ----------------------------------------------------------
  # 9. Transformación
  # ----------------------------------------------------------

  processed_abundance <- transform_abundance(
    processed_abundance,
    method = transform
  )


  # ----------------------------------------------------------
  # 10. Crear processed_se
  # ----------------------------------------------------------

  processed_se <- SummarizedExperiment::SummarizedExperiment(

    assays = list(
      processed = processed_abundance
    ),

    rowData = SummarizedExperiment::rowData(
      filtered_se
    ),

    colData = SummarizedExperiment::colData(
      filtered_se
    ),

    metadata = S4Vectors::metadata(
      filtered_se
    )
  )

  # ----------------------------------------------------------
  # 11. Guardar en la sesión R
  # ----------------------------------------------------------

  assign(
    "processed_se",
    processed_se,
    envir = .GlobalEnv
  )


  # ----------------------------------------------------------
  # 12. Devolver el objeto
  # ----------------------------------------------------------

  invisible(processed_se)
}


# ============================================================
# Ejecutar process_se desde JavaScript
# ============================================================

run_process_se <- function(
    remove_groups,
    remove_subgroups,
    remove_samples,
    remove_features,
    imputation,
    normalization,
    transform
) {
  
  process_se(
    se = se,
    remove_groups = remove_groups,
    remove_subgroups = remove_subgroups,
    remove_samples = remove_samples,
    remove_features = remove_features,
    imputation = imputation,
    normalization = normalization,
    transform = transform
  )
  
   invisible(NULL)
}


# ============================================================
# RESUMEN DE processed_se
# ============================================================

summarise_processed_se <- function() {
  
  if (!exists("processed_se", envir = .GlobalEnv, inherits = FALSE)) {
    stop(
      "No existe un objeto processed_se.",
      call. = FALSE
    )
  }
  
  object <- get(
    "processed_se",
    envir = .GlobalEnv,
    inherits = FALSE
  )
  
  
  paste(
    c(
      paste0(
        "Dimensiones de processed_se: ",
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
        "Sample number: ",
        ncol(object)
      ),
      
      paste0(
        "Lipid number: ",
        nrow(object)
      ),
      
      paste0(
        "Columnas de colData: ",
        paste(
          names(SummarizedExperiment::colData(object)),
          collapse = ", "
        )
      ),
      
      paste0(
        "Columnas de rowData: ",
        paste(
          names(SummarizedExperiment::rowData(object)),
          collapse = ", "
        )
      )
    ),
    collapse = "\n"
  )
}
