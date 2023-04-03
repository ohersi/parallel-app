export default {
  preset: 'ts-jest',
  testEnvironment: "node",
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {},
  setupFilesAfterEnv: ["./src/tests/utils/jest.setup.ts"],
  testTimeout: 90000,
  collectCoverage: true,
  collectCoverageFrom: ["./src/**"],
  coveragePathIgnorePatterns: ["/node_modules/", ".src/repositories/**", "./src/dto", "./src/middleware", "./src/utils/", "./src/tests/create-testing-module.ts", "./index.ts",],
}

