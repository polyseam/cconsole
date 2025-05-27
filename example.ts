import { CConsole } from "./mod.ts";

const cconsole = new CConsole("DEBUG", { prefixes: { LOG: "[EGG]" } });

if (import.meta.main) {
  cconsole.padded().debug("Hello world", { version: 1 });
}
