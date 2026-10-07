module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        allowlist: ['API_BASE_URL'],
        safe: true,
        allowUndefined: false,
        verbose: false,
      },
    ],
  ],
};