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
    lipidNumberData.data;

const levels =
    lipidNumberData.levels;

const title =
    lipidNumberData.title;

const titleXaxis =
    lipidNumberData.title_xaxis;

const titleYaxis =
    lipidNumberData.title_yaxis;

const legendTitle =
    lipidNumberData.legend_title;

const caption =
    lipidNumberData.caption;


console.log(
    "Lipid number data:",
    data
);

console.log(
    "Lipid number levels:",
    levels
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

const traces =
    levels.map(
        level => {

            const levelData =
                data.filter(
                    row => row.group === level
                );

            return {

                type: "bar",

                x: levelData.map(
                    row => row.sample
                ),

                y: levelData.map(
                    row => row.lipid_number
                ),

                marker: {
                    color: levelData[0]?.color
                },

                // text: levelData.map(
                //     row => row.lipid_number
                // ),

                textposition: "auto",

                hovertemplate: levelData.map(
                    row => row.hover_text
                ),

                name: level

            };
        }
    );

 // ============================================================
// Layout
// ============================================================

const layout = {

    plot_bgcolor: "white",

    paper_bgcolor: "white",

    title: {
        text: title,
        font: {
            family: "Arial",
            size: 18
        }
    },

    margin: {
        t: 30,
        r: 20,
        b: 100,
        l: 80
    },

    annotations: [
        {
            text: caption,
            x: 0,
            y: -0.25,
            xref: "paper",
            yref: "paper",
            showarrow: false,
            xanchor: "left",
            font: {
                family: "Arial",
                size: 11,
                color: "gray"
            }
        }
    ],

    xaxis: {
        title: {
            text: titleXaxis,
            font: {
                family: "Arial",
                size: 14
            }
        },
        showline: true,
        showgrid: false,
        zeroline: false,
        ticklen: 1,
        linewidth: 1
    },

    yaxis: {
        title: {
            text: titleYaxis,
            font: {
                family: "Arial",
                size: 14
            }
        },
        showline: true,
        zeroline: false,
        showgrid: false,
        ticklen: 1,
        linewidth: 1,
        rangemode: "nonnegative"
    },

    legend: {
        title: {
            text: legendTitle,
            font: {
                family: "Arial",
                size: 14
            }
        },
        font: {
            family: "Arial",
            size: 12
        }
    }
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
            traces,
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