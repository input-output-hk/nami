import React from 'react';
import { useHistory } from 'react-router-dom';
import { getBalance } from '../../api/extension';
import { Messaging } from '../../api/messaging';

const Start = () => {
  const history = useHistory();
  const controller = Messaging.createInternalController();
  const [website, setWebsite] = React.useState('');

  React.useEffect(() => {
    controller.requestData().then((response) => {
      setWebsite(response.currentWebpage);
    });
  }, []);
  return (
    <div>
      Start
      <div>
        <img src={website.favicon} />
        <div>{website.url}</div>
      </div>
      <button
        onClick={() => {
          controller.returnData('CANCEL');
          window.close();
        }}
      >
        Close Me
      </button>
      <button
        onClick={() => {
          controller.returnData(true);
          window.close();
        }}
      >
        Access
      </button>
    </div>
  );
};

export default Start;
