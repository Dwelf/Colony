var roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep, helper) {

        var needtobuild = false;
        var upgrading = false;
        if (creep.memory.building == undefined) {
            creep.memory.building = false;
        }
        if (creep.memory.upgrading == undefined) {
            creep.memory.upgrading = false;
        }


        var targets = helper.ConstructionSites(creep.room);

        if (targets.length > 0) {
            needtobuild = true;
            upgrading = false;
        }
        else {
            upgrading = true;
            needtobuild = false;
            creep.memory.building = false;
        }

        if (needtobuild == true) {
            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.building = true;
            }

            if (creep.carry.energy == 0) {
                creep.memory.building = false;
            }

            if (creep.carry.energy < creep.carryCapacity && creep.memory.building == false) {
                // Gather some energy
                var targets = helper.EnergySites(creep.room);
                if (targets.length > 0) {
                    targets = _.sortBy(targets, function (structure) {
                        return creep.pos.getRangeTo(structure);
                    });

                    if (creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                         PathFinder.use(true);
                         console.log(creep.moveTo(targets[0]));
                    }
                }
            }

            if (creep.memory.building) {
                var targets = helper.ConstructionSites(creep.room);
                targets = _.sortBy(targets, function (structure) {
                    return creep.pos.getRangeTo(structure);
                });
                if (targets.length) {
                    if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        PathFinder.use(true);
                        creep.moveTo(targets[0]);
                    }
                }
            }
        }

        if (upgrading) {
            if (creep.memory.upgrading && creep.carry.energy == 0) {
                creep.memory.upgrading = false;

            }
            if (creep.memory.upgrading == false && creep.carry.energy == creep.carryCapacity) {
                creep.memory.upgrading = true;
            }

            if (creep.memory.upgrading) {
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    PathFinder.use(true);
                    creep.moveTo(creep.room.controller);
                }
            }
            else {
                var targets = helper.EnergySites(creep.room);
                if (targets.length > 0) {
                    targets = _.sortBy(targets, function (structure) {
                        return creep.pos.getRangeTo(structure);
                    });
                    if (creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        PathFinder.use(true);
                        creep.moveTo(targets[0]);
                    }
                }
            }
        }
    }
};

module.exports = roleBuilder;