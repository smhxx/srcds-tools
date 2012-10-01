module.exports = process.env.SRCDSTOOLS_COV
  ? require('./lib-cov')
  : require('./lib');
