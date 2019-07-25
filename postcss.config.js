module.exports = {
  plugins: [
      require('cssnano')({
          preset: ['default', {
            //   normalizeWhitespace: false
          }],
      }),
  ],
};