export interface Shortcut {
  key: string;
  description: string;
  subsection?: string;
}

export interface Section {
  name: string;
  shortcuts: Shortcut[];
}
