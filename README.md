# cconsole

A simple, colorful, console replacement for Deno.

# usage

```ts
// src/cconsole.ts
import { CConsole, type LogLevel } from "@polyseam/cconsole";

const logLevel = (Deno.env.get("VERBOSITY") ?? "DEBUG") as LogLevel;
export const cconsole = new CConsole(logLevel);

cconsole.debug(
  "Hello, world!",
  "these messages will only be displayed in 'DEBUG' mode",
);
// [DEBUG] Hello, world! these messages will only be displayed in 'DEBUG' mode

cconsole.info(
  "FYI, world!",
  "these messages will be displayed in 'INFO' mode and above",
);
// [INFO] FYI, world! these messages will be displayed in 'INFO' mode and above

cconsole.warn(
  "Watch out, world!",
  "these messages will be displayed in 'WARN' mode and above",
);
// [WARN] Watch out, world! these messages will be displayed in 'WARN' mode and above

cconsole.error("Yikes, world!", "these messages will always be displayed");
// [ERROR] Yikes, world! these messages will always be displayed
```
