import type { FileFormat } from "./FormatHandler.js";

declare global {
  interface Window {
    supportedFormatCache: Map<string, FileFormat[]>;
    printSupportedFormatCache: () => string;
  }
}

export { };
