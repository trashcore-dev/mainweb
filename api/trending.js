module.exports = (req, res) => {
  res.json({ trending: global.trending || [] });
};
