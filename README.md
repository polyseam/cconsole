# usage

```ts
// src/cconsole.ts
import { CConsole, type LogLevel } from "@polyseam/cconsole";
const logLevel = (Deno.env.get("VERBOSITY") ?? "DEBUG") as LogLevel;
export const cconsole = new CConsole(logLevel);
```
