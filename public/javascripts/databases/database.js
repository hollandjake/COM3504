//TODO: TOM
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
export function saveImage(jobId, image, callback) {
    //TODO: IF (ONLINE):
    //TODO:     SEND TO SERVER
    //TODO:     ON RESPONSE -> SAVE TO IDB_server
    //TODO:                 -> RETURN SERVER OBJECT
    //TODO: ELSE:
    //TODO:     STORE IN IDB_offline
    //TODO:     RETURN CACHED OBJECT
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
export function ajaxRequest(type, url, onsuccess, onoffline, onerror, data=null) {
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
        //statusCode:{
        //    0: onoffline
        //}
    })
}