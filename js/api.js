/* API layer. The screen only calls fetchRows(idNo). Everything about the connection lives here and in js/config.js. */
(function () {
  const C = () => window.AGENT360;

  /* Turn any Denodo style response into an array of flat rows. */
  function extractRows(json) {
    if (Array.isArray(json)) return json;
    for (const k of C().responseRowPaths) if (json && Array.isArray(json[k])) return json[k];
    return [];
  }

  /* Make sure every row has all 432 columns. Missing or "<null>" values become real nulls, so the screen can show Null. */
  function fillNulls(row) {
    const out = {};
    window.ALL_COLUMNS.forEach(c => { const v = row[c]; out[c] = (v === undefined || v === "<null>" || v === "") ? null : v; });
    Object.keys(row).forEach(k => { if (!(k in out)) out[k] = (row[k] === "<null>" || row[k] === "") ? null : row[k]; });   /* keeps proposed columns */
    if (row.__ext) { Object.assign(out, row.__ext); delete out.__ext; }
    return out;
  }

  /* Returns { rows, source, reason }. source is "mock", "api" or "backup". */
  async function fetchRows(idNo) {
    if (C().useMock) {
      await new Promise(r => setTimeout(r, 400));                 /* feels like a network call */
      const rows = window.MOCK_ROWS[idNo] || (idNo === C().backup.sampleId ? window.BACKUP_ROWS : []);
      return { rows: rows.map(fillNulls), source: "mock" };
    }
    try {
      const a = C().api, url = new URL(a.path, a.baseUrl);
      Object.entries(a.extraParams || {}).forEach(([k, v]) => url.searchParams.set(k, v));
      url.searchParams.set(a.searchParam, idNo);
      const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), a.timeoutMs);
      try {
        const res = await fetch(url, { method: a.method, headers: a.headers, signal: ctl.signal });
        if (!res.ok) throw new Error("The API returned " + res.status + ".");
        return { rows: extractRows(await res.json()).map(fillNulls), source: "api" };
      } finally { clearTimeout(timer); }
    } catch (e) {
      const reason = e.name === "AbortError" ? "The API did not answer in time." : (e.message || "The API could not be reached.");
      const b = C().backup;
      if (b && b.enabled && window.BACKUP_ROWS && (!b.matchIdOnly || idNo === b.sampleId)) return { rows: window.BACKUP_ROWS.map(fillNulls), source: "backup", reason };
      throw new Error(reason);
    }
  }

  window.Agent360Api = { fetchRows, extractRows, fillNulls };
})();
