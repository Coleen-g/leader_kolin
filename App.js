import * as React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import AdminDrawerNavigator from './navigation/AdminDrawerNavigator'; // your main navigator

export default function App() {
  return (
    <PaperProvider>
      <AdminDrawerNavigator />
    </PaperProvider>
  );
}