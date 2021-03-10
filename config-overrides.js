const WorkerPlugin = require('worker-plugin')

module.exports = (config, env) => {
  // config.plugins = [...config.plugins, new WorkerPlugin()]
  // config.module.rules = [
  //   {
  //     test: /\.worker\.(c|m)?js$/i,
  //     use: { loader: 'worker-loader' }
  //   },
  //   ...config.module.rules
  // ]
  return config
}
