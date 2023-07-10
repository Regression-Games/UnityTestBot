import { CharInfo } from "../bossroom";

export function configureBot(rg) {
    rg.characterType = CharInfo.type[0]; // healer
}

export async function startScenario(rg) {

    const charType = CharInfo.type.indexOf(rg.characterType);

    // validate that we're in the game
    await rg.waitForScene("BossRoom");

    // find the closest human player and use a heal ability on them
    let target = await rg.findNearestEntity("HumanPlayer");
    await rg.entityExists(target);

    let skillId = CharInfo.abilities[charType][1]
    rg.performAction("PerformSkill", {
        skillId: skillId,
        targetId: target.id,
        xPosition: target.position.x,
        yPosition: target.position.y,
        zPosition: target.position.z
    })

    // validate that the heal recovers from cooldown
    await rg.entityHasAttribute(rg.getBot(), ["isOnCooldown", `ability${skillId}Available`], true); 


    // find the closest enemy and use the basic attack until it dies
    // measure from the position of a known imp, 
    // so the character doesn't try to attack through a wall
    target = await rg.findNearestEntity("Imp", { x: -3.95, y: 0.0, z: -15.5 });
    await rg.entityExists(target);
    await rg.entityHasAttribute(target, "health", 15);

    // approach the entity
    rg.performAction("FollowObject", {
        targetId: target.id,
        range: 5,
    });

    // queue three attacks
    // each one should do 5 damage
    skillId = CharInfo.abilities[charType][0];
    const args = {
        skillId: skillId,
        targetId: target.id,
        xPosition: target.position.x,
        yPosition: target.position.y,
        zPosition: target.position.z
    }
    rg.performAction("PerformSkill", args)
    await rg.entityHasAttribute(target, "health", 10);

    rg.performAction("PerformSkill", args)
    await rg.entityHasAttribute(target, "health", 5);

    rg.performAction("PerformSkill", args)
    await rg.entityDoesNotExist(target);

    rg.complete();
}