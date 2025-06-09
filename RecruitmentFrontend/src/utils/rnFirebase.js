import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import app from '@react-native-firebase/app';

// Kiểm tra xem Firebase đã được khởi tạo chưa
if (!app().apps.length) {
  app.initializeApp();
  console.log("React Native Firebase initialized successfully");
}

// Cấu hình persistence cho authentication
auth().setPersistence(auth.Auth.Persistence.LOCAL);

export { auth, firestore, database, app };