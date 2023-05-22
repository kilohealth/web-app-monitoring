const defaultParams = {
  plugins: {
    '@semantic-release/npm': { npmPublish: false },
    '@semantic-release/git': {
      message:
        // eslint-disable-next-line no-template-curly-in-string
        'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    },
  },
  defaultBranch: 'main',
};

// TODO: remove after outsourcing @kilojs/semantic-release-config
// this is copy paste from there
function semanticReleaseConfig(params) {
  return {
    branches: [
      '+([0-9])?(.{+([0-9]),x}).x',
      params.defaultBranch ?? defaultParams.defaultBranch,
      'next',
      'next-major',
      { name: 'beta', prerelease: true },
      { name: 'alpha', prerelease: true },
    ],
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      '@semantic-release/changelog',
      '@semantic-release/gitlab',
      [
        '@semantic-release/npm',
        {
          ...(defaultParams.plugins
            ? defaultParams.plugins['@semantic-release/npm']
            : undefined),
          ...(params.plugins
            ? params.plugins['@semantic-release/npm']
            : undefined),
        },
      ],
      [
        '@semantic-release/git',
        {
          ...(defaultParams.plugins
            ? defaultParams.plugins['@semantic-release/git']
            : undefined),
          ...(params.plugins
            ? params.plugins['@semantic-release/git']
            : undefined),
        },
      ],
    ],
  };
}

module.exports = {
  ...semanticReleaseConfig({
    defaultBranch: 'main',
    plugins: { '@semantic-release/npm': { npmPublish: true } },
  }),
  repositoryUrl: 'https://github.com/kilohealth/web-app-monitoring',
};
