const multipleEntry = require('react-app-rewire-multiple-entry')([
    {
        entry: 'src/index_app.js',
        template: 'public/index.html',
        outPath: '/index.html'
    },
    {
        entry: 'src/index_config.js',
        template: 'public/config.html',
        outPath: '/config.html'
	}
  ]);
   
  module.exports = {
    webpack: function(config, env) {
      multipleEntry.addMultiEntry(config);
      return config;
    }
    // , devServer: function (configFunction) {
    //   multipleEntry.addEntryProxy(configFunction);
    //   return configFunction;
    // }
  };