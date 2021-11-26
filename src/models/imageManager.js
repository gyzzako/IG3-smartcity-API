const sharp = require('sharp');
const fs = require('fs');

function saveImage(imageBuffer, imageName, destFolder){
    return sharp(imageBuffer)
        .jpeg()
        .resize({
            fit: 'inside',
            width: 1920,
            height: 1080
        })
        .toFile(`${destFolder}/${imageName}.jpeg`);
};

module.exports.handleImageUploadingToStorage = async (imageTest, imageName, destFolderImages) => {
    const image = imageTest;
    if(image === undefined){
        throw new Error("Erreur lors de la sauvegarde de l'image");
    }else{
        try{
            const response = await saveImage(image.buffer, imageName, destFolderImages);
            return response.format;
        }catch(e){
            console.error(e);
            throw new Error("Erreur lors de la sauvegarde de l'image");
        }
    }
}

module.exports.handleImageRemovingFromStorage = async(imageName, destFolderImages) => {
    if(imageName !== undefined && imageName !== null && imageName !== "null"){
        fs.stat(destFolderImages, function (err, stats) {     
            if(err) {
                return console.error(err);
            }
            fs.unlink(destFolderImages + "/" + imageName, function(err){
                 if(err) return console.error(err);
            });  
         });
    }
}
