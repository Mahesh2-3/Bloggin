import { createContext, useContext } from 'react';

export const SearchParamContext = createContext();

export const useSearchParam = () => useContext(SearchParamContext);
