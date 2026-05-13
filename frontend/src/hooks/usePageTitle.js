import { useEffect } from "react";

const usePageTitle = (title) => {
  useEffect(() => {
    if (!title) {
      return;
    }
    document.title = `${title} | DevSecOps Zero Trust`;
  }, [title]);
};

export default usePageTitle;
