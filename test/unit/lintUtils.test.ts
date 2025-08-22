import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lintAndRefactorCode } from '../../src/linterUtils.ts';
import { ESLint } from 'eslint';

vi.mock('eslint', () => {
  const ESLint = vi.fn();
  ESLint.prototype.lintText = vi.fn();
  return { ESLint };
});

// Get a typed reference to the mocked class and its method
const mockedESLint = vi.mocked(ESLint);
const mockedLintText = vi.mocked(ESLint.prototype.lintText);

describe('lintAndRefactorCode', () => {
  beforeEach(() => {
    // Clear mock history before each test
    mockedESLint.mockClear();
    mockedLintText.mockClear();
  });

  it('should return original code and no errors for clean code', async () => {
    const code = `const x = 1;`;
    mockedLintText.mockResolvedValue([
      {
        messages: [],
        output: undefined, // No fixes, so output is undefined
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        usedDeprecatedRules: [],
        filePath: '',
        suppressedMessages: [],
        fatalErrorCount: 0,
      },
    ]);

    const { fixedCode, errorReport } = await lintAndRefactorCode(code);

    expect(fixedCode).toBe(code);
    expect(errorReport).toBeNull();
    expect(mockedLintText).toHaveBeenCalledWith(code);
  });

  it('should return fixed code and no errors for auto-fixable issues', async () => {
    const originalCode = `var x=1`;
    const expectedFixedCode = `const x = 1;`;
    mockedLintText.mockResolvedValue([
      {
        messages: [], // Assuming no remaining errors after fix
        output: expectedFixedCode,
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        usedDeprecatedRules: [],
        filePath: '',
        suppressedMessages: [],
        fatalErrorCount: 0,
      },
    ]);

    const { fixedCode, errorReport } = await lintAndRefactorCode(originalCode);

    expect(fixedCode).toBe(expectedFixedCode);
    expect(errorReport).toBeNull();
    expect(mockedLintText).toHaveBeenCalledWith(originalCode);
  });

  it('should return an error report for non-fixable errors', async () => {
    const codeWithErrors = `const x = y;`; // ReferenceError
    const errorMessages = [
      {
        severity: 2 as const,
        line: 1,
        column: 11,
        message: "'y' is not defined.",
        ruleId: 'no-undef',
      },
    ];
    mockedLintText.mockResolvedValue([
      {
        messages: errorMessages,
        output: undefined, // No fixes applied
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        usedDeprecatedRules: [],
        filePath: '',
        suppressedMessages: [],
        fatalErrorCount: 0,
      },
    ]);

    const { fixedCode, errorReport } =
      await lintAndRefactorCode(codeWithErrors);

    expect(fixedCode).toBe(codeWithErrors);
    expect(errorReport).not.toBeNull();
    expect(errorReport).toBe("L1:11: 'y' is not defined. (no-undef)");
    expect(mockedLintText).toHaveBeenCalledWith(codeWithErrors);
  });

  it('should return fixed code and an error report for mixed issues', async () => {
    const originalCode = `var x=y`; // fixable `var` and `spacing`, unfixable `y`
    const partiallyFixedCode = `const x = y;`;
    const errorMessages = [
      {
        severity: 2 as const,
        line: 1,
        column: 9,
        message: "'y' is not defined.",
        ruleId: 'no-undef',
      },
    ];
    mockedLintText.mockResolvedValue([
      {
        messages: errorMessages,
        output: partiallyFixedCode,
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        usedDeprecatedRules: [],
        filePath: '',
        suppressedMessages: [],
        fatalErrorCount: 0,
      },
    ]);

    const { fixedCode, errorReport } = await lintAndRefactorCode(originalCode);

    expect(fixedCode).toBe(partiallyFixedCode);
    expect(errorReport).not.toBeNull();
    expect(errorReport).toBe("L1:9: 'y' is not defined. (no-undef)");
    expect(mockedLintText).toHaveBeenCalledWith(originalCode);
  });

  it('should auto-fix `let` to `const` for non-reassigned variables', async () => {
    const originalCode = `let x = 5; console.log(x);`;
    const expectedFixedCode = `const x = 5; console.log(x);`;
    mockedLintText.mockResolvedValue([
      {
        messages: [],
        output: expectedFixedCode,
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        usedDeprecatedRules: [],
        filePath: '',
        suppressedMessages: [],
        fatalErrorCount: 0,
      },
    ]);

    const { fixedCode, errorReport } = await lintAndRefactorCode(originalCode);

    expect(fixedCode).toBe(expectedFixedCode);
    expect(errorReport).toBeNull();
    expect(mockedLintText).toHaveBeenCalledWith(originalCode);
  });

  it('should auto-fix to use object shorthand', async () => {
    const originalCode = `const name = 'test'; const obj = { name: name };`;
    const expectedFixedCode = `const name = 'test'; const obj = { name };`;
    mockedLintText.mockResolvedValue([
      {
        messages: [],
        output: expectedFixedCode,
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        usedDeprecatedRules: [],
        filePath: '',
        suppressedMessages: [],
        fatalErrorCount: 0,
      },
    ]);

    const { fixedCode, errorReport } = await lintAndRefactorCode(originalCode);

    expect(fixedCode).toBe(expectedFixedCode);
    expect(errorReport).toBeNull();
    expect(mockedLintText).toHaveBeenCalledWith(originalCode);
  });

  it('should auto-fix to use template literals', async () => {
    const originalCode = `const name = 'world'; const greeting = 'Hello ' + name;`;
    const expectedFixedCode =
      "const name = 'world'; const greeting = `Hello ${name}`;";
    mockedLintText.mockResolvedValue([
      {
        messages: [],
        output: expectedFixedCode,
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        usedDeprecatedRules: [],
        filePath: '',
        suppressedMessages: [],
        fatalErrorCount: 0,
      },
    ]);

    const { fixedCode, errorReport } = await lintAndRefactorCode(originalCode);

    expect(fixedCode).toBe(expectedFixedCode);
    expect(errorReport).toBeNull();
    expect(mockedLintText).toHaveBeenCalledWith(originalCode);
  });

  it('should report an error for using == instead of ===', async () => {
    const codeWithErrors = `if (x == 1) {}`;
    const errorMessages = [
      {
        severity: 2 as const,
        line: 1,
        column: 5,
        message: "Expected '===' and instead saw '=='.",
        ruleId: 'eqeqeq',
      },
    ];
    mockedLintText.mockResolvedValue([
      {
        messages: errorMessages,
        output: codeWithErrors, // No fix applied
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        usedDeprecatedRules: [],
        filePath: '',
        suppressedMessages: [],
        fatalErrorCount: 0,
      },
    ]);

    const { fixedCode, errorReport } =
      await lintAndRefactorCode(codeWithErrors);

    expect(fixedCode).toBe(codeWithErrors);
    expect(errorReport).not.toBeNull();
    expect(errorReport).toBe(
      "L1:5: Expected '===' and instead saw '=='. (eqeqeq)"
    );
    expect(mockedLintText).toHaveBeenCalledWith(codeWithErrors);
  });
});
