import {
    createModule
} from "./module-template.js";


export async function initDataAnalysisModule({
    webR,
    log
}) {

    const {
        container,
        content
    } = createModule(
        "Data analysis"
    );


    const status =
        document.createElement("p");

    status.textContent =
        "Analysis module ready.";


    const runButton =
        document.createElement("button");

    runButton.type =
        "button";

    runButton.textContent =
        "Run analysis";


    content.append(
        runButton
    );

    content.append(
        status
    );


    let resolveAnalysis;

    const analysisCompleted =
        new Promise(resolve => {
            resolveAnalysis = resolve;
        });


    runButton.addEventListener(
        "click",
        async () => {

            runButton.disabled =
                true;
                
                
            // ----------------------------------------------------
            //  Ejecutar análisis 
            // ----------------------------------------------------
               try { 
                
                status.textContent =
                    "Analysing data...";
                
                
              // ====================================================
              // Calcular PCA
              // ====================================================
                    
               log(
                    `Analysing data with selected parameters...`
                );      


              // ====================================================
              // Calcular PCA
              // ====================================================
              
              status.textContent =
                    "Preparing PCA...";
                
                await webR.evalRVoid(
                    "prepare_pca()"
                );


                log(
                    "Executed: PCA"
                );
                
              // ====================================================
              // Calcular hclustering
              // ====================================================
                
              
                status.textContent =
                    "Preparing hierachichal clustering...";
                
                await webR.evalRVoid(
                    "prepare_hclustering()"
                );


                log(
                    "Executed: Hierarchichal Clustering"
                );
              
                
            // ====================================================
              // Fin de analisis
              // ====================================================

            status.textContent =
                "Analysis completed.";

            resolveAnalysis();

            log(
                "Data analysis completed."
            );
            
               } catch (error) {

                // ------------------------------------------------
                // Error durante el procesamiento
                // ------------------------------------------------

                console.error(
                    error
                );


                const message =
                    error instanceof Error
                        ? error.message
                        : String(error);


                log(
                    `ERROR during data analysis: ${message}`
                );


            } finally {

                // ------------------------------------------------
                // Volver a activar el botón
                // ------------------------------------------------

                runButton.disabled =
                    false;
            }
            
        }
    );


    return {
        container,
        analysisCompleted
    };
}