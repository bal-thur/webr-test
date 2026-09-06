
import { createModule } from "./module-template.js";


export async function initBoxplotAbundanceModule({ webR, log }) {

    const {
        container,
        content
    } = createModule("Boxplot of abundance");


    try {

        // ============================================================
        // Obtener datos desde R
        // ============================================================

        const json =
            await webR.evalRString(
                "get_abundance_boxplot()"
            );


        const boxplotAbundanceData =
            JSON.parse(json);


        log(
            "Abundance boxplot data received from R."
        );


        console.log(
            "Abundance boxplot:",
            boxplotAbundanceData
        );


        // ============================================================
        // Función para crear cada boxplot
        // ============================================================

        const createBoxplot = (
            boxplotData
        ) => {

            // --------------------------------------------------------
            // Extraer componentes
            // --------------------------------------------------------

            const data =
                boxplotData.data;

            const levels =
                boxplotData.levels;

            const title =
                boxplotData.title;

            const titleXaxis =
                boxplotData.title_xaxis;

            const titleYaxis =
                boxplotData.title_yaxis;

            const legendTitle =
                boxplotData.legend_title;

            const caption =
                boxplotData.caption;


            // --------------------------------------------------------
            // Crear una trace por muestra
            // --------------------------------------------------------

            const samplesSeen =
                new Set();


            const traces =
                boxplotData.samples.map(
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

                            type: "box",

                            orientation: "h",

                            x: sampleData.map(
                                row =>
                                    row.abundance
                            ),

                            y: sampleData.map(
                                () =>
                                    sample
                            ),

                            name: group,

                            legendgroup: group,

                            showlegend: showLegend,

                            marker: {
                                color: color
                            },

                            line: {
                                color: color
                            },

                            boxpoints: false,

                            hovertemplate:
                                "<b>Sample:</b> " +
                                sample +
                                "<br><b>" +
                                legendTitle +
                                ":</b> " +
                                group +
                                "<br><b>Abundance:</b> %{x:.3f}" +
                                "<extra></extra>"
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
                    l: 200
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
                    linewidth: 1,

                    categoryorder: "array",
                    categoryarray: boxplotData.samples
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

        createBoxplot(
            boxplotAbundanceData.before
        );


        // ============================================================
        // Crear gráfico AFTER
        // ============================================================

        createBoxplot(
            boxplotAbundanceData.after
        );


        log(
            "Abundance boxplots created."
        );


        return {
            container
        };


    } catch (error) {

        console.error(
            "Error loading abundance boxplots:",
            error
        );


        log(
            `Error loading abundance boxplots: ${error.message}`
        );


        return {
            container
        };

    }
}

