const sharp = require('sharp');
const fs = require('fs');
const fsPromise = fs.promises;

function saveImage(imageBuffer, imageName, destFolder){
    return sharp(imageBuffer)
        .jpeg()
        .resize({
            fit: 'inside',
            width: 1280,
            height: 720
        })
        .toFile(`${destFolder}/${imageName}.jpeg`);
};

module.exports.handleImageUploadingToStorage = async (imageFile, imageName, destFolderImages) => {
    const image = imageFile;
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
       try{
        await fsPromise.unlink(destFolderImages + "/" + imageName);
       }catch(e){
           console.error(e);
       }
    }
}
