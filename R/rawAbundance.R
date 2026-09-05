# ---------------------------------------------
# PREPARAR LOS DATOS EN R.

# ============================================================
# Obtener abundancia de "se" (raw abundance)

prepare_raw_abundance <- function() {
  
  abundance <- SummarizedExperiment::assay(
    se,
    "abundance"
  )
  
  abundance <- signif(
    abundance,
    digits = 5
  )
  
  raw_abundance_table <<-
    data.frame(
      lipid = rownames(abundance),
      class = se@elementMetadata$Class,
      category = se@elementMetadata$Category,
      abundance,
      check.names = FALSE
    )
  
  rownames(raw_abundance_table) <- seq_len(
    nrow(raw_abundance_table)
  )
  
  invisible(raw_abundance_table)
}
# ----------------------------------------
# SERVIR LOS DATOS A JAVASCRIPT

# ============================================================
# Obtener abundancia de "se" (raw abundance)


# ----------------------------------------
# SERVIR LOS DATOS A JAVASCRIPT

# ============================================================
# Obtener abundancia de "se" (raw abundance)

get_raw_abundance <- function() {
  
  rows <- split(
    raw_abundance_table,
    seq_len(nrow(raw_abundance_table))
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




