// Ruta donde guardaremos temporalmente el Excel

const R_EXCEL_PATH =
    "/data/import.xlsx";


import { createModule } from "./module-template.js";


function formatError(error) {

    const message =
        error instanceof Error
            ? error.message
            : String(error);

    return message.replace(
        /^Error:\s*/,
        ""
    );
}


/*
 * Esta es la función que app.js llama para activar
 * el módulo de importación.
 *
 * Recibe:
 *
 *   webR  -> nuestra instancia de WebR
 *   log   -> función de app.js para escribir mensajes
 *            en la salida principal
 */
export async function initImportDataModule({
    webR,
    log,
    onImportCompleted
}) {

    let resolveImport;
    let rejectImport;

    const importCompleted =
        new Promise((resolve, reject) => {

            resolveImport = resolve;
            rejectImport = reject;

        });


    // ============================================================
    // Crear interfaz del módulo
    // ============================================================

    const {
        container,
        controls,
        results
    } = createModule(
        "Import data"
    );


    // ============================================================
    // Selector de archivo
    // ============================================================

    const input =
        document.createElement("input");

    input.type =
        "file";

    input.accept =
        ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";


    // ============================================================
    // Zona de estado
    // ============================================================

    const status =
        document.createElement("pre");

    status.textContent =
        "Selecciona un archivo Excel con el formato definido.";


    // ============================================================
    // Construir contenido
    // ============================================================

    controls.appendChild(
        input
    );

    results.appendChild(
        status
    );


    // ============================================================
    // Estado inicial
    // ============================================================

    status.textContent =
        "Selecciona un archivo Excel.";

    log(
        "Módulo de importación de datos listo."
    );


    // ============================================================
    // Importación
    // ============================================================

    input.addEventListener(
        "change",
        async () => {

            const [file] =
                input.files;


            if (!file) {
                return;
            }


            // --------------------------------------------------------
            // Comprobar extensión
            // --------------------------------------------------------

            if (
                !file.name
                    .toLowerCase()
                    .endsWith(".xlsx")
            ) {

                status.textContent =
                    "ERROR: selecciona un archivo .xlsx.";

                input.value = "";

                return;
            }


            // --------------------------------------------------------
            // Ejecutar importación
            // --------------------------------------------------------

            try {

                // ====================================================
                // 1. Importar Excel y crear SummarizedExperiment
                // ====================================================

                status.textContent =
                    `Loading data...`;


                const data =
                    new Uint8Array(
                        await file.arrayBuffer()
                    );


                await webR.FS.writeFile(
                    R_EXCEL_PATH,
                    data
                );


                await webR.evalRVoid(
                    `import_analysis_excel("${R_EXCEL_PATH}")`
                );


                log(
                    "Excel importado y objeto creado."
                );


                // ====================================================
                // Crear y guardar las paletas
                // ====================================================

                status.textContent =
                    "Preparing color palettes...";


                await webR.evalRVoid(
                    "create_and_store_palettes()"
                );


                log(
                    "Executed: Color palettes."
                );


                // ====================================================
                // Preparar raw abundance
                // ====================================================

                status.textContent =
                    "Preparing raw abundance...";


                await webR.evalRVoid(
                    "prepare_raw_abundance()"
                );


                log(
                    "Executed: Raw abundance"
                );
                
                
                // ====================================================
                // Preparar se statistics
                // ====================================================

                 status.textContent =
                    "Preparing statistics...";


                await webR.evalRVoid(
                    "prepare_se_statistics()"
                );


                log(
                    "Executed: SE Statistics"
                );


                // ====================================================
                // Preparar Lipid metadata
                // ====================================================

                status.textContent =
                    "Preparing lipid metadata...";


                await webR.evalRVoid(
                    "prepare_lipid_metadata()"
                );


                log(
                    "Executed: Lipid Metadata"
                );

                                // ====================================================
                // Preparar Lipid metadata
                // ====================================================

                status.textContent =
                    "Preparing lipid number...";


                await webR.evalRVoid(
                    "prepare_lipid_number()"
                );


                log(
                    "Executed: Lipid number"
                );

                
                
                // ====================================================
                // Obtener resumen del SummarizedExperiment
                // ====================================================

                status.textContent =
                    "Preparing experiment summary...";


                const summary =
                    await webR.evalRString(
                        "summarise_imported_se()"
                    );


                // ====================================================
                // Fin
                // ====================================================

                status.textContent =
                    `Data load completed. \n\n${summary}`;


                log(
                    "Importación completada correctamente."
                );


                resolveImport();


                if (onImportCompleted) {

                    onImportCompleted();

                }


            } catch (error) {

                console.error(
                    error
                );


                const message =
                    formatError(
                        error
                    );


                status.textContent =
                    `ERROR: ${message}`;


                log(
                    `ERROR de importación: ${message}`
                );


                rejectImport(
                    error
                );


            } finally {

                input.value = "";

            }

        }
    );


    return {
        container,
        input,
        status,
        importCompleted
    };
}