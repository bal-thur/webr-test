# ============================================================
# IMPORTACIÓN DEL FORMATO CERRADO DE LA APLICACIÓN
# ============================================================

required_sheets <- c("project_info", "abundance", "group_info")
required_project_keys <- c(
  "Project name",
  "Entity",
  "Researcher",
  "Organism",
  "Matrix"
)
required_group_columns <- c("sample_name", "group", "subgroup")

import_error <- function(message) {
  stop(paste0("Validación del Excel fallida: ", message), call. = FALSE)
}

is_nonempty_text <- function(x) {
  !is.na(x) && nzchar(trimws(as.character(x)))
}

validate_analysis_excel <- function(path) {
  if (!requireNamespace("readxl", quietly = TRUE)) {
    stop("El paquete readxl no está disponible.", call. = FALSE)
  }

  sheets <- readxl::excel_sheets(path)

  if (!identical(sheets, required_sheets)) {
    import_error(
      paste0(
        "las hojas deben ser exactamente ",
        paste(required_sheets, collapse = ", "),
        ". Se encontraron: ",
        paste(sheets, collapse = ", ")
      )
    )
  }

  project_info <- readxl::read_excel(
    path,
    sheet = "project_info",
    col_names = FALSE,
    .name_repair = "minimal"
  )

  if (nrow(project_info) != length(required_project_keys) || ncol(project_info) != 2) {
    import_error("project_info debe contener exactamente cinco filas y dos columnas.")
  }

  project_keys <- as.character(project_info[[1]])
  project_values <- project_info[[2]]

  if (!identical(project_keys, required_project_keys)) {
    import_error("project_info no contiene las cinco claves esperadas en el orden requerido.")
  }

  if (any(!vapply(project_values, is_nonempty_text, logical(1)))) {
    import_error("project_info contiene valores vacíos.")
  }

  abundance <- readxl::read_excel(
    path,
    sheet = "abundance",
    .name_repair = "minimal"
  )

  if (ncol(abundance) < 2 || !identical(names(abundance)[1], "feature")) {
    import_error("abundance debe empezar por la columna feature y contener al menos una muestra.")
  }

  if (nrow(abundance) < 1) {
    import_error("abundance debe contener al menos un feature.")
  }

  features <- as.character(abundance[["feature"]])
  sample_names <- names(abundance)[-1]

  if (any(!vapply(features, is_nonempty_text, logical(1)))) {
    import_error("abundance contiene features vacíos.")
  }

  if (anyDuplicated(features)) {
    import_error("abundance contiene features duplicados.")
  }

  if (any(!vapply(sample_names, is_nonempty_text, logical(1)))) {
    import_error("abundance contiene nombres de muestra vacíos.")
  }

  if (anyDuplicated(sample_names)) {
    import_error("abundance contiene nombres de muestra duplicados.")
  }

  abundance_values <- abundance[-1]

  for (sample_name in sample_names) {
    values <- abundance_values[[sample_name]]

    if (!is.numeric(values)) {
      import_error(
        paste0("la muestra ", sample_name, " contiene valores que no son numéricos.")
      )
    }

    invalid <- !is.na(values) & (!is.finite(values) | values <= 0)

    if (any(invalid)) {
      import_error(
        paste0(
          "la muestra ",
          sample_name,
          " contiene abundancias que no son números finitos mayores que cero."
        )
      )
    }
  }

  group_info <- readxl::read_excel(
    path,
    sheet = "group_info",
    .name_repair = "minimal"
  )

  if (!identical(names(group_info), required_group_columns)) {
    import_error("group_info debe tener exactamente las columnas sample_name, group y subgroup.")
  }

  group_sample_names <- as.character(group_info[["sample_name"]])

  if (any(!vapply(group_sample_names, is_nonempty_text, logical(1)))) {
    import_error("group_info contiene sample_name vacíos.")
  }

  if (anyDuplicated(group_sample_names)) {
    import_error("group_info contiene sample_name duplicados.")
  }

  if (!identical(sample_names, group_sample_names)) {
    import_error(
      "los sample_name de group_info deben coincidir exactamente y en el mismo orden con abundance."
    )
  }

  groups <- group_info[["group"]]

  if (any(!vapply(groups, is_nonempty_text, logical(1)))) {
    import_error("group_info contiene valores group vacíos.")
  }

  subgroups <- group_info[["subgroup"]]

  if (!is.numeric(subgroups) || any(is.na(subgroups) | !is.finite(subgroups))) {
    import_error("group_info$subgroup debe ser numérico, finito y no vacío.")
  }

  list(
    project_keys = project_keys,
    project_values = as.character(project_values),
    abundance = abundance_values,
    features = features,
    sample_names = sample_names,
    group_info = group_info
  )
}

import_analysis_excel <- function(path) {
  if (!requireNamespace("SummarizedExperiment", quietly = TRUE) ||
      !requireNamespace("S4Vectors", quietly = TRUE)) {
    stop("Los paquetes SummarizedExperiment y S4Vectors deben estar instalados.", call. = FALSE)
  }

  validated <- validate_analysis_excel(path)

  abundance_matrix <- as.matrix(validated$abundance)
  storage.mode(abundance_matrix) <- "double"
  rownames(abundance_matrix) <- validated$features
  colnames(abundance_matrix) <- validated$sample_names

  processed_matrix <- matrix(
    NA_real_,
    nrow = nrow(abundance_matrix),
    ncol = ncol(abundance_matrix),
    dimnames = dimnames(abundance_matrix)
  )

  row_data <- S4Vectors::DataFrame(
    feature = validated$features,
    catalog_match = rep(FALSE, length(validated$features)),
    catalog_id = rep(NA_character_, length(validated$features)),
    lipid_name = rep(NA_character_, length(validated$features)),
    lipid_class = rep(NA_character_, length(validated$features)),
    lipid_subclass = rep(NA_character_, length(validated$features)),
    sum_composition = rep(NA_character_, length(validated$features)),
    fatty_acyl_composition = rep(NA_character_, length(validated$features)),
    adduct = rep(NA_character_, length(validated$features)),
    catalog_status = rep("unmatched", length(validated$features)),
    row.names = validated$features
  )

  col_data <- S4Vectors::DataFrame(
    sample_name = validated$sample_names,
    group = as.character(validated$group_info[["group"]]),
    subgroup = validated$group_info[["subgroup"]],
    row.names = validated$sample_names
  )

  project_metadata <- stats::setNames(
    as.list(validated$project_values),
    validated$project_keys
  )

  candidate_se <- SummarizedExperiment::SummarizedExperiment(
    assays = list(
      abundance = abundance_matrix,
      processed = processed_matrix
    ),
    rowData = row_data,
    colData = col_data,
    metadata = project_metadata
  )

  assign("se", candidate_se, envir = .GlobalEnv)
  invisible(candidate_se)
}

summarise_imported_se <- function() {
  if (!exists("se", envir = .GlobalEnv, inherits = FALSE)) {
    stop("No existe un objeto se importado.", call. = FALSE)
  }

  object <- get("se", envir = .GlobalEnv, inherits = FALSE)
  metadata_text <- vapply(
    names(S4Vectors::metadata(object)),
    function(name) paste0(name, ": ", S4Vectors::metadata(object)[[name]]),
    character(1)
  )

  paste(
    c(
      paste0("Dimensiones de se: ", nrow(object), " features × ", ncol(object), " muestras"),
      paste0("Assays: ", paste(SummarizedExperiment::assayNames(object), collapse = ", ")),
      paste0("Número de muestras: ", ncol(object)),
      paste0("Número de features: ", nrow(object)),
      paste0("Columnas de colData: ", paste(names(SummarizedExperiment::colData(object)), collapse = ", ")),
      paste0("Columnas de rowData: ", paste(names(SummarizedExperiment::rowData(object)), collapse = ", ")),
      "Metadata:",
      paste0("  ", metadata_text),
      paste0("Features completamente NA: ", sum(rowSums(is.na(SummarizedExperiment::assay(object, "abundance"))) == ncol(object))),
      paste0("Features sin coincidencia de catálogo: ", sum(!SummarizedExperiment::rowData(object)$catalog_match))
    ),
    collapse = "\n"
  )
}
