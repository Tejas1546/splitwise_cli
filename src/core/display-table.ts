export const displayTable = <T extends Record<string, unknown>>(
  items: T[],
): void => {
  if (!items || items.length === 0) {
    console.log('No records to display.');
    return;
  }
  console.table(items);
};
