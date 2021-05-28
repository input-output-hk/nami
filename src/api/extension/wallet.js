import { EVENT, SENDER, TARGET } from '../../config/config';

export const onAccountChange = (callback) => {
  window.addEventListener('message', function responseHandler(e) {
    const response = e.data;
    if (
      typeof response !== 'object' ||
      response === null ||
      !response.target ||
      response.target !== TARGET ||
      !response.event ||
      response.event !== EVENT.accountChange ||
      !response.sender ||
      response.sender !== SENDER.extension
    )
      return;
    callback(response.data);
  });
};
