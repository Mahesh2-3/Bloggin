import { useState } from 'react';
import { SearchParamContext } from './Searchcontext';

const SearchParamProvider = ({ children }) => {
  const [searchParam, setSearchParam] = useState('');

  return (
    <SearchParamContext.Provider value={{ searchParam, setSearchParam }}>
      {children}
    </SearchParamContext.Provider>
  );
};

export default SearchParamProvider;
