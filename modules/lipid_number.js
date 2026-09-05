import { createModule } from "./module-template.js";


export async function initLipidNumberModule({ webR, log }) {

    const {
        container,
        content
    } = createModule("Lipid Number");


    try {

        // ============================================================
        // Obtener datos desde R
        // ============================================================

        const json =
            await webR.evalRString(
                "get_lipid_number()"
            );


        const lipidNumberData =
            JSON.parse(json);


        log(
            "Lipid number data received from R."
        );


        console.log(
            "Lipid number data:",
            lipidNumberData
        );


        // ============================================================
        // Extraer componentes
        // ============================================================

        const data =
            lipidNumberData.lipid_number;

        const palette =
            lipidNumberData.palette;

        const legendTitle =
            lipidNumberData.legend_title;


        console.log(
            "Lipid number table:",
            data
        );

        console.log(
            "Palette:",
            palette
        );

        console.log(
            "Legend title:",
            legendTitle
        );


        // ============================================================
        // Preparar datos para Plotly
        // ============================================================

        const samples =
            data.map(
                row => row.sample
            );


        const lipidCounts =
            data.map(
                row => row.lipid_number
            );


        const groups =
            data.map(
                row => row.group
            );


        const colors =
            groups.map(
                group => palette[group]
            );


        // ============================================================
        // Crear contenedor del gráfico
        // ============================================================

        const plotContainer =
            document.createElement("div");

        plotContainer.className =
            "plot-container";


        content.appendChild(
            plotContainer
        );


        // ============================================================
        // Datos de Plotly
        // ============================================================

        const trace = {

            type: "bar",

            x: samples,

            y: lipidCounts,

            marker: {
                color: colors
            },

            text: lipidCounts,

            textposition: "auto",

            name: "Lipid number"

        };


        // ============================================================
        // Layout
        // ============================================================

        const layout = {

            title: {
                text: "Lipid Number"
            },

            xaxis: {
                title: {
                    text: "Sample"
                }
            },

            yaxis: {
                title: {
                    text: "Number of lipids"
                }
            },

            showlegend: false

        };


        // ============================================================
        // Configuración de Plotly
        // ============================================================

        const config = {

            responsive: true,

            displayModeBar: true

        };


        // ============================================================
        // Crear gráfico
        // ============================================================

        Plotly.newPlot(
            plotContainer,
            [trace],
            layout,
            config
        );
        
        // ============================================================
// Recalcular tamaño una vez montado el módulo
// ============================================================

requestAnimationFrame(() => {

    Plotly.Plots.resize(
        plotContainer
    );

});


        log(
            "Lipid number plot created."
        );


        return {
            container
        };


    } catch (error) {

        console.error(
            "Error loading lipid number:",
            error
        );


        log(
            `Error loading lipid number: ${error.message}`
        );


        return {
            container
        };

    }
}