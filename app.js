import { WebR, ChannelType } from "./webr.mjs";

// Modulo de importación de datos
import { initImportDataModule } from "./modules/import-data.js";
// Modulo de raw-abundance
import { initRawAbundanceModule } from "./modules/raw-abundance.js";
// Modulo de se statistics
import { initSeStatisticsModule } from "./modules/se_statistics.js";
// Modulo de lipid metadata
import { initLipidMetadataModule } from "./modules/lipid_metadata.js";
// Modulo de lipid number
import { initLipidNumberModule } from "./modules/lipid_number.js";
// Modulo de lipid total abundance
import { initTotalAbundanceModule } from "./modules/lipid_total_abundance.js";


// Modulo de procesamiento de datos
import { initProcessDataModule } from "./modules/process-data.js";
// Modulo de processed-abundance
import { initProcessedAbundanceModule } from "./modules/processed-abundance.js";


// Modulo de análisis de datos
import { initDataAnalysisModule } from "./modules/data-analysis.js";


const output = document.getElementById("output");


// ============================================================
// Definición de módulos de la aplicación
// ============================================================

const MODULES = {
    
    importData: {
    label: "Import data"
},


dataOverview: {
    label: "Data overview",
    children: {
      
        StudyInformation: {
            label: "Study information",
            module: "StudyInformation"
        },
      
        studyDesign: {
            label: "Study design",
            module: "studyDesign"
        },
        
        
       rawAbundance: {
            label: "Abundance",
            module: "rawAbundance"
        },
        
        totalAbundance: {
            label: "Lipid total abundance",
            module: "totalAbundance"
        },
        
        lipidNumber: {
            label: "Lipid number",
            module: "lipidNumber"
        },
        
        
        statistics: {
            label: "Statistics",
            module: "statistics"
        },
        
        
        
        lipidMetadata: {
                label: "Lipid metadata",
                module: "lipidMetadata"
        },
        
    }
},
    

processing: {
    label: "Process data"
},

    dataQuality: {
        label: "Data quality",
        children: {
            processedAbundance: {
                label: "Processed abundance",
                module: "processedAbundance"
            },
            
            abundanceDistribution: {
                label: "Abundance distribution",
                module: "abundanceDistribution"
            },
            
            boxplot: {
                label: "Boxplot",
                module: "boxplot"
            }
        }
    },

dataAnalysis: {
    label: "Analyse data"
},


    profiling: {
        label: "Profiling",
        children: {

            classDistribution: {
                label: "Class distribution",
                module: "classDistribution"
            }
        }
    },

    dimensionalReduction: {
        label: "Dimensional reduction",
        children: {
            pca: {
                label: "PCA",
                module: "pcaPlot"
            },
            pcaExplainedVariance: {
                label: "PCA explained variance",
                module: "pcaAdditional"
            },
            plsda: {
                label: "PLS-DA",
                module: "plsda"
            }
        }
    },

    hierarchicalClustering: {
        label: "Hierarchical clustering",
        children: {
            heatmap: {
                label: "Heatmap + clustering",
                module: "heatmap"
            }
        }
    },

    differentialAbundance: {
        label: "Differential abundance",
        children: {
            volcanoPlot: {
                label: "Volcano plot",
                module: "volcanoPlot"
            },
            differentialBoxplot: {
                label: "Boxplot",
                module: "differentialBoxplot"
            },
            lipidCharacteristics: {
                label: "Lipid characteristics",
                module: "lipidCharacteristics"
            },
            characteristicAssociations: {
                label: "Characteristic associations",
                module: "characteristicAssociations"
            },
            characteristicsByClass: {
                label: "Characteristics by class",
                module: "characteristicsByClass"
            }
        }
    },

    enrichment: {
        label: "Enrichment",
        children: {
            overRepresentation: {
                label: "Over-representation analysis",
                module: "overRepresentation"
            }
        }
    },

    networking: {
        label: "Networking",
        children: {
            activityNetwork: {
                label: "Activity network",
                module: "activityNetwork"
            }
        }
    }
};

// ============================================================
// Etapas de disponibilidad de los módulos
// ============================================================

const MODULE_STAGES = {

    1: [
        "dataOverview",
        "processing"
    ],

    2: [
        "dataQuality",
        "dataAnalysis"
    ],

    3: [
        "profiling",
        "dimensionalReduction",
        "hierarchicalClustering",
        "differentialAbundance",
        "enrichment",
        "networking"
    ]
};


// ============================================================
// Comprobar disponibilidad de un módulo
// ============================================================

function isModuleEnabled(moduleId) {

    // Import data siempre está disponible.
    if (moduleId === "importData") {

        return true;
    }


    // Etapa 1
    if (MODULE_STAGES[1].includes(moduleId)) {

        return hasImportedData;
    }


    // Etapa 2
    if (MODULE_STAGES[2].includes(moduleId)) {

        return hasProcessedData;
    }


    // Etapa 3
    if (MODULE_STAGES[3].includes(moduleId)) {

        return hasAnalyzedData;
    }


    // Si el módulo no pertenece a ninguna etapa,
    // permanece bloqueado.
    return false;
}


// ============================================================
// Estado de la aplicación
// ============================================================
let hasImportedData = false;
let hasProcessedData = false;
let hasAnalyzedData = false;

let importModule = null;
let processModule = null;
let analysisModule = null;

function log(message) {
    output.textContent += "\n" + message;
}



// ============================================================
// Construir navegación
// ============================================================

function buildNavigation({
    webR,
    log
}) {

    const navigation =
        document.getElementById("module-navigation");


    navigation.replaceChildren();


    // --------------------------------------------------------
    // Recorrer módulos principales
    // --------------------------------------------------------

    Object.entries(MODULES).forEach(
        ([moduleId, module]) => {

            const group =
                document.createElement("div");


            group.className =
                "nav-group";


            const button =
                document.createElement("button");


            button.className =
                "nav-item";


            button.type =
                "button";


            button.dataset.module =
                moduleId;


            const hasChildren =
                Boolean(module.children);


            button.setAttribute(
                "aria-expanded",
                "false"
            );


            // ------------------------------------------------
            // Contenido del botón principal
            // ------------------------------------------------

            button.innerHTML = `
                <span class="nav-label">
                    ${module.label}
                </span>

                ${
                    hasChildren
                        ? '<span class="nav-chevron" aria-hidden="true">▸</span>'
                        : ""
                }
            `;


// =================================================
// Determinar disponibilidad
// =================================================

const enabled =
    isModuleEnabled(moduleId);


            button.disabled =
                !enabled;


            // =================================================
            // MÓDULO CON HIJOS
            // =================================================

            if (hasChildren) {

                const children =
                    document.createElement("div");


                children.className =
                    "nav-children";


                children.hidden =
                    true;


                Object.entries(
                    module.children
                ).forEach(
                    ([, child]) => {

                        const childButton =
                            document.createElement("button");


                        childButton.className =
                            "nav-subitem";


                        childButton.type =
                            "button";


                        childButton.dataset.module =
                            child.module;


                        childButton.textContent =
                            child.label;


                        // ------------------------------------
                        // Estado del hijo
                        // ------------------------------------

                       childButton.disabled =!enabled;

                        // ------------------------------------
                        // Abrir módulo hijo
                        // ------------------------------------

                        childButton.addEventListener(
                            "click",
                            async event => {

                                event.stopPropagation();


                                try {

                                    await openModule(
                                        child.module,
                                        {
                                            webR,
                                            log
                                        }
                                    );

                                } catch (error) {

                                    console.error(error);

                                    log(
                                        `ERROR loading module ${child.module}: ${error}`
                                    );
                                }
                            }
                        );


                        children.appendChild(
                            childButton
                        );
                    }
                );


                // --------------------------------------------
                // Click sobre categoría
                // --------------------------------------------

                button.addEventListener(
                    "click",
                    async () => {

                        // Una categoría bloqueada
                        // no puede expandirse.

                        if (button.disabled) {

                            return;
                        }


                        const isOpen =
                            !children.hidden;


                        // ------------------------------------
                        // Cerrar otros grupos
                        // ------------------------------------

                        navigation
                            .querySelectorAll(
                                ".nav-children"
                            )
                            .forEach(
                                other => {

                                    other.hidden =
                                        true;
                                }
                            );


                        navigation
                            .querySelectorAll(
                                ".nav-item[data-module]"
                            )
                            .forEach(
                                other => {

                                    other.setAttribute(
                                        "aria-expanded",
                                        "false"
                                    );


                                    other.classList.remove(
                                        "expanded"
                                    );
                                }
                            );


                        // ------------------------------------
                        // Abrir grupo seleccionado
                        // ------------------------------------

                        if (!isOpen) {

                            children.hidden =
                                false;


                            button.setAttribute(
                                "aria-expanded",
                                "true"
                            );


                            button.classList.add(
                                "expanded"
                            );


                            // --------------------------------
                            // Abrir primer hijo
                            // --------------------------------

                            const firstChild =
                                Object.values(
                                    module.children
                                )[0];


                            if (firstChild) {

                                try {

                                    await openModule(
                                        firstChild.module,
                                        {
                                            webR,
                                            log
                                        }
                                    );

                                } catch (error) {

                                    console.error(error);

                                    log(
                                        `ERROR loading module ${firstChild.module}: ${error}`
                                    );
                                }
                            }
                        }
                    }
                );


                group.appendChild(
                    button
                );


                group.appendChild(
                    children
                );

            }


            // =================================================
            // MÓDULO SIN HIJOS
            // =================================================

            else {

                button.addEventListener(
                    "click",
                    async () => {

                        try {

                            await openModule(
                                moduleId,
                                {
                                    webR,
                                    log
                                }
                            );

                        } catch (error) {

                            console.error(error);

                            log(
                                `ERROR loading module ${moduleId}: ${error}`
                            );
                        }
                    }
                );


                group.appendChild(
                    button
                );
            }


            navigation.appendChild(
                group
            );
        }
    );
}

// ============================================================
// Abrir módulo
// ============================================================

let navigationRequestId = 0;

async function openModule(
    moduleId,
    context
) {

    const navigation =
        document.getElementById("module-navigation");


    const buttons =
        navigation.querySelectorAll(
            ".nav-item,.nav-subitem"
        );


    // --------------------------------------------------------
    // Identificador de navegación
    // --------------------------------------------------------

    const currentRequestId =
        ++navigationRequestId;


    // --------------------------------------------------------
    // Módulo activo
    // --------------------------------------------------------

    buttons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.module === moduleId
        );
    });


    // --------------------------------------------------------
    // Contenedor principal de módulos
    // --------------------------------------------------------

    const moduleContainer =
        document.getElementById("module-container");


    moduleContainer.replaceChildren();


    // --------------------------------------------------------
    // Mensaje de carga
    // --------------------------------------------------------

    const loading =
        document.createElement("p");

    loading.textContent =
        `Loading ...`;

    moduleContainer.appendChild(
        loading
    );


    // --------------------------------------------------------
    // Import data
    // --------------------------------------------------------

    if (moduleId === "importData") {

        if (!importModule) {

            importModule =
                await initImportDataModule({
                    ...context,

                    onImportCompleted: () => {

                        hasImportedData = true;

                        hasProcessedData = false;

                        processModule = null;

                        hasAnalyzedData = false;

                        analysisModule = null;

                        buildNavigation(
                            context
                        );


                        log(
                            "Import data state updated."
                        );
                    }
                });


            if (
                currentRequestId !==
                navigationRequestId
            ) {
                return;
            }


            moduleContainer.replaceChildren();

            moduleContainer.appendChild(
                importModule.container
            );

        } else {

            moduleContainer.replaceChildren();

            moduleContainer.appendChild(
                importModule.container
            );
        }


        return importModule;
    }


    // --------------------------------------------------------
    // Módulo: Raw abundance
    // --------------------------------------------------------

    if (moduleId === "rawAbundance") {

        const rawAbundanceModule =
            await initRawAbundanceModule(
                context
            );


        if (
            currentRequestId !==
            navigationRequestId
        ) {
            return;
        }


        moduleContainer.replaceChildren();

        moduleContainer.appendChild(
            rawAbundanceModule.container
        );


        return rawAbundanceModule;
    }

    // --------------------------------------------------------
    // Módulo: se statistics
    // --------------------------------------------------------

    if (moduleId === "statistics") {

        const seStatisticsModule =
            await initSeStatisticsModule(
                context
            );


        if (
            currentRequestId !==
            navigationRequestId
        ) {
            return;
        }


        moduleContainer.replaceChildren();

        moduleContainer.appendChild(
            seStatisticsModule.container
        );


        return seStatisticsModule;
    }


    // --------------------------------------------------------
    // Módulo: Lipid metadata
    // --------------------------------------------------------

    if (moduleId === "lipidMetadata") {

        const lipidMetadataModule =
            await initLipidMetadataModule(
                context
            );


        if (
            currentRequestId !==
            navigationRequestId
        ) {
            return;
        }


        moduleContainer.replaceChildren();

        moduleContainer.appendChild(
            lipidMetadataModule.container
        );


        return lipidMetadataModule;
    }


    // --------------------------------------------------------
    // Módulo: Lipid number
    // --------------------------------------------------------

    if (moduleId === "lipidNumber") {

        const lipidNumberModule =
            await initLipidNumberModule(
                context
            );


        if (
            currentRequestId !==
            navigationRequestId
        ) {
            return;
        }


        moduleContainer.replaceChildren();

        moduleContainer.appendChild(
            lipidNumberModule.container
        );


        return lipidNumberModule;
    }

     // --------------------------------------------------------
    // Módulo: Lipid total abundance
    // --------------------------------------------------------

    if (moduleId === "totalAbundance") {

        const totalAbundanceModule =
            await initTotalAbundanceModule(
                context
            );


        if (
            currentRequestId !==
            navigationRequestId
        ) {
            return;
        }


        moduleContainer.replaceChildren();

        moduleContainer.appendChild(
            totalAbundanceModule.container
        );


        return totalAbundanceModule;
    }

 
 
    
    
    // --------------------------------------------------------
    // Data processing
    // --------------------------------------------------------

    if (moduleId === "processing") {

        if (!hasImportedData) {

            moduleContainer.replaceChildren();

            return;
        }


        if (!processModule) {

            processModule =
                await initProcessDataModule({

                    ...context,

                    onProcessCompleted: () => {

                        hasProcessedData = true;

                        hasAnalyzedData = false;

                        analysisModule = null;


                        buildNavigation(
                            context
                        );


                        log(
                            "Data processing state updated."
                        );
                    }
                });


            if (
                currentRequestId !==
                navigationRequestId
            ) {
                return;
            }


            moduleContainer.replaceChildren();

            moduleContainer.appendChild(
                processModule.container
            );

        } else {

            moduleContainer.replaceChildren();

            moduleContainer.appendChild(
                processModule.container
            );
        }


        return processModule;
    }


    // --------------------------------------------------------
    // Módulo: Processed abundance
    // --------------------------------------------------------

    if (moduleId === "processedAbundance") {

        const processedAbundanceModule =
            await initProcessedAbundanceModule(
                context
            );


        if (
            currentRequestId !==
            navigationRequestId
        ) {
            return;
        }


        moduleContainer.replaceChildren();

        moduleContainer.appendChild(
            processedAbundanceModule.container
        );


        return processedAbundanceModule;
    }




    // --------------------------------------------------------
    // Data analysis
    // --------------------------------------------------------

    if (moduleId === "dataAnalysis") {

        if (!hasProcessedData) {

            moduleContainer.replaceChildren();

            return;
        }


        if (!analysisModule) {

            analysisModule =
                await initDataAnalysisModule(
                    context
                );


            if (
                currentRequestId !==
                navigationRequestId
            ) {
                return;
            }


            moduleContainer.replaceChildren();

            moduleContainer.appendChild(
                analysisModule.container
            );


            analysisModule.analysisCompleted.then(
                () => {

                    hasAnalyzedData = true;

                    analysisModule = null;


                    buildNavigation(
                        context
                    );


                    log(
                        "Data analysis state updated."
                    );
                }
            );

        } else {

            moduleContainer.replaceChildren();

            moduleContainer.appendChild(
                analysisModule.container
            );
        }


        return analysisModule;
    }
}



// ============================================================
// Funcion. Crear directorios de forma compatible con nuestra versión
// de WebR


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
// Funcion. Copiar un archivo del proyecto al filesystem de WebR
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

// == Constuir menu de navegación
 
    
    
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


log("Creando directorios...");

    // ========================================================
    // Crear estructura de directorios
    // ========================================================

    await createDirectory(webR, "/R");
    await createDirectory(webR, "/data");

    // ========================================================
    // Cargar scripts
    // ========================================================

log("Cargando scripts...");

// Etapa 1 

    await copyFileToWebR(webR,"./R/setup.R","/R/setup.R");
    await copyFileToWebR(webR,"./R/import_data.R","/R/import_data.R");
    await copyFileToWebR(webR,"./R/rawAbundance.R","/R/rawAbundance.R");
    await copyFileToWebR(webR,"./R/se_statistics.R","/R/se_statistics.R");
    await copyFileToWebR(webR,"./R/lipid_metadata.R","/R/lipid_metadata.R");
    await copyFileToWebR(webR,"./R/lipid_number.R","/R/lipid_number.R")
    await copyFileToWebR(webR,"./R/lipid_total_abundance.R","/R/lipid_total_abundance.R")

// Etapa 2

    await copyFileToWebR(webR,"./R/get_process_options.R","/R/get_process_options.R");
    await copyFileToWebR(webR,"./R/process_se.R","/R/process_se.R");
    await copyFileToWebR(webR,"./R/processedAbundance.R","/R/processedAbundance.R");
    
// Etapa 3    
    
    
    // ========================================================
    // Cargar archivos
    // =======================================================

log("Cargando archivos...");
    
    await copyFileToWebR(webR,"./data/lipid_data.csv","/data/lipid_data.csv");
    await copyFileToWebR(webR,"./data/palette.csv","/data/palette.csv");
    await copyFileToWebR(webR,"./data/process_parameters.csv","/data/process_parameters.csv");

// ========================================================
// Ejecutar setup.R
// ========================================================

log("Ejecutando setup.R...");

await webR.evalRVoid(
    `source("/R/setup.R")`
);

log("setup.R ejecutado.");


// ========================================================
// Comprobar que el entorno R está preparado
// ========================================================

const setupOK =
    await webR.evalRBoolean("exists('setup_ok') && isTRUE(setup_ok)");


// ========================================================
// Si setup.R no terminó correctamente,
// no inicializamos los módulos de la aplicación.
// ========================================================

if (!setupOK) {

    throw new Error(
        "El entorno R no está preparado. " +
        "No se pueden iniciar los módulos de análisis."
    );
}


// ========================================================
// R preparado correctamente
// ========================================================

log("Entorno R preparado correctamente.");


// ========================================================
// Inicializar módulo de importación
// ========================================================

    buildNavigation({
        webR,
        log
    });


// ========================================================
// Aplicación lista
 // ========================================================

    const appLoading =
        document.getElementById("app-loading");

    appLoading.hidden = true;
    
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
