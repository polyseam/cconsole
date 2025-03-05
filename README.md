# usage

```ts
// src/cconsole.ts
import { CConsole, type LogLevel } from "@polyseam/cconsole";
const logLevel = Deno.env.get("VERBOSITY") ?? "debug";
export const cconsole = new CConsole(logLevel);
```
