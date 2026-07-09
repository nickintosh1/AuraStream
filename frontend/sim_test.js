const { TransactionBuilder, Networks, Account, Operation, Address, nativeToScVal } = require('@stellar/stellar-sdk');
const { rpc } = require('@stellar/stellar-sdk');

async function test() {
  const server = new rpc.Server('https://soroban-testnet.stellar.org:443');
  const depositor = 'GAVAX3CT3G2XGKNXLMAP6R6IGRVQJHP6CBVOKNJVEWXONO2ZPQYPBXCM';
  
  const sourceAccount = await server.getAccount(depositor);
  const tx = new TransactionBuilder(sourceAccount, { networkPassphrase: Networks.TESTNET, fee: '100' })
    .addOperation(Operation.invokeContractFunction({
      contract: 'CC5ZFHGX2TR3YBI4NUJFK3XZW6KTNQMYH7OCWYG4FTLMWNN3AWQLEF63',
      function: 'initiate_vesting',
      args: [
        new Address(depositor).toScVal(),
        new Address(depositor).toScVal(),
        new Address('CCQFEGCBTC3GP5YISAKVMUYMUFEVY7EKER3BHGB5M5Z6G65JVEOL4INP').toScVal(),
        nativeToScVal(1000n, { type: 'i128' }),
        nativeToScVal(10n, { type: 'u64' })
      ]
    })).setTimeout(60).build();
    
  try {
    const sim = await server.simulateTransaction(tx);
    console.log(JSON.stringify(sim, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
