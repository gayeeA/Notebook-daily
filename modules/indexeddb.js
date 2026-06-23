/* ==========================================================
   MYDIARY V3
   INDEXEDDB IMAGE STORAGE
   modules/indexeddb.js
========================================================== */

(function(){

"use strict";

/* ==========================================================
   DATABASE CONFIG
========================================================== */

const DB_NAME = "MyDiaryDB";

const DB_VERSION = 1;

const IMAGE_STORE = "images";

let db = null;

/* ==========================================================
   INIT DATABASE
========================================================== */

function initDB(){

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const request =
            indexedDB.open(
                DB_NAME,
                DB_VERSION
            );

            request.onerror =
            () => {

                console.error(
                    "IndexedDB failed"
                );

                reject(
                    request.error
                );

            };

            request.onsuccess =
            () => {

                db =
                request.result;

                console.log(
                    "📷 IndexedDB Ready"
                );

                resolve(db);

            };

            request.onupgradeneeded =
            (event)=>{

                const database =
                event.target.result;

                if(
                    !database.objectStoreNames.contains(
                        IMAGE_STORE
                    )
                ){

                    const store =
                    database.createObjectStore(
                        IMAGE_STORE,
                        {
                            keyPath:"id"
                        }
                    );

                    store.createIndex(
                        "createdAt",
                        "createdAt",
                        {
                            unique:false
                        }
                    );

                }

            };

        }
    );

}

/* ==========================================================
   GET STORE
========================================================== */

function getStore(
    mode="readonly"
){

    if(!db){

        throw new Error(
            "Database not initialized"
        );

    }

    const tx =
    db.transaction(
        IMAGE_STORE,
        mode
    );

    return tx.objectStore(
        IMAGE_STORE
    );

}

/* ==========================================================
   GENERATE ID
========================================================== */

function generateImageId(){

    return (
        "img_" +
        Date.now() +
        "_" +
        Math.random()
        .toString(36)
        .substring(2,10)
    );

}

/* ==========================================================
   SAVE IMAGE
========================================================== */

async function saveImage(
    imageData,
    metadata={}
){

    return new Promise(
        (
            resolve,
            reject
        )=>{

            try{

                const store =
                getStore(
                    "readwrite"
                );

                const imageId =
                generateImageId();

                const record = {

                    id:imageId,

                    data:imageData,

                    metadata,

                    createdAt:
                    new Date()
                    .toISOString()

                };

                const request =
                store.add(
                    record
                );

                request.onsuccess =
                ()=>{

                    resolve(
                        imageId
                    );

                };

                request.onerror =
                ()=>{

                    reject(
                        request.error
                    );

                };

            }
            catch(error){

                reject(error);

            }

        }
    );

}

/* ==========================================================
   GET IMAGE
========================================================== */

async function getImage(
    imageId
){

    return new Promise(
        (
            resolve,
            reject
        )=>{

            try{

                const store =
                getStore();

                const request =
                store.get(
                    imageId
                );

                request.onsuccess =
                ()=>{

                    resolve(
                        request.result
                    );

                };

                request.onerror =
                ()=>{

                    reject(
                        request.error
                    );

                };

            }
            catch(error){

                reject(error);

            }

        }
    );

}

/* ==========================================================
   DELETE IMAGE
========================================================== */

async function deleteImage(
    imageId
){

    return new Promise(
        (
            resolve,
            reject
        )=>{

            try{

                const store =
                getStore(
                    "readwrite"
                );

                const request =
                store.delete(
                    imageId
                );

                request.onsuccess =
                ()=>{

                    resolve(true);

                };

                request.onerror =
                ()=>{

                    reject(
                        request.error
                    );

                };

            }
            catch(error){

                reject(error);

            }

        }
    );

}

/* ==========================================================
   GET ALL IMAGES
========================================================== */

async function getAllImages(){

    return new Promise(
        (
            resolve,
            reject
        )=>{

            try{

                const store =
                getStore();

                const request =
                store.getAll();

                request.onsuccess =
                ()=>{

                    resolve(
                        request.result || []
                    );

                };

                request.onerror =
                ()=>{

                    reject(
                        request.error
                    );

                };

            }
            catch(error){

                reject(error);

            }

        }
    );

}

/* ==========================================================
   CLEAR IMAGE STORE
========================================================== */

async function clearImages(){

    return new Promise(
        (
            resolve,
            reject
        )=>{

            try{

                const store =
                getStore(
                    "readwrite"
                );

                const request =
                store.clear();

                request.onsuccess =
                ()=>{

                    resolve(true);

                };

                request.onerror =
                ()=>{

                    reject(
                        request.error
                    );

                };

            }
            catch(error){

                reject(error);

            }

        }
    );

}

/* ==========================================================
   COUNT IMAGES
========================================================== */

async function countImages(){

    return new Promise(
        (
            resolve,
            reject
        )=>{

            try{

                const store =
                getStore();

                const request =
                store.count();

                request.onsuccess =
                ()=>{

                    resolve(
                        request.result
                    );

                };

                request.onerror =
                ()=>{

                    reject(
                        request.error
                    );

                };

            }
            catch(error){

                reject(error);

            }

        }
    );

}

/* ==========================================================
   IMAGE FILE HANDLER
========================================================== */

async function fileToBase64(
    file
){

    return new Promise(
        (
            resolve,
            reject
        )=>{

            const reader =
            new FileReader();

            reader.onload =
            ()=>{

                resolve(
                    reader.result
                );

            };

            reader.onerror =
            ()=>{

                reject(
                    reader.error
                );

            };

            reader.readAsDataURL(
                file
            );

        }
    );

}

/* ==========================================================
   SAVE FILE DIRECTLY
========================================================== */

async function saveFileImage(
    file
){

    const base64 =
    await fileToBase64(
        file
    );

    const imageId =
    await saveImage(
        base64,
        {
            fileName:
            file.name,

            size:
            file.size,

            type:
            file.type
        }
    );

    return imageId;

}

/* ==========================================================
   BULK LOAD IMAGE DATA
========================================================== */

async function getImagesByIds(
    imageIds=[]
){

    const images = [];

    for(
        const id
        of imageIds
    ){

        try{

            const image =
            await getImage(id);

            if(image){

                images.push(
                    image
                );

            }

        }
        catch(error){

            console.warn(
                error
            );

        }

    }

    return images;

}

/* ==========================================================
   DATABASE INFO
========================================================== */

async function getDatabaseInfo(){

    const count =
    await countImages();

    return {

        database:
        DB_NAME,

        version:
        DB_VERSION,

        imageCount:
        count

    };

}

/* ==========================================================
   AUTO INIT
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async ()=>{

        try{

            await initDB();

        }
        catch(error){

            console.error(
                error
            );

        }

    }
);

/* ==========================================================
   EXPORT GLOBAL API
========================================================== */

window.MyDiaryDB = {

    initDB,

    saveImage,

    getImage,

    deleteImage,

    getAllImages,

    clearImages,

    countImages,

    saveFileImage,

    getImagesByIds,

    getDatabaseInfo

};

})();