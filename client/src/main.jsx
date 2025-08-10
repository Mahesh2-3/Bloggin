import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import SearchParamProvider from "./context/Searchparam";
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ClickSparkWrapper } from './animations/ClickSparkWrapper.jsx';
import { MessageProvider } from './context/MessageContext.jsx';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <ClickSparkWrapper>
          <SearchParamProvider>
            <MessageProvider>
              <App />
            </MessageProvider>
          </SearchParamProvider>
        </ClickSparkWrapper>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
