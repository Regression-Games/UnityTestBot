import { waitForDebugger } from "inspector";
import { CharInfo } from "../bossroom";
import { Validator } from "./validator";

let charType = 1; // fixed to rogue character
let rg;

export async function configureBot(bot) {

  console.log("hello?");
  
  rg = new Validator(bot)

  // validate we're on the main menu
  rg.expect(rg.state().sceneName).toEqual("MainMenu");

  // get to the character select screen
  const profileMenuButton = await rg.findEntityByType("ProfileMenuButton");
  rg.expect(profileMenuButton.interactable).toEqual(true);
  rg.performAction("ClickButton", {targetId: profileMenuButton.id});

  const selectProfileButton = await rg.findEntityByType("SelectProfileButton");
  rg.expect(selectProfileButton.interactable).toEqual(true);
  rg.performAction("ClickButton", {targetId: selectProfileButton.id});

  const startWithRGButton = await rg.findEntityByType("StartWithRGButton");
  rg.expect(startWithRGButton.interactable).toEqual(true);
  rg.performAction("ClickButton", {targetId: startWithRGButton.id});

  const rgHostButton = await rg.findEntityByType("RGHostButton");
  rg.expect(rgHostButton.interactable).toEqual(true);
  rg.performAction("ClickButton", {targetId: rgHostButton.id});


  // now we should be at character select
  rg.expect(rg.state().sceneName).toEqual("CharSelect");

  // select a character and get to the game screen
  const seat7Button = await rg.findEntityByType("Seat7Button");
  rg.expect(seat7Button.interactable).toEqual(true);
  rg.performAction("ClickButton", {targetId: seat7Button.id});

  const readyButton = await rg.findEntityByType("Seat7Button");
  rg.expect(readyButton.interactable).toEqual(true);
  rg.performAction("ClickButton", {targetId: readyButton.id});


  // we should be in the dungeon now
  rg.expect(rg.state().sceneName).toEqual("BossRoom");

  // dismiss the help dialogs so we can start playing
  const cheatsCancelButton = await rg.findEntityByType("CheatsCancelButton");
  rg.expect(cheatsCancelButton.interactable).toEqual(true);
  rg.performAction("ClickButton", {targetId: cheatsCancelButton.id});

  const gameHUDStartButton = await rg.findEntityByType("GameHUDStartButton");
  rg.expect(gameHUDStartButton.interactable).toEqual(true);
  rg.performAction("ClickButton", {targetId: gameHUDStartButton.id});


  // we're done!
  rg.complete()
}

/**
 * Let server know if i have finished my processing
 * @returns {boolean} true if done processing and ready to be torn down
 */
 export function isComplete() {
  return rg.isComplete();
}

/**
 * Defines the type of character that the game should use for this bot.
 */
export function getCharacterType() {
  return CharInfo.type[charType];
}