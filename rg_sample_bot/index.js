
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