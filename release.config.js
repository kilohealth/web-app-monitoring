const { semanticReleaseConfig } = require('@kilojs/semantic-release-config');

module.exports = {
  ...semanticReleaseConfig({
    defaultBranch: 'master',
    plugins: { '@semantic-release/npm': { npmPublish: true } },
  }),
  repositoryUrl: 'https://github.com/kilohealth/web-app-monitoring',
};
