import { useEffect, useState } from 'react';

const useClickTracker = (actionArea) => {
  const [dropDownVisible, setDropDownVisible] = useState(false);

  useEffect(() => {
    const onClickTracker = (event) => {
      if (!actionArea.current) {
        setDropDownVisible(false);
        return;
      }
      if (dropDownVisible) {
        setDropDownVisible(false);
      } else if (actionArea.current.contains(event.target)) {
        setDropDownVisible(true);
      }
    };
    document.addEventListener('click', onClickTracker);
    return function cleanup() {
      document.removeEventListener('click', onClickTracker);
    };
  }, [actionArea, dropDownVisible]);

  return dropDownVisible;
};

export default useClickTracker;
