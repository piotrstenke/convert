import { FormatDefinition } from "../FormatHandler.ts";
import type { FileData, FileFormat, FormatHandler } from "../FormatHandler.ts";
import CommonFormats, { Category } from "src/CommonFormats.ts";
import { BSON } from "bson";

const bsonFormat = new FormatDefinition(
  "Binary JSON",
  "bson",
  "bson",
  "application/bson",
  Category.DATA
);

export class toBsonHandler implements FormatHandler {

  public name: string = "toBson";

  public supportedFormats?: FileFormat[] = [
    CommonFormats.JSON.supported("json", true, false, true),
    bsonFormat.supported("bson", false, true, true)
  ];

  public ready: boolean = false;

  async init() {
    this.ready = true;
  }

  async doConvert(
    inputFiles: FileData[],
    inputFormat: FileFormat,
    outputFormat: FileFormat
  ): Promise<FileData[]> {
    if (inputFormat.mime !== CommonFormats.JSON.mime) {
      throw "Unsupported input format";
    }

    if (outputFormat.mime !== bsonFormat.mime) {
      throw "Unsupported output format";
    }

    return inputFiles.map(file => {
      const text = new TextDecoder().decode(file.bytes);
      let jsonData = JSON.parse(text);

      // BSON required the root to be an object.
      if (Array.isArray(jsonData)) {
        jsonData = { root: jsonData };
      }

      const bsonResult = BSON.serialize(jsonData);
      const name = file.name.split(".")[0] + ".bson";

      return {
        name,
        bytes: bsonResult
      };
    });
  }
}

export class fromBsonHandler implements FormatHandler {
  public name: string = "fromBson";

  public supportedFormats?: FileFormat[] = [
    CommonFormats.JSON.supported("json", false, true, true),
    bsonFormat.supported("bson", true, false, true)
  ];

  public ready: boolean = false;

  async init() {
    this.ready = true;
  }

  async doConvert(
    inputFiles: FileData[],
    inputFormat: FileFormat,
    outputFormat: FileFormat
  ): Promise<FileData[]> {
    if (inputFormat.mime !== bsonFormat.mime) {
      throw "Unsupported input format";
    }

    if (outputFormat.mime !== CommonFormats.JSON.mime) {
      throw "Unsupported output format";
    }

    return inputFiles.map(file => {
      const bsonData = BSON.deserialize(file.bytes);
      const text = JSON.stringify(bsonData);

      const name = file.name.split(".")[0] + ".json";

      return {
        name,
        bytes: new TextEncoder().encode(text)
      };
    });
  }
}
