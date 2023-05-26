const {flatRoutes} = require('remix-flat-routes');

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: 'app',
  ignoredRouteFiles: ['**/.*'],
  watchPaths: ['./public'],
  server: './server.ts',
  /**
   * The following settings are required to deploy Hydrogen apps to Oxygen:
   */
  publicPath: (process.env.HYDROGEN_ASSET_BASE_URL ?? '/') + 'build/',
  assetsBuildDirectory: 'dist/client/build',
  serverBuildPath: 'dist/worker/index.js',
  serverMainFields: ['browser', 'module', 'main'],
  serverConditions: ['worker', process.env.NODE_ENV],
  serverDependenciesToBundle: 'all',
  serverModuleFormat: 'esm',
  serverPlatform: 'neutral',
  serverMinify: process.env.NODE_ENV === 'production',
  future: {
    v2_meta: true,
    unstable_postcss: true,
    v2_errorBoundary: true,
    unstable_tailwind: true,
    v2_routeConvention: true,
    v2_normalizeFormMethod: true,
    unstable_dev: {
      port: '', // let it choose a random port
      appServerPort: process.env.APP_SERVER_PORT || process.env.PORT || 3000,
    },
  },
  routes: async (defineRoutes) => {
    return flatRoutes('routes', defineRoutes, {
      ignoredRouteFiles: [
        '.*',
        '**/*.css',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/__*.*',
      ],
    });
  },
};
