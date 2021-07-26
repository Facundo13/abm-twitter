"use strict";

let textarea = document.getElementById('tweet-textarea');
let btnSubmit = document.querySelector('.btn-add');
let containerTweets = document.querySelector('.my-tweets');

const IDBRequest = indexedDB.open("db-tweets",1);

IDBRequest.addEventListener("upgradeneeded", ()=>{
    const db = IDBRequest.result;
    db.createObjectStore("tweets",{
        autoIncrement: true
    });
});

const getIDBData = mode =>{
    const db = IDBRequest.result;
    const IDBTransaction = db.transaction("tweets",mode);
    const objectStore = IDBTransaction.objectStore("tweets");

    return objectStore;
}


const addTweet = tw => {
    const IDBData = getIDBData("readwrite");
    IDBData.add(tw);
}

const readTweet = ()=>{
    const IDBData = getIDBData("readonly");
    const cursor = IDBData.openCursor();
    const fragment = document.createDocumentFragment();
    cursor.addEventListener("success",()=>{
        if (cursor.result){
            let tw = tweetsHTML(cursor.result.key,cursor.result.value);
            fragment.appendChild(tw);
            cursor.result.continue();
        }else{
            containerTweets.appendChild(fragment);
        }
    })
}

const editTweet = (key,tw) => {
    const IDBData = getIDBData("readwrite");

    IDBData.put(tw,key);
}

const deleteTweet = key => {
    const IDBData = getIDBData("readwrite");

    IDBData.delete(key);
}



btnSubmit.addEventListener('click',()=>{
    let tw = textarea.value;
    if (tw.length > 0){
        addTweet({tw});
        readTweet();
    }
});  


const tweetsHTML = (id,tweetTexto) => {
    const container = document.createElement("DIV");
    const h3 = document.createElement("h3");
    const option = document.createElement("DIV");
    const saveButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    container.classList.add("tweets");
    option.classList.add("option");
    saveButton.classList.add("btn", "btn-save");
    deleteButton.classList.add("btn", "btn-delete");

    saveButton.textContent = "Guardar";
    deleteButton.textContent = "Eliminar";
    h3.innerHTML = tweetTexto.tweet;

    option.appendChild(saveButton);
    option.appendChild(deleteButton);
    container.appendChild(h3);
    container.appendChild(option);

    return container;
}
