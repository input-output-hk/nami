import { useEffect, useState } from "react";
import DAppConnector from "../../../plugins/DAppConnector";

function useAppDetails(origin) {
  const [name, setName] = useState();
  const [icon, setIcon] = useState();

  const getAppDetails = async () => {
    setName();
    setIcon();
    if (chrome.namiApp) {
      if (origin.includes('//')) { // Website
        setName(origin.split('//')[1]);
        setIcon(`https://www.google.com/s2/favicons?domain=${origin}&sz=32`);
      }
      else { // App
        let res = await DAppConnector.getAppDetails({ pkg: origin });
        setName(res.name);
        setIcon(res.icon);
      }
    }
    else {
      setName(origin.split('//')[1]);
      setIcon(`chrome://favicon/size/16@2x/${origin}`);
    }
  };

  useEffect(() => getAppDetails(), [origin]);

  return { name, icon };
}

export default useAppDetails;
