/** @type {import("jest").Config} */
export default {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  // The app (and the generated Prisma client) rely on ESM features like
  // import.meta, so tests run as native ESM. Jest must be started with
  // `node --experimental-vm-modules` — see the "test" script in package.json.
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "esnext",
          moduleResolution: "bundler",
          verbatimModuleSyntax: false,
          esModuleInterop: true,
          types: ["jest", "node"],
        },
      },
    ],
  },
  // Source files use NodeNext-style "./x.js" imports; map them back to the
  // extensionless path so Jest resolves the .ts sources.
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  setupFiles: ["<rootDir>/tests/setup.ts"],
  // Integration tests share one Postgres database; run files serially so
  // per-test cleanup in one file can't race another file's inserts.
  maxWorkers: 1,
  testTimeout: 15000,
};
