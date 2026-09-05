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
        "Módulo de importación listo. Selecciona un archivo Excel.";

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
                    `Importando ${file.name}...`;


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
                // 2. Obtener resumen del SummarizedExperiment
                // ====================================================

                status.textContent =
                    "Datos importados. Preparando resumen.";


                const summary =
                    await webR.evalRString(
                        "summarise_imported_se()"
                    );


                // ====================================================
                // 3. Crear y guardar las paletas
                // ====================================================

                status.textContent =
                    "Datos importados. Creando paletas.";


                await webR.evalRVoid(
                    "create_and_store_palettes()"
                );


                log(
                    "Executed: Color palettes."
                );


                // ====================================================
                // 4. Preparar raw abundance
                // ====================================================

                status.textContent =
                    "Executing: Raw abundance";


                await webR.evalRVoid(
                    "prepare_raw_abundance()"
                );


                log(
                    "Executed: Raw abundance"
                );


                // ====================================================
                // Fin
                // ====================================================

                status.textContent =
                    `Datos importados correctamente.\n\n${summary}\n\nPaletas creadas correctamente.`;


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