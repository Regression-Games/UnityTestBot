import {BossRoomBot, CharInfo} from "../bossroom";
import {RGValidator} from "../rg";


let charType = Math.round(Math.random() * 1000000) % 4;

export function configureBot(characterType) {
  console.log(`Unity bot configureBot function called, charType: ${charType} - characterType: ${characterType}`);
  charType = CharInfo.type.indexOf(characterType);
}


let CURRENT_ABILITY = 0;

let lastEnemyId = -1;

let rgValidator = new RGValidator();

export async function runTurn(playerId, tickInfo, mostRecentMatchInfo, actionQueue) {

  // On each state, run through the validations and see if any failed or passed
  rgValidator.checkValidations(tickInfo);

  // select 1 ability per update
  selectAbility(playerId, tickInfo, mostRecentMatchInfo, actionQueue);

  //TODO: Add script sensors to the door and button so that a bot can walk to a button if door not open
}

/**
 * Selects an ability for this character, and queues that action.
 */
function selectAbility(playerId, tickInfo, mostRecentMatchInfo, actionQueue) {
  const myPlayer = BossRoomBot.getAlly(tickInfo, playerId);
  const t = tickInfo.tick;
  const charName = CharInfo.type[charType];

  // Select an ability
  const abilities = CharInfo.abilities[charType];
  const abilityIndex = CURRENT_ABILITY % abilities.length;
  const ability = abilities[abilityIndex];
  const targetType = CharInfo.abilityTargets[charType][abilityIndex]

  // If the ability requires an enemy, select the most recently referenced enemy, or the nearest enemy.
  if (targetType === 1) {
    let randomEnemy = BossRoomBot.getEnemy(tickInfo, lastEnemyId);
    if (!randomEnemy) {
      randomEnemy = BossRoomBot.nearestEnemy(tickInfo, myPlayer.position);
    }
    if (randomEnemy) {
      lastEnemyId = randomEnemy.id;
      BossRoomBot.startAbility(ability, randomEnemy.position, randomEnemy.id, actionQueue);

      // This was an offensive ability used on a target. Run three validations
      // 1. That a cooldown is now present
      // 2. That the cooldown goes away at some point in the future
      // 3. That the target has lost health

      rgValidator.validate(`[${charName}] Ability on Cooldown - Offense Ability #` + ability, t + 100, (newTick) => {
        const myState = BossRoomBot.getAlly(newTick, playerId);
        let isOnCooldown = myState.isOnCooldown[`ability${ability}Available`];
        return isOnCooldown === true; // turns null into false;
      });

      rgValidator.validate(`[${charName}] Ability Recovered from Cooldown - Offense Ability #` + ability, t + 1000, (newTick) => {
        const myState = BossRoomBot.getAlly(newTick, playerId);
        let isOnCooldown = myState.isOnCooldown[`ability${ability}Available`];
        return isOnCooldown === false; // turns null into false;
      });

      const originalHealth = randomEnemy.health;
      rgValidator.validate(`[${charName}] Damage Given - Offense Ability #` + ability, t + 1000, (newTick) => {
        const enemyState = BossRoomBot.getEnemy(newTick, randomEnemy.id);
        return !enemyState || enemyState.health < originalHealth;
      });

    } else {
      lastEnemyId = -1;
    }
  } else {
    // Otherwise, this ability might require an ally - select a random one.
    const allies = BossRoomBot.getAllies(tickInfo);
    let randomAlly;
    if (targetType === -1){
      randomAlly = null;
    } else {
      randomAlly = allies[Math.floor(Math.random() * allies.length)];
    }
    BossRoomBot.startAbility(ability, randomAlly ? randomAlly.position : null, randomAlly ? randomAlly.id : null, actionQueue);

    // This was an ally ability used on a target. Run two validations
    // 1. That a cooldown is now present
    // 2. That the cooldown goes away at some point in the future

    rgValidator.validate(`[${charName}] Ability on Cooldown - Ally Ability #` + ability, t + 100, (newTick) => {
      const myState = BossRoomBot.getAlly(newTick, playerId);
      let isOnCooldown = myState.isOnCooldown[`ability${ability}Available`];
      return isOnCooldown === true; // turns null into false;
    });

    rgValidator.validate(`[${charName}] Ability Recovered from Cooldown - Ally Ability #` + ability, t + 1000, (newTick) => {
      const myState = BossRoomBot.getAlly(newTick, playerId);
      let isOnCooldown = myState.isOnCooldown[`ability${ability}Available`];
      return isOnCooldown === false; // turns null into false;
    });

  }

  CURRENT_ABILITY++;

}

/**
 * Defines the type of character that the game should use for this bot.
 */
export function getCharacterType() {
  return CharInfo.type[charType];
}