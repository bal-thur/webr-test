
import { createModule } from "./module-template.js";


export async function initPcaModule({ webR, log }) {

    const {
        container,
        content
    } = createModule("PCA");


    try {

        // ============================================================
        // Obtener datos desde R
        // ============================================================

        const json =
            await webR.evalRString(
                "get_pca_data()"
            );

        const pcaData =
            JSON.parse(json);


        log(
            "PCA data received from R."
        );


        // ============================================================
        // Estado del PCA
        // ============================================================

        const pcaState = {

            grouping:
                Object.keys(pcaData)[0],

            xPC:
                "PC1",

            yPC:
                "PC2",

            showEllipses:
                true

        };


        // ============================================================
        // Componentes PCA disponibles
        // ============================================================

        const pcaComponents = [
            "PC1",
            "PC2",
            "PC3",
            "PC4"
        ];


        // ============================================================
        // Crear panel de selectores
        // ============================================================

        const selectorPanel =
            document.createElement("div");

        selectorPanel.className =
            "selector-panel";


        // ============================================================
        // Selector X
        // ============================================================

        const xSelectorGroup =
            document.createElement("div");

        xSelectorGroup.className =
            "selector-group";


        const xLabel =
            document.createElement("label");

        xLabel.textContent =
            "X axis";


        const pcaXSelect =
            document.createElement("select");

        pcaXSelect.className =
            "plot-selector";


        xSelectorGroup.append(
            xLabel,
            pcaXSelect
        );


        // ============================================================
        // Selector Y
        // ============================================================

        const ySelectorGroup =
            document.createElement("div");

        ySelectorGroup.className =
            "selector-group";


        const yLabel =
            document.createElement("label");

        yLabel.textContent =
            "Y axis";


        const pcaYSelect =
            document.createElement("select");

        pcaYSelect.className =
            "plot-selector";


        ySelectorGroup.append(
            yLabel,
            pcaYSelect
        );


        // ============================================================
        // Selector de agrupación
        // ============================================================

        const groupingSelectorGroup =
            document.createElement("div");

        groupingSelectorGroup.className =
            "selector-group";


        const groupingLabel =
            document.createElement("label");

        groupingLabel.textContent =
            "Grouping";


        const pcaGroupingSelect =
            document.createElement("select");

        pcaGroupingSelect.className =
            "plot-selector";


        groupingSelectorGroup.append(
            groupingLabel,
            pcaGroupingSelect
        );


        // ============================================================
        // Selector de elipses
        // ============================================================

        const ellipseSelectorGroup =
            document.createElement("div");

        ellipseSelectorGroup.className =
            "selector-group";


        const ellipseLabel =
            document.createElement("label");

        ellipseLabel.textContent =
            "Confidence ellipses";


        const pcaEllipsesSelect =
            document.createElement("select");

        pcaEllipsesSelect.className =
            "plot-selector";


        ellipseSelectorGroup.append(
            ellipseLabel,
            pcaEllipsesSelect
        );


        // ============================================================
        // Añadir selectores al panel
        // ============================================================

        selectorPanel.append(
            xSelectorGroup,
            ySelectorGroup,
            groupingSelectorGroup,
            ellipseSelectorGroup
        );


        content.appendChild(
            selectorPanel
        );


        // ============================================================
        // Inicializar selector de agrupación
        // ============================================================

        function initializeGroupingSelector() {

            pcaGroupingSelect.innerHTML = "";


            Object.keys(pcaData).forEach(
                grouping => {

                    const option =
                        document.createElement("option");


                    option.value =
                        grouping;


                    option.textContent =
                        pcaData[grouping]
                            .grouping_name;


                    pcaGroupingSelect.appendChild(
                        option
                    );

                }
            );


            pcaGroupingSelect.value =
                pcaState.grouping;

        }


        // ============================================================
        // Inicializar selector de elipses
        // ============================================================

        function initializeEllipseSelector() {

            pcaEllipsesSelect.innerHTML = "";


            const yesOption =
                document.createElement("option");

            yesOption.value =
                "true";

            yesOption.textContent =
                "Yes";


            const noOption =
                document.createElement("option");

            noOption.value =
                "false";

            noOption.textContent =
                "No";


            pcaEllipsesSelect.append(
                yesOption,
                noOption
            );


            pcaEllipsesSelect.value =
                "true";

        }


        // ============================================================
        // Actualizar selectores de componentes
        // ============================================================

        function updatePcSelectors() {

            pcaXSelect.innerHTML = "";

            pcaYSelect.innerHTML = "";


            pcaComponents.forEach(
                pc => {

                    const xOption =
                        document.createElement("option");


                    xOption.value =
                        pc;

                    xOption.textContent =
                        pc;

                    xOption.disabled =
                        pc === pcaState.yPC;


                    pcaXSelect.appendChild(
                        xOption
                    );


                    const yOption =
                        document.createElement("option");


                    yOption.value =
                        pc;

                    yOption.textContent =
                        pc;

                    yOption.disabled =
                        pc === pcaState.xPC;


                    pcaYSelect.appendChild(
                        yOption
                    );

                }
            );


            pcaXSelect.value =
                pcaState.xPC;

            pcaYSelect.value =
                pcaState.yPC;

        }


        // ============================================================
        // Cálculo de elipse
        // ============================================================

        function calculateEllipse(
            scores,
            xColumn,
            yColumn,
            level = 0.95,
            segments = 51
        ) {

            const n =
                scores.length;


            if (n < 4) {
                return null;
            }


            const x =
                scores.map(
                    row => Number(
                        row[xColumn]
                    )
                );


            const y =
                scores.map(
                    row => Number(
                        row[yColumn]
                    )
                );


            const meanX =
                x.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) / n;


            const meanY =
                y.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) / n;


            let varX = 0;
            let varY = 0;
            let covXY = 0;


            for (
                let i = 0;
                i < n;
                i++
            ) {

                const dx =
                    x[i] - meanX;

                const dy =
                    y[i] - meanY;


                varX +=
                    dx * dx;

                varY +=
                    dy * dy;

                covXY +=
                    dx * dy;

            }


            varX /=
                (n - 1);

            varY /=
                (n - 1);

            covXY /=
                (n - 1);


            const l11 =
                Math.sqrt(varX);


            if (
                !Number.isFinite(l11) ||
                l11 === 0
            ) {
                return null;
            }


            const l12 =
                covXY / l11;


            const l22Squared =
                varY -
                l12 * l12;


            if (
                l22Squared <= 0 ||
                !Number.isFinite(l22Squared)
            ) {
                return null;
            }


            const l22 =
                Math.sqrt(
                    l22Squared
                );


            const df2 =
                n - 1;


            const qf =
                (
                    df2 / 2
                ) *
                (
                    Math.pow(
                        1 - level,
                        -2 / df2
                    ) - 1
                );


            const radius =
                Math.sqrt(
                    2 * qf
                );


            const ellipseX = [];
            const ellipseY = [];


            for (
                let i = 0;
                i <= segments;
                i++
            ) {

                const angle =
                    2 *
                    Math.PI *
                    i /
                    segments;


                const unitX =
                    Math.cos(angle);

                const unitY =
                    Math.sin(angle);


                const transformedX =
                    unitX * l11;


                const transformedY =
                    unitX * l12 +
                    unitY * l22;


                ellipseX.push(
                    meanX +
                    radius *
                    transformedX
                );


                ellipseY.push(
                    meanY +
                    radius *
                    transformedY
                );

            }


            return {
                x: ellipseX,
                y: ellipseY
            };

        }


        // ============================================================
        // Crear PCA plot
        // ============================================================

        function createPcaPlot(
            pca,
            xPC,
            yPC,
            showEllipses
        ) {

            const scores =
                pca.data.scores;


            const variance =
                pca.data.variance;


            const levels =
                pca.levels;


            const palette =
                pca.palette;


            const xVariance =
                variance.find(
                    row =>
                        row.PC === xPC
                );


            const yVariance =
                variance.find(
                    row =>
                        row.PC === yPC
                );


            const traces = [];


            levels.forEach(
                group => {

                    const groupScores =
                        scores.filter(
                            row =>
                                row.group === group
                        );


                    if (
                        groupScores.length === 0
                    ) {
                        return;
                    }


                    traces.push({

                        x:
                            groupScores.map(
                                row =>
                                    Number(
                                        row[xPC]
                                    )
                            ),

                        y:
                            groupScores.map(
                                row =>
                                    Number(
                                        row[yPC]
                                    )
                            ),

                        mode:
                            "markers",

                        type:
                            "scatter",

                        name:
                            group,

                        legendgroup:
                            group,

                        marker: {

                            size:
                                10,

                            symbol:
                                "circle",

                            color:
                                groupScores[0].color

                        },

                        text:
                            groupScores.map(
                                row =>
                                    row.sample
                            ),

                        hovertemplate:

                            "<b>%{text}</b>" +

                            "<br>" +

                            group +

                            "<br>" +

                            xPC +

                            ": %{x:.3f}" +

                            "<br>" +

                            yPC +

                            ": %{y:.3f}" +

                            "<extra></extra>"

                    });


                    if (showEllipses) {

                        const ellipse =
                            calculateEllipse(
                                groupScores,
                                xPC,
                                yPC
                            );


                        if (
                            ellipse !== null
                        ) {

                            traces.push({

                                x:
                                    ellipse.x,

                                y:
                                    ellipse.y,

                                mode:
                                    "lines",

                                type:
                                    "scatter",

                                name:
                                    group,

                                legendgroup:
                                    group,

                                showlegend:
                                    false,

                                fill:
                                    "toself",

                                fillcolor:
                                    groupScores[0].color,

                                line: {

                                    color:
                                        groupScores[0].color,

                                    width:
                                        2

                                },

                                opacity:
                                    0.15,

                                hoverinfo:
                                    "skip"

                            });

                        }

                    }

                }
            );


            const xVarianceValue =
                xVariance
                    ? Number(
                        xVariance.variance
                    )
                    : 0;


            const yVarianceValue =
                yVariance
                    ? Number(
                        yVariance.variance
                    )
                    : 0;


            const layout = {

                title: {
                    text:
                        pca.title
                },


                xaxis: {

                    title: {
                        text:
                            `${xPC} (${xVarianceValue.toFixed(2)}%)`
                    },

                    zeroline:
                        false,

                    showline:
                        true,

                    showgrid:
                        false,

                    mirror:
                        false

                },


                yaxis: {

                    title: {
                        text:
                            `${yPC} (${yVarianceValue.toFixed(2)}%)`
                    },

                    zeroline:
                        false,

                    showline:
                        true,

                    showgrid:
                        false,

                    mirror:
                        false

                },


                legend: {

                    title: {
                        text:
                            pca.grouping_name
                    },

                    groupclick:
                        "togglegroup"

                },


                hovermode:
                    "closest",


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
                traces,
                layout
            };

        }


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
        // Configuración Plotly
        // ============================================================

        const config = {

            responsive:
                true,

            displayModeBar:
                true

        };


        // ============================================================
        // Actualizar PCA plot
        // ============================================================

        function updatePcaPlot() {

            const pca =
                pcaData[
                    pcaState.grouping
                ];


            const plot =
                createPcaPlot(
                    pca,
                    pcaState.xPC,
                    pcaState.yPC,
                    pcaState.showEllipses
                );


            Plotly.react(
                plotContainer,
                plot.traces,
                plot.layout,
                config
            );

        }


        // ============================================================
        // Selector X
        // ============================================================

        pcaXSelect.addEventListener(
            "change",
            function () {

                pcaState.xPC =
                    this.value;


                if (
                    pcaState.xPC ===
                    pcaState.yPC
                ) {

                    pcaState.yPC =
                        pcaComponents.find(
                            pc =>
                                pc !==
                                pcaState.xPC
                        );

                }


                updatePcSelectors();

                updatePcaPlot();

            }
        );


        // ============================================================
        // Selector Y
        // ============================================================

        pcaYSelect.addEventListener(
            "change",
            function () {

                pcaState.yPC =
                    this.value;


                if (
                    pcaState.yPC ===
                    pcaState.xPC
                ) {

                    pcaState.xPC =
                        pcaComponents.find(
                            pc =>
                                pc !==
                                pcaState.yPC
                        );

                }


                updatePcSelectors();

                updatePcaPlot();

            }
        );


        // ============================================================
        // Selector de agrupación
        // ============================================================

        pcaGroupingSelect.addEventListener(
            "change",
            function () {

                pcaState.grouping =
                    this.value;


                updatePcaPlot();

            }
        );


        // ============================================================
        // Selector de elipses
        // ============================================================

        pcaEllipsesSelect.addEventListener(
            "change",
            function () {

                pcaState.showEllipses =
                    this.value === "true";


                updatePcaPlot();

            }
        );


        // ============================================================
        // Inicializar selectores
        // ============================================================

        initializeGroupingSelector();

        initializeEllipseSelector();

        updatePcSelectors();


        // ============================================================
        // Crear gráfico inicial
        // ============================================================

        updatePcaPlot();


        // ============================================================
        // Recalcular tamaño una vez montado
        // ============================================================

        requestAnimationFrame(() => {

            Plotly.Plots.resize(
                plotContainer
            );

        });


        log(
            "PCA score plot created."
        );


        return {
            container
        };


    } catch (error) {

        console.error(
            "Error loading PCA score plot",
            error
        );


        log(
            `Error loading PCA score plot: ${error.message}`
        );


        return {
            container
        };

    }

}

