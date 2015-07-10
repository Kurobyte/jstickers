
function replace_all(text) {
	nonValid = ['<', '>', ':', '"', '\\', '/', '|', '?', '*'];
	for (var i = 0; i < nonValid.length; i++) {
		if (text.indexOf(nonValid[i]) != 0) {
			text = text.replace(nonValid[i], ' ');
        }
    }
	return text;
}

/**
 * Search the sticker version in the local ProductVersion
 * @param   {Number} id ID of the sticker
 * @returns {Number} Version of the sticker
 */
function searchVer(id) {
    var trobat = false;
    var s = 0;
    var v = 1;
    id = parseInt(id);
    
    while (s < stickDB.versions.length && !trobat) {
        if ($.inArray(id, stickDB.versions[s]) != -1) {
            v = stickDB.versions[s][1];
            trobat = true;
        }
        s++;
    }
    
    return v;
}


/**
 * Fetch and loads the sticker data.
 * @param {Number} sticker_id ID of the sticker.
 */
function loadStickerData(sticker_id) {
    if (parseInt(sticker_id) == NaN || sticker_id == "") {
        $.alert({
            theme: 'supervan',
            icon: 'fa fa-times-circle red',
            animation: 'opacity',
            title: 'Error!',
            content: 'You should entry a sticker ID.',
            confirmButton: 'Close',
            autoClose: 'confirm|4000'
        });
    } else {
        dwnAnimated = null;
        $('#stickAtrib').html('');
        sVer = searchVer(sticker_id);
        $('#placeholder').attr('src', BASE_URL+'/products/0/0/'+ sVer +'/'+ sticker_id +'/android/main.png'); //LINEStorePC

        $.ajax(BASE_URL+'/products/0/0/'+ sVer +'/'+ sticker_id +'/android/productInfo.meta', {
            success: function(data) {
                sData = data;
                jData = JSON.parse(data);
                var lang = Object.keys(jData['title']);
                sTitle = jData.title[lang[0]];
                $('#sticker_name').html('Name: '+jData.title[lang[0]]);
                $('#sticker_no').html('Nº: '+jData.stickers.length);
                
                if ('hasAnimation' in jData) {
                    if (jData.hasAnimation) {
                        dwnAnimated = false;
                        $('#stickAtrib').html('<img src="img/animated.png" title="Animated Sticker">');
                    }
                }
                
                reSetOptions();
            },
            error: function() {
                sData = undefined;
                jData = undefined;
                $('#sticker_name').html('Name: ');
                $('#sticker_no').html('Nº: ');
                
                $('#placeholder').attr('src', 'img/sticker_placeholder.png');
                
                $.alert({
                    theme: 'supervan',
                    icon: 'fa fa-times-circle red',
                    animation: 'opacity',
                    title: 'Invalid Sticker?!',
                    content: 'The sticker ID that you have introduced could be invalid.',
                    confirmButton: 'OK',
                    autoClose: 'confirm|4000'
                });
            }
        });
    }
}

/**
 * Preform the download of all stickers of the pack.
 */
function download() {
    nSticker = 0; //Reset nSticker value to 0
    prgBar.progressbar("value", 0); //Reset progressbar
    dirName = jData.packageId+' - '+replace_all(sTitle);
    
    if (dwnAnimated) { //Checks if is an animated sticker
        try {
            stats = fs.lstatSync(prgCfg.outDir+'/'+dirName);
        } catch (e) {
            fs.mkdirSync(prgCfg.outDir+'/'+dirName, 0777);
            fs.mkdirSync(prgCfg.outDir+'/'+dirName+'/animated', 0777);
        }

        for (var s = 0; s < jData.stickers.length; s++) {
            downloadAnimatedSticker(jData.packageId, jData.stickers[s].id);
        }
    } else {
        try {
            stats = fs.lstatSync(prgCfg.outDir+'/'+dirName);
        } catch (e) {
            fs.mkdirSync(prgCfg.outDir+'/'+dirName, 0777);
        }

        for (var s = 0; s < jData.stickers.length; s++) {
            downloadSticker(jData.packageId, jData.stickers[s].id);
        }
    }
}

/**
 * Downloads the sticker from the server.
 * @param {Number} sticker_id ID of the sticker.
 * @param {Number} png_id     ID of the image.
 */
function downloadSticker(sticker_id, png_id) {
    var file = fs.createWriteStream(prgCfg.outDir+'/'+dirName+'/'+png_id +'.png');
    file.on('finish', function() {
        prgBar.progressbar("value", ((nSticker + 1)/jData.stickers.length * 100));
        $('#prgLabel').html( parseFloat((nSticker + 1)/jData.stickers.length * 100).toFixed(2) +"%");
        nSticker++;
    });
    var request = http.get(BASE_URL+'/products/0/0/'+ sVer +'/'+ sticker_id +'/android/stickers/'+ png_id +'.png', function(response) {
        response.pipe(file);
    });
}


/**
 * Downloads the sticker and his animation from the server.
 * @param {Number} sticker_id ID of the sticker.
 * @param {Number} png_id     ID of the image.
 */
function downloadAnimatedSticker(sticker_id, png_id) {
    var file = fs.createWriteStream(prgCfg.outDir+'/'+dirName+'/'+png_id +'.png');
    var animated = fs.createWriteStream(prgCfg.outDir+'/'+dirName+'/animated/'+png_id +'.png');
    animated.on('finish', function() {
        exec('"'+APP_DIR+'/apng2gif" "'+prgCfg.outDir+'/'+dirName+'/animated/'+png_id +'.png" "'+prgCfg.outDir+'/'+dirName+'/animated/'+png_id +'.gif"', function(error, stdout, stderr) {
            //console.log('stdout: ' + stdout);
            //console.log('stderr: ' + stderr);
            /*if (error !== null) {
                console.log('exec error: ' + error);
            }*/
        });
        prgBar.progressbar("value", ((nSticker + 1)/jData.stickers.length * 100));
        $('#prgLabel').html( parseFloat((nSticker + 1)/jData.stickers.length * 100).toFixed(2) +"%");
        nSticker++;
    });
    var request = http.get(BASE_URL+'/products/0/0/'+ sVer +'/'+ sticker_id +'/android/stickers/'+ png_id +'.png', function(response) {
        response.pipe(file);
    });
    
    var aniRequest = http.get(BASE_URL+'/products/0/0/'+ sVer +'/'+ sticker_id +'/android/animation/'+ png_id +'.png', function(response) {
        response.pipe(animated);
    });
}

/**
 * Fetches in the LINE server the last product version to download.
 * @param {Number} version Last local ProductVersion.
 */
function downloadProdVersion(version) {
    var request = http.get(BASE_URL+'/products/productVersions_'+version+'.meta', function(response) {
        if (response.statusCode == 404) {
            try {
                stats = fs.lstatSync(APP_DIR+'/productVersions.meta');
                if (stats.isFile())
                    fs.unlinkSync(APP_DIR+'/productVersions.meta');
            } catch (e) {}
            var file = fs.createWriteStream(APP_DIR+'/productVersions.meta');
            file.on('finish', function() {
                loadProdVersions();
            });
            var request = http.get(BASE_URL+'/products/productVersions_'+(version - 1)+'.meta', function(response) {
                response.pipe(file);
            });
            prgCfg.prodVer = (version - 1);
            saveKeyConfig(sDB.settings.PRODVER, (version - 1));
        } else if (response.statusCode == 200) {
            downloadProdVersion(version + 1);
        }
    });
    
    //console.log(version);
}