var roleChampion = {

    /** @param {Creep} creep **/
    run: function (creep, helper) {
        var enemies = helper.Enemies(creep.room);

        enemies = _.sortBy(enemies, function (structure) {
            return creep.pos.getRangeTo(structure);
        });

        if (enemies.length > 0) {
            creep.say("TERMINATE!", true);
            var attemptAttack = creep.attack(enemies[0]);
            if (creep.attack(enemies[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(enemies[0]);
            }
            else {
                console.log("Error:" + attemptAttack)
            }
        }
        else {
            if (creep.room.name != 'W48N44') {
                var exit = creep.pos.findClosestByRange(FIND_EXIT_LEFT);
                creep.moveTo(exit);
            }
            else {
                creep.moveTo(creep.room.controller);
            }
        }
    }
};

module.exports = roleChampion;