import { Button } from '@chakra-ui/button';
import React from 'react';
import { setWhitelisted } from '../../../api/extension';

const Enable = ({ request, controller }) => {
  const [website, setWebsite] = React.useState('');

  React.useEffect(() => {
    setWebsite(request.currentWebpage);
  }, []);
  return (
    <div>
      Enable
      <div>
        <img src={website.favicon} />
        <div>{website.url}</div>
      </div>
      <Button
        onClick={async () => {
          await controller.returnData('CANCEL');
          window.close();
        }}
      >
        Close Me
      </Button>
      <Button
        onClick={async () => {
          await setWhitelisted(request.currentWebpage.url);
          await controller.returnData(true);
          window.close();
        }}
      >
        Access
      </Button>
    </div>
  );
};

export default Enable;
