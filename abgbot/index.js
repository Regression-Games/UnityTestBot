import { CharInfo } from "../bossroom";

let CURRENT_ABILITY = 0;
let lastEnemyId = -1;
let charType = -1;

export function configureBot(rg) {
  rg.characterConfig = {
    characterType: CharInfo.type[Math.round(Math.random() * 1000000) % 4]
  };
}

let counter = 0
export async function processTick(rg) {
  console.log('Counter: ' + counter);
  ++counter;

  // The character type we request may not be the one we actually get
  const characterType = rg.characterConfig.characterType;
  if (characterType) {
    const newCharType = CharInfo.type.indexOf(characterType);
    if (charType != newCharType) {
      charType = newCharType;
      console.log(`Character type has been set: ${characterType}`);
    }
    // do not log if already the same
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
  if (charType >= 0 && charType < CharInfo.abilities.length) {
    const abilities = CharInfo.abilities[charType];
    if (abilities) {
      const abilityIndex = CURRENT_ABILITY % abilities.length;
      const ability = abilities[abilityIndex];

      if (!rg.entityHasAttribute(rg.getBot(), ["isOnCooldown", `ability${ability + 1}Available`], true, false)) {
        return;
      }

      const targetType = CharInfo.abilityTargets[charType][abilityIndex]
      let currentTarget;

      if (targetType === -1) {
        currentTarget = null;
      } else if (targetType === 1) {
        // The ability requires an enemy.

        currentTarget = await rg.getState(lastEnemyId);
        if (!currentTarget) {
          // If there was no recent enemy id, or if it's no longer available in the state then find the nearest enemy instead
          currentTarget = await rg.findNearestEntity(null, null, (entity) => {
            return entity.team === 1 && !entity.broken
          }, false)
          if (!currentTarget) {
            lastEnemyId = -1;
            return;
          }
          lastEnemyId = currentTarget.id;
        }
      } else {
        // Otherwise, this ability requires an ally - select the closest one
        currentTarget = await rg.findNearestEntity(null, null, (entity) => {
          return entity.team === 0
        }, false);
        if (!currentTarget) {
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
    } else {
      console.warn(`Invalid abilities for charType index: ${charType}`)
    }
  } else {
    console.warn(`Invalid charType index: ${charType}`)
  }

}
