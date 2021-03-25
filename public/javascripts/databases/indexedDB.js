import * as idb from '../idb/index.js';

let db;

const DB_NAME= 'db';
const PIDS_STORE_NAME= 'store_pids';
const JOBS_STORE_NAME= 'store_jobs';
const LOG = false;

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
                        keyPath: 'jobID'
                    });
                }
            }
        });
        if (LOG) console.log('db created');
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
        }
    }
    else localStorage.setItem(PID, JSON.stringify(data));
}

/**
 * it retrieves the PID
 * @param PID
 * @returns value
 */
export async function getPID(PID) {
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
    let data = {};
    data.jobID = job.id;
    data.creator = job.creator;
    data.name = job.name;
    data.imageSequence = [];
    job.imageSequence.forEach((image) => {
        let imageData = {};
        imageData.author = image.author;
        imageData.description = image.description;
        imageData.title = image.title;
        imageData.imageUrl = image.imageUrl;
        imageData.id = image.id;
        data.imageSequence.push(imageData);
    });

    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction(JOBS_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(JOBS_STORE_NAME);
            await store.put(data);
            await  tx.complete;
        } catch(error) {
            localStorage.setItem(data.jobID, JSON.stringify(data));
        }
    }
    else localStorage.setItem(data.jobID, JSON.stringify(data));
}

/**
 * it inserts an image into an existing job
 * @param {String} jobID
 * @param {Object} image
 * @param {String} image.author
 * @param {String} image.description
 * @param {String} image.title
 * @param {String} image.imageUrl
 * @param {String} image.id
 */
export async function storeNewImage(jobID, image) {
    let job = await getJob(jobID);
    let newImage = {};
    newImage.author = image.author;
    newImage.description = image.description;
    newImage.title = image.title;
    newImage.imageUrl = image.imageUrl;
    newImage.id = image.id;
    job.imageSequence.push(newImage)

    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction(JOBS_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(JOBS_STORE_NAME);
            await store.put(job);
            await  tx.complete;
        } catch(error) {
            localStorage.setItem(job.jobID, JSON.stringify(job));
        }
    }
    else localStorage.setItem(job.jobID, JSON.stringify(job));
}

/**
 * it retrieves the job
 * @param {String} jobID
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
export async function getJob(jobID) {
    if (!db)
        await initDatabase();
    let job;
    if (db) {
        try {
            let tx = await db.transaction(JOBS_STORE_NAME, 'readonly');
            let store = await tx.objectStore(JOBS_STORE_NAME);
            const resultObject = await store.get(jobID);
            await tx.complete;
            if (resultObject) {
                job = resultObject;
            } else {
                const jobLocal = localStorage.getItem(jobID);
                if (jobLocal !== null)
                    job = JSON.parse(jobLocal);
            }
        } catch (error) {
            if (LOG) console.log(error);
        }
    } else {
        const jobLocal = localStorage.getItem(jobID);
        if (jobLocal !== null)
            job = JSON.parse(jobLocal);
    }
    return job;
}