import React from 'react';
import { Button } from '@chakra-ui/button';
import { Planet } from 'react-kawaii';
import { useHistory } from 'react-router-dom';
import { getCurrentAccount, signData, signTx } from '../../../api/extension';

const SignTx = ({ request, controller }) => {
  const history = useHistory();
  const [account, setAccount] = React.useState(null);
  const getAccount = async () => {
    const currentAccount = await getCurrentAccount();
    setAccount(currentAccount);
  };

  React.useEffect(() => {
    getAccount();
  });

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <div style={{ width: '90%', textAlign: 'center' }}>
        <div>TX SIGN REQUEST</div>
        <div style={{ height: 40 }} />
        <div>Wallet Name</div>
        <div>{account && account.name}</div>
        <div style={{ fontSize: 18 }}>Transaction to sign: </div>
        <div style={{ fontWeight: 600 }}>{request.data.txBody}</div>
        <div style={{ height: 20 }} />
        <Button
          onClick={async () => {
            const signedInfo = await signTx(
              request.data.txBody,
              request.data.keyHashes,
              'cool'
            );
            console.log(signedInfo);
            await controller.returnData(signedInfo);
            window.close();
          }}
        >
          Sign
        </Button>
        <Button
          onClick={async () => {
            await controller.returnData(null);
            window.close();
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SignTx;
