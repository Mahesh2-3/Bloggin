import { useEffect } from "react";

export function useTitle(title) {
  useEffect(() => {
    if (title){
    document.title = `${title} - Bloggin'`;
  }else{
      document.title = `Bloggin'`;

    }
  }, [title]);
}
