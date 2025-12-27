import * as fs from "fs";
import { Section, Shortcut } from "./types";

export function parseCheatsheet(filePath: string): Section[] {
  // Expand ~ to home directory
  const expandedPath = filePath.replace(/^~/, process.env.HOME || "");

  if (!fs.existsSync(expandedPath)) {
    return [];
  }

  const content = fs.readFileSync(expandedPath, "utf-8");
  const lines = content.split("\n");

  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let currentSubsection: string | undefined = undefined;
  let inFrontmatter = false;

  for (const line of lines) {
    // Handle YAML frontmatter
    if (line.trim() === "---") {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    if (inFrontmatter) continue;

    // Match section headers: > [!IMPORTANT] AppName OR ## AppName
    const sectionMatch = line.match(/^>\s*\[!IMPORTANT\]\s*(.+)$/) || line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = { name: sectionMatch[1].trim(), shortcuts: [] };
      currentSubsection = undefined;
      continue;
    }

    // Match subsection headers: > **Subsection Name** OR ### Subsection Name
    const subsectionMatch = line.match(/^>\s*\*\*(.+)\*\*$/) || line.match(/^###\s+(.+)$/);
    if (subsectionMatch) {
      currentSubsection = subsectionMatch[1].trim();
      continue;
    }

    // Match table rows: > | Key | Description | or | Key | Description |
    const tableMatch = line.match(/^>?\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/);
    if (tableMatch && currentSection) {
      const key = tableMatch[1].trim();
      const description = tableMatch[2].trim();

      // Skip header rows and separator rows
      if (
        key.toLowerCase() === "key" ||
        key.match(/^-+$/) ||
        description.toLowerCase() === "description" ||
        description.match(/^-+$/)
      ) {
        continue;
      }

      const shortcut: Shortcut = {
        key,
        description,
      };

      if (currentSubsection) {
        shortcut.subsection = currentSubsection;
      }

      currentSection.shortcuts.push(shortcut);
    }
  }

  // Don't forget the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}
