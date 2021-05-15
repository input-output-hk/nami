import React from 'react';
import { useHistory } from 'react-router-dom';
import { Messaging } from '../../api/messaging';
import { METHOD } from '../../config/config';

const Start = () => {
  const history = useHistory();
  const controller = Messaging.createInternalController();

  React.useEffect(() => {
    controller.requestData();
  }, []);
  return (
    <div>
      Start<div></div>
      <button
        onClick={() => {
          controller.returnData({ cool: 'wow' });
          window.close();
        }}
      >
        Close Me
      </button>
    </div>
  );
};

export default Start;
