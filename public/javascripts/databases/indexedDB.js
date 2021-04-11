import * as idb from '../idb/index.js';

let db;

const DB_NAME= 'db';
const PIDS_STORE_NAME= 'store_pids';
const JOBS_STORE_NAME= 'store_jobs';

/**
 * it inits the database
 */
export async function initDatabase(){
    if (!db) {
        db = await idb.openDB(DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(PIDS_STORE_NAME)) {
                    upgradeDb.createObjectStore(PIDS_STORE_NAME, {
                        keyPath: 'PID'
                    });
                    upgradeDb.createObjectStore(JOBS_STORE_NAME, {
                        keyPath: 'id'
                    });
                }
            }
        });
    }
}

/**
 * it saves a PID into the indexedDB otherwise it uses local storage
 * @param PID
 * @param value
 */
export async function storePID(PID, value) {
    let data = {};
    data.value = value;
    data.PID = PID;

    if (!db) {
        await initDatabase();
    }
    if (db) {
        try{
            let tx = await db.transaction(PIDS_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(PIDS_STORE_NAME);
            await store.put(data);
            await  tx.complete;
        } catch(error) {
            localStorage.setItem(PID, JSON.stringify(data));
        }
    }
    else {
        localStorage.setItem(PID, JSON.stringify(data));
    }
}

/**
 * it retrieves the PID
 * @param PID
 * @returns value
 */
export async function getPID(PID) {
    if (!db) {
        await initDatabase();
    }
    let value;
    if (db) {
        try {
            let tx = await db.transaction(PIDS_STORE_NAME, 'readonly');
            let store = await tx.objectStore(PIDS_STORE_NAME);
            const resultObject = await store.get(PID);
            await tx.complete;
            if (resultObject && resultObject.value) {
                value = resultObject.value;
            } else {
                const valueLocal = localStorage.getItem(PID).value;
                if (valueLocal !== null) {
                    value = valueLocal;
                }
            }
        } catch (error) {}
    } else {
        const valueLocal = localStorage.getItem(PID).value;
        if (valueLocal !== null) {
            value = valueLocal;
        }
    }
    return value;
}

/**
 * it saves a job into the indexedDB otherwise it uses local storage
 * @param {Object} job
 * @param {String} job.id
 * @param {String} job.name
 * @param {String} job.creator
 * @param {Object[]} job.imageSequence
 * @param {String} job.imageSequence.author
 * @param {String} job.imageSequence.description
 * @param {String} job.imageSequence.title
 * @param {String} job.imageSequence.imageUrl
 * @param {String} job.imageSequence.id
 */
export async function storeJob(job) {
    if (!db) {
        await initDatabase();
    }

    if (db) {
        try{
            let tx = await db.transaction(JOBS_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(JOBS_STORE_NAME);
            await store.put(job);
            await  tx.complete;
        } catch(error) {
            localStorage.setItem(job.id, JSON.stringify(job));
        }
    }
    else {
        localStorage.setItem(job.id, JSON.stringify(job));
    }
}

/**
 * it inserts an image into an existing job
 * @param {String} jobId
 * @param {Object} image
 * @param {String} image.author
 * @param {String} image.description
 * @param {String} image.title
 * @param {String} image.imageUrl
 * @param {String} image.id
 */
export async function storeNewImage(jobId, image) {
    let job = await getJob(jobId);
    job.imageSequence.push(image);

    if (!db) {
        await initDatabase();
    }
    if (db) {
        try{
            let tx = await db.transaction(JOBS_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(JOBS_STORE_NAME);
            await store.put(job);
            await  tx.complete;
        } catch(error) {
            localStorage.setItem(job.id, JSON.stringify(job));
        }
    }
    else {
        localStorage.setItem(job.id, JSON.stringify(job));
    }
}

export async function updateImageWithAnnotations(jobId, newImage) {
    let job = await getJob(jobId);

    job.imageSequence = job.imageSequence.map(image => {
        if (image._id === newImage._id) {
            return newImage;
        }
        return image;
    })
    job.imageSequence.push(newImage);

    if (!db) {
        await initDatabase();
    }
    if (db) {
        try{
            let tx = await db.transaction(JOBS_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(JOBS_STORE_NAME);
            await store.put(job);
            await  tx.complete;
        } catch(error) {
            localStorage.setItem(job.id, JSON.stringify(job));
        }
    }
    else {
        localStorage.setItem(job.id, JSON.stringify(job));
    }
}

export async function storeChatMessage(jobId, imageId, chatObj) {
    let job = await getJob(jobId);
    job.imageSequence.forEach(image => {
        if (image._id == imageId) {
            image.chat.push(chatObj);
        }
    })

    if (!db) {
        await initDatabase();
    }
    if (db) {
        try{
            let tx = await db.transaction(JOBS_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(JOBS_STORE_NAME);
            await store.put(job);
            await  tx.complete;
        } catch(error) {
            localStorage.setItem(job.id, JSON.stringify(job));
        }
    }
    else {
        localStorage.setItem(job.id, JSON.stringify(job));
    }
}

/**
 * it retrieves the job
 * @param {String} jobId
 * @returns {Object} job
 * @returns {String} job.id
 * @returns {String} job.name
 * @returns {String} job.creator
 * @returns {Object[]} job.imageSequence
 * @returns {String} job.imageSequence.author
 * @returns {String} job.imageSequence.description
 * @returns {String} job.imageSequence.title
 * @returns {String} job.imageSequence.imageUrl
 */
export async function getJob(jobId) {
    if (!db) {
        await initDatabase();
    }
    let job;
    if (db) {
        try {
            let tx = await db.transaction(JOBS_STORE_NAME, 'readonly');
            let store = await tx.objectStore(JOBS_STORE_NAME);
            const resultObject = await store.get(jobId);
            await tx.complete;
            if (resultObject) {
                job = resultObject;
            } else {
                const jobLocal = localStorage.getItem(jobId);
                if (jobLocal !== null) {
                    job = JSON.parse(jobLocal);
                }
            }
        } catch (error) {}
    } else {
        const jobLocal = localStorage.getItem(jobId);
        if (jobLocal !== null) {
            job = JSON.parse(jobLocal);
        }
    }
    return job;
}