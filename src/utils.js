export const noop = () => {};

export const pipe = (...cbs) => {
  let res = cbs[0];
  for (let i = 1, n = cbs.length; i < n; i++) res = cbs[i](res);
  return res;
};

export const createSymbol = name =>
  typeof Symbol === "function" ? Symbol(name) : `@@agos.${name}`;
