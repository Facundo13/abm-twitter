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

IDBRequest.addEventListener("success", ()=>{
    readTweet();
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
    containerTweets.innerHTML = "";
    cursor.addEventListener("success",()=>{
        if (cursor.result){
            let twAdd = tweetsHTML(cursor.result.key,cursor.result.value);
            fragment.appendChild(twAdd);
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
        if (document.querySelector(".enabled")){
           if (confirm("Tienes elementos sin guardar, quieres continuar?")){
                addTweet({tw});
                readTweet();
                textarea.value = "";
           } 
        }else{
            addTweet({tw});
            readTweet();
            textarea.value = "";
        }
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
    saveButton.classList.add("btn", "btn-save","disabled");
    deleteButton.classList.add("btn", "btn-delete");

    saveButton.textContent = "Guardar";
    deleteButton.textContent = "Eliminar";
    h3.innerHTML = tweetTexto.tw;
    h3.setAttribute("contenteditable","true");
    h3.setAttribute("spellcheck", "false");

    option.appendChild(saveButton);
    option.appendChild(deleteButton);
    container.appendChild(h3);
    container.appendChild(option);

    h3.addEventListener("keyup", ()=>{
        saveButton.classList.remove("disabled");
        saveButton.classList.add("enabled");
    })

    saveButton.addEventListener("click", ()=>{
        if (!saveButton.classList.contains("disabled")){
            let tw = h3.textContent;
            editTweet(id,{tw});
            saveButton.classList.add("disabled");
            saveButton.classList.remove("enabled");
        }
    })

    deleteButton.addEventListener("click", ()=>{
        deleteTweet(id);
        containerTweets.removeChild(container);
    })

    return container;
}
