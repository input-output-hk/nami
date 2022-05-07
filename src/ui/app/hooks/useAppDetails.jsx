import { useEffect, useState } from "react";
import DAppConnector from "../../../plugins/DAppConnector";

function useAppDetails(origin) {
  const [name, setName] = useState();
  const [icon, setIcon] = useState();

  const init = async () => {
    if (DAppConnector) {
      let res = await DAppConnector.getAppDetails({ pkg: origin });
      setName(res.name);
      setIcon(res.icon);
    }
    else {
      setName(origin.split('//')[1]);
      setIcon(`chrome://favicon/size/16@2x/${origin}`);
    }
  };

  useEffect(() => init(), []);

  return { name, icon };
}

export default useAppDetails;
