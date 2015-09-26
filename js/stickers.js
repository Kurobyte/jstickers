
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
        nSticker = sticker_id;
        sVer = searchVer(sticker_id);
        if ($('#imgPlaceholder > canvas').length == 0)
            $('#placeholder').attr('src', BASE_URL+'/products/0/0/'+ sVer +'/'+ sticker_id +'/android/main.png'); //LINEStorePC
        else {
            $('#imgPlaceholder').html('<div id="stickAtrib"></div><img id="placeholder" class="undraggable" src="'+BASE_URL+'/products/0/0/'+ sVer +'/'+ sticker_id +'/android/main.png" style="width: 100%;"><audio id="stickSound"></audio>')
        }

        $.ajax(BASE_URL+'/products/0/0/'+ sVer +'/'+ sticker_id +'/android/productInfo.meta', {
            success: function(data) {
                sData = data;
                jData = JSON.parse(data);
                var lang = Object.keys(jData['title']);
                sTitle = jData.title[lang[0]];
                $('#sticker_name').html('Name: '+jData.title[lang[0]]);
                $('#sticker_no').html('Nº: '+jData.stickers.length);
                $('#stickAtrib').unbind();
                $('#placeholder').unbind();
                
                if ('hasAnimation' in jData) {
                    if (jData.hasAnimation) {
                        dwnAnimated = false;
                        $('#placeholder').attr('src', BASE_URL+'/products/0/0/'+ sVer +'/'+ sticker_id +'/iphone/main_animation@2x.png'); //APNG
                        $('#placeholder').attr('onclick', 'playAPNG();'); //APNG
                        $('#stickAtrib').html('<img src="img/animated.png" title="Animated Sticker">');
                        APNG.animateImage(document.getElementById('placeholder'));
                        $('#stickAtrib').click(playAPNG);
                    }
                }
                
                if ('hasSound' in jData) {
                    if (jData.hasSound) {
                        dwnAudio = false;
                        $('#stickAtrib').html('<img src="img/audio.png" title="Animated Sticker">');
                        audio = document.getElementById('stickSound');
                        audio.src = BASE_URL+'/products/0/0/'+ sVer +'/'+ sticker_id +'/android/main_sound.m4a';
                        audio.play();
                        if (jData.hasAnimation) {
                            $('#placeholder').attr('onclick', 'playAPNG(); playAudio();');
                        } else {
                            $('#placeholder').attr('onclick', 'playAudio();');
                        }
                        $('#stickAtrib').click(playAudio);
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
    nOp = 1;
    prgBar.progressbar("value", 0); //Reset progressbar
    dirName = jData.packageId+' - '+replace_all(sTitle);
    
    if (dwnAnimated) //Checks if is an animated sticker
        nOp += 1;
    if (dwnAudio) //Checks if is an audio sticker
        nOp += 1;
    
    try {
        stats = fs.lstatSync(prgCfg.outDir+'/'+dirName);
    } catch (e) {
        fs.mkdirSync(prgCfg.outDir+'/'+dirName, 0777);
    }

    for (var s = 0; s < jData.stickers.length; s++) {
        downloadSticker(jData.packageId, jData.stickers[s].id, nOp);
    }
    
    if (dwnAnimated) { //Checks if is an animated sticker
        try {
            stats = fs.lstatSync(prgCfg.outDir+'/'+dirName+'/animated');
        } catch (e) {
            fs.mkdirSync(prgCfg.outDir+'/'+dirName+'/animated', 0777);
        }

        for (var s = 0; s < jData.stickers.length; s++) {
            downloadAnimatedSticker(jData.packageId, jData.stickers[s].id, nOp);
        }
    }
    
    if (dwnAudio) { //Checks if is an animated sticker
        try {
            stats = fs.lstatSync(prgCfg.outDir+'/'+dirName+'/sound');
        } catch (e) {
            fs.mkdirSync(prgCfg.outDir+'/'+dirName+'/sound', 0777);
        }

        for (var s = 0; s < jData.stickers.length; s++) {
            downloadAudioSticker(jData.packageId, jData.stickers[s].id, nOp);
        }
    }
}

/**
 * Downloads the sticker from the server.
 * @param {Number} sticker_id ID of the sticker.
 * @param {Number} png_id     ID of the image.
 * @param {Number} nOp        Variable used to determine if needs to download extra things like animations/sound.
 */
function downloadSticker(sticker_id, png_id, nOp) {
    var file = fs.createWriteStream(prgCfg.outDir+'/'+dirName+'/'+png_id +'.png');
    file.on('finish', function() {
        prgBar.progressbar("value", ((nSticker + 1)/(jData.stickers.length * nOp) * 100));
        $('#prgLabel').html( parseFloat((nSticker + 1)/(jData.stickers.length * nOp) * 100).toFixed(2) +"%");
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
 * @param {Number} nOp        Variable used to determine if needs to download extra things like animations/sound.
 */
function downloadAnimatedSticker(sticker_id, png_id, nOp) {
    var animated = fs.createWriteStream(prgCfg.outDir+'/'+dirName+'/animated/'+png_id +'.png');
    animated.on('finish', function() {
        exec('"'+APP_DIR+'/apng2gif" "'+prgCfg.outDir+'/'+dirName+'/animated/'+png_id +'.png" "'+prgCfg.outDir+'/'+dirName+'/animated/'+png_id +'.gif"', function(error, stdout, stderr) {
        });
        prgBar.progressbar("value", ((nSticker + 1)/(jData.stickers.length * nOp) * 100));
        $('#prgLabel').html( parseFloat((nSticker + 1)/(jData.stickers.length * nOp) * 100).toFixed(2) +"%");
        nSticker++;
    });
    
    var aniRequest = http.get(BASE_URL+'/products/0/0/'+ sVer +'/'+ sticker_id +'/android/animation/'+ png_id +'.png', function(response) {
        response.pipe(animated);
    });
}

/**
 * Downloads the audio tracks for the sticker.
 * @param {Number} sticker_id ID of the sticker.
 * @param {Number} png_id     ID of the image.
 * @param {Number} nOp        Variable used to determine if needs to download extra things like animations/sound.
 */
function downloadAudioSticker(sticker_id, png_id, nOp) {
    var audio = fs.createWriteStream(prgCfg.outDir+'/'+dirName+'/sound/'+png_id +'.m4a');
    audio.on('finish', function() {
        prgBar.progressbar("value", ((nSticker + 1)/(jData.stickers.length * nOp) * 100));
        $('#prgLabel').html( parseFloat((nSticker + 1)/(jData.stickers.length * nOp) * 100).toFixed(2) +"%");
        nSticker++;
    });
    
    var aniRequest = http.get(BASE_URL+'/products/0/0/'+ sVer +'/'+ sticker_id +'/android/sound/'+ png_id +'.m4a', function(response) {
        response.pipe(audio);
    });
}

/**
 * Fetches in the LINE server the last product version to download.
 * @param {Number} version Last local ProductVersion.
 */
function downloadProdVersion(version) {
    $('#statMsg').html('(Updating DB: '+version+')');
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
                $('#statMsg').html('');
                response.pipe(file);
            });
            prgCfg.prodVer = (version - 1);
            saveKeyConfig(sDB.settings.PRODVER, (version - 1));
        } else if (response.statusCode == 200) {
            downloadProdVersion(version + 1);
        }
    });
}