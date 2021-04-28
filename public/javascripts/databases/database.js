//TODO: TOM
import {db, initDatabase, JOBS_STORE_NAME, OFFLINE_JOBS_STORE_NAME} from "./indexedDB.js";


export function getJobs(callback) {
    if (navigator.onLine) {
        ajaxRequest('/job/list',async (jobsData) => {
            jobsData = [...jobsData,...await getJobs(true)];
            jobsData.forEach(job => {
                storeJob(job);
            });
            callback(jobsData);
        }, (e) => {
            console.log("its offline, can't get all jobs");
        }, (e) => {
            console.log("there was an error, can't get all jobs");
        }, 'get', null);
    } else {
        callback([...getJobs(),...getJob(jobId, true)]);
    }
}

export async function getThisJob(jobId, callback) {
    if (navigator.onLine) {
        await ajaxRequest(jobId+'/list',async (jobData) => {
            jobData = [...jobsData,...await getJob(jobId, true)];
            await storeJob(jobData);
            callback(jobData);
        }, (e) => {
            console.log("its offline, can't get all jobs");
        }, (e) => {
            console.log("there was an error, can't get all jobs");
        }, 'get', null);
    } else {
        callback([...await getJobs(),...await getJob(jobId, true)]);
    }
}

export async function saveJob(job, callback) {
    if (navigator.onLine) {
        await ajaxRequest('/job/create',async (data) => {
            await storeJob(data.job, false);
            window.location.href = data.job.url;
        }, (e) => {
            console.log("its offline, can't get all jobs");
            callback(e);
        }, (e) => {
            console.log("there was an error, can't get all jobs");
            callback(e);
        }, 'POST', job);
    } else {
        //await storeJob(job, true);
    }
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