import { List, ActionPanel, Action, getPreferenceValues } from "@raycast/api";
import { useMemo } from "react";
import { parseCheatsheet } from "./parser";

interface Preferences {
  cheatsheetPath: string;
}

export default function Command() {
  const { cheatsheetPath } = getPreferenceValues<Preferences>();
  const sections = useMemo(
    () => parseCheatsheet(cheatsheetPath),
    [cheatsheetPath],
  );

  if (sections.length === 0) {
    return (
      <List>
        <List.EmptyView
          title="No Shortcuts Found"
          description="Check that the cheatsheet file exists and is properly formatted"
        />
      </List>
    );
  }

  return (
    <List searchBarPlaceholder="Search shortcuts...">
      {sections.map((section) => (
        <List.Section key={section.name} title={section.name}>
          {section.shortcuts.map((shortcut, idx) => (
            <List.Item
              key={`${section.name}-${idx}`}
              title={shortcut.key}
              subtitle={shortcut.description}
              keywords={[section.name, shortcut.subsection].filter(Boolean) as string[]}
              accessories={
                shortcut.subsection ? [{ text: shortcut.subsection }] : []
              }
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard
                    title="Copy Shortcut"
                    content={`${shortcut.key}: ${shortcut.description}`}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
