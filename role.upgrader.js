var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function (creep, helper) {

        if (creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;

        }
        if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
        }

        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else {
            var targets = helper.EnergySites(creep.room);
            targets = _.sortBy(targets, function (structure) {
                return creep.pos.getRangeTo(structure);
            });

            if (targets.length > 0) {
                if (creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }

        }
    }
};

module.exports = roleUpgrader;