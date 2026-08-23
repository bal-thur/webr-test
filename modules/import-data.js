// Ruta donde guardaremos temporalmente el Excel

const R_EXCEL_PATH = "/data/import.xlsx";


function addImportInterface() {

    // Crea un contenedor HTML <section> donde vivirá toda la interfaz de importación.
    const container = document.createElement("section");

    // Crea el título que verá el usuario.
    const title = document.createElement("h2");

    // Crea el selector de archivos del navegador.
    const input = document.createElement("input");

    // Crea una zona de texto donde mostraremos  el estado de la importación y posibles errores.
    const status = document.createElement("pre");


    // Texto que aparecerá como título.
    title.textContent = "Importar datos";


    // Convierte el elemento <input> en un selector de archivos.
    input.type = "file";

    // Le indicamos al navegador que esperamos un archivo Excel .xlsx.
    input.accept =
        ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";


    // Mensaje inicial que aparece debajo del selector.
    status.textContent =
        "Selecciona un archivo Excel con el formato definido.";


    // Mete dentro del <section>:
    //
    //   Importar datos
    //   [selector de archivo]
    //   mensaje de estado
    //
    container.append(title, input, status);

    // Añade el <section> al HTML de la aplicación.
    document.body.append(container);


    // Devolvemos estos dos elementos para poder utilizarlos
    // posteriormente desde initImportDataModule().
    return { input, status };
}


function formatError(error) {

    // Si el error es un objeto Error de JavaScript,
    // obtenemos su mensaje.
    //
    // Si no lo es, lo convertimos simplemente a texto.
    const message =
        error instanceof Error ? error.message : String(error);

    // Elimina un posible "Error: " del principio
    // para que el mensaje mostrado sea más limpio.
    return message.replace(/^Error:\s*/, "");
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
export async function initImportDataModule({ webR, log }) {


    // Crea la interfaz HTML y recupera:
    //
    //   input  -> selector de archivo
    //   status -> zona donde mostramos el estado
    const { input, status } = addImportInterface();


    // En este punto el módulo ya está disponible.
    status.textContent =
        "Módulo de importación listo. Selecciona un archivo Excel.";

    log("Módulo de importación de datos listo.");


    /*
     * Aquí empieza la parte importante.
     *
     * addEventListener("change", ...)
     *
     * significa:
     *
     * "Cuando el usuario cambie el archivo seleccionado,
     * ejecuta esta función".
     */
    input.addEventListener("change", async () => {


        // input.files contiene los archivos seleccionados.
        //
        // Nosotros esperamos solamente uno.
        //
        // [file] extrae el primer archivo.
        const [file] = input.files;


        // Si por algún motivo no hay archivo,
        // no hacemos nada.
        if (!file) {
            return;
        }


        // Comprobamos que el archivo tenga extensión .xlsx.
        // Esto es solamente una primera comprobación realizada por JavaScript.
        //
        // La validación REAL de la estructura del Excel la hará posteriormente R.
        if (!file.name.toLowerCase().endsWith(".xlsx")) {

            status.textContent =
                "ERROR: selecciona un archivo .xlsx.";

            // Vacía el selector.
            input.value = "";

            return;
        }


        /*
         * A partir de aquí empieza el proceso de importación.
         *
         * try/catch permite capturar errores de:
         *
         *   - JavaScript
         *   - WebR
         *   - R
         *   - lectura/escritura del archivo
         */
        try {


            // Informa al usuario de que el archivo se está procesando.
            status.textContent =
                `Importando ${file.name}...`;


            /*
             * file.arrayBuffer()
             *
             * Lee el archivo seleccionado por el navegador
             * como una secuencia de bytes.
             *
             * Esto todavía NO es un archivo dentro de R.
             */
            const data =
                new Uint8Array(await file.arrayBuffer());


            /*
             * Aquí ocurre el puente:
             *
             * navegador
             *      ↓
             * bytes
             *      ↓
             * filesystem virtual de WebR
             *
             * El archivo termina siendo:
             *
             * /data/import.xlsx
             *
             * dentro de WebR.
             */
            await webR.FS.writeFile(
                R_EXCEL_PATH,
                data
            );


            /*
             * Ahora JavaScript le pide a R que ejecute
             * una función que ya debería existir en la sesión R.
             *
             * IMPORTANTE:
             *
             * JavaScript NO está leyendo el Excel.
             *
             * JavaScript solamente lo ha colocado en:
             *
             * /data/import.xlsx
             *
             * La lectura y validación del Excel la hace R.
             */
            await webR.evalRVoid(
                `import_analysis_excel("${R_EXCEL_PATH}")`
            );


            /*
             * La función anterior crea el objeto "se".
             *
             * Después pedimos a R un resumen del objeto.
             *
             * evalRString() significa que esperamos que R
             * devuelva un texto.
             */
            status.textContent =
                await webR.evalRString(
                    "summarise_imported_se()"
                );


            // Mensaje en la salida general de app.js.
            log(
                "Excel importado y objeto se creado."
            );
            
            
            
            
            // 3. Crear y guardar las paletas
            // ----------------------------------------------------------
            
            status.textContent =
            "Creando paletas...";
            
            await webR.evalRVoid(
              "create_and_store_palettes()"
              );


        } catch (error) {


            // También dejamos el error en la consola de desarrollo del navegador.
            console.error(error);


            // Convertimos el error a un mensaje legible.
            const message =
                formatError(error);


            // Mostramos el error en el módulo.
            status.textContent =
                `ERROR: ${message}`;


            // Y también en la salida general de app.js.
            log(
                `ERROR de importación: ${message}`
            );


        } finally {


            // Después de terminar, vaciamos el selector.
            //
            // Esto permite volver a seleccionar el mismo archivo posteriormente si fuera necesario.
            input.value = "";
        }
    });
}