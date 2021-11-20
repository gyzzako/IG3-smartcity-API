const sharp = require('sharp');

module.exports.saveImage = (imageBuffer, imageName, destFolder) => {
    return sharp(imageBuffer)
        .jpeg()
        .resize({
            fit: 'inside',
            width: 1920,
            height: 1080
        })
        .toFile(`${destFolder}/${imageName}.jpeg`);
};

