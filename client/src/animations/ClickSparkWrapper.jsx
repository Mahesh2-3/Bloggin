import { useTheme } from '../context/ThemeContext';
import ClickSpark from './ClickSpark';


export const ClickSparkWrapper = ({ children }) => {
  const { theme } = useTheme();

  return (
    <ClickSpark
      sparkColor={theme === 'dark' ? '#fff' : '#000'}
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      {children}
    </ClickSpark>
  );
};