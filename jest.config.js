module.exports = {
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(axios)/)", // explicitly allow transforming axios
  ],
  transformIgnorePatterns: [
  "node_modules/(?!(axios)/)"
],
"jest": {
  "setupFilesAfterEnv": ["<rootDir>/src/setupTests.js"]
}

};
