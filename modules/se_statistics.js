import { createModule } from "./module-template.js";


export async function initSeStatisticsModule({ webR, log }) {

    const {
        container,
        content
    } = createModule("Statistics");


    const status =
        document.createElement("p");

    //status.textContent =
    //    "Loading statistics...";

    content.appendChild(status);


    try {

        const json =
            await webR.evalRString(
                "get_se_statistics()"
            );


        const seStatistics =
            JSON.parse(json);


        log(
            "Statistics received from R."
        );


        console.log(
            "Se Statistics:",
            seStatistics
        );


        // ============================================================
        // Crear tabla
        // ============================================================

        const table =
            document.createElement("table");

        table.className =
            "data-table";


        // ------------------------------------------------------------
        // Cabecera
        // ------------------------------------------------------------

        const thead =
            document.createElement("thead");

        const headerRow =
            document.createElement("tr");


        const columns =
            Object.keys(seStatistics[0]);


        columns.forEach(column => {

            const th =
                document.createElement("th");

            th.textContent =
                column;

            headerRow.appendChild(th);

        });


        thead.appendChild(headerRow);


        // ------------------------------------------------------------
        // Cuerpo
        // ------------------------------------------------------------

        const tbody =
            document.createElement("tbody");


        seStatistics.forEach(row => {

            const tr =
                document.createElement("tr");


            columns.forEach(column => {

                const td =
                    document.createElement("td");

                const value =
                    row[column];


                if (value === null) {

                    td.textContent = "";

                } else {

                    td.textContent =
                        value;
                }


                tr.appendChild(td);

            });


            tbody.appendChild(tr);

        });


        table.append(
            thead,
            tbody
        );


        const tableContainer =
    document.createElement("div");

tableContainer.className =
    "data-table-container";

tableContainer.appendChild(table);

content.appendChild(tableContainer);


        return {
            container,
            seStatistics
        };


    } catch (error) {

        console.error(
            "Error loading statistics:",
            error
        );

        status.textContent =
            "Error loading statistics."; 

        log(
            `Error loading statistics: ${error.message}`
        );


        return {
            container,
            seStatistics: null
        };

    }
}