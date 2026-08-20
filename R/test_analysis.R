library(jsonlite)

run_test_analysis <- function(data) {
  
  result <- data.frame(
    lipid = data$lipid,
    group = data$group,
    abundance = data$abundance,
    p_value = data$p_value
  )
  
  jsonlite::toJSON(
    result,
    dataframe = "rows",
    auto_unbox = TRUE,
    na = "null"
  )
}