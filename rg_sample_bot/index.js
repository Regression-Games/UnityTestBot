/**
 * Defines the type of character that the game should use for this bot.
 */
export function getCharacterConfig() {
  return {
    "speed": "2000"
  };
}

export function configureBot(rg) {
  rg.characterConfig = {
    speed: 4000
  };
}

export async function processTick(rg) {

  let powerUps = rg.findEntities("PowerUp")
  if (powerUps) {
    console.log(powerUps[0].position)
    rg.performAction("MoveToPosition", powerUps[0].position)
  }

}