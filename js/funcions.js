var gui = require("nw.gui");
var http = require('http');
var fs = require('fs');
var path = require("path");
var exec = require('child_process').exec;

var BASE_URL = 'http://dl.stickershop.line.naver.jp';
var APP_DIR = path.parse(process.execPath).dir;

var sDB = new settingsDB();
var prgCfg = {};

var sData = undefined;
var jData = undefined;
var prgBar = undefined;

var stickDB = undefined;
var sTitle = "";
var sVer = 1;
var dirName = "";
var nSticker = 0;
var dwnAnimated = null;
var dwnAudio = null;


$(document).ready( function() {
    prgBar = $( "#progressbar" ).progressbar({
        value: 0,
        complete: function() { 
            $.alert({
                icon: 'fa fa-check green',
                theme: 'supervan',
                animation: 'opacity',
                title: 'Success!',
                content: 'Download completed.',
                confirmButton: 'Close',
                autoClose: 'confirm|3000'
            });
        }
    });
    loadProdVersions();
});

function openDevTools() {
    var win = gui.Window.get();
    if (win.isDevToolsOpen()) {
      win.closeDevTools();
    } else {
      win.showDevTools();
    }
}

function Maximize() {
    gui.Window.get().maximize();
}

function Minimize() {
    gui.Window.get().minimize();
}

function updateProdDB() {
    $.confirm({
        theme: 'supervan',
        animation: 'opacity',
        title: 'Update ProductVersions?',
        content: 'Are you sure that you want to update? (It will take a while)',
        confirmButton: 'Update',
        cancelButton: 'Cancel',
        confirm: function(){
            downloadProdVersion(prgCfg.prodVer);
        }
    });
}

function readF() { //TODELETE
    reader = fs.createReadStream('productVersions.meta', { encoding: 'utf8', mode: 666 });

    readline = require('readline');
    
    var rd = readline.createInterface({
        input: reader,
        output: process.stdout,
        terminal: false
    });

    rd.on('line', function(line) { //READ LINE BY LINE
        stickDB = JSON.parse(line);
    });
}

function loadProdVersions() {
    //if (fs.existsSync())
    fs.readFile(APP_DIR+'/productVersions.meta', 'utf8', function(err, data) {
        if (err) {
            //$.alert(); //ADD alert.
        } else {
            stickDB = JSON.parse(data);
        }
    });
}

function cllbConfig(key, value) {
    prgCfg[key] = value;
    if (key == sDB.settings.OUTDIR)
        checkFolder();
}

/**
 * Loads the configuration from the IndexedDB
 */
function loadConfig() {
    sDB.getOption(sDB.settings.OUTDIR, sDB.tables.SETTINGS, cllbConfig);
    sDB.getOption(sDB.settings.PRODVER, sDB.tables.SETTINGS, cllbConfig);
}

/**
 * Saves all the config to the DB
 */
function saveConfig() {
    keys = Object.keys(prgCfg);
    for ( var i = 0; i < keys.length; i++) {
        saveKeyConfig(keys[i], prgCfg[keys[i]]);
    }
}

/**
 * Saves a single config record to the DB
 * @param {String} key   Key of the object
 * @param {Object} value Value of the object
 */
function saveKeyConfig(key, value) {
    sDB.saveOption(key, sDB.tables.SETTINGS, value);
}

function checkFolder() {
    try {
        stats = fs.lstatSync(prgCfg.outDir);
        if (!stats.isDirectory())
            fs.mkdirSync(prgCfg.outDir);
    } catch (e) {
        fs.mkdirSync(prgCfg.outDir);    
    }
}

function openFolder() {
    var open = require('node-open');
    open('open', prgCfg.outDir);
}

function selectFolder() {
    var op = $('<input type="file" nwdirectory nwworkingdir="'+prgCfg.outDir+'"/>');
    op.on('change', function() {
        prgCfg.outDir = this.value;
        saveConfig();
        checkFolder();
    });
    op.click();
}

function downloadAnimated() {
    if (dwnAnimated != null) {
        var anim = $('#dwnAnim');
        anim.removeClass('fa-square');
        if (dwnAnimated) {
            dwnAnimated = !dwnAnimated;
            anim.removeClass('fa-check-square-o');
            anim.addClass('fa-square-o');
        } else {
            dwnAnimated = !dwnAnimated;
            anim.removeClass('fa-square-o');
            anim.addClass('fa-check-square-o');
        }
    }
}

function downloadAudio() {
    if (dwnAudio != null) {
        var audio = $('#dwnAudio');
        audio.removeClass('fa-square');
        if (dwnAudio) {
            dwnAudio = !dwnAudio;
            audio.removeClass('fa-check-square-o');
            audio.addClass('fa-square-o');
        } else {
            dwnAudio = !dwnAudio;
            audio.removeClass('fa-square-o');
            audio.addClass('fa-check-square-o');
        }
    }
}

function reSetOptions() {
    var anim = $('#dwnAnim');
    var audio = $('#dwnAudio');
    
    if (dwnAnimated != null) {
        anim.removeClass('fa-square');
        if (dwnAnimated) {
            anim.addClass('fa-check-square-o');
        } else {
            anim.addClass('fa-square-o');
        }
    } else {
        anim.attr('class', 'fa fa-square');
    }
    
    if (dwnAudio != null) {
        audio.removeClass('fa-square');
        if (dwnAudio) {
            audio.addClass('fa-check-square-o');
        } else {
            audio.addClass('fa-square-o');
        }
    } else {
        audio.attr('class', 'fa fa-square');
    }
}

function showAbout() {
    var win = gui.Window.open('about.html', {toolbar:false, frame:false, "width": 250, "height": 260, "max_width": 250, "max_height": 260});
    win.on('closed', function() {
        win = null;
    });
}
