import { createModule } from "./module-template.js";


export async function initRawAbundanceModule({ webR, log }) {

    const {
        container,
        controls,
        results
    } = createModule("Abundance");


    const status =
        document.createElement("p");

    status.textContent =
        "Loading raw abundance...";

    results.appendChild(status);


    try {

        const json =
            await webR.evalRString(
                "get_raw_abundance()"
            );


        const rawAbundance =
            JSON.parse(json);


        log(
            "Raw abundance received from R."
        );

        log(
            `Rows: ${rawAbundance.length}`
        );

        log(
            `Columns: ${Object.keys(rawAbundance[0]).length}`
        );


        status.textContent =
            `Lipid number: ${rawAbundance.length}`;


        console.log(
            "Raw abundance:",
            rawAbundance
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
            Object.keys(rawAbundance[0]);


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


        rawAbundance.forEach(row => {

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

results.appendChild(tableContainer);


        return {
            container,
            rawAbundance
        };


    } catch (error) {

        console.error(
            "Error loading raw abundance:",
            error
        );

        status.textContent =
            "Error loading raw abundance.";

        log(
            `Error loading raw abundance: ${error.message}`
        );


        return {
            container,
            rawAbundance: null
        };

    }
}