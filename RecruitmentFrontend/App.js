// App.js (nằm ngoài thư mục src)

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'; // Điều hướng của ứng dụng
import { AuthProvider } from './src/contexts/authContext'; // Đảm bảo đường dẫn chính xác
import { UserProvider } from './src/contexts/userContext'; // Cung cấp thông tin người dùng
import { JobSeekerProvider } from './src/contexts/jobSeekerContext'; // Cung cấp thông tin hồ sơ người tìm việc
import RootNavigator from './src/navigation/RootNavigator'; // Điều hướng chính của ứng dụng

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <JobSeekerProvider>
          <Router>
            <RootNavigator /> {/* Điều hướng chính */}
          </Router>
        </JobSeekerProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
