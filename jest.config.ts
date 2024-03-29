export default {
  preset: 'ts-jest',
  testEnvironment: "node",
  coverageProvider: 'v8',
  maxWorkers: 2,
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1"
  },
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {},
  setupFilesAfterEnv: ["./src/tests/test-utils/jest.setup.ts"],
  testTimeout: 90000,
  collectCoverage: true,
  collectCoverageFrom: ["./src/**"],
  coveragePathIgnorePatterns: ["/node_modules/", ".src/repositories/", "./src/dto", "./src/middleware", "./src/resources/", "./src/utils/", "./src/tests/create-testing-module.ts", "./index.ts", "./src/migrations"],
}

