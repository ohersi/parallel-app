export default {
  preset: 'ts-jest',
  testEnvironment: "node",
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {},
  setupFilesAfterEnv: ["./src/tests/utils/jest.setup.ts"],
  testTimeout: 90000,
}

