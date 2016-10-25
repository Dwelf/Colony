var roleChampion = {

    /** @param {Creep} creep **/
    run: function (creep, helper) {
        var enemies = creep.room.find(FIND_HOSTILE_CREEPS );
        if (enemies.length > 0) {
            creep.say("TERMINATE!",true);
            var attemptAttack = creep.attack(enemies[0]);
            if (creep.attack(enemies[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(enemies[0]);
            }
            else
            {
                console.log("Error:" + attemptAttack )
            }
        }
    }
};

module.exports = roleChampion;