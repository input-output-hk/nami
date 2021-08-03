import Ipfs from 'ipfs';
import FileType from 'file-type/browser';
import isSvg from 'is-svg';

// currently not in use, because of some issues with keeping ipfs-js alive

// Start IPFS Node
export const startIpfs = () => {
  let ipfs;
  const initIpfs = async () => {
    if (ipfs) return;
    try {
      console.time('IPFS Started');
      const result = await Ipfs.create();
      ipfs = result;
      console.timeEnd('IPFS Started');
    } catch (e) {
      console.log(e);
      return initIpfs();
    }
  };

  const awaitIpfs = () =>
    new Promise((res, rej) => {
      const interval = setInterval(() => {
        if (ipfs) {
          clearInterval(interval);
          res();
          return;
        }
      });
    });

  initIpfs();

  chrome.runtime.onConnect.addListener(function (port) {
    if (!port.name.startsWith('IPFS')) return;
    port.onMessage.addListener(async function (msg) {
      await awaitIpfs();
      for await (const file of ipfs.get(msg.hash)) {
        const content = [];
        for await (const chunk of file.content) {
          content.push(chunk);
        }
        const fileType = isSvg(content[0])
          ? { type: 'image/svg+xml' }
          : await FileType.fromBuffer(content[0]);
        const blob = new Blob(content, fileType);
        const url = URL.createObjectURL(blob);
        port.postMessage(url);
      }
    });
  });
};
