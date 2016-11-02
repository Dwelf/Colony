var BasicHarvester = {
    AssignedId: 0,
    /** @param {Creep} creep **/
    run: function (creep, helper) {
        var roomData = creep.room.memory.roomData;
        if (creep.carry.energy < creep.carryCapacity) {
            if (creep.memory.AssignedResource !== undefined) {
                roomData.HarvesterSourceAssingment[creep.memory.AssignedResource]++;
                var source = Game.getObjectById(creep.memory.AssignedResource);
                var thingy = creep.harvest(source);
                if (thingy == ERR_NOT_IN_RANGE || thingy == ERR_NOT_ENOUGH_RESOURCES) {
                    creep.moveTo(source);
                }
            }
            else {
                roomData.unAssigned.Harvesters.push(creep.name);
            }
        }
        else {
            roomData.HarvesterSourceAssingment[creep.memory.AssignedResource]++;
            var sites = helper.StorageSites(creep.room)
            if (creep.transfer(sites[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sites[0]);
            }
        }
    }
};

module.exports = BasicHarvester;