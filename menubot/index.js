import { CharInfo } from "../bossroom";

let rg = null;

export function configureBot(rg) {
  rg.isSpawnable = false;
  rg.characterType = CharInfo.type[1]; // fixed to rogue character
  rg.lifecycle = "PERSISTENT";
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

      break;
    case "PostGame":
    default:
      // teardown myself
      rg.complete()
      break;
  }

}

async function getInteractableButton(rg, buttonName) {
  const button = await rg.findEntity(buttonName);
  if (button && await rg.entityHasAttribute(button, "interactable", true)) {
    return button;
  }
  return null;
}