#!/usr/bin/env node

import { program } from "commander";
import { initializeVibe, manual } from "../src/index.js";

program
  .name("vibe")
  .description(
    "CLI tool to help with file organization through interactive prompts"
  )
  .version("1.0.0");

program
  .command("init")
  .description("Initialize a project and configure basic settings.")
  .action(() => {
    initializeVibe();
  });

program.action(() => {
  manual();
});

program.parse(process.argv);
