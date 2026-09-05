# ---------------------------------------------
# PREPARAR LOS DATOS EN R.

# ============================================================
# Obtener abundancia de "se" (raw abundance)

prepare_processed_abundance <- function() {
  
  abundance <- SummarizedExperiment::assay(
    processed_se,
    "processed"
  )
  
  abundance <- signif(
    abundance,
    digits = 5
  )
  
  processed_abundance_table <<-
    data.frame(
      lipid = rownames(abundance),
      class = processed_se@elementMetadata$Class,
      category = processed_se@elementMetadata$Category,
      abundance,
      check.names = FALSE
    )
  
  rownames(processed_abundance_table) <- seq_len(
    nrow(processed_abundance_table)
  )
  
  invisible(processed_abundance_table)
}


# ----------------------------------------
# SERVIR LOS DATOS A JAVASCRIPT

# ============================================================
# Obtener abundancia de "processed_se" (processed abundance)

get_processed_abundance <- function() {
  
  rows <- split(
    processed_abundance_table,
    seq_len(nrow(processed_abundance_table))
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
