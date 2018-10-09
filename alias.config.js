const path = require('path');

module.exports = {
    resolve: {
        alias: {
            '@common': path.join(__dirname, 'lib/common'),
            '@control': path.join(__dirname, 'lib/control'),
            '@data': path.join(__dirname, 'lib/data')
        }
    }
};