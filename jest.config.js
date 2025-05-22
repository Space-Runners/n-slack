module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: -10,
        },
    },
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    transform: {
        "\\.[jt]sx?$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
    },
};
