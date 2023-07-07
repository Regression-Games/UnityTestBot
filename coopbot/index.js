
export function configureBot(rg) {
  rg.automatedTestMode = true;
  rg.isSpawnable = false;
  rg.characterType = 3; // Archer
  rg.lifecycle = "PERSISTENT";
}

/**
 * Outline of our bot algorithm. For every tick:
 *  - If the bot is standing on the switch, do nothing
 *  - If the bot is not near the player, move within range of the player
 *  - If an enemy is within a certain distance of a player, attack that enemy
 *  - If the switch is within a range of 30 units from the bot, move onto the switch
 */
export async function runTurn(rg) {

  if(rg.getState().sceneName !== "BossRoom") return;

  const currentPosition = rg.getBot().position;

  // if the bot is standing on a switch, then do nothing
  const floorSwitch = await rg.findEntity("FloorSwitch");
  if(floorSwitch && await rg.entityHasAttribute(floorSwitch, "isOn", true)) return;

  // if the switch is within range of 30 units from the bot, then move onto it
  if(floorSwitch && rg.MathFunctions.distanceSq(currentPosition, floorSwitch.position) < 30) {
    rg.performAction("FollowObject", {
      targetId: floorSwitch.id,
      range: 0.1
    });
    return;
  }

  // if the bot is not near the human player, then move within range of that player
  const humanPlayer = await rg.findEntity("HumanPlayer");
  if(humanPlayer && rg.MathFunctions.distanceSq(currentPosition, humanPlayer.position) > 10 ) {
    rg.performAction("FollowObject", {
      targetId: humanPlayer.id,
      range: 2
    });
    return;
  }

  // Otherwise, attack a nearby enemy if there is one
  const enemy = await rg.findNearestEntity(null, currentPosition, (entity) => { return entity.team === 1 && !entity.broken});
  if(enemy && enemy.health > 0) {
    rg.performAction("PerformSkill", {
      skillId: 1,
      targetId: enemy.id,
      xPosition: enemy.position.x,
      yPosition: enemy.position.y,
      zPosition: enemy.position.z
    });
  }

}