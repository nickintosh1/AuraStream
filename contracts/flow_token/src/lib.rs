#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token::TokenInterface, Address, Env,
    MuxedAddress, String, Symbol,
};

#[contracttype]
#[derive(Clone)]
pub enum StorageKey {
    Authority,
    AccountBalance(Address),
}

#[contract]
pub struct FlowTokenContract;

#[contractimpl]
impl TokenInterface for FlowTokenContract {
    fn name(env: Env) -> String {
        String::from_str(&env, "AuraStream Utility Token")
    }

    fn symbol(env: Env) -> String {
        String::from_str(&env, "AURA")
    }

    fn decimals(_env: Env) -> u32 {
        7
    }

    fn balance(env: Env, id: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&StorageKey::AccountBalance(id))
            .unwrap_or(0)
    }

    fn transfer(env: Env, from: Address, to: MuxedAddress, amount: i128) {
        from.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }
        let to = to.address();
        let from_balance = Self::balance(env.clone(), from.clone());
        if from_balance < amount {
            panic!("insufficient balance");
        }

        env.storage().persistent().set(
            &StorageKey::AccountBalance(from.clone()),
            &(from_balance - amount),
        );

        let to_balance = Self::balance(env.clone(), to.clone());
        env.storage().persistent().set(
            &StorageKey::AccountBalance(to.clone()),
            &(to_balance + amount),
        );

        env.events()
            .publish((symbol_short!("transfer"), from, to), amount);
    }

    fn allowance(_env: Env, _from: Address, _spender: Address) -> i128 {
        0
    }

    fn approve(
        _env: Env,
        _from: Address,
        _spender: Address,
        _amount: i128,
        _expiration_ledger: u32,
    ) {
        panic!("approve not implemented");
    }

    fn transfer_from(_env: Env, _spender: Address, _from: Address, _to: Address, _amount: i128) {
        panic!("transfer_from not implemented");
    }

    fn burn(_env: Env, _from: Address, _amount: i128) {
        panic!("burn not implemented");
    }

    fn burn_from(_env: Env, _spender: Address, _from: Address, _amount: i128) {
        panic!("burn_from not implemented");
    }
}

#[contractimpl]
impl FlowTokenContract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&StorageKey::Authority) {
            panic!("already initialized");
        }
        env.storage().instance().set(&StorageKey::Authority, &admin);
    }

    pub fn admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&StorageKey::Authority)
            .expect("admin authority not set")
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin = Self::admin(env.clone());
        admin.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }
        let balance = Self::balance(env.clone(), to.clone());
        env.storage()
            .persistent()
            .set(&StorageKey::AccountBalance(to.clone()), &(balance + amount));

        env.events()
            .publish((Symbol::new(&env, "mint"), to), amount);
    }
}

mod test;
