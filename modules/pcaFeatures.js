// =========================================================
// PCA FEATURES
// =========================================================

import { createModule } from "./module-template.js";


// =========================================================
// MODULE
// =========================================================

export async function initPcaFeaturesModule(
    {
        webR,
        log
    }
) {

    const {
        container,
        content
    } = createModule(
        "PCA features"
    );


    // =====================================================
    // GET PCA DATA
    // =====================================================

    let pcaData;

    try {

        const json =
            await webR.evalRString(
                "get_pca_data()"
            );

        pcaData =
            JSON.parse(
                json
            );

        log(
            "PCA feature data received from R."
        );

    } catch (error) {

        log(
            "Error getting PCA feature data:",
            error
        );

        const message =
            document.createElement(
                "div"
            );

        message.textContent =
            "Error loading PCA feature data.";

        content.appendChild(
            message
        );

        return {
            container
        };
    }


    // =====================================================
    // GET FIRST PCA GROUPING
    // =====================================================

    const groupings =
        Object.keys(
            pcaData
        );

    if (groupings.length === 0) {

        const message =
            document.createElement(
                "div"
            );

        message.textContent =
            "No PCA feature data available.";

        content.appendChild(
            message
        );

        return {
            container
        };
    }


    const grouping =
        groupings[0];

    const pca =
        pcaData[
            grouping
        ];


    // =====================================================
    // STATE
    // =====================================================

    let selectedPC =
        "PC1";


    // =====================================================
    // FEATURE PC SELECTOR
    // =====================================================

    const selectorPanel =
        document.createElement(
            "div"
        );

    selectorPanel.className =
        "selector-panel";


    const selectorGroup =
        document.createElement(
            "div"
        );

    selectorGroup.className =
        "selector-group";


    const selectorLabel =
        document.createElement(
            "label"
        );

    selectorLabel.textContent =
        "Principal component";


    const pcSelect =
        document.createElement(
            "select"
        );

    pcSelect.className =
        "plot-selector";


    const components = [
        "PC1",
        "PC2",
        "PC3",
        "PC4"
    ];


    components.forEach(
        pc => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                pc;

            option.textContent =
                pc;

            pcSelect.appendChild(
                option
            );
        }
    );


    pcSelect.value =
        selectedPC;


    selectorGroup.append(
        selectorLabel,
        pcSelect
    );

    selectorPanel.append(
        selectorGroup
    );


    // =====================================================
    // GRID
    // =====================================================

    const grid =
        document.createElement(
            "div"
        );

    grid.className =
        "grid-70-30";


    // =====================================================
    // FEATURE CONTRIBUTION PLOT
    // =====================================================

    const featureContributionPlot =
        document.createElement(
            "div"
        );

    featureContributionPlot.className =
        "plot-container";


    // =====================================================
    // PRINCIPAL COMPONENTS VARIANCE
    // =====================================================

    const variancePlot =
        document.createElement(
            "div"
        );

    variancePlot.className =
        "plot-container";


    // =====================================================
    // GRID CONTENT
    // =====================================================

    grid.append(
        featureContributionPlot,
        variancePlot
    );


    // =====================================================
    // MODULE CONTENT
    // =====================================================

    content.append(
        selectorPanel,
        grid
    );


    // =====================================================
    // CREATE PRINCIPAL COMPONENTS VARIANCE PLOT
    // =====================================================

    function createVariancePlot(
        pca,
        maxPC = 4
    ) {

        const source =
            pca.data.scree;


        const data =
            source.filter(
                row => {

                    const component =
                        String(
                            row.PC
                        );

                    const pcNumber =
                        Number(
                            component.replace(
                                "PC",
                                ""
                            )
                        );

                    return (
                        Number.isFinite(
                            pcNumber
                        ) &&
                        pcNumber <= maxPC
                    );
                }
            );


        const trace = {

            type:
                "bar",

            x:
                data.map(
                    row =>
                        row.PC
                ),

            y:
                data.map(
                    row =>
                        Number(
                            row.variance
                        )
                ),

            hovertemplate:
                "<b>%{x}</b>" +
                "<br>" +
                "Variance: " +
                "%{y:.2f}%" +
                "<extra></extra>"
        };


        const layout = {

            title: {

                text:
                    "Principal components variance"
            },

            xaxis: {

                title: {

                    text:
                        "Principal component"
                },

                showline:
                    true,

                showgrid:
                    false,

                mirror:
                    false,

                zeroline:
                    false
            },

            yaxis: {

                title: {

                    text:
                        "Variance (%)"
                },

                showline:
                    true,

                showgrid:
                    false,

                mirror:
                    false,

                zeroline:
                    false,

                rangemode:
                    "tozero"
            },

            showlegend:
                false,

            margin: {

                l:
                    70,

                r:
                    30,

                t:
                    70,

                b:
                    70
            }
        };


        return {

            traces: [
                trace
            ],

            layout
        };
    }


    // =====================================================
    // CREATE FEATURE CONTRIBUTION PLOT
    // =====================================================

    function createFeatureContributionPlot(
        pca,
        pc,
        topN = 10
    ) {

        const contribution =
            pca.data.contribution;


        const data =
            contribution
                .map(
                    row => ({

                        feature:
                            row.feature,

                        contribution:
                            Number(
                                row[
                                    pc
                                ]
                            )
                    })
                )
                .filter(
                    row =>
                        Number.isFinite(
                            row.contribution
                        )
                )
                .sort(
                    (a, b) =>
                        b.contribution -
                        a.contribution
                )
                .slice(
                    0,
                    topN
                );


        const reversedData =
            [
                ...data
            ].reverse();


        const trace = {

            type:
                "bar",

            orientation:
                "h",

            x:
                reversedData.map(
                    row =>
                        row.contribution
                ),

            y:
                reversedData.map(
                    row =>
                        row.feature
                ),

            hovertemplate:
                "<b>%{y}</b>" +
                "<br>" +
                "Contribution: " +
                "%{x:.2f}%" +
                "<extra></extra>"
        };


        const layout = {

            title: {

                text:
                    `Feature contribution — ${pc}`
            },

            xaxis: {

                title: {

                    text:
                        "Contribution (%)"
                },

                showline:
                    true,

                showgrid:
                    false,

                mirror:
                    false,

                zeroline:
                    false,

                rangemode:
                    "tozero"
            },

            yaxis: {

                title: {

                    text:
                        ""
                },

                showline:
                    true,

                showgrid:
                    false,

                mirror:
                    false,

                zeroline:
                    false,

                automargin:
                    true
            },

            showlegend:
                false,

            margin: {

                l:
                    150,

                r:
                    30,

                t:
                    70,

                b:
                    70
            }
        };


        return {

            traces: [
                trace
            ],

            layout
        };
    }


    // =====================================================
    // UPDATE PRINCIPAL COMPONENTS VARIANCE
    // =====================================================

    function updateVariancePlot() {

        const plot =
            createVariancePlot(
                pca,
                4
            );


        Plotly.newPlot(
            variancePlot,
            plot.traces,
            plot.layout,
            {
                responsive:
                    true
            }
        );


        requestAnimationFrame(
            () => {

                Plotly.Plots.resize(
                    variancePlot
                );
            }
        );
    }


    // =====================================================
    // UPDATE FEATURE CONTRIBUTION
    // =====================================================

    function updateFeatureContributionPlot() {

        const plot =
            createFeatureContributionPlot(
                pca,
                selectedPC,
                10
            );


        Plotly.react(
            featureContributionPlot,
            plot.traces,
            plot.layout,
            {
                responsive:
                    true
            }
        );


        requestAnimationFrame(
            () => {

                Plotly.Plots.resize(
                    featureContributionPlot
                );
            }
        );
    }


    // =====================================================
    // PC SELECTOR EVENT
    // =====================================================

    pcSelect.addEventListener(
        "change",
        () => {

            selectedPC =
                pcSelect.value;

            updateFeatureContributionPlot();
        }
    );


    // =====================================================
    // INITIALIZATION
    // =====================================================

    updateFeatureContributionPlot();

    updateVariancePlot();


    // =====================================================
    // RETURN
    // =====================================================

    return {
        container
    };
}