const { TransactionBuilder, Networks, Account, Operation, Address, nativeToScVal } = require('@stellar/stellar-sdk');
const { rpc } = require('@stellar/stellar-sdk');
async function test() {
  const server = new rpc.Server('https://soroban-testnet.stellar.org:443');
  const depositor = 'GAVAX3CT3G2XGKNXLMAP6R6IGRVQJHP6CBVOKNJVEWXONO2ZPQYPBXCM';
  const sourceAccount = await server.getAccount(depositor);
  const tx = new TransactionBuilder(sourceAccount, { networkPassphrase: Networks.TESTNET, fee: '100' })
    .addOperation(Operation.invokeContractFunction({
      contract: 'CCQFEGCBTC3GP5YISAKVMUYMUFEVY7EKER3BHGB5M5Z6G65JVEOL4INP', // new AURA
      function: 'transfer',
      args: [
        new Address(depositor).toScVal(),
        new Address(depositor).toScVal(), // transfer to self to test
        nativeToScVal(1n, { type: 'i128' }),
      ]
    })).setTimeout(60).build();
  const sim = await server.simulateTransaction(tx);
  console.log("error:", sim.error);
}
test();
