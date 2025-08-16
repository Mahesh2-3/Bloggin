import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import SearchParamProvider from "./context/Searchparam";
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ClickSparkWrapper } from './animations/ClickSparkWrapper.jsx';
import { MessageProvider } from './context/MessageContext.jsx';
import { PostsProvider } from './components/PostsContext.jsx';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <ClickSparkWrapper>
          <SearchParamProvider>
            <MessageProvider>
            <PostsProvider>
              <App />
              </PostsProvider>
            </MessageProvider>
          </SearchParamProvider>
        </ClickSparkWrapper>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
