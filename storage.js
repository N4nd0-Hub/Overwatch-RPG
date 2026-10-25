(function () {
  "use strict";
  const DB_NAME = "OverwatchRPGData";
  const STORE_NAME = "sheets";
  const RECORD_KEY = "overwatch_rpg_sheet_v1";
  let openPromise;
  let writeQueue = Promise.resolve();

  function openDb() {
    if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB não está disponível neste navegador."));
    if (openPromise) return openPromise;
    openPromise = new Promise((resolve, reject) => {
      let request;
      try { request = indexedDB.open(DB_NAME, 1); }
      catch (error) { reject(error); return; }
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); openPromise = undefined; };
        resolve(db);
      };
      request.onerror = () => reject(request.error || new Error("Falha ao abrir o banco de fichas."));
      request.onblocked = () => reject(new Error("Outra aba está bloqueando a atualização do banco de fichas."));
    }).catch(error => { openPromise = undefined; throw error; });
    return openPromise;
  }

  function getRaw(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(RECORD_KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("Não foi possível ler as fichas."));
      tx.onabort = () => reject(tx.error || new Error("Leitura das fichas interrompida."));
    });
  }

  function putRaw(db, raw) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(raw, RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("Falha ao salvar fichas."));
      tx.onabort = () => reject(tx.error || new Error("Gravação das fichas interrompida."));
    });
  }

  function validate(snapshot) {
    if (!snapshot || !Array.isArray(snapshot.heroes)) throw new Error("O arquivo salvo tem formato incompatível.");
    return snapshot;
  }

  function write(snapshot) {
    // Captura o conteúdo imediatamente; as gravações posteriores ficam na ordem correta.
    const raw = typeof snapshot === "string" ? snapshot : JSON.stringify(validate(snapshot));
    const operation = writeQueue.catch(() => {}).then(async () => {
      const db = await openDb();
      await putRaw(db, raw);
      // Só remove a versão antiga após confirmar a gravação integral no IndexedDB.
      try { localStorage.removeItem(RECORD_KEY); } catch (_) {}
    });
    writeQueue = operation;
    return operation;
  }

  async function read() {
    await writeQueue.catch(() => {});
    const db = await openDb();
    const stored = await getRaw(db);
    if (stored != null) return validate(JSON.parse(stored));

    // Primeira visita após a atualização: importar as fichas antigas sem apagá-las.
    const oldData = localStorage.getItem(RECORD_KEY);
    if (oldData == null) return null;
    const snapshot = validate(JSON.parse(oldData));
    await write(snapshot);
    return snapshot;
  }

  window.OWStorage = Object.freeze({ read, write });
})();