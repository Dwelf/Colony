var roleRepair = {

    /** @param {Creep} creep **/
    run: function (creep, helper) {

        if (creep.carry.energy == 0) {
            creep.memory.Repairing = false;
        }

        if (creep.memory.Repairing == false) {
            var targets = helper.EnergySites(creep.room);
            if (targets.length > 0) {
                targets = _.sortBy(targets, function (structure) {
                    return creep.pos.getRangeTo(structure);
                });

                if (creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }

            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.Repairing = true;
                creep.memory.RepairSite = undefined;
            }
        }
        else {
            if (creep.memory.RepairSite == undefined) {

                var structToRepair = creep.room.find(FIND_STRUCTURES, {
                    filter: function (object) {
                        return object.hits < object.hitsMax / 3 && object.hits < 2000;
                    }
                });
                if (structToRepair.length > 0) {
                    creep.memory.RepairSite = structToRepair[0].id;

                    // perhaps check the results again?

                } else {
                    // if nothing to repair work on walls
                    var structToRepair = creep.room.find(FIND_STRUCTURES, {
                        filter: function (object) {
                            return object.hits < object.hitsMax / 3;
                        }
                    });

                    if (structToRepair.length > 0) {
                        structToRepair = _.sortBy(structToRepair, function (structure) {
                            return structure.hits / structure.hitsMax;
                        });

                        creep.memory.RepairSite = structToRepair[0].id;
                    }
                }
            }

            if (creep.memory.RepairSite != undefined) {
                var target = Game.getObjectById(creep.memory.RepairSite);

                if (target.hits < target.hitsMax) {
                    if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
                else {
                    creep.memory.RepairSite = undefined;
                }
            }
        }
    }
};

module.exports = roleRepair;