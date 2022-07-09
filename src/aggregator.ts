import axios from "axios";
import { setDefaultResultOrder } from "dns";
import fs from "fs";

let wallets: string[] = [];

const addToWallet = (address: any) => {
  if (wallets.indexOf(address) >= 0) {
    return;
  }
  wallets.push(address);
}

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

const main = async () => {
  let offset = 0;
  let limit = 25;

  while(wallets.length < 20000) {
    try {
      const data: any[] = (await axios.get(`https://api.solscan.io/nft/market/trade?offset=${offset}&limit=${limit}`))?.data?.data;

      data.forEach((subdata: any) => {
        console.log(subdata?.seller, "->", subdata?.buyer);
        addToWallet(subdata?.buyer);
        addToWallet(subdata?.seller);
      })
    } catch(err: any) {
      console.log(err?.response?.data)
      await delay(40000);
    }

    offset += limit;
    console.log(wallets.length);
  }

  console.log(wallets);
  let content = wallets.reduce((a, b) => (a += JSON.stringify(b) + ","), "[");
  content += "]";
  fs.writeFileSync('./data/wallets.json', content, "utf8");
}

main()
  .then(() => process.exit(0))
  .catch((err: Error) => {
    console.error(err);
    process.exit(1);
  });