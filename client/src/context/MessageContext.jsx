import React, { createContext, useContext, useState } from 'react';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: '', color: 'green', visible: false });

  const showMessage = (message, color = 'green') => {
    setToast({ message, color, visible: true });

    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000); // auto hide after 3 sec
  };

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {children}
      {toast.visible && (
        <div className={`fixed top-4 font-semibold right-4 px-4 py-2 rounded shadow-lg text-white z-50 transition-all duration-300`}
             style={{ backgroundColor: toast.color }}>
          {toast.message}
        </div>
      )}
    </MessageContext.Provider>
  );
};

export const useMessage = () => useContext(MessageContext);
