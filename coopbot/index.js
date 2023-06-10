import {BossRoomBot, CharInfo} from "../bossroom";
import {MathFunctions} from "../rg";

let charType = 3; // Archer

export function configureBot(characterType) {
  console.log(`Unity bot configureBot function called, charType: ${charType} - characterType: ${characterType}`);
  charType = CharInfo.type.indexOf(characterType);
}

/**
 * Outline of our bot algorithm. For every tick:
 *  - If the bot is standing on the switch, do nothing
 *  - If the bot is not near the player, move within range of the player
 *  - If an enemy is within a certain distance of a player, attack that enemy
 *  - If the switch is within a range of 30 units from the bot, move onto the switch
 */
export async function runTurn(playerId, tickInfo, mostRecentMatchInfo, actionQueue) {


  if ("BossRoom" == tickInfo.sceneName) {

    // First, get all the information needed to perform the various checks
    const myState = BossRoomBot.getAlly(tickInfo, playerId);
    const doorSwitchState = BossRoomBot.getDoorSwitch(tickInfo);

    // If the bot is standing on the switch, do nothing
    if (doorSwitchState && doorSwitchState.isOn) return;

    // If the switch is within a range of 30 units from the bot, move onto the switch
    if (doorSwitchState && MathFunctions.distanceSq(myState.position, doorSwitchState.position) < 30) {
      BossRoomBot.followObject(doorSwitchState, 0.1, actionQueue);
      return;
    }

    // If the bot is not near the player, move within range of the player
    const humanPlayer = BossRoomBot.getHumans(tickInfo)[0];
    if (humanPlayer && MathFunctions.distanceSq(humanPlayer.position, myState.position) > 7) {
      BossRoomBot.followObject(humanPlayer, 2, actionQueue);
      return;
    }

    // Otherwise, attack nearby enemies, if there is one
    const nearbyEnemy = BossRoomBot.nearestEnemy(tickInfo, myState.position);
    if (nearbyEnemy) {
      BossRoomBot.startAbility(1, nearbyEnemy.position, nearbyEnemy.id, actionQueue);
    }
  }
}

/**
 * Defines the type of character that the game should use for this bot (in this case an Archer)
 */
export function getCharacterType() {
  return CharInfo.type[charType];
}
