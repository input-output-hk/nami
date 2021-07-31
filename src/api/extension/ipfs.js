import Ipfs from 'ipfs';
import FileType from 'file-type/browser';
import isSvg from 'is-svg';

// Start IPFS Node
export const startIpfs = () => {
  let ipfs;
  const initIpfs = async () => {
    if (ipfs) return;
    console.time('IPFS Started');
    ipfs = await Ipfs.create();
    console.timeEnd('IPFS Started');
  };
  initIpfs();

  chrome.runtime.onConnect.addListener(function (port) {
    if (!port.name.startsWith('IPFS')) return;
    port.onMessage.addListener(async function (msg) {
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
