var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    
            var sources = _.filter(creep.room.flags,)
          
          
          var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy  > 0;
                    }});
        
             if(creep.carry.energy > 0)
             {
                 creep.drop("ENERGY");
             }
	}
};

module.exports = roleMiner;