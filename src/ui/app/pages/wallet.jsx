import React from 'react';
import { Button } from '@chakra-ui/button';
import { Planet } from 'react-kawaii';
import { useHistory } from 'react-router-dom';
import { getCurrentAccount } from '../../../api/extension';

const Wallet = ({ data }) => {
  const history = useHistory();
  const [account, setAccount] = React.useState(null);
  const getAccount = async () => {
    const currentAccount = await getCurrentAccount();
    console.log(currentAccount);
    setAccount(currentAccount);
  };

  React.useEffect(() => {
    getAccount();
  }, []);

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
      <Planet
        size={200}
        mood={account && account.avatar.mood}
        color={account && account.avatar.color}
      />
      <div style={{ width: '90%', textAlign: 'center' }}>
        <div style={{ height: 40 }} />
        <div>Name</div>
        <div>{account && account.name}</div>
        <div style={{ height: 20 }} />
        <div>Payment</div>
        <div style={{ wordBreak: 'break-all' }}>
          {account && account.paymentAddr}
        </div>
        <div style={{ height: 20 }} />
        <div>Reward</div>
        <div style={{ wordBreak: 'break-all' }}>
          {account && account.rewardAddr}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
