// Converts database rows (snake_case) into API objects (camelCase). OWNER: PM.
const toCamel = (key) => key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export const camelRow = (row) =>
  row ? Object.fromEntries(Object.entries(row).map(([key, value]) => [toCamel(key), value])) : row;

export const camelRows = (rows) => rows.map(camelRow);
