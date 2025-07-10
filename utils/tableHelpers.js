class TableHelper {

  /**
   * Check if the table is empty.
   * @param {Locator} tableLocator
   * @returns {Promise<boolean>}
   */
  async isTableEmpty(tableLocator) {
    const rowCount = await this.getRowCount(tableLocator);
    return rowCount === 0;
  }

  /**
   * Verify the table headers match the expected values.
   * @param {Locator} tableLocator
   * @param {string[]} expectedHeaders
   * @returns {Promise<boolean>}
   */
  async verifyTableHeaders(tableLocator, expectedHeaders) {
    const headers = tableLocator.locator('thead th');
    const headerTexts = await headers.allTextContents();
    return JSON.stringify(headerTexts) === JSON.stringify(expectedHeaders);
  }

  /**
   * Get all column values based on the column header.
   * @param {Locator} tableLocator
   * @param {string} columnHeader
   * @returns {Promise<string[]>}
   */
  async getColumnValuesByHeader(tableLocator, columnHeader) {
    const headers = tableLocator.locator('thead th');
    const headerTexts = await headers.allTextContents();
    const colIndex = headerTexts.indexOf(columnHeader);
    if (colIndex === -1) {
      throw new Error(`Column header "${columnHeader}" not found`);
    }
    const columnCells = tableLocator.locator(`tbody tr td:nth-child(${colIndex + 1})`);
    return columnCells.allTextContents();
  }

  /**
   * Get the index of a column by its header name.
   * @param {Locator} tableLocator
   * @param {string} columnHeader
   * @returns {Promise<number>}
   */
  async getColumnIndexByHeader(tableLocator, columnHeader) {
    const headers = await tableLocator.locator('thead th').allTextContents();
    const index = headers.indexOf(columnHeader);
    if (index === -1) {
      throw new Error(`Column header "${columnHeader}" not found`);
    }
    return index;
  }

  /**
   * Get all text from a specific column.
   * @param {Locator} tableLocator
   * @param {number} colIndex
   * @returns {Promise<string[]>}
   */
  async getColumnText(tableLocator, colIndex) {
    const cells = tableLocator.locator(`tbody tr td:nth-child(${colIndex + 1})`);
    return cells.allTextContents();
  }

  /**
   * Get the total row count of the table.
   * @param {Locator} tableLocator
   * @returns {Promise<number>}
   */
  async getRowCount(tableLocator) {
    const rows = tableLocator.locator('tbody tr');
    return rows.count();
  }

  /**
   * Validate the number of rows in the table matches the expected count.
   * @param {Locator} tableLocator
   * @param {number} expectedRowCount
   * @returns {Promise<boolean>}
   */
  async validateRowCount(tableLocator, expectedRowCount) {
    const rowCount = await this.getRowCount(tableLocator);
    return rowCount === expectedRowCount;
  }

  /**
   * Find a row index based on a cell's exact value.
   * @param {Locator} tableLocator
   * @param {string} cellText
   * @returns {Promise<number>}
   */
  async getRowIndexByCellValue(tableLocator, cellText) {
    const rows = tableLocator.locator('tbody tr');
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cellTexts = await row.locator('td').allTextContents();
      if (cellTexts.some(text => text.trim() === cellText.trim())) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Get all row values when a specific cell text is matched.
   * @param {Locator} tableLocator
   * @param {string} searchText
   * @returns {Promise<string[]>}
   */
  async getRowValuesWhenCellTextIsMatched(tableLocator, searchText) {
    const rows = tableLocator.locator('tbody tr');
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');
      const cellTexts = await cells.allTextContents();
      if (cellTexts.some(cellText => cellText.includes(searchText))) {
        return cellTexts;
      }
    }

    throw new Error(`No row found with cell text matching "${searchText}"`);
  }

  /**
   * Get row values as an object (HashMap) with column headers as keys
   * and cell values as values when a specific cell text is fully matched.
   * @param {Locator} tableLocator
   * @param {string} searchText
   * @returns {Promise<Object>}
   */
  async getRowValuesAsHashMapWithExactMatch(tableLocator, searchText) {
    const headers = await tableLocator.locator('thead th').allTextContents();
    const rows = tableLocator.locator('tbody tr');
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');
      const cellTexts = await cells.allTextContents();
      if (cellTexts.some(cellText => cellText.trim() === searchText.trim())) {
        const rowHashMap = {};
        headers.forEach((header, index) => {
          rowHashMap[header] = cellTexts[index] || null;
        });
        return rowHashMap;
      }
    }

    throw new Error(`No row found with cell text fully matching "${searchText}"`);
  }

  /**
   * Get row values as an object (HashMap) with column headers as keys
   * and cell values as values when a specific cell text is matched.
   * @param {Locator} tableLocator
   * @param {string} searchText
   * @returns {Promise<Object>}
   */
  async getRowValuesAsHashMapWithPartialMatch(tableLocator, searchText) {
    const headers = await tableLocator.locator('thead th').allTextContents();
    const rows = tableLocator.locator('tbody tr');
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');
      const cellTexts = await cells.allTextContents();
      if (cellTexts.some(cellText => cellText.includes(searchText))) {
        const rowHashMap = {};
        headers.forEach((header, index) => {
          rowHashMap[header] = cellTexts[index] || null;
        });
        return rowHashMap;
      }
    }

    throw new Error(`No row found with cell text matching "${searchText}"`);
  }

  /**
   * Get a specific cell value using row and column headers.
   * @param {Locator} tableLocator
   * @param {string} rowHeader
   * @param {string} columnHeader
   * @returns {Promise<string>}
   */
  async getCellValueByHeaders(tableLocator, rowHeader, columnHeader) {
    const columnHeaders = await tableLocator.locator('thead th').allTextContents();
    const columnIndex = columnHeaders.indexOf(columnHeader);

    if (columnIndex === -1) {
      throw new Error(`Column header "${columnHeader}" not found`);
    }

    const rows = tableLocator.locator('tbody tr');
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const firstCellText = await row.locator('td').nth(0).textContent();
      if (firstCellText && firstCellText.trim() === rowHeader.trim()) {
        return await row.locator('td').nth(columnIndex).textContent();
      }
    }

    throw new Error(`Row header "${rowHeader}" not found`);
  }

  

}

module.exports = TableHelper;