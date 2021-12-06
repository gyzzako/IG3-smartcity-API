const fs = require('fs');
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API SmartCity', // Title (required)
            version: '1.0.0', // Version (required)
        },
    },
    // Path to the API docs
    apis: [
        './src/V1/controllers/*',
        './src/V1/middleware/*',
        './src/V1/models/*',
        './src/V1/routes/*',
    ],
};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);
fs.writeFileSync('./swagger/spec.json', JSON.stringify(swaggerSpec));