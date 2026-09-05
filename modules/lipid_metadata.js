import { createModule } from "./module-template.js";


export async function initLipidMetadataModule({ webR, log }) {

    const {
        container,
        content
    } = createModule("Lipid metadata");


    const status =
        document.createElement("p");


    content.appendChild(status);


    try {

        const json =
            await webR.evalRString(
                "get_lipid_metadata()"
            );


        const lipidMetadata =
            JSON.parse(json);


        log(
            "Lipid metadata received from R."
        );


        console.log(
            "Lipid metadata:",
            lipidMetadata
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
            Object.keys(lipidMetadata[0]);


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


        lipidMetadata.forEach(row => {

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
            lipidMetadata
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
            lipidMetadata: null
        };

    }
}