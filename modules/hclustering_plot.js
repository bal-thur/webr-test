// ============================================================
// DATOS
// ============================================================

const hclusteringData =
    hclustering_result.hclustering_data;

const lipidMetadata =
    hclustering_result.lipid_metadata;


// ============================================================
// OPCIONES DE GROUP BY
// ============================================================

function getGroupingOptions() {

    return Object.keys(hclusteringData).map(
        key => ({
            value: key,
            label: hclusteringData[key].grouping_name
        })
    );

}


// ============================================================
// OPCIONES DE DISPLAY BY
// ============================================================

function getDisplayOptions(grouping) {

    const groupingData =
        hclusteringData[grouping];

    return Object.keys(groupingData)
        .filter(key => key !== "grouping_name");

}


// ============================================================
// ETIQUETAS DE DISPLAY BY
// ============================================================

function getDisplayLabel(value) {

    const labels = {
        species: "Species",
        class: "Class",
        category: "Category"
    };

    return labels[value] || value;
}


// ============================================================
// OPCIONES DE FILTER
// ============================================================

function getFilterOptions(displayBy) {

    // Species → filtrar por lipid class
    if (displayBy === "species") {

        const classes = [
            ...new Set(
                lipidMetadata.map(
                    lipid => lipid.class
                )
            )
        ];

        return classes.sort();
    }


    // Class → filtrar por category
    if (displayBy === "class") {

        const categories = [
            ...new Set(
                lipidMetadata.map(
                    lipid => lipid.category
                )
            )
        ];

        return categories.sort();
    }


    // Category → no hay filtro
    return [];
}


// ============================================================
// ETIQUETAS DE FILTER
// ============================================================

function getFilterLabel(value) {

    if (value === "all") {
        return "All";
    }

    return value;
}


// ============================================================
// RELLENAR SELECTOR GROUP BY
// ============================================================

function populateGroupingSelect() {

    const select =
        document.getElementById("groupingSelect");

    const options =
        getGroupingOptions();

    select.innerHTML = "";

    options.forEach(option => {

        const element =
            document.createElement("option");

        element.value =
            option.value;

        element.textContent =
            option.label;

        select.appendChild(element);

    });
}


// ============================================================
// RELLENAR SELECTOR DISPLAY BY
// ============================================================

function populateDisplaySelect(grouping) {

    const select =
        document.getElementById("displaySelect");

    const options =
        getDisplayOptions(grouping);

    select.innerHTML = "";

    options.forEach(option => {

        const element =
            document.createElement("option");

        element.value =
            option;

        element.textContent =
            getDisplayLabel(option);

        select.appendChild(element);

    });
}


// ============================================================
// RELLENAR SELECTOR FILTER
// ============================================================

function populateFilterSelect(displayBy) {

    const select =
        document.getElementById("filterSelect");

    const options =
        getFilterOptions(displayBy);

    select.innerHTML = "";

    // Category → filtro desactivado
    if (options.length === 0) {

        const element =
            document.createElement("option");

        element.value = "all";
        element.textContent = "—";

        select.appendChild(element);

        select.disabled = true;

        return;
    }

    select.disabled = false;


    // All
    const allElement =
        document.createElement("option");

    allElement.value = "all";
    allElement.textContent = "All";

    select.appendChild(allElement);


    // Opciones
    options.forEach(option => {

        const element =
            document.createElement("option");

        element.value =
            option;

        element.textContent =
            getFilterLabel(option);

        select.appendChild(element);

    });
}


// ============================================================
// OBTENER DATAFRAME SELECCIONADO
// ============================================================

function getSelectedData(
    grouping,
    displayBy
) {

    const groupingData =
        hclusteringData[grouping];

    if (!groupingData) {

        throw new Error(
            `Grouping no encontrado: ${grouping}`
        );
    }

    const data =
        groupingData[displayBy];

    if (!data) {

        throw new Error(
            `Display by no encontrado: ${displayBy}`
        );
    }

    return data;
}


// ============================================================
// FILTRAR DATAFRAME
// ============================================================

function getFilteredData(
    grouping,
    displayBy,
    filter
) {

    const data =
        getSelectedData(
            grouping,
            displayBy
        );


    // Sin filtro
    if (
        filter === "all" ||
        displayBy === "category"
    ) {
        return data;
    }


    // ========================================================
    // SPECIES → FILTER POR LIPID CLASS
    // ========================================================

    if (displayBy === "species") {

        const allowedFeatures =
            new Set(
                lipidMetadata
                    .filter(
                        lipid =>
                            lipid.class === filter
                    )
                    .map(
                        lipid =>
                            lipid.feature
                    )
            );

        return data.filter(
            row =>
                allowedFeatures.has(
                    row.feature
                )
        );
    }


    // ========================================================
    // CLASS → FILTER POR CATEGORY
    // ========================================================

    if (displayBy === "class") {

        const allowedClasses =
            new Set(
                lipidMetadata
                    .filter(
                        lipid =>
                            lipid.category === filter
                    )
                    .map(
                        lipid =>
                            lipid.class
                    )
            );

        return data.filter(
            row =>
                allowedClasses.has(
                    row.class
                )
        );
    }


    return data;
}


// ============================================================
// DATAFRAME → MATRIZ
// ============================================================

function dataframeToMatrix(data) {

    if (!Array.isArray(data) || data.length === 0) {

        return {
            matrix: [],
            rowNames: [],
            columnNames: []
        };
    }

    const firstRow = data[0];


    const rowNameKey =
        Object.keys(firstRow)
            .find(name =>
                name !== "_row" &&
                typeof firstRow[name] === "string"
            );


    if (!rowNameKey) {

        throw new Error(
            "No se encontró la columna identificadora de las filas."
        );
    }


    const columnNames =
        Object.keys(firstRow)
            .filter(name =>
                name !== rowNameKey &&
                name !== "_row"
            );


    const rowNames =
        data.map(
            row => row[rowNameKey]
        );


    const matrix =
        data.map(row => {

            return columnNames.map(
                column => row[column]
            );

        });


    return {
        matrix,
        rowNames,
        columnNames
    };
}


// ============================================================
// MATRIZ ACTUAL
// ============================================================

function getCurrentMatrix() {

    const grouping =
        document.getElementById(
            "groupingSelect"
        ).value;

    const displayBy =
        document.getElementById(
            "displaySelect"
        ).value;

    const filter =
        document.getElementById(
            "filterSelect"
        ).value;


    const filteredData =
        getFilteredData(
            grouping,
            displayBy,
            filter
        );


  const result =
    dataframeToMatrix(
        filteredData
    );


const rowCount =
    result.matrix.length;

console.log(
    "Row count:",
    rowCount
);

    console.log(
        "============================="
    );

    console.log(
        "Grouping:",
        grouping
    );

    console.log(
        "Display by:",
        displayBy
    );

    console.log(
        "Filter:",
        filter
    );

    console.log(
        "Filas:",
        result.matrix.length
    );

    console.log(
        "Columnas:",
        result.matrix[0]
            ? result.matrix[0].length
            : 0
    );

    console.log(
        "============================="
    );


    return result;
}


// ============================================================
// PEARSON
// ============================================================

function pearson(x, y) {

    const n = x.length;

    let sumX = 0;
    let sumY = 0;

    for (let i = 0; i < n; i++) {

        sumX += x[i];
        sumY += y[i];
    }


    const meanX =
        sumX / n;

    const meanY =
        sumY / n;


    let numerator = 0;
    let sumX2 = 0;
    let sumY2 = 0;


    for (let i = 0; i < n; i++) {

        const dx =
            x[i] - meanX;

        const dy =
            y[i] - meanY;


        numerator +=
            dx * dy;

        sumX2 +=
            dx * dx;

        sumY2 +=
            dy * dy;
    }


    return numerator /
        Math.sqrt(
            sumX2 * sumY2
        );
}


// ============================================================
// DISTANCIA
// ============================================================

function pearsonDistance(x, y) {

    return 1 - pearson(x, y);
}


// ============================================================
// TRANSPONER MATRIZ
// ============================================================

function transpose(matrix) {

    if (
        !Array.isArray(matrix) ||
        matrix.length === 0
    ) {
        return [];
    }


    const rows =
        matrix.length;

    const cols =
        matrix[0].length;

    const result = [];


    for (let j = 0; j < cols; j++) {

        const column = [];

        for (let i = 0; i < rows; i++) {

            column.push(
                matrix[i][j]
            );
        }

        result.push(column);
    }


    return result;
}


// ============================================================
// REORDENAR MATRIZ
// ============================================================

function reorderMatrix(
    matrix,
    rowOrder,
    columnOrder
) {

    return rowOrder.map(
        rowIndex => {

            return columnOrder.map(
                columnIndex =>
                    matrix[
                        rowIndex
                    ][
                        columnIndex
                    ]
            );

        }
    );
}


// ============================================================
// SEGMENTOS DENDROGRAMA — FILAS
// ============================================================

function getRowClusterY(
    cluster,
    rowPosition
) {

    if (cluster.isLeaf) {

        return rowPosition[
            cluster.index
        ];
    }


    const y1 =
        getRowClusterY(
            cluster.children[0],
            rowPosition
        );

    const y2 =
        getRowClusterY(
            cluster.children[1],
            rowPosition
        );


    return (y1 + y2) / 2;
}


// ============================================================
// SEGMENTOS DENDROGRAMA — COLUMNAS
// ============================================================

function getColumnClusterX(
    cluster,
    columnPosition
) {

    if (cluster.isLeaf) {

        return columnPosition[
            cluster.index
        ];
    }


    const x1 =
        getColumnClusterX(
            cluster.children[0],
            columnPosition
        );

    const x2 =
        getColumnClusterX(
            cluster.children[1],
            columnPosition
        );


    return (x1 + x2) / 2;
}


// ============================================================
// SEGMENTOS DE UN NODO — FILAS
// ============================================================

function createRowNodeSegments(
    cluster,
    rowPosition
) {

    if (cluster.isLeaf) {
        return [];
    }


    const x =
        cluster.height;


    const child1 =
        cluster.children[0];

    const child2 =
        cluster.children[1];


    const y1 =
        getRowClusterY(
            child1,
            rowPosition
        );

    const y2 =
        getRowClusterY(
            child2,
            rowPosition
        );


    return [

        // línea vertical del nodo
        {
            x: x,
            y: y1,
            xend: x,
            yend: y2
        },


        // rama hacia hijo 1
        {
            x: x,
            y: y1,
            xend: child1.height,
            yend: y1
        },


        // rama hacia hijo 2
        {
            x: x,
            y: y2,
            xend: child2.height,
            yend: y2
        }

    ];
}


// ============================================================
// DENDROGRAMA COMPLETO — FILAS
// ============================================================

function createRowDendrogramSegments(
    cluster,
    rowPosition
) {

    let segments = [];


    if (!cluster.isLeaf) {

        segments =
            segments.concat(
                createRowNodeSegments(
                    cluster,
                    rowPosition
                )
            );


        for (
            const child
            of cluster.children
        ) {

            segments =
                segments.concat(
                    createRowDendrogramSegments(
                        child,
                        rowPosition
                    )
                );
        }
    }


    return segments;
}


// ============================================================
// SEGMENTOS DE UN NODO — COLUMNAS
// ============================================================

function createColumnNodeSegments(
    cluster,
    columnPosition
) {

    if (cluster.isLeaf) {
        return [];
    }


    const y =
        cluster.height;


    const child1 =
        cluster.children[0];

    const child2 =
        cluster.children[1];


    const x1 =
        getColumnClusterX(
            child1,
            columnPosition
        );

    const x2 =
        getColumnClusterX(
            child2,
            columnPosition
        );


    return [

        // línea horizontal del nodo
        {
            x: x1,
            y: y,
            xend: x2,
            yend: y
        },


        // rama hacia hijo 1
        {
            x: x1,
            y: y,
            xend: x1,
            yend: child1.height
        },


        // rama hacia hijo 2
        {
            x: x2,
            y: y,
            xend: x2,
            yend: child2.height
        }

    ];
}


// ============================================================
// DENDROGRAMA COMPLETO — COLUMNAS
// ============================================================

function createColumnDendrogramSegments(
    cluster,
    columnPosition
) {

    let segments = [];


    if (!cluster.isLeaf) {

        segments =
            segments.concat(
                createColumnNodeSegments(
                    cluster,
                    columnPosition
                )
            );


        for (
            const child
            of cluster.children
        ) {

            segments =
                segments.concat(
                    createColumnDendrogramSegments(
                        child,
                        columnPosition
                    )
                );
        }
    }


    return segments;
}


// ============================================================
// SEGMENTOS → TRACE PLOTLY
// ============================================================

function segmentsToPlotlyTrace(
    segments,
    xaxis,
    yaxis
) {

    const x = [];
    const y = [];


    for (
        const segment
        of segments
    ) {

        x.push(
            segment.x
        );

        y.push(
            segment.y
        );


        x.push(
            segment.xend
        );

        y.push(
            segment.yend
        );


        x.push(null);
        y.push(null);
    }


    return {

        type: "scatter",

        mode: "lines",

        x: x,
        y: y,

        xaxis: xaxis,
        yaxis: yaxis,

        line: {
            width: 1.5,
            color: "#444"
        },

        hoverinfo: "skip",

        showlegend: false
    };
}


// ============================================================
// ACTUALIZAR HEATMAP
// ============================================================

function updateHeatmap() {

    // ========================================================
    // DATOS ACTUALES
    // ========================================================

    const current =
        getCurrentMatrix();


    const dataMatrix =
        current.matrix;

    const rowLabels =
        current.rowNames;

    const columnLabels =
        current.columnNames;


    // ========================================================
    // VALIDACIÓN
    // ========================================================

    if (
        !dataMatrix ||
        dataMatrix.length === 0 ||
        dataMatrix[0].length === 0
    ) {

        console.warn(
            "No hay datos para representar."
        );

        return;
    }


    const rowCount =
        dataMatrix.length;

    const columnCount =
        dataMatrix[0].length;


    // ========================================================
    // CLUSTERING DE FILAS
    // ========================================================

let rowDendrogram = null;

if (rowCount >= 2) {

    rowDendrogram =
        HClust.agnes(
            dataMatrix,
            {
                method: "complete",
                distanceFunction:
                    pearsonDistance
            }
        );
}


    // ========================================================
    // CLUSTERING DE COLUMNAS
    // ========================================================

let columnDendrogram = null;

if (rowCount >= 2) {

    const columnDataMatrix =
        transpose(
            dataMatrix
        );

    columnDendrogram =
        HClust.agnes(
            columnDataMatrix,
            {
                method: "complete",
                distanceFunction:
                    pearsonDistance
            }
        );
}


    // ========================================================
    // ÓRDENES
    // ========================================================

const rowOrder =
    rowDendrogram
        ? rowDendrogram.indices()
        : Array.from(
            { length: rowCount },
            (_, index) => index
        );


const columnOrder =
    columnDendrogram
        ? columnDendrogram.indices()
        : Array.from(
            { length: columnCount },
            (_, index) => index
        );


    console.log(
        "Row order:",
        rowOrder
    );

    console.log(
        "Column order:",
        columnOrder
    );


    // ========================================================
    // MATRIZ REORDENADA
    // ========================================================

    const displayMatrix =
        reorderMatrix(
            dataMatrix,
            rowOrder,
            columnOrder
        );


    // ========================================================
    // ETIQUETAS REORDENADAS
    // ========================================================

    const displayRowLabels =
        rowOrder.map(
            index =>
                rowLabels[index]
        );


    const displayColumnLabels =
        columnOrder.map(
            index =>
                columnLabels[index]
        );


    // ========================================================
    // POSICIONES DE HOJAS
    // ========================================================

    const rowPosition = {};

    rowOrder.forEach(
        (index, position) => {

            rowPosition[index] =
                position + 1;
        }
    );


    const columnPosition = {};

    columnOrder.forEach(
        (index, position) => {

            columnPosition[index] =
                position + 1;
        }
    );


    // ========================================================
    // HEATMAP CUSTOM DATA
    // ========================================================

    const heatmapCustomData = [];


    for (
        let i = 0;
        i < rowOrder.length;
        i++
    ) {

        const row = [];


        for (
            let j = 0;
            j < columnOrder.length;
            j++
        ) {

            row.push([
                displayRowLabels[i],
                displayColumnLabels[j]
            ]);
        }


        heatmapCustomData.push(
            row
        );
    }


    // ========================================================
    // HEATMAP TRACE
    // ========================================================

    const heatmapTrace = {

        type: "heatmap",

        z: displayMatrix,

        x: columnOrder.map(
            (_, index) => index + 1
        ),

        y: rowOrder.map(
            (_, index) => index + 1
        ),

        xaxis: "x",

        yaxis: "y",

        colorscale: [
            [0.00, "#0571b0"],
            [0.25, "#92c5de"],
            [0.50, "#ffffff"],
            [0.75, "#f4a582"],
            [1.00, "#ca0020"]
        ],

        customdata:
            heatmapCustomData,

        hovertemplate:
            "<b>%{customdata[0]}</b><br>" +
            "%{customdata[1]}<br>" +
            "Signal: %{z:.3f}" +
            "<extra></extra>",

        hoverongaps: false,

        colorbar: {

            title: {
                text: "Signal"
            },

            thickness: 12,

            len: 0.8,

            x: 1.02
        }
    };


    // ========================================================
    // DENDROGRAMA DE FILAS
    // ========================================================

let rowDendrogramTrace = null;

if (rowDendrogram) {

    const rowSegments =
        createRowDendrogramSegments(
            rowDendrogram,
            rowPosition
        );

    rowDendrogramTrace =
        segmentsToPlotlyTrace(
            rowSegments,
            "x2",
            "y"
        );
}
    // ========================================================
    // DENDROGRAMA DE COLUMNAS
    // ========================================================

let columnDendrogramTrace = null;

if (columnDendrogram) {

    const columnSegments =
        createColumnDendrogramSegments(
            columnDendrogram,
            columnPosition
        );

    columnDendrogramTrace =
        segmentsToPlotlyTrace(
            columnSegments,
            "x",
            "y2"
        );
}
       // ========================================================
    // etiqueta de filas
    // ======================================================== 
    

const columnLabelAnnotations =
    columnOrder.map(
        (_, index) => ({

            x:
                index + 1,

            y:
                1,

            xref: "x",
            yref: "y3",

            text:
                displayColumnLabels[index],

            textangle: -90,

            showarrow: false,

            xanchor: "center",
            yanchor: "top",

            font: {
                size: 10
            }
        })
    );


const rowLabelAnnotations =
    rowOrder.map(
        (_, index) => ({

            x:
                1,

            y:
                index + 1,

            xref: "x3",
            yref: "y",

            text:
                displayRowLabels[index],

            textangle: 0,

            showarrow: false,

            xanchor: "right",
            yanchor: "middle",

            font: {
                size: 10
            }
        })
    );
    



    
// ========================================================
    // LAYOUT
    // ========================================================

const layout = {

    title:
        "Heatmap + hierarchical clustering",
    
    height: 900,

    // ====================================================
    // HEATMAP
    // ====================================================

    xaxis: {

        domain: [
            0.0833,
            0.877
        ],

        range: [
            0.5,
            columnOrder.length + 0.5
        ],

        tickmode: "array",

        tickvals:
            columnOrder.map(
                (_, index) => index + 1
            ),

        ticklen: 0,

        showline: false,
        zeroline: false,
        showgrid: false,
        showticklabels: false,

        anchor: "y"
    },


    yaxis: {

        domain: [
            0.0833,
            0.877
        ],

        range: [
            rowOrder.length + 0.5,
            0.5
        ],

        tickmode: "array",

        tickvals:
            rowOrder.map(
                (_, index) => index + 1
            ),

        ticklen: 0,

        showline: false,
        zeroline: false,
        showgrid: false,
        showticklabels: false,

        anchor: "x"
    },


    // ====================================================
    // DENDROGRAMA FILAS
    // ====================================================

xaxis2: {

    domain: [
        0.881,
        1.00
    ],

    showticklabels: false,
    showline: false,
    zeroline: false,
    showgrid: false,

    range: [
        0,
        rowDendrogram
            ? rowDendrogram.height
            : 0
    ],

    fixedrange: true,

    anchor: "y"
},


    // ====================================================
    // ETIQUETAS FILAS
    // ====================================================

xaxis3: {

    domain: [
        0.00,
        0.0794
    ],

    range: [
        -1,
        1
    ],

    showticklabels: false,
    showline: false,
    zeroline: false,
    showgrid: false,

    fixedrange: true,

    anchor: "y"
},

    // ====================================================
    // DENDROGRAMA COLUMNAS
    // ====================================================

    yaxis2: {

        domain: [
            0.881,
            1.00
        ],

        showticklabels: false,
        showline: false,
        zeroline: false,
        showgrid: false,

    range: [
        0,
        columnDendrogram
            ? columnDendrogram.height
            : 0
    ],

        fixedrange: true,

        anchor: "x"
    },


    // ====================================================
    // ETIQUETAS COLUMNAS
    // ====================================================

yaxis3: {

    domain: [
        0.00,
        0.0794
    ],

    range: [
        -1,
        1
    ],

    showticklabels: false,
    showline: false,
    zeroline: false,
    showgrid: false,

    fixedrange: true,

    anchor: "x"
},


    // ====================================================
    // MÁRGENES
    // ====================================================
 annotations: [
        ...columnLabelAnnotations,
        ...rowLabelAnnotations
    ],
    
    margin: {
        l: 50,
        r: 50,
        t: 40,
        b: 100
    }
};


// ========================================================
// PLOTLY
// ========================================================

const plotElement =
    document.getElementById(
        "dendrogram"
    );


const plotTraces = [
    heatmapTrace
];


if (rowDendrogramTrace) {

    plotTraces.push(
        rowDendrogramTrace
    );
}


if (columnDendrogramTrace) {

    plotTraces.push(
        columnDendrogramTrace
    );
}


if (
    plotElement.data &&
    plotElement.data.length > 0
) {

    Plotly.react(
        plotElement,
        plotTraces,
        layout
    );


} else {

    Plotly.newPlot(
        plotElement,
        plotTraces,
        layout
    );
}

}


// ============================================================
// INICIALIZACIÓN
// ============================================================

populateGroupingSelect();

const initialGrouping =
    document.getElementById(
        "groupingSelect"
    ).value;

populateDisplaySelect(
    initialGrouping
);

const initialDisplay =
    document.getElementById(
        "displaySelect"
    ).value;

populateFilterSelect(
    initialDisplay
);


// ============================================================
// EVENTO: GROUP BY
// ============================================================

document
    .getElementById("groupingSelect")
    .addEventListener(
        "change",
        function () {

            const grouping =
                this.value;

            populateDisplaySelect(
                grouping
            );


            const displayBy =
                document.getElementById(
                    "displaySelect"
                ).value;


            populateFilterSelect(
                displayBy
            );


            updateHeatmap();
        }
    );


// ============================================================
// EVENTO: DISPLAY BY
// ============================================================

document
    .getElementById("displaySelect")
    .addEventListener(
        "change",
        function () {

            const displayBy =
                this.value;


            populateFilterSelect(
                displayBy
            );


            updateHeatmap();
        }
    );


// ============================================================
// EVENTO: FILTER
// ============================================================

document
    .getElementById("filterSelect")
    .addEventListener(
        "change",
        function () {

            updateHeatmap();
        }
    );


// ============================================================
// PRIMER DIBUJO
// ============================================================

updateHeatmap();

