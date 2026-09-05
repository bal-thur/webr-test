export function createModule(titleText) {

    const container =
        document.createElement("section");

    container.className =
        "module-shell";


    // ============================================================
    // Header
    // ============================================================

    const header =
        document.createElement("div");

    header.className =
        "module-header";


    const title =
        document.createElement("div");

    title.className =
        "header-text";

    title.textContent =
        titleText;


    header.appendChild(title);


    // ============================================================
    // Content
    // ============================================================

    const content =
        document.createElement("div");

    content.className =
        "content-container";


    const controls =
        document.createElement("div");

    controls.className =
        "module-controls";


    const results =
        document.createElement("div");

    results.className =
        "module-results";


    content.append(
        controls,
        results
    );


    // ============================================================
    // Module
    // ============================================================

    container.append(
        header,
        content
    );


    return {
        container,
        title,
        controls,
        results
    };
}