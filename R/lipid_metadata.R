# ---------------------------------------------
# PREPARAR LOS DATOS EN R.

# ============================================================
# Obtener propiedades de los lipidos (metadata)


prepare_lipid_metadata <- function() {
  
  lipid_metadata <-
    as.data.frame(
      se@elementMetadata
    )
  
  colnames(lipid_metadata)[
    colnames(lipid_metadata) == "feature"
  ] <- "lipid"
  
  lipid_metadata[is.na(lipid_metadata)] <- ""
  
  rownames(lipid_metadata) <- seq_len(
    nrow(lipid_metadata)
  )
  
  lipid_metadata <<- lipid_metadata
  
  
  invisible(lipid_metadata)
}
# ----------------------------------------
# SERVIR LOS DATOS A JAVASCRIPT

# ============================================================
# Obtener lipid properties desde javascript


get_lipid_metadata <- function() {
  
  rows <- split(
    lipid_metadata,
    seq_len(nrow(lipid_metadata))
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

