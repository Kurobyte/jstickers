
function settingsDB() {
    this.db;
    this.settings = { PRODVER: "prodVer", OUTDIR: "outDir" };
    this.tables = { SETTINGS: "settings" };
    
    var that = this;
    var request = indexedDB.open('appSettings', 1);
    
    
    request.onupgradeneeded = function(event) {
        var idb = request.result;
        if (event.oldVersion < 1) {
            // Version 1 is the first version of the database.
            var store = idb.createObjectStore("settings", {keyPath: "option"});
            var value = store.createIndex("value", "value");
            
            store.put({option: "outDir", value: path.join(APP_DIR, 'downloads')});
            store.put({option: "prodVer", value: 32632});
        }
    };

    request.onsuccess = function() {
        that.db = request.result;
        loadConfig();
    };
    
    
    this.getOption = function(key, table, callback) { 
        var tx = this.db.transaction(table, "readonly");
        var store = tx.objectStore(table);

        var request = store.get(key);
        request.onsuccess = function() { 
            var matching = request.result;
            if (matching !== undefined) {
                callback(matching.option, matching.value);
            } else {
                callback(undefined, null);
            }
        };
    }
    
    this.saveOption = function(key, table, newValue) {
        
        var store = this.db.transaction(table, "readwrite").objectStore(table);
        var request = store.get(key);
        
        request.onsuccess = function(event) {
            var data = event.target.result;
            
            if (data !== undefined) {
                data.value = newValue;
                var result = store.put(data);
                
                result.onsuccess = function(event) { console.log("saving success"); }
                result.onerror = function(event) { console.log("saving error"); }
            }
        }
        
        request.onerror = function(ev)
        {
            console.log('Error occured', ev.srcElement.error.message);
        };
    }
    
    /**
     * Drop the database
     * @param {String} name Name of the database to drop.
     */
    this.dropDatabase = function(name) {
        var request = indexedDB.deleteDatabase(name);
        request.onsuccess = function() { console.log("Deleted"); };
        request.onerror = function() { console.log("Error deleting"); };
    }
}    

