import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { store } from '@/components/Features/api/Store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Stacks from './Stack/Stack';


export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    
    <Provider store={store}>
        <Stacks/>
      </Provider>

  );
}
