import { formatBytes } from "../utils.js";

export class FileTable extends HTMLTableElement {
  constructor() {
    super();
    this.classList.add("file-table");
    this.dataRows = [];
  }

  get loadingRow() {
    return this.querySelector("tr.loading");
  }

  static init() {
    customElements.define("file-table", FileTable, { extends: "table" });
  }

  toggleLoading(active) {
    if (active) {
      this.tBodies[0].querySelectorAll("tr").forEach((row) => row.remove());
      this.tBodies[0].appendChild(this.generateLoadingRow());
    } else {
      this.loadingRow.remove();
      if (this.dataRows.length > 0) {
        this.dataRows.forEach((row) => {
          this.tBodies[0].appendChild(row);
        });
      } else {
        this.tBodies[0].appendChild(this.generateNoDataRow());
      }
    }
  }

  updateFiles(projectId, documentXMLEls) {
    this.dataRows = [];
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
      this.dataRows.push(rowEl);
    });
    this.toggleLoading(false);
  }

  generateLoadingRow() {
    const row = document.createElement("tr");
    row.classList.add("loading");
    this.tHead.querySelectorAll("th").forEach(() => {
      const cell = document.createElement("td");
      const div = document.createElement("div");
      div.innerHTML = "&nbsp;";
      cell.appendChild(div);
      row.appendChild(cell);
    });
    return row;
  }

  generateNoDataRow() {
    const cell = document.createElement("td");
    cell.textContent = window.gettext("No file yet");
    cell.setAttribute("colspan", "4");
    const row = document.createElement("tr");
    row.classList.add("no_data");
    row.appendChild(cell);
    return row;
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
