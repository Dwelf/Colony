var roleHarvester = {

	/** @param {Creep} creep **/
	run: function (creep,helper) {
		var roomData = Memory.Rooms[creep.room.name];
		if (creep.memory.AssignedResource !== undefined) {
			roomData.HarvesterSourceAssingment[creep.memory.AssignedResource]++;
			var source = Game.getObjectById(creep.memory.AssignedResource);
			if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
				creep.moveTo(source);
			}
		}
		else {
			roomData.unAssigned.Harveters.push(creep.name);
		}
	}

};

module.exports = roleHarvester;