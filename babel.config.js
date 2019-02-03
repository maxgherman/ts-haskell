
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
            [require.resolve('babel-plugin-module-resolver'), {
                root: ["."],
                alias: {
                    "@common": "./lib/common",
                    "@control": "./lib/control",
                    "@data": "./lib/data"
                }
            }]
        ]
    }
  }