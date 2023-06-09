import {BossRoomBot, CharInfo} from "../bossroom";
import {RGValidator, RGBot} from "../rg";

let charType = 1; // fixed to rogue character

export function configureBot(characterType) {
  console.log(`Unity bot configureBot function called, charType: ${charType} - characterType: ${characterType}`);
  charType = CharInfo.type.indexOf(characterType);
}

let rgValidator = new RGValidator();

let botComplete = false;

// flags for clicking the 6 buttons we need to click to start the game
let stateFlags = {
  "RGHostButton":false,
  "StartWithRGButton":false,
  "SelectProfileButton":false,
  "ProfileMenuButton":false,
  "ReadyButton":false,
  "Seat7Button":false,
}

let playedGame = false;

export async function runTurn(playerId, tickInfo, mostRecentMatchInfo, actionQueue) {

  // On each state, run through the validations and see if any failed or passed
  rgValidator.checkValidations(tickInfo);

  const t = tickInfo.tick;
  const sceneName = tickInfo.sceneName;

  // too spammy but good for debugging
  //console.log(`Processing tickInfo: ${JSON.stringify(tickInfo)}`)

  switch (sceneName) {
    case "MainMenu":

      if (playedGame) {
        botComplete = true;
      } else {
        const hostButton = getInteractableButton(tickInfo, "RGHostButton");
        if (hostButton && stateFlags["StartWithRGButton"] && !stateFlags["RGHostButton"]) {
          clickButton(hostButton.id, actionQueue);
          stateFlags["RGHostButton"] = true
        }

        const startButton = getInteractableButton(tickInfo, "StartWithRGButton");
        if (startButton && stateFlags["SelectProfileButton"] && !stateFlags["StartWithRGButton"]) {
          clickButton(startButton.id, actionQueue);
          stateFlags["StartWithRGButton"] = true
        }

        const selectProfileButton = getInteractableButton(tickInfo, "SelectProfileButton");
        if (selectProfileButton && stateFlags["ProfileMenuButton"] && !stateFlags["SelectProfileButton"]) {
          clickButton(selectProfileButton.id, actionQueue);
          stateFlags["SelectProfileButton"] = true
        }

        const profileMenuButton = getInteractableButton(tickInfo, "ProfileMenuButton");
        if (profileMenuButton && !stateFlags["ProfileMenuButton"]) {
          clickButton(profileMenuButton.id, actionQueue);
          stateFlags["ProfileMenuButton"] = true
        }
      }

      break;
    case "CharSelect":
      if (playedGame) {
        botComplete = true;
      } else {
        const readyButton = getInteractableButton(tickInfo, "ReadyButton");
        if (readyButton && stateFlags["Seat7Button"] && !stateFlags["ReadyButton"]) {
          clickButton(readyButton.id, actionQueue);
          stateFlags["ReadyButton"] = true
        }

        const seat7Button = getInteractableButton(tickInfo, "Seat7Button");
        if (seat7Button && !stateFlags["Seat7Button"]) {
          clickButton(seat7Button.id, actionQueue);
          stateFlags["Seat7Button"] = true
        }
      }

      break;
    case "BossRoom":
      playedGame = true;

      const GameHUDStartButton = getInteractableButton(tickInfo, "GameHUDStartButton");
      if (GameHUDStartButton && stateFlags["CheatsCancelButton"] && !stateFlags["GameHUDStartButton"]) {
        clickButton(GameHUDStartButton.id, actionQueue);
        stateFlags["GameHUDStartButton"] = true
      }

      const CheatsCancelButton = getInteractableButton(tickInfo, "CheatsCancelButton");
      if (CheatsCancelButton && !stateFlags["CheatsCancelButton"]) {
        clickButton(CheatsCancelButton.id, actionQueue);
        stateFlags["CheatsCancelButton"] = true
      }

      break;
    case "PostGame":
    default:
      // teardown myself
      console.log(`Game ended, bot is Complete`)
      botComplete = true;
      break;
  }

}

function getInteractableButton(tickInfo, buttonName) {
  const buttons = RGBot.getEntitiesOfType(tickInfo, buttonName);
  //console.log(`Found buttons: ${JSON.stringify(buttons)}`)
  if (buttons && buttons.length > 0) {
    const button = buttons[0];
    if (button.interactable) {
      //console.log(`Returning button: ${JSON.stringify(button)}`)
      return button;
    }
  }
  return null;
}

function clickButton(targetId, actionQueue) {
  console.log(`Clicking button: ${targetId}`)
  const input = {
    targetId: targetId
  }
  actionQueue.queue("ClickButton", input)
}

/**
 * Defines the type of character that the game should use for this bot.
 */
export function getCharacterType() {
  return CharInfo.type[charType];
}

/**
 * Let server know if i have finished my processing
 * @returns {boolean} true if done processing and ready to be torn down
 */
export function isComplete() {
  return botComplete;
}

/**
    One of ...
    MANAGED - Server disconnects/ends bot on match/game-scene teardown
    PERSISTENT - Bot is responsible for disconnecting / ending itself
 */
export function getBotLifecycle() {
  return 'PERSISTENT';
}

export function isSpawnable() {
  return false;
}