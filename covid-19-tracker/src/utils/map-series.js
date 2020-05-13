const mapSeries = async (iterable, action) => {
  for (const x of iterable) {
    await action(x);
  }
};

module.exports = mapSeries;
