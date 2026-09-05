// Compatibility adapter for existing consumers. Visual tooltips were retired.
// Keep labels on the controls themselves; do not create wrappers or portals.
export const Tooltip = ({ children }) => children;
