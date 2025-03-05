import { assert, assertEquals, assertStringIncludes } from "@std/assert";

import { CConsole } from "./mod.ts";
import type { LogLevel } from "./mod.ts";

// A fake console that records calls to its methods.
class FakeConsole implements Console {
  public logs: unknown[][] = [];
  public debugs: unknown[][] = [];
  public infos: unknown[][] = [];
  public warns: unknown[][] = [];
  public errors: unknown[][] = [];

  log(...args: unknown[]): void {
    this.logs.push(args);
  }
  debug(...args: unknown[]): void {
    this.debugs.push(args);
  }
  info(...args: unknown[]): void {
    this.infos.push(args);
  }
  warn(...args: unknown[]): void {
    this.warns.push(args);
  }
  error(...args: unknown[]): void {
    this.errors.push(args);
  }
  // Stub out remaining Console methods
  dir(
    _object: unknown,
    _options?: {
      showHidden?: boolean;
      colors?: boolean;
      depth?: number;
    },
  ): void {}
  table(_data: unknown, _columns?: string[]): void {}
  assert(_condition?: boolean, ..._data: unknown[]): void {}
  clear(): void {}
  count(_label?: string): void {}
  countReset(_label?: string): void {}
  group(..._data: unknown[]): void {}
  groupCollapsed(..._data: unknown[]): void {}
  groupEnd(): void {}
  time(_label?: string): void {}
  timeLog(_label?: string, ..._data: unknown[]): void {}
  timeEnd(_label?: string): void {}
  trace(..._data: unknown[]): void {}
  dirxml(..._data: unknown[]): void {}
  timeStamp(_label?: string): void {}
  profile(_label?: string): void {}
  profileEnd(_label?: string): void {}
}

// Helper to temporarily override global console with our fake console.
function withFakeConsole(
  testFn: (fake: FakeConsole) => Promise<void> | void,
) {
  const originalConsole = globalThis.console;
  const fake = new FakeConsole();
  globalThis.console = fake;
  try {
    testFn(fake);
  } finally {
    globalThis.console = originalConsole;
  }
}

Deno.test("CConsole logs debug messages when log level is DEBUG", () => {
  withFakeConsole((fake) => {
    const cconsole = new CConsole("DEBUG");
    cconsole.debug("debug message");
    // Expect one debug call
    assertEquals(fake.debugs.length, 1);
    // Check that the logged message contains the [DEBUG] prefix.
    const firstArg = fake.debugs[0][0] as string;
    assertStringIncludes(firstArg, "[DEBUG]");
  });
});

Deno.test("CConsole does not log debug messages when log level is INFO", () => {
  withFakeConsole((fake) => {
    const cconsole = new CConsole("INFO");
    cconsole.debug("debug message");
    // Debug should be suppressed when current level is INFO (or above)
    assertEquals(fake.debugs.length, 0);
  });
});

Deno.test("CConsole logs info, warn, and error messages appropriately", () => {
  withFakeConsole((fake) => {
    const cconsole = new CConsole("INFO");
    cconsole.info("info message");
    cconsole.warn("warn message");
    cconsole.error("error message");

    // Check INFO output.
    assertEquals(fake.infos.length, 1);
    const infoArg = fake.infos[0][0] as string;
    assertStringIncludes(infoArg, "[INFO]");

    // Check WARN output.
    assertEquals(fake.warns.length, 1);
    const warnArg = fake.warns[0][0] as string;
    assertStringIncludes(warnArg, "[WARN]");

    // Check ERROR output.
    assertEquals(fake.errors.length, 1);
    const errorArg = fake.errors[0][0] as string;
    assertStringIncludes(errorArg, "[ERROR]");
  });
});

Deno.test("CConsole setLogLevel updates the logging behavior dynamically", () => {
  withFakeConsole((fake) => {
    const cconsole = new CConsole("INFO");
    // Initially, debug messages are suppressed.
    cconsole.debug("initial debug");
    assertEquals(fake.debugs.length, 0);

    // Change log level to DEBUG.
    cconsole.setLogLevel("DEBUG");
    cconsole.debug("after update debug");
    assertEquals(fake.debugs.length, 1);
    const debugArg = fake.debugs[0][0] as string;
    assertStringIncludes(debugArg, "[DEBUG]");
  });
});

Deno.test("CConsole defaults to DEBUG for invalid log level", () => {
  withFakeConsole((fake) => {
    // Cast an invalid value to LogLevel.
    const invalidLevel = "INVALID" as LogLevel;
    const cconsole = new CConsole(invalidLevel);
    // The constructor should log a debug message warning about the invalid level.
    // Also, since it defaults to DEBUG, debug messages should be printed.
    cconsole.debug("test debug");
    // We expect at least one debug message (from the constructor or our call).
    assert(
      fake.debugs.length >= 1,
      "Expected at least one debug message for an invalid log level",
    );

    const DEBUG_CALL_FROM_CONSTRUCTOR = 1;
    // Calling debug again should log normally.
    cconsole.debug("another debug");
    assertEquals(fake.debugs.length, 2 + DEBUG_CALL_FROM_CONSTRUCTOR);
  });
});
