# ============================================================
# SETUP DE LA APLICACIÓN
# ============================================================

message("========================================")
message("Iniciando setup")
message("R: ", R.version.string)
message("========================================")


# ============================================================
# REPOSITORIOS WASM
# ============================================================

repos <- c(
  "https://bioc.r-universe.dev",
  "https://tidyverse.r-universe.dev",
  "https://repo.r-wasm.org"
)


# ============================================================
# PAQUETES
# ============================================================

packages <- c(
  "mixOmics",
  "dplyr",
  "tidyr",
  "ggplot2",
  "S4Vectors",
  "SummarizedExperiment",
  "readxl"
)


# ============================================================
# INSTALACIÓN
# ============================================================

message("Instalando paquetes...")

webr::install(
  packages,
  repos = repos
)


# ============================================================
# COMPROBACIÓN: SOLO INSTALACIÓN
# ============================================================

message("")
message("Comprobando paquetes instalados:")

installed <- rownames(installed.packages())

for (pkg in packages) {
  
  if (pkg %in% installed) {
    
    message(
      "  OK  ",
      pkg,
      " ",
      as.character(
        packageVersion(pkg)
      )
    )
    
  } else {
    
    message(
      "  ERROR  ",
      pkg,
      " no está instalado"
    )
  }
}


message("")
message("========================================")
message("Setup terminado")
message("========================================")