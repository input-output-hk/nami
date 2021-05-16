import React from 'react';
import { useHistory } from 'react-router-dom';
import { Messaging } from '../../api/messaging';
import { METHOD } from '../../config/config';

const Start = () => {
  const history = useHistory();
  const controller = Messaging.createInternalController();
  const [website, setWebsite] = React.useState('');

  React.useEffect(() => {
    controller.requestData().then((response) => {
      console.log(response);
      setWebsite(response.currentWebpage);
    });
  }, []);
  return (
    <div>
      Start
      <div>
        <img src={website.favIconUrl} />
        <div>{website.url}</div>
      </div>
      <button
        onClick={() => {
          controller.returnData({ error: 'closed!' });
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
