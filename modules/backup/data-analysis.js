import {
    createModule
} from "./module-template.js";


export async function initDataAnalysisModule({
    webR,
    log
}) {

    const {
        container,
        controls,
        results
    } = createModule(
        "Data analysis"
    );


    const status =
        document.createElement("p");

    status.textContent =
        "Analysis module ready.";


    const runButton =
        document.createElement("button");

    runButton.type =
        "button";

    runButton.textContent =
        "Run analysis";


    controls.append(
        runButton
    );

    results.append(
        status
    );


    let resolveAnalysis;

    const analysisCompleted =
        new Promise(resolve => {
            resolveAnalysis = resolve;
        });


    runButton.addEventListener(
        "click",
        async () => {

            runButton.disabled =
                true;

            status.textContent =
                "Analysis completed.";

            resolveAnalysis();

            log(
                "Data analysis completed."
            );
        }
    );


    return {
        container,
        analysisCompleted
    };
}