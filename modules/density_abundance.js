
import { createModule } from "./module-template.js";


export async function initAbundanceDensityModule({ webR, log }) {

    const {
        container,
        content
    } = createModule("Density plot of abundance");


    try {

        // ============================================================
        // Obtener datos desde R
        // ============================================================

        const json =
            await webR.evalRString(
                "get_abundance_density()"
            );


        const abundanceDensityData =
            JSON.parse(json);


        log(
            "Abundance density data received from R."
        );


        console.log(
            "Abundance density:",
            abundanceDensityData
        );


        // ============================================================
        // Función para crear cada density plot
        // ============================================================

        const createDensityPlot = (
            densityData
        ) => {

            // --------------------------------------------------------
            // Extraer componentes
            // --------------------------------------------------------

            const data =
                densityData.data;

            const samples =
                densityData.samples;

            const title =
                densityData.title;

            const titleXaxis =
                densityData.title_xaxis;

            const titleYaxis =
                densityData.title_yaxis;

            const legendTitle =
                densityData.legend_title;

            const caption =
                densityData.caption;


            // --------------------------------------------------------
            // Crear una trace por muestra
            // --------------------------------------------------------

            const samplesSeen =
                new Set();


            const traces =
                samples.map(
                    sample => {

                        const sampleData =
                            data.filter(
                                row =>
                                    row.sample === sample
                            );


                        if (sampleData.length === 0) {
                            return null;
                        }


                        const group =
                            sampleData[0].group;

                        const color =
                            sampleData[0].color;


                        const showLegend =
                            !samplesSeen.has(group);


                        samplesSeen.add(group);


                        return {

                            type: "scatter",

                            mode: "lines",

                            x: sampleData.map(
                                row =>
                                    row.abundance
                            ),

                            y: sampleData.map(
                                row =>
                                    row.density
                            ),

                            name: group,

                            legendgroup: group,

                            showlegend: showLegend,

                            line: {
                                color: color
                            },

                            hovertemplate:
                                sampleData.map(
                                    row =>
                                        row.hover_text
                                )
                        };
                    }
                ).filter(
                    trace =>
                        trace !== null
                );


            // --------------------------------------------------------
            // Layout
            // --------------------------------------------------------

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
                    showgrid: false,
                    zeroline: false,
                    ticklen: 1,
                    linewidth: 1
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


            // --------------------------------------------------------
            // Configuración de Plotly
            // --------------------------------------------------------

            const config = {

                responsive: true,

                displayModeBar: true
            };


            // --------------------------------------------------------
            // Crear contenedor
            // --------------------------------------------------------

            const plotContainer =
                document.createElement("div");

            plotContainer.className =
                "plot-container";


            content.appendChild(
                plotContainer
            );


            // --------------------------------------------------------
            // Crear gráfico
            // --------------------------------------------------------

            Plotly.newPlot(
                plotContainer,
                traces,
                layout,
                config
            );


            // --------------------------------------------------------
            // Recalcular tamaño una vez montado
            // --------------------------------------------------------

            requestAnimationFrame(() => {

                Plotly.Plots.resize(
                    plotContainer
                );

            });


            return plotContainer;
        };

        // ============================================================
        // Crear gráfico BEFORE
        // ============================================================

        createDensityPlot(
            abundanceDensityData.before
        );

        // ============================================================
        // Crear gráfico AFTER
        // ============================================================

        createDensityPlot(
            abundanceDensityData.after
        );


        log(
            "Abundance density plots created."
        );


        return {
            container
        };


    } catch (error) {

        console.error(
            "Error loading abundance density plots:",
            error
        );


        log(
            `Error loading abundance density plots: ${error.message}`
        );


        return {
            container
        };

    }
}

