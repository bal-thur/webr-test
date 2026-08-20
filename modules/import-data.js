const R_IMPORT_SCRIPT_SOURCE = "./R/import_data.R";
const R_IMPORT_SCRIPT_PATH = "/R/import_data.R";
const R_EXCEL_PATH = "/data/import.xlsx";

function addImportInterface() {
    const container = document.createElement("section");
    const title = document.createElement("h2");
    const input = document.createElement("input");
    const status = document.createElement("pre");

    title.textContent = "Importar datos";
    input.type = "file";
    input.accept = ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    status.textContent = "Selecciona un archivo Excel con el formato definido.";

    container.append(title, input, status);
    document.body.append(container);

    return { input, status };
}

function formatError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.replace(/^Error:\s*/, "");
}

export async function initImportDataModule({ webR, copyFileToWebR, log }) {
    const { input, status } = addImportInterface();
    let rModuleReady = false;

    status.textContent = "Inicializando el módulo R de importación...";

    try {
        await copyFileToWebR(
            webR,
            R_IMPORT_SCRIPT_SOURCE,
            R_IMPORT_SCRIPT_PATH
        );

        await webR.evalRVoid(`source("${R_IMPORT_SCRIPT_PATH}")`);

        rModuleReady = true;
        status.textContent = "Módulo de importación listo. Selecciona un archivo Excel.";
        log("Módulo de importación de datos listo.");
    } catch (error) {
        const message = formatError(error);
        status.textContent = `ERROR al inicializar el módulo R: ${message}`;
        log(`ERROR al inicializar el módulo R de importación: ${message}`);
    }

    input.addEventListener("change", async () => {
        const [file] = input.files;

        if (!file) {
            return;
        }

        if (!file.name.toLowerCase().endsWith(".xlsx")) {
            status.textContent = "ERROR: selecciona un archivo .xlsx.";
            input.value = "";
            return;
        }

        if (!rModuleReady) {
            status.textContent = "ERROR: el módulo R de importación no se pudo inicializar.";
            input.value = "";
            return;
        }

        try {
            status.textContent = `Importando ${file.name}...`;
            const data = new Uint8Array(await file.arrayBuffer());

            await webR.FS.writeFile(R_EXCEL_PATH, data);
            await webR.evalRVoid(`import_analysis_excel("${R_EXCEL_PATH}")`);

            status.textContent = await webR.evalRString("summarise_imported_se()");
            log("Excel importado y objeto se creado.");
        } catch (error) {
            console.error(error);
            status.textContent = `ERROR: ${formatError(error)}`;
            log(`ERROR de importación: ${formatError(error)}`);
        } finally {
            input.value = "";
        }
    });
}
