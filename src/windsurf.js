import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function configureWindSurf(targetDir) {
  // Additional configuration based on IDE selection can be implemented here
  const spinner = ora("Configuring IDE settings...").start();
  // Copy template files based on IDE settings
  const templateDir = path.join(__dirname, "templates", "default");

  // Copy template files
  // Check if template directory exists
  // Read all .mdc files from template directory and concat into one string
  let mdcContent = "";
  try {
    const files = fs.readdirSync(templateDir);
    for (const file of files) {
      if (file.endsWith(".mdc")) {
        const filePath = path.join(templateDir, file);
        let content = fs.readFileSync(filePath, "utf8");
        // 첫 5줄 제거
        content = content.split("\n").slice(5).join("\n");
        mdcContent += content + "\n\n";
      }
    }
  } catch (error) {
    spinner.fail("Error occurred while reading .mdc files.");
    throw error;
  }

  spinner.succeed(`All preconfigured file loaded successfully.`);

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

    mdcContent += `\n# Technical Stack
${results}

**Purpose:** Locks AI to a consistent tech stack, preventing unwanted deviations (e.g., JSON over SQL). This is my setup—yours might differ (e.g., add Rust or React).`;

    fs.writeFileSync(path.join(targetDir, ".windsurfrules"), mdcContent);

    if (mdcContent.length > 6000) {
      console.log(chalk.yellow("Warning: .windsurfrules file is too large."));
      console.log(
        chalk.yellow(
          "The file size exceeds 6000 characters and the AI model may not be able to process the entire content."
        )
      );
      console.log(
        chalk.yellow("Consider modifying it with more concise descriptions.")
      );
    }
    console.log(chalk.green("Stack information successfully saved."));
  }
}
