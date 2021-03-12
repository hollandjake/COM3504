import * as idb from '../idb/index.js';

let db;

const PIDS_DB_NAME= 'db_pids';
const PIDS_STORE_NAME= 'store_pids';
const LOG = false;

/**
 * it inits the database
 */
async function initDatabase(){
    if (!db) {
        db = await idb.openDB(PIDS_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(PIDS_STORE_NAME)) {
                    let pidsDB = upgradeDb.createObjectStore(PIDS_STORE_NAME, {
                        keyPath: 'PID'
                    });
                }
            }
        });
        if (LOG) console.log('db created');
    }
}
window.initDatabase= initDatabase;

/**
 * it saves a PID into the indexedDB otherwise it uses local storage
 * @param PID
 * @param value
 */
async function storePID(PID, value) {
    let data = {};
    data.value = value;
    data.PID = PID;
    if (LOG) console.log('inserting: '+JSON.stringify(data));
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction(PIDS_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(PIDS_STORE_NAME);
            await store.put(data);
            await  tx.complete;
            if (LOG) console.log('added item to the store! '+ JSON.stringify(data));
        } catch(error) {
            localStorage.setItem(PID, JSON.stringify(data));
        };
    }
    else localStorage.setItem(PID, JSON.stringify(data));
}
window.storePID= storePID;

/**
 * it retrieves the PID
 * @param PID
 * @returns value
 */
async function getPID(PID) {
    if (!db)
        await initDatabase();
    let value;
    if (db) {
        try {
            let tx = await db.transaction(PIDS_STORE_NAME, 'readonly');
            let store = await tx.objectStore(PIDS_STORE_NAME);
            const resultObject = await store.get(PID);
            if (LOG) console.log(resultObject);
            await tx.complete;
            if (resultObject && resultObject.value) {
                value = resultObject.value;
            } else {
                const valueLocal = localStorage.getItem(PID).value;
                if (valueLocal == null)
                    if (LOG) console.log('local storage for '+PID+' does not exist');
                else
                    value = valueLocal;
            }
        } catch (error) {
            if (LOG) console.log(error);
        }
    } else {
        const valueLocal = localStorage.getItem(PID).value;
        if (valueLocal == null)
            if (LOG) console.log('local storage for '+PID+' does not exist');
        else
            value = valueLocal;
    }
    return value;
}
window.getPID= getPID;

