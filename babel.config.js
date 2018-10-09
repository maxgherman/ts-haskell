
module.exports = api => {
    
    api.cache(true);
    
    return {
        presets: [
            ["@babel/env", {
                "targets": {
                    "node": "current"
                  }
            }]
        ],

        plugins: [
            ["babel-plugin-webpack-alias", {
                "config": "alias.config.js",
                "findConfig": true
            }]
        ]
    }
  }