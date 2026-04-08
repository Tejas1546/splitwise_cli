export const displayTable = <T extends Record<string, unknown>>(
  items: T[],
  indexLabel: string = 'Index',
): void => {
  if (!items || items.length === 0) {
    console.log('No records to display.');
    return;
  }

  const allKeys = Array.from(
    new Set(items.flatMap((item) => Object.keys(item))),
  );

  const formatValue = (val: unknown): string => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'object')
      return Array.isArray(val) ? '[Array]' : '[Object]';
    return String(val);
  };

  const colWidths: Record<string, number> = {
    [indexLabel]: Math.max(indexLabel.length, String(items.length).length),
  };

  allKeys.forEach((key) => {
    colWidths[key] = key.length;
    items.forEach((item) => {
      const valStr = formatValue(item[key]);
      if (valStr.length > colWidths[key]!) {
        colWidths[key] = valStr.length;
      }
    });
  });

  const pad = (str: string, len: number) => ` ${str.padEnd(len, ' ')} `;

  const drawBorder = (
    left: string,
    mid: string,
    right: string,
    char: string,
  ) => {
    const parts = [indexLabel, ...allKeys].map((k) =>
      char.repeat(colWidths[k]! + 2),
    );
    return `${left}${parts.join(mid)}${right}`;
  };

  const output: string[] = [];

  output.push(drawBorder('┌', '┬', '┐', '─'));

  const headerRow = [indexLabel, ...allKeys]
    .map((k) => pad(k, colWidths[k]!))
    .join('│');
  output.push(`│${headerRow}│`);

  output.push(drawBorder('├', '┼', '┤', '─'));

  items.forEach((item, index) => {
    const rowData = [indexLabel, ...allKeys].map((k) => {
      // Check against the dynamic label to write the number
      if (k === indexLabel) {
        return pad(String(index + 1), colWidths[k]!);
      }
      return pad(formatValue(item[k]), colWidths[k]!);
    });
    output.push(`│${rowData.join('│')}│`);
  });

  output.push(drawBorder('└', '┴', '┘', '─'));

  console.log(output.join('\n'));
};
