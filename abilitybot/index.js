import { CharInfo } from "../bossroom";

let CURRENT_ABILITY = 0;
let lastEnemyId = -1;
let charType;

export function configureBot(rg) {
  rg.characterConfig = {
    characterType: CharInfo.type[Math.round(Math.random() * 1000000) % 4]
  };
}

export async function processTick(rg) {

  // The character type we request may not be the one we actually get
  const characterType = JSON.parse(rg.characterConfig).characterType;
  if (characterType) {
    charType = CharInfo.type.indexOf(characterType);
    console.log(`Unity bot configureBot function called, charType: ${charType} - characterType: ${characterType}`);
  }

  if (rg.getState().sceneName === "BossRoom") {

    // select 1 ability per update
    await selectAbility(rg);

    // TODO: Add script sensors to the door and button so that a bot can walk to a button if door not open
  }
}

/**
 * Selects an ability for this character, and queues that action.
 */
async function selectAbility(rg) {

  // Select an ability
  const abilities = CharInfo.abilities[charType];
  const abilityIndex = CURRENT_ABILITY % abilities.length;
  const ability = abilities[abilityIndex];

  if(!rg.entityHasAttribute(rg.getBot(), ["isOnCooldown", `ability${ability + 1}Available`], true)) {
    return;
  }

  const targetType = CharInfo.abilityTargets[charType][abilityIndex]
  let currentTarget;

  if(targetType === -1) 
  {
    currentTarget = null;
  } 
  else if (targetType === 1) {
    // The ability requires an enemy.
    
    currentTarget = await rg.getState(lastEnemyId);
    if(!currentTarget) {
      // If there was no recent enemy id, or if it's no longer available in the state then find the nearest enemy instead
      currentTarget = await rg.findNearestEntity(null, null, (entity) => { return entity.team === 1 && !entity.broken } )
      if(!currentTarget) {
        lastEnemyId = -1;
        return;
      }
      lastEnemyId = currentTarget.id;
    }
  } else {
    // Otherwise, this ability requires an ally - select the closest one
    currentTarget = await rg.findNearestEntity(null, null, (entity) => { return entity.team === 0 });
    if(!currentTarget) {
      return;
    }
  }
  
  rg.performAction("PerformSkill", {
    skillId: ability,
    targetId: currentTarget?.id,
    xPosition: currentTarget?.position?.x,
    yPosition: currentTarget?.position?.y,
    zPosition: currentTarget?.position?.z
  });

  CURRENT_ABILITY++;

}
