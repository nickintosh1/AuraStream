#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String};

#[contract]
pub struct DummyToken;

#[contractimpl]
impl soroban_sdk::token::TokenInterface for DummyToken {
    fn allowance(env: Env, from: Address, spender: Address) -> i128 { 0 }
    fn approve(env: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32) {}
    fn balance(env: Env, id: Address) -> i128 { 0 }
    fn transfer(env: Env, from: Address, to: Address, amount: i128) {}
    fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {}
    fn burn(env: Env, from: Address, amount: i128) {}
    fn decimals(env: Env) -> u32 { 7 }
    fn name(env: Env) -> String { String::from_str(&env, "Test") }
    fn symbol(env: Env) -> String { String::from_str(&env, "TST") }
}
