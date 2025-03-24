import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function configureCursor(targetDir) {
  // Additional configuration based on IDE selection can be implemented here

  // Copy template files based on IDE settings
  const templateDir = path.join(__dirname, "templates", "default");
  const destPath = path.join(targetDir, `.cursor`, "rules");

  // Ask about describing vibe coding stack
  const { describeStack } = await inquirer.prompt([
    {
      type: "confirm",
      name: "describeStack",
      message: "Do you want to describe technical stack for vibe coding?",
      default: false,
    },
  ]);

  if (describeStack) {
    let stackResults = [];
    let jobDescriptionResults = [];
    const stackTarget = ["backend", "frontend", "database"];
    // Iterate through each stack type to get user input
    for (const stackType of stackTarget) {
      const { stackDescription } = await inquirer.prompt([
        {
          type: "input",
          name: "stackDescription",
          message: `Describe your ${
            stackType.charAt(0).toUpperCase() + stackType.slice(1)
          } stack:`,
          default: "",
        },
      ]);

      if (stackDescription.trim()) {
        stackResults.push({
          type: stackType,
          description: stackDescription,
        });
      }
    }

    // Collect additional stack information
    const { additionalStack } = await inquirer.prompt([
      {
        type: "confirm",
        name: "additionalStack",
        message: "Would you like to add other job description?",
        default: false,
      },
    ]);

    if (additionalStack) {
      let customStackName = "";
      while (customStackName.trim() === "") {
        const { jobDescription } = await inquirer.prompt([
          {
            type: "input",
            name: "jobDescription",
            message: "Enter the job description of the project:",
          },
        ]);

        if (!jobDescription.trim()) {
          break;
        }

        jobDescriptionResults.push(jobDescription);
      }
    }

    const results = [
      ...stackResults.map(
        (result) => `${result.description} for ${result.type}`
      ),
      ...jobDescriptionResults,
    ]
      .map((result) => {
        return `- ${result}`;
      })
      .join("\n");

    const descriptionMarkdown = `---
description:
globs:
alwaysApply: true
---
Technical Stack
${results}

**Purpose:** Locks AI to a consistent tech stack, preventing unwanted deviations (e.g., JSON over SQL). This is my setup—yours might differ (e.g., add Rust or React).`;

    const spinner = ora("Configuring IDE settings...").start();

    // Check if template directory exists
    if (!fs.existsSync(templateDir)) {
      spinner.text = "Template directory not found. Creating it...";
      try {
        fs.mkdirSync(templateDir, { recursive: true });
        spinner.succeed("Template directory created successfully.");
      } catch (error) {
        spinner.fail("Failed to create template directory.");
        throw new Error(`Could not create template directory: ${templateDir}`);
      }
    }

    // Copy template files
    try {
      await fs.copy(templateDir, destPath, {
        overwrite: false,
        errorOnExist: false,
      });
      spinner.text = "Default template files have been copied.";
    } catch (error) {
      spinner.fail("Error occurred while copying template files.");
      throw error;
    }
    fs.writeFileSync(path.join(destPath, "my-stack.mdc"), descriptionMarkdown);

    console.log(chalk.green("Stack information successfully saved."));
  }
}
