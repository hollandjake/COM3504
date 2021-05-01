import * as idb from '../idb/index.js';

let db;

const DB_NAME = 'db';
const PIDS = 'store_pids';
const JOBS = 'store_jobs';
const IMAGES = 'store_images';
const ANNOTATIONS = 'store_annotations';
const CHATS = 'store_chats';
const OFFLINE_JOBS = 'store_offline_jobs';
const OFFLINE_IMAGES = 'store_offline_images';

export async function getPID(key) {
    let cacheData = await getFromCache(PIDS, key);
    return cacheData ? cacheData.value : null;
}

export function savePID(key, value) {
    return saveToCache(PIDS, key, {key, value});
}

export function getJobs(onsuccess) {
    if (onsuccess) {
        getAllFromCache(JOBS)
            .then(async jobStoreData => [...jobStoreData, ...await getAllFromCache(OFFLINE_JOBS)])
            .then((data) => {
                onsuccess(data);
            })

        ajaxRequest(
            'GET',
            '/job/list',
            async (jobsData) => {
                jobsData.forEach(job => {
                    job._id = String(job._id);
                    saveToCache(JOBS, job._id, job)
                });
                onsuccess([...jobsData, ...await getAllFromCache(OFFLINE_JOBS)]);
            },
            async () => onsuccess([...await getAllFromCache(JOBS), ...await getAllFromCache(OFFLINE_JOBS)]),
            async () => onsuccess([...await getAllFromCache(JOBS), ...await getAllFromCache(OFFLINE_JOBS)])
        );
    }
}

export function getJob(jobId, onsuccess, onerror) {
    jobId = String(jobId);

    if (onsuccess) {
        getFromCache(JOBS, jobId)
            .then(async foundJob => {
                if (foundJob) return foundJob;
                return await getFromCache(OFFLINE_JOBS, jobId);
            })
            .then(foundJob => {
                if (foundJob) onsuccess(foundJob)
            });
    }

    if (!isNaN(jobId)) {
        ajaxRequest(
            'GET',
            `/job/list?id=${jobId}`,
            async (response) => {
                let jobData = response.job;
                if (!jobData) {
                    jobData = getFromCache(OFFLINE_JOBS, jobId);
                } else {
                    jobData._id = String(jobData._id);
                    await saveToCache(JOBS, jobData._id, jobData);
                }
                if (onsuccess && jobData) onsuccess(jobData)
            },
            async () => {
                let jobData = await getFromCache(JOBS, jobId);
                if (!jobData) {
                    jobData = await getFromCache(OFFLINE_JOBS, jobId);
                }
                if (onsuccess && jobData) onsuccess(jobData)
            },
            (e) => {
                if (onerror) onerror(('responseJSON' in e) ? e['responseJSON'] : {
                    error: "Something went wrong"
                })
            }
        );
    }
}

export function saveJob(jobForm, jobData, onsuccess, onerror) {
    ajaxRequest(
        'POST',
        '/job/create',
        async (data) => {
            data.job._id = String(data.job._id);
            await saveToCache(JOBS, data.job._id, data.job);
            onsuccess(data.job);
        },
        async () => {
            jobData._id = generateTempId();
            let imageObj = await new Promise((resolve, reject) => saveImage(jobForm, jobData, resolve, reject));
            console.log(imageObj);
            let jobObj = {
                _id: jobData._id,
                url: `/job?id=${jobData._id}`,
                name: jobData['job_name'],
                creator: jobData['job_creator'],
                imageSequence: [imageObj._id]
            }
            await saveToCache(OFFLINE_JOBS, jobObj._id, jobObj);
            console.log(await getFromCache(OFFLINE_JOBS, jobObj._id));
            onsuccess(jobObj);
        },
        (e) => {
            if (onerror) onerror(('responseJSON' in e) ? e['responseJSON'] : {
                error: "Something went wrong"
            })
        },
        jobForm
    );
}

export function saveImage(imageForm, imageData, onsuccess, onerror) {
    ajaxRequest(
        'POST',
        '/image/create',
        async (data) => {
            await saveToCache(IMAGES, data.image._id, data.image);
            if (onsuccess) onsuccess(data.image);
        },
        async () => {
            let imageObj = await generateTempImage(imageData);
            if (onsuccess) onsuccess(imageObj);
        },
        (e) => {
            if (onerror) onerror(('responseJSON' in e) ? e['responseJSON'] : {
                error: "Something went wrong"
            })
        },
        imageForm
    )
}

export function getImage(imageId, onsuccess, onerror) {
    if (onsuccess) {
        getFromCache(IMAGES, imageId)
            .then(async foundImage => {
                if (foundImage) return foundImage;
                return await getFromCache(OFFLINE_IMAGES, imageId);
            })
            .then(foundImage => {
                if (foundImage) onsuccess(foundImage)
            });
    }

    if (!isNaN(imageId)) {
        ajaxRequest(
            'GET',
            `/image?id=${imageId}`,
            async (data) => {
                await saveToCache(IMAGES, data.image._id, data.image);
                if (onsuccess) onsuccess(data.image);
            },
            null,
            (e) => {
                if (onerror) onerror(('responseJSON' in e) ? e['responseJSON'] : {
                    error: "Something went wrong"
                })
            }
        )
    }
}

export function saveJobImage(jobId, imageForm, imageData, onsuccess, onerror) {
    jobId = String(jobId);
    ajaxRequest(
        'POST',
        `/job/add-image?id=${jobId}`,
        async (data) => {
            let job = await getFromCache(JOBS, jobId);
            if (job) {
                await saveToCache(IMAGES, data._id, data);
                job.imageSequence.push(data._id);
                await saveToCache(JOBS, job._id, job);
            }
            if (onsuccess) onsuccess(data.image, true);
        },
        async () => {
            let job = await getFromCache(JOBS, jobId);
            let offlineJob = await getFromCache(OFFLINE_JOBS, jobId);
            let cachedImageData = await new Promise((resolve, reject) => saveImage(imageForm, imageData, resolve, reject));
            if (job) {
                job.imageSequence.push(cachedImageData._id);
                await saveToCache(JOBS, job._id, job);
            } else if (offlineJob) {
                offlineJob.imageSequence.push(cachedImageData._id);
                await saveToCache(OFFLINE_JOBS, offlineJob._id, offlineJob);
            }
            if (onsuccess) onsuccess(cachedImageData, false);
        },
        (e) => {
            if (onerror)
                onerror(('responseJSON' in e) ? e['responseJSON'] : {
                    error: "Something went wrong"
                })
        },
        imageForm
    )
}

export async function saveImageDirectlyToCache(jobId, imageData) {
    jobId = String(jobId);
    let job = await getFromCache(JOBS, jobId);
    if (job) {
        job.imageSequence.push(imageData._id);
        await saveToCache(JOBS, jobId, job);
    }
    await saveToCache(IMAGES, imageData._id, imageData);
}

export async function getAnnotationDataForImage(imageId) {
    const annotationObject = await getFromCache(ANNOTATIONS, imageId);
    return annotationObject ? annotationObject.annotationData : null;
}

export function saveAnnotationDataForImage(imageId, annotationData) {
    saveToCache(ANNOTATIONS, imageId, {imageId, annotationData});
}

export async function getChatDataForImage(imageId) {
    const chatData = await getFromCache(CHATS, imageId);
    return chatData ? chatData : {imageId: imageId, chatData: []};
}

export function saveChatForImage(imageId, chatElement) {
    getChatDataForImage(imageId)
        .then(chatData => {
            chatData.chatData.push({message: chatElement.message, sender: chatElement.sender});
            saveToCache(CHATS, imageId, chatData);
        })
}

/** UTILITIES **/

async function generateTempImage(imageData) {
    let imageObj = {
        title: imageData['image_title'],
        creator: imageData['image_creator'],
        description: imageData['image_description']
    }

    switch (imageData['image_type']) {
        case 'upload':
            imageObj.imageData = await new Promise(resolve => {
                let reader = new FileReader();
                reader.onloadend = () => resolve(reader.result)
                reader.readAsDataURL(imageData['image_source']);
            })
            break;
        case 'camera':
        case 'url':
            imageObj.imageData = imageData['image_source'];
            break;
    }

    imageObj._id = generateTempId();
    imageObj.url = `/image?id=${imageObj._id}`;
    await saveToCache(OFFLINE_IMAGES, imageObj._id, imageObj);
    return imageObj;
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

function generateTempId() {
    let num = Date.now();
    let s = '', t;

    while (num > 0) {
        t = (num - 1) % 26;
        s = String.fromCharCode(65 + t) + s;
        num = Math.floor((num - t) / 26);
    }
    return s || undefined;
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
    if (navigator.onLine) {
        $.ajax({
            url: url,
            type: type,
            data: data,
            processData: false,
            contentType: false,
            success: onsuccess,
            error: (response) => {
                if (response.status === 0) {
                    if (onoffline) onoffline();
                } else {
                    if (onerror) onerror(response);
                }
            },
        })
    } else {
        if (onoffline) onoffline();
    }
}

async function getAllFromCache(storeName) {
    let result = [];

    let localStorageExecutor = () => {
        for (let i in Object.keys(localStorage)) {
            if (i.startsWith(storeName)) {
                result.push(JSON.parse(localStorage.getItem(i)));
            }
        }
    }

    await executeOnCache(
        storeName,
        'readonly',
        async (store) => {
            result = await store.getAll();
            localStorageExecutor();
        },
        localStorageExecutor
    )
    return result;
}

async function getFromCache(storeName, id) {
    let result = null;
    await executeOnCache(
        storeName,
        'readonly',
        async (storeName) => {
            result = await storeName.get(id) ?? JSON.parse(localStorage.getItem(`${storeName}_${id}`));
        },
        () => result = JSON.parse(localStorage.getItem(`${storeName}_${id}`))
    );
    return result;
}

async function saveToCache(storeName, id, object) {
    await executeOnCache(storeName, 'readwrite', (store) => {
        store.put(object);
    }, () => {
        localStorage.setItem(`${storeName}_${id}`, JSON.stringify(object));
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
            localStorageOperation();
        }
    } else {
        localStorageOperation();
    }
}

/**
 * it inits the database
 */
export async function initDatabase() {
    if (!db && 'indexedDB' in window) {
        db = await idb.openDB(DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                upgradeDb.createObjectStore(PIDS, {
                    keyPath: 'key'
                });

                upgradeDb.createObjectStore(JOBS, {
                    keyPath: '_id'
                });

                upgradeDb.createObjectStore(IMAGES, {
                    keyPath: '_id'
                });

                upgradeDb.createObjectStore(ANNOTATIONS, {
                    keyPath: 'imageId'
                });

                upgradeDb.createObjectStore(CHATS, {
                    keyPath: 'imageId'
                });


                upgradeDb.createObjectStore(OFFLINE_JOBS, {
                    keyPath: '_id'
                })


                upgradeDb.createObjectStore(OFFLINE_IMAGES, {
                    keyPath: '_id'
                })
            }
        });
    }
}