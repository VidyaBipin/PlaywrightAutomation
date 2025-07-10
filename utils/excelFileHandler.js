const XLSX = require("xlsx");
const fs = require("fs").promises;

class ExcelFileHandler {
  constructor(filePath) {
    this.FILE_PATH = filePath || `${process.cwd()}/resources/Testdata.xlsx`;
  }

  /**
   * Reads the workbook as a buffer and returns it as an XLSX object.
   */
  async _readWorkbook() {
    const fileBuffer = await fs.readFile(this.FILE_PATH);
    return XLSX.read(fileBuffer, { type: "buffer" });
  }

  /**
   * Writes the workbook back to the file asynchronously.
   */
  async _writeWorkbook(workbook) {
    const updatedBuffer = XLSX.write(workbook, { type: "buffer" });
    await fs.writeFile(this.FILE_PATH, updatedBuffer);
  }

  /**
   * Gets data from a cell in the Excel sheet.
   */
  async getDataFromExcel(sheetName, colNum, rowNum) {
    const workbook = await this._readWorkbook();
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

    const cellAddress = { c: colNum - 1, r: rowNum - 1 };
    const cellRef = XLSX.utils.encode_cell(cellAddress);
    const cell = sheet[cellRef];

    if (!cell) return "";

    switch (cell.t) {
      case "s":
        return cell.v;
      case "n":
        if (cell.z && cell.z.includes("d")) {
          const date = XLSX.SSF.parse_date_code(cell.v);
          return new Date(date.y, date.m - 1, date.d).toLocaleDateString();
        }
        return String(cell.v);
      case "b":
        return String(cell.v);
      case "d":
        return new Date(cell.v).toLocaleDateString();
      default:
        return String(cell.v);
    }
  }

  /**
   * Gets data from a cell based on a column name.
   */
  async getCellDataFromExcelByColumnName(sheetName, columnName, rowNum) {
    const workbook = await this._readWorkbook();
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

    const header = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
    if (!header) throw new Error(`Header row not found in sheet "${sheetName}"`);

    const colIndex = header.findIndex((h) => h.trim().toLowerCase() === columnName.trim().toLowerCase());
    if (colIndex === -1) throw new Error(`Column "${columnName}" not found`);

    const range = `${rowNum}:${rowNum}`;
    const row = XLSX.utils.sheet_to_json(sheet, { header: 1, range, raw: false })[0];
    if (!row) throw new Error(`Row "${rowNum}" not found`);

    return row[colIndex] !== undefined ? String(row[colIndex]) : "";
  }

  /**
   * Gets data from the sheet as a list of maps.
   */
  async getDataFromSheetAsListOfMaps(sheetName) {
    const workbook = await this._readWorkbook();
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

    return XLSX.utils.sheet_to_json(sheet, { defval: "" });
  }

  /**
   * Gets data by test name.
   */
  async getDataFromExcelByTestName(sheetName, testName) {
    const workbook = await this._readWorkbook();
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const headerRow = jsonData[0];
    const dataRows = jsonData.slice(1);

    for (const row of dataRows) {
      if (row[0]?.toString().trim().toLowerCase() === testName.toLowerCase()) {
        const testData = {};
        for (let i = 1; i < headerRow.length; i++) {
          const parameterName = headerRow[i]?.toString().trim();
          const parameterValue = row[i]?.toString().trim();
          if (parameterName) testData[parameterName] = parameterValue || "";
        }
        return testData;
      }
    }

    throw new Error(`Test name "${testName}" not found in the sheet "${sheetName}".`);
  }

  /**
   * Writes data to a cell in the Excel sheet.
   */
  async writeDataToExcel(sheetName, rowNum, colNum, value) {
    const workbook = await this._readWorkbook();
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

    const cellAddress = { c: colNum - 1, r: rowNum - 1 };
    const cellRef = XLSX.utils.encode_cell(cellAddress);

    let cellType = "s";
    if (typeof value === "number") cellType = "n";
    else if (typeof value === "boolean") cellType = "b";
    else if (value instanceof Date) cellType = "d";

    sheet[cellRef] = { t: cellType, v: value };

    if (!sheet["!ref"]) {
      sheet["!ref"] = `${cellRef}:${cellRef}`;
    } else {
      const range = XLSX.utils.decode_range(sheet["!ref"]);
      range.s.r = Math.min(range.s.r, rowNum - 1);
      range.e.r = Math.max(range.e.r, rowNum - 1);
      range.s.c = Math.min(range.s.c, colNum - 1);
      range.e.c = Math.max(range.e.c, colNum - 1);
      sheet["!ref"] = XLSX.utils.encode_range(range);
    }

    await this._writeWorkbook(workbook);
  }
}

module.exports = ExcelFileHandler;
// // Usage example:
// const excelHandler = new ExcelFileHandler('path/to/your/excel/file.xlsx');

// // Example usage:
// (async () => {
//   try {
//     const data = await excelHandler.getDataFromSheetAsListOfMaps('Sheet1');
//     console.log(data);
//   } catch (error) {
//     console.error(error);
//   }
// })();