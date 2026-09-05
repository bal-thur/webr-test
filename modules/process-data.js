// ============================================================
// MÓDULO DE PROCESAMIENTO DE DATOS
// ============================================================

import { createModule } from "./module-template.js";


// ============================================================
// Comprobar que queda al menos una muestra
// ============================================================

function validateRemainingSamples({
    options,
    controls
}) {

    const removeGroups =
        controls.groups.getValue(true);

    const removeSubgroups =
        controls.subgroups.getValue(true);

    const removeSamples =
        controls.samples.getValue(true);


    const remainingSamples =
        getRemainingSamples({
            samples: options.samples,
            removeGroups,
            removeSubgroups,
            removeSamples
        });


    if (remainingSamples.length === 0) {

        return {
            valid: false,
            message: "No samples remain after filtering.",
            remainingSamples: []
        };
    }


    return {
        valid: true,
        message: null,
        remainingSamples
    };
}


// ============================================================
// Comprobar cuántas muestras quedan después de aplicar filtros
// ============================================================

function getRemainingSamples({
    samples,
    removeGroups,
    removeSubgroups,
    removeSamples
}) {

    return samples.filter(sample => {

        // Eliminar si pertenece a un grupo seleccionado
        if (removeGroups.includes(sample.group)) {
            return false;
        }


        // Eliminar si pertenece a un subgrupo seleccionado
        if (
            sample.subgroup !== null &&
            removeSubgroups.includes(sample.subgroup)
        ) {
            return false;
        }


        // Eliminar si la muestra está seleccionada directamente
        if (removeSamples.includes(sample.sample)) {
            return false;
        }


        return true;
    });
}


// ============================================================
// Crear un selector HTML normal
// ============================================================

function createSelectControl({
    labelText,
    id
}) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "process-control";


    const label =
        document.createElement("label");

    label.htmlFor =
        id;

    label.textContent =
        labelText;


    const select =
        document.createElement("select");

    select.id =
        id;


    wrapper.append(
        label,
        select
    );


    return {
        wrapper,
        select
    };
}


// ============================================================
// Crear un filtro de selección múltiple con Choices.js
// ============================================================

function createMultiSelectControl({
    labelText,
    id,
    placeholder
}) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "process-control";


    const label =
        document.createElement("label");

    label.htmlFor =
        id;

    label.textContent =
        labelText;


    const select =
        document.createElement("select");

    select.id =
        id;

    select.multiple =
        true;


    wrapper.append(
        label,
        select
    );


    const choices =
        new Choices(
            select,
            {
                removeItemButton: true,
                searchEnabled: true,
                shouldSort: false,
                addChoices: false,
                allowHTML: false,
                placeholder: true,
                placeholderValue: placeholder,
                searchPlaceholderValue: "Search..."
            }
        );


    return {
        wrapper,
        select,
        choices
    };
}


// ============================================================
// Rellenar un selector normal
// ============================================================

function populateSelect(
    select,
    options
) {

    select.replaceChildren();


    for (const option of options) {

        const element =
            document.createElement("option");

        element.value =
            option.value;

        element.textContent =
            option.label;

        select.appendChild(
            element
        );
    }
}


// ============================================================
// Rellenar un selector Choices
// ============================================================

function populateMultiSelect(
    choices,
    options
) {

    choices.clearChoices();


    choices.setChoices(
        options.map(option => ({
            value: option.value,
            label: option.label
        })),
        "value",
        "label",
        true
    );
}


function getProcessingParameters(
    controls
) {

    return {

        remove_groups:
            controls.groups.getValue(true),

        remove_subgroups:
            controls.subgroups.getValue(true),

        remove_samples:
            controls.samples.getValue(true),

        remove_features:
            controls.featureFilter.value,

        imputation:
            controls.imputation.value,

        normalization:
            controls.normalization.value,

        transform:
            controls.transform.value
    };
}


// ============================================================
// Cambiar los valores vacíos por NULL
// ============================================================

function emptyArrayToNull(
    value
) {

    if (
        Array.isArray(value) &&
        value.length === 0
    ) {
        return null;
    }


    return value;
}


// ============================================================
// Obtener opciones de procesamiento desde R
// ============================================================

async function getProcessingOptions(
    webR
) {

    const json =
        await webR.evalRString(
            "get_processing_options_json(se)"
        );


    try {

        return JSON.parse(
            json
        );

    } catch (error) {

        throw new Error(
            "R devolvió un JSON de opciones de procesamiento no válido."
        );
    }
}


// ============================================================
// Ejecutar procesamiento y obtener resumen
// ============================================================

async function runProcessing(
    webR,
    parameters
) {

    const runProcessSE =
        await webR.evalR(
            "run_process_se"
        );


    // Ejecutar process_se() en R

    await runProcessSE(
        emptyArrayToNull(
            parameters.remove_groups
        ),

        emptyArrayToNull(
            parameters.remove_subgroups
        ),

        emptyArrayToNull(
            parameters.remove_samples
        ),

        parameters.remove_features,

        parameters.imputation,

        parameters.normalization,

        parameters.transform
    );


    // Obtener resumen de processed_se

    const summary =
        await webR.evalRString(
            "summarise_processed_se()"
        );


    return summary;
}


// ============================================================
// Crear interfaz de procesamiento
// ============================================================

function addProcessInterface() {

    const {
        container,
        content
    } = createModule(
        "Process data"
    );


    // --------------------------------------------------------
    // Descripción
    // --------------------------------------------------------

    const description =
        document.createElement("p");

    description.textContent =
        "Configure data filtering and processing options.";


    content.appendChild(
        description
    );


    // --------------------------------------------------------
    // Selectores de procesamiento
    // --------------------------------------------------------

    const featureFilter =
        createSelectControl({
            labelText: "Feature filtering",
            id: "process-feature-filter"
        });


    const imputation =
        createSelectControl({
            labelText: "Imputation",
            id: "process-imputation"
        });


    const normalization =
        createSelectControl({
            labelText: "Normalization",
            id: "process-normalization"
        });


    const transform =
        createSelectControl({
            labelText: "Transformation",
            id: "process-transform"
        });


    // --------------------------------------------------------
    // Filtros multiselección
    // --------------------------------------------------------

    const groups =
        createMultiSelectControl({
            labelText: "Remove groups",
            id: "process-remove-groups",
            placeholder: "Select groups to remove..."
        });


    const subgroups =
        createMultiSelectControl({
            labelText: "Remove subgroups",
            id: "process-remove-subgroups",
            placeholder: "Select subgroups to remove..."
        });


    const samples =
        createMultiSelectControl({
            labelText: "Remove samples",
            id: "process-remove-samples",
            placeholder: "Select samples to remove..."
        });


    // --------------------------------------------------------
    // Botón de procesamiento
    // --------------------------------------------------------

    const processButton =
        document.createElement("button");

    processButton.type =
        "button";

    processButton.id =
        "process-data-button";

    processButton.textContent =
        "Process";


    // --------------------------------------------------------
    // Añadir controles
    // --------------------------------------------------------

    content.append(

        featureFilter.wrapper,
        imputation.wrapper,
        normalization.wrapper,
        transform.wrapper,

        groups.wrapper,
        subgroups.wrapper,
        samples.wrapper,

        processButton
    );


    return {

        container,

        featureFilter:
            featureFilter.select,

        imputation:
            imputation.select,

        normalization:
            normalization.select,

        transform:
            transform.select,

        groups:
            groups.choices,

        subgroups:
            subgroups.choices,

        samples:
            samples.choices,

        processButton
    };
}


// ============================================================
// Inicializar módulo de procesamiento
// ============================================================

export async function initProcessDataModule({
    webR,
    log,
    onProcessCompleted
}) {

    log(
        "Inicializando módulo de procesamiento..."
    );


    // --------------------------------------------------------
    // Crear interfaz
    // --------------------------------------------------------

    const controls =
        addProcessInterface();


    // --------------------------------------------------------
    // Obtener opciones desde R
    // --------------------------------------------------------

    let options;


    try {

        options =
            await getProcessingOptions(
                webR
            );

    } catch (error) {

        console.error(
            error
        );

        throw new Error(
            `No se pudieron obtener las opciones de procesamiento: ${error.message}`
        );
    }


    // --------------------------------------------------------
    // Rellenar selectores
    // --------------------------------------------------------

    populateSelect(
        controls.featureFilter,
        options.remove_features
    );


    populateSelect(
        controls.imputation,
        options.imputation
    );


    populateSelect(
        controls.normalization,
        options.normalization
    );


    populateSelect(
        controls.transform,
        options.transform
    );


    // --------------------------------------------------------
    // Rellenar filtros multiselección
    // --------------------------------------------------------

    populateMultiSelect(
        controls.groups,
        options.groups.map(group => ({
            value: group,
            label: group
        }))
    );


    populateMultiSelect(
        controls.subgroups,
        options.subgroups.map(subgroup => ({
            value: subgroup,
            label: subgroup
        }))
    );


    populateMultiSelect(
        controls.samples,
        options.samples.map(sample => ({
            value: sample.sample,
            label: sample.sample
        }))
    );


    // ============================================================
    // Botón Process
    // ============================================================

    controls.processButton.addEventListener(
        "click",
        async () => {

            // ----------------------------------------------------
            // 1. Comprobar que queda al menos una muestra
            // ----------------------------------------------------

            const validation =
                validateRemainingSamples({
                    options,
                    controls
                });


            if (!validation.valid) {

                log(
                    validation.message
                );

                alert(
                    validation.message
                );

                return;
            }


            // ----------------------------------------------------
            // 2. Obtener parámetros seleccionados
            // ----------------------------------------------------

            const parameters =
                getProcessingParameters(
                    controls
                );


            console.log(
                "Processing parameters:",
                parameters
            );


            console.log(
                "Remaining samples:",
                validation.remainingSamples
            );


            // ----------------------------------------------------
            // 3. Ejecutar procesamiento
            // ----------------------------------------------------

            try {

                log(
                    `Processing data with ${validation.remainingSamples.length} remaining samples...`
                );


                // Evitar que el usuario pulse Process
                // mientras R está procesando los datos.

                controls.processButton.disabled =
                    true;

                
                // ------------------------------------------------
                // Ejecutar process_se() y obtener resumen
                // ------------------------------------------------

                const summary =
                    await runProcessing(
                        webR,
                        parameters
                    );


               // ====================================================
              // Preparar processed abundance table
              // ====================================================



                await webR.evalRVoid(
                    "prepare_processed_abundance()"
                );


                log(
                    "Executed: Processed abundance"
                );

                
                
                
                // ------------------------------------------------
                // Procesamiento completado correctamente
                // ------------------------------------------------

                log(
                    "Data processing completed."
                );


                console.log(
                    "Processed SE:",
                    summary
                );


                // Resolver la Promise.

                if (onProcessCompleted) {

                    onProcessCompleted(
                        summary
                    );
                }


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
                    `ERROR during data processing: ${message}`
                );


            } finally {

                // ------------------------------------------------
                // Volver a activar el botón
                // ------------------------------------------------

                controls.processButton.disabled =
                    false;
            }
        }
    );


    log(
        "Módulo de procesamiento listo."
    );


    return {
        ...controls
    };
}