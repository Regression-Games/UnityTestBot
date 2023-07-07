import { CharInfo } from "../bossroom";

export function configureBot(rg) {
  rg.automatedTestMode = true;
  rg.isSpawnable = false;
  rg.characterType = CharInfo.type[1]; // fixed to rogue character
  rg.lifecycle = "PERSISTENT";
}

/**
 * Start running my test scenario
 */
export async function startScenario(rg) {

  // validate we're on the main menu
  await rg.waitForScene("MainMenu");

  // get to the character select screen
  const profileMenuButton = await rg.findEntity("ProfileMenuButton");
  await rg.entityHasAttribute(profileMenuButton, "interactable", true);
  rg.performAction("ClickButton", {targetId: profileMenuButton.id});

  const selectProfileButton = await rg.findEntity("SelectProfileButton");
  await rg.entityHasAttribute(selectProfileButton, "interactable", true);
  rg.performAction("ClickButton", {targetId: selectProfileButton.id});

  const startWithRGButton = await rg.findEntity("StartWithRGButton");
  await rg.entityHasAttribute(startWithRGButton, "interactable", true);
  rg.performAction("ClickButton", {targetId: startWithRGButton.id});

  const rgHostButton = await rg.findEntity("RGHostButton");
  await rg.entityHasAttribute(rgHostButton, "interactable", true);
  rg.performAction("ClickButton", {targetId: rgHostButton.id});


  // now we should be at character select
  await rg.entityDoesNotExist(profileMenuButton);
  await rg.entityDoesNotExist(selectProfileButton);
  await rg.entityDoesNotExist(startWithRGButton);
  await rg.entityDoesNotExist(rgHostButton);
  await rg.waitForScene("CharSelect");

  // select a character and get to the game screen
  const seat7Button = await rg.findEntity("Seat7Button");
  await rg.entityHasAttribute(seat7Button, "interactable", true);
  rg.performAction("ClickButton", {targetId: seat7Button.id});

  const readyButton = await rg.findEntity("ReadyButton");
  await rg.entityHasAttribute(readyButton, "interactable", true);
  rg.performAction("ClickButton", {targetId: readyButton.id});


  // we should be in the dungeon now
  await rg.entityDoesNotExist(seat7Button);
  await rg.entityDoesNotExist(readyButton);
  await rg.waitForScene("BossRoom");

  // dismiss the help dialogs so we can start playing
  const cheatsCancelButton = await rg.findEntity("CheatsCancelButton");
  await rg.entityHasAttribute(cheatsCancelButton, "interactable", true);
  rg.performAction("ClickButton", {targetId: cheatsCancelButton.id});

  const gameHUDStartButton = await rg.findEntity("GameHUDStartButton");
  await rg.entityHasAttribute(gameHUDStartButton, "interactable", true);
  rg.performAction("ClickButton", {targetId: gameHUDStartButton.id});

  // HUD should have been dismissed, 
  // which means our buttons should also no longer be on the screen
  await rg.entityDoesNotExist(cheatsCancelButton);
  await rg.entityDoesNotExist(gameHUDStartButton);


  // we're done!
  rg.complete()
}