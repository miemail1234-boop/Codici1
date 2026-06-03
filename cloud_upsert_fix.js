(() => {
  const originalUpsert = typeof upsertCloudRows === "function" ? upsertCloudRows : null;
  if (!originalUpsert) return;

  function keyForRow(table, row) {
    if (!row) return "";
    if (table === "app_settings" || !Object.prototype.hasOwnProperty.call(row, "id")) {
      return String(row.user_id || "");
    }
    return `${row.user_id || ""}::${row.id || ""}`;
  }

  function uniqueRows(table, rows) {
    if (!Array.isArray(rows)) return rows;
    const map = new Map();
    rows.forEach(row => {
      const key = keyForRow(table, row);
      if (!key) return;
      map.set(key, row);
    });
    return Array.from(map.values());
  }

  upsertCloudRows = async function patchedUpsertCloudRows(table, rows) {
    return originalUpsert(table, uniqueRows(table, rows));
  };
})();
