import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [isDark, setIsDark] = useState(theme=="dark");

  useEffect(() => {
    if (isDark) {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={`w-16 h-8 scale-75 flex items-center rounded-full p-1 transition-colors duration-300 ${isDark ? 'bg-[#3d3d3d93]' : 'bg-gray-300'
        }`}
    >
      <div
        className={`w-7 h-7 bg-white dark:bg-black rounded-full shadow-md transform transition-transform duration-300 ${isDark ? 'translate-x-7' : 'translate-x-0'
          } flex items-center justify-center`}
      >
        {isDark ? (
          <MoonIcon className="h-4 w-4 text-white" />
        ) : (
          <SunIcon className="h-4 w-4 text-gray-700" />

        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
