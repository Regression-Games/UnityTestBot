import {BossRoomBot, CharInfo} from "../bossroom";
import {RGValidator, RGBot} from "../rg";

let charType = Math.round(Math.random() * 1000000) % 4;

export function configureBot(characterType) {
  console.log(`Unity bot configureBot function called, charType: ${charType} - characterType: ${characterType}`);
  charType = CharInfo.type.indexOf(characterType);
}

let rgValidator = new RGValidator();

let botComplete = false;

export async function runTurn(playerId, tickInfo, mostRecentMatchInfo, actionQueue) {

  // On each state, run through the validations and see if any failed or passed
  rgValidator.checkValidations(tickInfo);

  const t = tickInfo.tick;
  const sceneName = tickInfo.sceneName;

  switch (sceneName) {
    case "MainMenu":
      const startButton = getInteractableButton("StartWithRGButton");
      if (button) {
        clickButton(button.id);
      }

      const hostButton = getInteractableButton("RGHostButton");
      if (button) {
        clickButton(button.id);
      }
      break;
    case "CharSelect":
      const startButton = getInteractableButton("Seat7Button");
      if (button) {
        clickButton(button.id);
      }

      const hostButton = getInteractableButton("ReadyButton");
      if (button) {
        clickButton(button.id);
      }
      break;
    default:
      // teardown myself
      botComplete = true;
      break;
  }

}

function getInteractableButton(buttonName) {
  let buttons = RGBot.getEntitiesOfType(tickInfo, buttonName);
  if (buttons && buttons.length > 0) {
    let button = buttons[0];
    if (button.interactable) {
      return button;
    }
  }
  return null;
}

function clickButton(targetId) {
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