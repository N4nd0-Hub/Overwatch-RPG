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

  const OFFICIAL_PORTRAIT_REPLACEMENTS=[{"name":"WUYANG","old":"https://liquipedia.net/commons/images/0/04/Wuyang_full_portrait.png","image":"assets/wuyang_portrait.webp"},{"name":"BRIGITTE","old":"https://www.geekalerts.com/u/Overwatch-Brigitte.jpg","image":"assets/brigitte_portrait.webp"},{"name":"ANA","old":"https://vignette3.wikia.nocookie.net/characterprofile/images/2/23/Ana_Amari.png/revision/latest?cb=20160712180933","image":"assets/ana_portrait.webp"},{"name":"LÚCIO","old":"https://overwiki.ru/images/e/e5/%D0%9B%D1%83%D1%81%D0%B8%D0%BE.png","image":"assets/lucio_portrait.webp"},{"name":"BAPTISTE","old":"https://static.wikia.nocookie.net/overwatch_gamepedia/images/0/00/OW2_Baptiste.png/revision/latest?cb=20241108201237","image":"assets/baptiste_portrait.webp"}];
  function upgradeStandardPortraits(snapshot) {
    let changed = false;
    for (const hero of snapshot.heroes) {
      const name = String(hero.name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
      for (const portrait of OFFICIAL_PORTRAIT_REPLACEMENTS) {
        const expected = portrait.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        if (name === expected && hero.image === portrait.old) {
          hero.image = portrait.image;
          changed = true;
          break;
        }
      }
    }
    return changed;
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
    if (stored != null) {
      const snapshot = validate(JSON.parse(stored));
      if (upgradeStandardPortraits(snapshot)) await write(snapshot);
      return snapshot;
    }

    // Primeira visita após a atualização: importar as fichas antigas sem apagá-las.
    const oldData = localStorage.getItem(RECORD_KEY);
    if (oldData == null) return null;
    const snapshot = validate(JSON.parse(oldData));
    upgradeStandardPortraits(snapshot);
    await write(snapshot);
    return snapshot;
  }

  window.OWStorage = Object.freeze({ read, write });
})();