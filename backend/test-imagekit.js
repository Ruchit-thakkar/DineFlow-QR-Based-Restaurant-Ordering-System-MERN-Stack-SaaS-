const ImageKit = require('imagekit');
const dotenv = require('dotenv');
dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

console.log("Testing ImageKit with:");
console.log("Endpoint:", process.env.IMAGEKIT_URL_ENDPOINT);
console.log("Public Key:", process.env.IMAGEKIT_PUBLIC_KEY ? "Set" : "Missing");

imagekit.upload({
    file : "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", // base64 1x1 pixel
    fileName : "test_image.png",
}).then(response => {
    console.log("Success!", response);
}).catch(error => {
    console.error("Failed!", error);
});
