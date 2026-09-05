import { createModule } from "./module-template.js";


export async function initProcessedAbundanceModule({ webR, log }) {

    const {
        container,
        content
    } = createModule("Processed Abundance");


    const status =
        document.createElement("p");


    content.appendChild(status);


    try {

        const json =
            await webR.evalRString(
                "get_processed_abundance()"
            );


        const processedAbundance =
            JSON.parse(json);


        log(
            "Processed abundance received from R."
        );

        log(
            `Rows: ${processedAbundance.length}`
        );

        log(
            `Columns: ${Object.keys(processedAbundance[0]).length}`
        );


        status.textContent =
            `Lipid number: ${processedAbundance.length}`;


        console.log(
            "Raw abundance:",
            processedAbundance
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
            Object.keys(processedAbundance[0]);


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


        processedAbundance.forEach(row => {

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
            processedAbundance
        };


    } catch (error) {

        console.error(
            "Error loading processed abundance:",
            error
        );

        status.textContent =
            "Error loading processed abundance.";

        log(
            `Error loading processed abundance: ${error.message}`
        );


        return {
            container,
            processedAbundance: null
        };

    }
}