import { CharInfo } from "../bossroom";

let rg = null;

let CURRENT_ABILITY = 0;
let lastEnemyId = -1;
let charType = -1;

export function configureBot(rg) {
  rg.isSpawnable = false;
  rg.lifecycle = "PERSISTENT";
  rg.characterConfig = {
    characterType: CharInfo.type[1]
  }; // fixed to rogue character
}

// flags for clicking the 6 buttons we need to click to start the game
let stateFlags = {
  "RGHostButton": false,
  "StartWithRGButton": false,
  "SelectProfileButton": false,
  "ProfileMenuButton": false,
  "ReadyButton": false,
  "Seat7Button": false,
}

let playedGame = false;

export async function processTick(rg) {

  const characterType = rg.characterConfig.characterType;
  if (characterType) {
    const newCharType = CharInfo.type.indexOf(characterType);
    if (charType != newCharType) {
      charType = newCharType;
      console.log(`Character type has been set: ${characterType}`);
    }
    // do not log if already the same.. should always be the rogue for this bot
  }

  switch (rg.getState().sceneName) {
    case "MainMenu":

      if (playedGame) {
        rg.complete()
      } else {
        const hostButton = await getInteractableButton(rg, "RGHostButton");
        if (hostButton && stateFlags["StartWithRGButton"] && !stateFlags["RGHostButton"]) {
          rg.performAction("ClickButton", {targetId: hostButton.id});
          stateFlags["RGHostButton"] = true
        }

        const startButton = await getInteractableButton(rg, "StartWithRGButton");
        if (startButton && stateFlags["SelectProfileButton"] && !stateFlags["StartWithRGButton"]) {
          rg.performAction("ClickButton", {targetId: startButton.id});
          stateFlags["StartWithRGButton"] = true
        }

        const selectProfileButton = await getInteractableButton(rg, "SelectProfileButton");
        if (selectProfileButton && stateFlags["ProfileMenuButton"] && !stateFlags["SelectProfileButton"]) {
          rg.performAction("ClickButton", {targetId: selectProfileButton.id});
          stateFlags["SelectProfileButton"] = true
        }

        const profileMenuButton = await getInteractableButton(rg, "ProfileMenuButton");
        if (profileMenuButton && !stateFlags["ProfileMenuButton"]) {
          rg.performAction("ClickButton", {targetId: profileMenuButton.id});
          stateFlags["ProfileMenuButton"] = true
        }
      }

      break;
    case "CharSelect":
      if (playedGame) {
        rg.complete()
      } else {
        const readyButton = await getInteractableButton(rg, "ReadyButton");
        if (readyButton && stateFlags["Seat7Button"] && !stateFlags["ReadyButton"]) {
          rg.performAction("ClickButton", {targetId: readyButton.id});
          stateFlags["ReadyButton"] = true
        }

        const seat7Button = await getInteractableButton(rg, "Seat7Button");
        if (seat7Button && !stateFlags["Seat7Button"]) {
          rg.performAction("ClickButton", {targetId: seat7Button.id});
          stateFlags["Seat7Button"] = true
        }
      }

      break;
    case "BossRoom":
      playedGame = true;

      const GameHUDStartButton = await getInteractableButton(rg, "GameHUDStartButton");
      if (GameHUDStartButton && stateFlags["CheatsCancelButton"] && !stateFlags["GameHUDStartButton"]) {
        rg.performAction("ClickButton", {targetId: GameHUDStartButton.id});
        stateFlags["GameHUDStartButton"] = true
      }

      const CheatsCancelButton = await getInteractableButton(rg, "CheatsCancelButton");
      if (CheatsCancelButton && !stateFlags["CheatsCancelButton"]) {
        rg.performAction("ClickButton", {targetId: CheatsCancelButton.id});
        stateFlags["CheatsCancelButton"] = true
      }

      if (stateFlags["CheatsCancelButton"] && stateFlags["GameHUDStartButton"]) {
        await selectAbility(rg);
      }

      break;
    case "PostGame":
    default:
      // teardown myself
      rg.complete()
      break;
  }

}

async function getInteractableButton(rg, buttonName) {
  const button = await rg.findEntity(buttonName, false);
  if (button && await rg.entityHasAttribute(button, "interactable", true, false)) {
    return button;
  }
  return null;
}

/**
 * Selects an ability for this character, and queues that action.
 * This is similar to the code in abilityBot, but separate to avoid having
 * to maintain the 2 different bot samples' compatibility.
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