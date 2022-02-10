/*
 * This is an example of a Rust smart contract with two simple, symmetric functions:
 *
 * 1. set_greeting: accepts a greeting, such as "howdy", and records it for the user (account_id)
 *    who sent the request
 * 2. get_greeting: accepts an account_id and returns the greeting saved for it, defaulting to
 *    "Hello"
 *
 * Learn more about writing NEAR smart contracts with Rust:
 * https://github.com/near/near-sdk-rs
 *
 */

// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, setup_alloc, AccountId};
use near_sdk::collections::{LookupMap, UnorderedMap};
use near_sdk::serde::{Deserialize, Serialize};

setup_alloc!();

// Structs in Rust are similar to other languages, and may include impl keyword as shown below
// Note: the names of the structs are not important when calling the smart contract, but the function names are
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct GameFight {
    // lookupMap to search name of hero by id
    records_heros: LookupMap<AccountId, String>,
    // lists info of heros 
    heros: UnorderedMap<usize, Hero>,
    owner: AccountId
}

#[derive(Clone, Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Hero {
    pub name: String,
    pub level: u8,
    pub damage: u16,
    pub health: u16,
    pub id: usize,
    pub owner: AccountId
}

impl Default for GameFight {
  fn default() -> Self {
    Self {
        records_heros: LookupMap::new(b"a".to_vec()),
        heros: UnorderedMap::new(b"post".to_vec()),
        owner: env::signer_account_id()
    }
  }
}

#[near_bindgen]
impl GameFight {

    // create_new_hero
    pub fn create_hero(&mut self, name: String) -> usize {
        // user create hero
        let owner = env::signer_account_id();

        let hero =  Hero {
            name,
            level: 0,
            damage: 0,
            health: 100,
            owner,
            id: self.heros.len() as usize
        };

        self.heros.insert(&hero.id, &hero);

        // return id of hero
        hero.id
    }

    // get info of a hero
    pub fn get_hero(&self, id: usize) ->  Hero {
        self.heros.get(&id).unwrap().clone()
    }

    // get info of all hero 
    pub fn get_all_hero(&self) -> Vec<Hero> {
        self.heros.values().collect()
    }


    // delete_hero
    pub fn delete_hero(&mut self, id: usize) {
        
        let user = env::signer_account_id();

        // just onwer of contract can delete hero
        assert_eq!(self.owner, user, "Just Owner of contract can delete hero");
        self.heros.remove(&id);
    }

    // edit name of hero
    pub fn edit_hero(&mut self, id: usize, name: String) {
        // check if current user is not owner
        let user = env::signer_account_id();
        assert_eq!(self.owner, user, "Just Only owner of contract can edit hero");

        let mut hero = self.heros.get(&id).unwrap();
        assert_eq!(hero.owner, user, "Only owner created hero can edit hero");

        hero.name = name;

        self.heros.insert(&id, &hero);
        
    }

    // level up hero
    pub fn lvlup_hero(&mut self, id: usize) {
        let user = env::signer_account_id();
        
        let mut hero = self.heros.get(&id).unwrap();
        assert_eq!(hero.owner, user, "Only owner created hero can edit hero");


        hero.level += 1;
        hero.health += 50;

        self.heros.insert(&id, &hero);
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 *
 * To run from contract directory:
 * cargo test -- --nocapture
 *
 * From project root, to run in combination with frontend tests:
 * yarn test
 *
 */
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

    // mock the context for testing, notice "signer_account_id" that was accessed above from env::
    fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
        VMContext {
            current_account_id: "alice_near".to_string(),
            signer_account_id: "bob_near".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "carol_near".to_string(),
            input,
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view,
            output_data_receivers: vec![],
            epoch_height: 19,
        }
    }


    #[test]
    fn test_create_hero() {
        let context = get_context(vec![], false);
        testing_env!(context);

        let mut contract = GameFight::default();

        let hero_one = contract.create_hero("Kha_Banh".to_string());
        assert_eq!(hero_one, 0);

        let hero_two = contract.create_hero("Huan_Rose".to_string());
        assert_eq!(hero_two, 1);
    }

    #[test]
    fn test_edit_hero() {
        let context = get_context(vec![], false);
        testing_env!(context);

        let mut contract = GameFight::default();

        let hero_one = contract.create_hero("Kha_Banh".to_string());
        assert_eq!(hero_one, 0);

        let hero_two = contract.create_hero("Huan_Rose".to_string());
        assert_eq!(hero_two, 1);


        contract.edit_hero(hero_one, "Kha_Banh_Super".to_string());

        let hero_khabanh = contract.get_hero(hero_one);

        assert_eq!(hero_khabanh.name.to_string(), "Kha_Banh_Super".to_string());
    }

    #[test]
    fn test_lvlup_hero() {
        let context = get_context(vec![], false);
        testing_env!(context);

        let mut contract = GameFight::default();

        let hero_one = contract.create_hero("Kha_Banh".to_string());
        assert_eq!(hero_one, 0);       

        assert_eq!(contract.get_hero(hero_one).level, 0);

        contract.lvlup_hero(hero_one);
        assert_eq!(contract.get_hero(hero_one).level, 1);

    }
}
