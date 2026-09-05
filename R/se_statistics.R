# ---------------------------------------------
# PREPARAR LOS DATOS EN R.

# ============================================================
# Cálculo de stadística descriptiva por cada grupo_subgrupo o grupo.


prepare_se_statistics <- function() {
  
  # ----------------------------------------------------------
  # Comprobaciones
  # ----------------------------------------------------------
  
  if (!exists("se", inherits = TRUE)) {
    stop(
      "No existe un objeto llamado 'se' en el entorno.",
      call. = FALSE
    )
  }
  
  if (!inherits(se, "SummarizedExperiment")) {
    stop(
      "El objeto 'se' debe ser un SummarizedExperiment.",
      call. = FALSE
    )
  }
  
  # ----------------------------------------------------------
  # Extraer abundancia
  # ----------------------------------------------------------
  
  abundance <- SummarizedExperiment::assay(
    se,
    "abundance"
  )
  
  # ----------------------------------------------------------
  # Extraer información de grupos
  # ----------------------------------------------------------
  
  cd <- SummarizedExperiment::colData(se)
  
  if ("group_subgroup" %in% colnames(cd)) {
    
    grouping_variable <- "group_subgroup"
    
  } else if ("group" %in% colnames(cd)) {
    
    grouping_variable <- "group"
    
  } else {
    
    stop(
      "colData(se) debe contener 'group' o 'group_subgroup'.",
      call. = FALSE
    )
  }
  
  group_values <- as.character(
    cd[[grouping_variable]]
  )
  
  # ----------------------------------------------------------
  # Calcular estadísticas
  # ----------------------------------------------------------
  
  results <- vector(
    "list",
    nrow(abundance)
  )
  
  groups <- unique(group_values)
  
  for (i in seq_len(nrow(abundance))) {
    
    feature_values <- abundance[i, ]
    feature_name <- rownames(abundance)[i]
    
    feature_results <- vector(
      "list",
      length(groups)
    )
    
    for (j in seq_along(groups)) {
      
      current_group <- groups[j]
      
      values <- feature_values[
        group_values == current_group
      ]
      
      # Número de muestras donde el feature está presente
      n <- sum(!is.na(values))
      
      if (n == 0) {
        
        mean_value <- NA_real_
        sd_value   <- NA_real_
        rsd_value  <- NA_real_
        
      } else {
        
        mean_value <- mean(
          values,
          na.rm = TRUE
        )
        
        sd_value <- if (n > 1) {
          stats::sd(
            values,
            na.rm = TRUE
          )
        } else {
          NA_real_
        }
        
        rsd_value <- if (
          is.na(sd_value) ||
          is.na(mean_value) ||
          mean_value == 0
        ) {
          NA_real_
        } else {
          100 * sd_value / abs(mean_value)
        }
      }
      
      feature_results[[j]] <- data.frame(
        feature = feature_name,
        group = current_group,
        mean = mean_value,
        SD = sd_value,
        RSD = rsd_value,
        n = n,
        stringsAsFactors = FALSE
      )
    }
    
    results[[i]] <- do.call(
      rbind,
      feature_results
    )
  }
  
  # ----------------------------------------------------------
  # Unir resultados. Guardar como variable global.
  # ----------------------------------------------------------
  
  se_statistics <- do.call(
    rbind,
    results
  )
  
  
  se_statistics[, c("mean", "SD", "RSD")] <-
    signif(
      se_statistics[, c("mean", "SD", "RSD")],
      digits = 5
    )
  
  rownames(se_statistics) <- NULL
  
  se_statistics <<- se_statistics
  
  ## No imprimir el resultado.  
  
  invisible(se_statistics)
  
}

# ============================================================
# Obtener cálculos estadísticos de "se". 

get_se_statistics <- function() {
  
  rows <- split(
    se_statistics,
    seq_len(nrow(se_statistics))
  )
  
  rows <- lapply(
    rows,
    as.list
  )
  
  names(rows) <- NULL
  
  jsonlite::toJSON(
    rows,
    pretty = TRUE,
    auto_unbox = TRUE,
    na = "null"
  )
}



