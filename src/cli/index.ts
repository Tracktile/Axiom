#!/usr/bin/env node

import { Type as T, Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import fs from "fs";
import loadConfig from "load-config-file";
import path from "path";
import { parse } from "ts-command-line-args";

import { generate } from "./generate";

loadConfig.register("json", (text) => JSON.parse(text));

const AxiomCliConfig = T.Object({
  entry: T.String({ default: "index.ts" }),
  output: T.String({ default: "api.yaml" }),
  internal: T.Boolean({ default: false }),
  format: T.Union([T.Literal("json"), T.Literal("yaml")], { default: "yaml" }),
  sections: T.Optional(
    T.Array(
      T.Object({
        title: T.String(),
        tags: T.Array(T.String()),
      })
    )
  ),
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
type AxiomCliConfig = Static<typeof AxiomCliConfig>;

const AxiomCliArgs = T.Object({
  config: T.Optional(T.String()),
  help: T.Optional(T.Boolean()),
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
type AxiomCliArgs = Static<typeof AxiomCliArgs>;

const fatal = (message: string) => {
  console.error(`[X] ${message}`);
  process.exit(1);
};

const info = (...args: any[]) => {
  console.info("[*]", ...args);
};

const processArgs = () => {
  try {
    const args = parse<AxiomCliArgs>(
      {
        config: {
          type: String,
          optional: true,
          description: "Path to an axiom.config.json file.",
          defaultValue: "axiom.config.json",
        },
        help: {
          type: Boolean,
          optional: true,
          alias: "h",
          description: "Displays this useful screen!",
        },
      },
      {
        helpArg: "help",
        headerContentSections: [
          {
            header: "Axiom",
            content:
              "A batteries included Typescript API framework, but like.. watch batteries.",
          },
        ],
      }
    );
    return args;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err);
      return fatal(err.message);
    }
    return fatal("Error encountered while process arguments.");
  }
};

const recurseDefaultExports = (imported: any): any => {
  if (imported.default) {
    return recurseDefaultExports(imported.default);
  }
  return imported;
};

async function loadEntry(entry: string) {
  const imported = await import(entry);
  const service = recurseDefaultExports(imported);
  return service;
}

function getConfig(configPath?: string) {
  try {
    const loaded = loadConfig.loadSync(configPath ?? "axiom.config");
    const resolvedPath = path.resolve(loaded.$cfgPath as string);
    const config = Value.Cast(AxiomCliConfig, loaded);

    // Rewrite entry and output to absolute paths based on the config file.
    config.entry = path.resolve(path.dirname(resolvedPath), config.entry);
    config.output = path.resolve(path.dirname(resolvedPath), config.output);

    info("Using config:", resolvedPath);
    return config;
  } catch (err) {
    if (err instanceof Error) {
      return fatal(
        `Unable to resolve configuration: ${configPath ?? "axiom.config"}: ${err.message}`
      );
    }
    return fatal("Unable to resolve configuration.");
  }
}

async function main() {
  const args = processArgs();
  const config = getConfig(args.config);
  const service = await loadEntry(config.entry);
  const content = await generate(service, config);
  fs.writeFileSync(path.resolve(config.output), content, { encoding: "utf8" });
  info("Specification written to:", path.resolve(config.output));
}

main();
