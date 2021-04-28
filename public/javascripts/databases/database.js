//TODO: TOM
import {db, initDatabase, JOBS_STORE_NAME, OFFLINE_JOBS_STORE_NAME} from "./indexedDB.js";


export function getJobs(callback) {
    //TODO: RETURN CACHE DATA (IDB_server and IDB_offline)
    //TODO: IF (ONLINE):
    //TODO:     FETCH FROM SERVER
    //TODO:     ON RESPONSE -> SAVE EACH JOB TO IDB_server
    //TODO:                 -> RETURN SERVER OBJECT
    //TODO: ELSE:
    //TODO:     DO NOTHING THE CLIENT HAS THE LATEST DATA IT CAN GET
}

//TODO: TOM
export function getJob(jobId, callback) {
    //TODO: RETURN CACHE JOB FROM EITHER (IDB_server or IDB_offline)
    //TODO: IF (ONLINE):
    //TODO:     FETCH FROM SERVER
    //TODO:     ON RESPONSE -> SAVE TO IDB_server
    //TODO:                 -> RETURN SERVER OBJECT
    //TODO: ELSE:
    //TODO:     DO NOTHING THE CLIENT HAS THE LATEST DATA IT CAN GET
}

//TODO: TOM
export function saveJob(job) {
    // $.ajax({
    //     url: "dsada",
    //     statusCode: {
    //         0: () => {
    //             //TODO: OFFLINE
    //         }
    //     },
    //     error: () => {
    //         //TODO: SERVER RETURNS AN ERROR
    //     }
    // })
    //TODO: IF (ONLINE):
    //TODO:     SEND TO SERVER
    //TODO:     ON RESPONSE -> SAVE TO IDB_server
    //TODO:                 -> RETURN SERVER OBJECT
    //TODO: ELSE:
    //TODO:     STORE IN IDB_offline
    //TODO:     RETURN CACHED OBJECT
}

//TODO: JAKE
export function saveImage(jobId, imageForm, imageData, onsuccess, onerror) {
    ajaxRequest(
        'POST',
        `/job/add-image?id=${jobId}`,
        async (data) => {
            let job = await getFromCache(JOBS_STORE_NAME, jobId);
            if (job) {
                job.imageSequence.push(data);
                await saveToCache(JOBS_STORE_NAME, jobId, job);
            }
            return data;
        },
        async () => {
            let job = await getFromCache(OFFLINE_JOBS_STORE_NAME, jobId);

            //TODO: STORE IN IDB_offline
            //TODO: RETURN CACHED OBJECT
        },
        (e) => onerror(e['responseJSON']),
        imageForm
    )
}

//TODO: BILLY
export function pushingToServer() {
    //TODO: FOR EACH CACHED_JOB in IDB_offline:
    //TODO:     obj = REMOVE OBJ FROM IDB_offline
    //TODO:     AJAX SEND TO SERVER saveJob(obj, callback)

    //TODO: FOR EACH CACHED_IMAGE in IDB_offline:
    //TODO:     obj = REMOVE OBJ FROM IDB_offline
    //TODO:     AJAX SEND TO SERVER saveImage(jobId, obj, callback)
}

/**
 *
 * @param {string} type
 * @param {string} url
 * @param {function} onsuccess
 * @param {function} onoffline
 * @param {function} onerror
 * @param {json} data
 */
export function ajaxRequest(type, url, onsuccess, onoffline, onerror, data = null) {
    $.ajax({
        url: url,
        type: type,
        data: data,
        processData: false,
        contentType: false,
        success: onsuccess,
        error: (response) => {
            if (response.statusCode === 0) {
                onoffline(response);
            } else {
                onerror(response);
            }
        },
    })
}

async function getAllFromCache(store) {
    return await executeOnCache(
        store,
        'readonly',
        (store) => store.getAll(),
        (localStore) => localStore.getItem(id)
    )
}

async function getFromCache(store, id) {
    return await executeOnCache(
        store,
        'readonly',
        (storeName) => {
            return storeName.get(id) || localStorage.getItem(`${storeName}_${id}`)
        },
        (localStore) => localStore.getItem(id)
    )
}

async function saveToCache(storeName, id, object) {
    await executeOnCache(storeName, 'readwrite', (store) => {
        store.put(object);
    }, (localStore) => {
        localStore.setItem(`${storeName}_${id}`, JSON.stringify(object));
    })
}

async function executeOnCache(storeName, mode, idbOperation, localStorageOperation) {
    if (!db) {
        await initDatabase();
    }

    if (db) {
        try {
            let tx = await db.transaction(storeName, mode);
            let store = await tx.objectStore(storeName);
            await idbOperation(store);
            await tx.complete;
        } catch (error) {
            localStorageOperation(localStorage);
        }
    } else {
        localStorageOperation(localStorage);
    }
}