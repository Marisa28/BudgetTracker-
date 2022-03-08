const indexdb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || 
window.msIndexedDB;
let db;
const request = indexdb.open("budgets",1)
request.onupdateneeded = ({target})=> {
    let db = target.result
    db.createObjectStore ("pending", {autoIncrement:true})
}
request.onsucess = ({target})=> {
    db = target.result
    if(navigator.onLine) {
        lookForData()
    }
}
request.onerror= function(event){
    console.log ("there was an error", event.target.errorCode)
}
function saveRecord(record) {
    const transactions = db.transaction(["pending"],"readwrite")
    const store=transactions.objectStore("pending")
    store.add(record)
}

function lookForData() {
    const transactions = db.transaction(["pending"],"readwrite")
    const store=transactions.objectStore("pending")
    const getall = store.getAll()
    getall.onsucess= function(){
        if(getall.result.length){
            fetch("/api/transaction/bulk", {
                method: "POST", body:JSON.stringify(getall.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                  }
            }).then(response =>response.json())
            .then(data => {
                const transactions = db.transaction(["pending"],"readwrite")
                const store=transactions.objectStore("pending")  
                store.clear()
            })
        }
    }
}
window.addEventListener("online", lookForData)


