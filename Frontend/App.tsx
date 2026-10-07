/**
 * Entry component. Everything else lives under src/.
 *
 * @format
 */

import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LeadsScreen from './src/screens/LeadsScreen';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <LeadsScreen />
    </SafeAreaProvider>
  );
}

export default App;
