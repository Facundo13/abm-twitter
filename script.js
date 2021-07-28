"use strict";

let textarea = document.getElementById('tweet-textarea');
let btnSubmit = document.querySelector('.btn-add');
let containerTweets = document.querySelector('.my-tweets');
let formTweets = document.querySelector('.form-tweets');

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
        if (tw.length > 280){
            const h5 = document.createElement("h5");
            h5.textContent = "El tweet supera los 280 caracteres y no puede ser publicado";
            h5.classList.add("error-tweet");
            const exist = formTweets.querySelector('.error-tweet');
            if (!exist){
                formTweets.appendChild(h5);
            }
        }else{
            const h5 = document.querySelector('.error-tweet');
            if (h5){
                formTweets.removeChild(h5);
            }
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
    }
});  


const tweetsHTML = (id,tweetTexto) => {
    const container = document.createElement("DIV");
    const p = document.createElement("p");
    const option = document.createElement("DIV");
    const saveButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    container.classList.add("tweets");
    option.classList.add("option");
    saveButton.classList.add("btn", "btn-save","disabled");
    deleteButton.classList.add("btn", "btn-delete");
    p.classList.add("text-tweet");

    saveButton.textContent = "Guardar";
    deleteButton.textContent = "Eliminar";
    p.innerHTML = tweetTexto.tw;
    p.setAttribute("contenteditable","true");
    p.setAttribute("spellcheck", "false");

    option.appendChild(saveButton);
    option.appendChild(deleteButton);
    container.appendChild(p);
    container.appendChild(option);

    p.addEventListener("keyup", ()=>{
        saveButton.classList.remove("disabled");
        saveButton.classList.add("enabled");
    })

    saveButton.addEventListener("click", ()=>{
        if (!saveButton.classList.contains("disabled")){
            let tw = p.textContent;
            if (tw.length <= 0 || tw.length >=280){
                const h5 = document.createElement("h5");
                h5.textContent = "El tweet no puede estar vacio ni superar los 280 caracteres";
                h5.classList.add("error-tweet");
                const exist = containerTweets.querySelector('.error-tweet');
                if (!exist){
                    containerTweets.appendChild(h5);
                }  
            }else{   
                const h5 = document.querySelector('.error-tweet');
                if (h5){
                    containerTweets.removeChild(h5);
                }         
                editTweet(id,{tw});
                saveButton.classList.add("disabled");
                saveButton.classList.remove("enabled");
            }
        }
    })

    deleteButton.addEventListener("click", ()=>{
        deleteTweet(id);
        containerTweets.removeChild(container);
    })

    return container;
}
