const { rpc, Contract, Address, nativeToScVal, scValToNative } = require('@stellar/stellar-sdk');
async function run() {
  const server = new rpc.Server('https://soroban-testnet.stellar.org:443');
  const contractId = 'CCQFEGCBTC3GP5YISAKVMUYMUFEVY7EKER3BHGB5M5Z6G65JVEOL4INP';
  const contract = new Contract(contractId);
  const tx = contract.call('balance', new Address('GB6OKBNXG2NY5Y7S7I2MYHXXCUNSFD4MCL42J5R4AHRN73SOPWLDP66R').toScVal());
  // Simulating is enough for getting balance
  const txBuilder = await server.prepareTransaction(new require('@stellar/stellar-sdk').TransactionBuilder(await server.getAccount('GAVAX3CT3G2XGKNXLMAP6R6IGRVQJHP6CBVOKNJVEWXONO2ZPQYPBXCM'), { fee: '100', networkPassphrase: 'Test SDF Network ; September 2015' }).addOperation(tx).setTimeout(30).build());
  const sim = await server.simulateTransaction(txBuilder);
  if (sim.result && sim.result.retval) {
    console.log(scValToNative(sim.result.retval));
  } else {
    console.log("sim error", sim.error);
  }
}
run();
