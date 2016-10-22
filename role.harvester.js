var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	        if(creep.memory.AssignedResource !== undefined)
	        {
	            var source = Game.getObjectById(creep.memory.AssignedResource);
	            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
	            }
            }
	}
};

module.exports = roleHarvester;