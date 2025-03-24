import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { configureCursor } from "./cursor.js";
import { configureWindSurf } from "./windsurf.js";

export async function initializeVibe() {
  console.log(chalk.blue("vibe - project initializer for vibe coding"));

  try {
    // 타겟 디렉토리 선택
    const { targetDir } = await inquirer.prompt([
      {
        type: "input",
        name: "targetDir",
        message:
          "Enter the directory path to work on (default: current directory)",
        default: process.cwd(),
        validate: (input) => {
          if (!fs.existsSync(input)) {
            return "The directory does not exist. Please try again.";
          }
          return true;
        },
      },
    ]);

    // IDE selection
    const { ide } = await inquirer.prompt([
      {
        type: "list",
        name: "ide",
        message: "Which IDE would you like to use?",
        choices: [
          { name: "Cursor", value: "cursor" },
          { name: "Windsurf", value: "windsurf" },
        ],
      },
    ]);

    console.log(chalk.green(`Selected IDE: ${ide}`));
    if (ide === "cursor") {
      await configureCursor(targetDir);
    } else if (ide === "windsurf") {
      await configureWindSurf(targetDir);
    }
  } catch (error) {
    console.error(chalk.red("An error occurred:"), error);
    process.exit(1);
  }

  console.log(chalk.green("The whole process is finished."));
  console.log(chalk.blue("Your project is now ready to start!"));
}

export async function manual() {
  console.log(chalk.blue("vibe - project initializer for vibe coding"));

  console.log(chalk.green("\nUsage:"));
  console.log("  vibe init");

  console.log(chalk.green("\nDescription:"));
  console.log("  Initialize a project and configure basic settings.");

  console.log(chalk.green("\nExamples:"));
  console.log("  $ vibe init");
  console.log("  $ npx vibe init");
}
