var roleHarvester = {
	/** @param {Creep} creep **/
	run: function (creep, helper) {
		var roomData = creep.room.memory.roomData;
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
};

module.exports = roleHarvester;