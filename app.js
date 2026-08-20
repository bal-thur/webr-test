import { WebR, ChannelType } from "./webr.mjs";
import { initImportDataModule } from "./modules/import-data.js";

const output = document.getElementById("output");

function log(message) {
    output.textContent += "\n" + message;
}


// ============================================================
// Crear directorios de forma compatible con nuestra versión
// de WebR
// ============================================================

async function createDirectory(webR, path) {

    try {
        await webR.FS.mkdir(path);
        log("Directorio creado: " + path);
    } catch (error) {

        // Si ya existe, no es un problema.
        // Para cualquier otro error, lo propagamos.
        if (!String(error).toLowerCase().includes("exist")) {
            throw error;
        }
    }
}


// ============================================================
// Copiar un archivo del proyecto al filesystem de WebR
// ============================================================

async function copyFileToWebR(webR, source, destination) {

    const response = await fetch(source);

    if (!response.ok) {
        throw new Error(
            `No se pudo cargar ${source}: HTTP ${response.status}`
        );
    }

    const data = new Uint8Array(
        await response.arrayBuffer()
    );

    await webR.FS.writeFile(
        destination,
        data
    );

    log(
        `Archivo cargado: ${source} → ${destination} ` +
        `(${data.length} bytes)`
    );
}


// ============================================================
// Iniciar WebR
// ============================================================

async function main() {

    log("Starting WebR...");
    log("Initializing WebR...");

    const baseUrl = new URL("./", import.meta.url).href;

    log("WebR base URL: " + baseUrl);

    const webR = new WebR({
        baseUrl: baseUrl,
        channelType: ChannelType.PostMessage
    });

    await webR.init();

    log("WebR initialized.");
    log("R is running in the browser.");


    // ========================================================
    // Crear estructura de directorios
    // ========================================================

    await createDirectory(webR, "/R");
    await createDirectory(webR, "/data");

    // ========================================================
    // Cargar setup.R
    // ========================================================

    await copyFileToWebR(
        webR,
        "./R/setup.R",
        "/R/setup.R"
    );


    // ========================================================
    // Ejecutar setup.R
    // ========================================================

    await webR.evalRVoid(`source("/R/setup.R")`);

    log("setup.R executed.");

    await initImportDataModule({
        webR,
        copyFileToWebR,
        log
    });
}


// ============================================================
// Errores
// ============================================================

main().catch(error => {

    console.error(error);

    log("");
    log("ERROR:");
    log(String(error));
});
