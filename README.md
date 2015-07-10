# jStickers #
This is a little project that has came out of [Get PNG Stickers](https://github.com/Kurobyte/Get-Png-Stickers), in order to make it more multi system and easy to use desktop app. It has developed with [node-webkit](https://github.com/nwjs/nw.js).

This aplication downloads the PNG stickers from the Line servers to your PC. **This don't enable the stickers in your Line app**.

# Usage #
![Basic usage of the program](https://pbs.twimg.com/media/CJQ8D3bWsAAijxN.png:large)

To get the sticker ID you need to go to LINE sticker shop.
> https:// store.line.me/stickershop/product/**4769**/es

And pick the number of the URL, that is the sticker ID

# Animated Stickers #
Some stickers have animations like this sticker set.

    https://store.line.me/stickershop/product/3860/es

Starting 1.1 version you can download the animations. The problem resides in  LINE uses [APNG(Animated PNG)](http://littlesvr.ca/apng/) format, but due to lack of support of the format I have added the capability to convert APNG to GIF, but for that you need to provide the binary of APNG2GIF for your system and place it in the app folder(node-webkit).
You can find the binaries here [http://sourceforge.net/projects/apng2gif/files/](http://sourceforge.net/projects/apng2gif/files/)

### Bugs ###
You can report isues/new features [here](https://github.com/Kurobyte/jstickers/issues)
