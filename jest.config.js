module.exports = {
    testEnvironment: "node",
    transform: {
      "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
    },
    moduleFileExtensions: [ "js" ],
    collectCoverageFrom: [
      "lib/**/*.js",
    ]
};
