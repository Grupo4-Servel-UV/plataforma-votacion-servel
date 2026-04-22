module.exports = function (options) {
  const defaultExternals = options.externals[0];

  return {
    ...options,
    externals: [
      function (context, callback) {
        if (context.request && context.request.startsWith('@servel/')) {
          return callback(); 
        }
        
        return defaultExternals(context, callback);
      },
    ],
  };
};