// Import React Native Firebase trước khi import các component khác
import './src/utils/rnFirebase';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);