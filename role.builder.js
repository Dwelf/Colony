var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        var needtobuild = false; 
        
         var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
         
         
            if(targets.length > 0) {
               needtobuild = true;
            }
             
            if(needtobuild == true)
            {
                if(creep.carry.energy == creep.carryCapacity)
                {
                    creep.memory.building = true;
                }
                
                if(creep.carry.energy == 0)
                { 
                    creep.memory.building = false;
                }
                
                if(creep.carry.energy < creep.carryCapacity && creep.memory.building == false)
                {
                    // Gather some energy
                     var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy  > 0;
                    }});
                    if(targets.length > 0) {
                        if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0]);
                        }
                    }
                }
                
                if(creep.memory.building)
                {
                     var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
                }
                
                
            }
            else
            {
                // place leftovers in a store
                    var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
        }
                
    }
};

module.exports = roleBuilder;