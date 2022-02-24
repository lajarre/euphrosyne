import { formatBytes } from "../utils.js";

export class FileTable extends HTMLTableElement {
  constructor() {
    super();
  }

  static init() {
    customElements.define("file-table", FileTable, { extends: "table" });
  }

  toggleLoading(active) {
    if (active) {
      this.querySelectorAll("tbody tr:not(.loading)").forEach(
        (el) => (el.style.display = "none")
      );
      this.querySelector("tbody tr.loading").style.display = "";
    } else {
      const tableRows = this.querySelectorAll("tbody tr:not(.loading)");
      tableRows.forEach((el) => (el.style.display = ""));
      if (tableRows.length > 1) {
        document.querySelector("tr.no_data").style.display = "none";
      }
      this.querySelector("tbody tr.loading").style.display = "none";
    }
  }

  updateFiles(projectId, documentXMLEls) {
    const tableBodyEl = this.tBodies[0];
    this.toggleLoading(false);
    tableBodyEl.querySelectorAll(".document-row").forEach((el) => el.remove());
    if (documentXMLEls.length) {
      document.querySelector("tr.no_data").style.display = "none";
      documentXMLEls.forEach((documentEl) => {
        const rowEl = this.insertRow(-1);
        rowEl.classList.add("document-row");

        const keyCell = rowEl.insertCell(),
          keyCellText = document.createTextNode(
            decodeURIComponent(
              documentEl.querySelector("Key").textContent.split("/").pop()
            )
          );
        keyCell.appendChild(keyCellText);

        const lastModifiedCell = rowEl.insertCell(),
          lastModifiedCellText = document.createTextNode(
            new Date(
              documentEl.querySelector("LastModified").textContent
            ).toLocaleDateString()
          );
        lastModifiedCell.appendChild(lastModifiedCellText);

        const sizeCell = rowEl.insertCell(),
          sizeCellText = document.createTextNode(
            formatBytes(
              parseInt(documentEl.querySelector("Size").textContent || "0")
            )
          );
        sizeCell.appendChild(sizeCellText);

        const actionsText = rowEl.insertCell();
        actionsText.appendChild(
          this.generateActionCellContent(
            projectId,
            documentEl.querySelector("Key").textContent
          )
        );
      });
    } else {
      document.querySelector("tr.no_data").style.display = "";
    }
  }

  generateActionCellContent(projectId, key) {
    const downloadButton = document.createElement("button");
    downloadButton.classList.add(
      "download-btn",
      "fr-btn",
      "fr-fi-download-line",
      "fr-btn--secondary"
    );
    downloadButton.textContent = window.gettext("Download file");
    downloadButton.title = window.gettext("Download file");
    downloadButton.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("download-click", { detail: { projectId, key } })
      );
    });
    const downloadListItem = document.createElement("li");
    downloadListItem.appendChild(downloadButton);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add(
      "delete-btn",
      "fr-btn",
      "fr-fi-delete-line",
      "fr-btn--secondary"
    );
    deleteButton.textContent = window.gettext("Delete file");
    deleteButton.title = window.gettext("Delete file");
    deleteButton.addEventListener("click", () =>
      this.dispatchEvent(
        new CustomEvent("delete-click", { detail: { projectId, key } })
      )
    );
    const deleteListItem = document.createElement("li");
    deleteListItem.appendChild(deleteButton);

    const unorderedList = document.createElement("ul");
    unorderedList.classList.add(
      "fr-btns-group",
      "fr-btns-group--inline",
      "fr-btns-group--sm"
    );
    unorderedList.appendChild(downloadListItem);
    unorderedList.appendChild(deleteListItem);

    return unorderedList;
  }
}
