var Helper = {
    conSites: [],
    energySources: [],
    energyStorage: [],
    sourceSite: {},
    droppedid: 0,
    ConstructionSites: function (room) {
        if (this.conSites.length == 0) {
            this.conSites = room.find(FIND_CONSTRUCTION_SITES);
        }
        return this.conSites;
    },
    StorageSites: function (room) {
        if (this.energyStorage.length == 0) {
            this.energyStorage = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_STORAGE || 
                        structure.structureType == STRUCTURE_TOWER ||
                        structure.structureType == STRUCTURE_CONTAINER )&& 
                        ((structure.structureType == STRUCTURE_CONTAINER) ?
                            _.sum(structure.store) < structure.storeCapacity
                            : structure.energy < structure.energyCapacity)
                }
            });
        }
        return this.energyStorage;
    },
    EnergySites: function (room) {
        if (this.energySources.length == 0) {
            this.energySources = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_STORAGE ||
                        structure.structureType == STRUCTURE_CONTAINER ) &&
                        (structure.structureType == STRUCTURE_CONTAINER)?
                            structure.store[RESOURCE_ENERGY] > 0
                            : structure.energy > 0                
                }
            });
        }
        return this.energySources;
    },
    InspectSite: function (id, room) {
        if (this.sourceSite[id] == undefined) {
            var source = Game.getObjectById(id);
            this.sourceSite[id] = source.pos.findInRange(FIND_DROPPED_ENERGY, 4);
        }
        
        if(this.sourceSite[id].length ==0)
        {
           // console.log("no resouces found at "+ id);
         return undefined;   
        }
        if (this.droppedid == this.sourceSite[id].length) {
            this.droppedid = 0;
        }
        var returnValue = this.sourceSite[id][this.droppedid];
        this.droppedid++;
        return returnValue;
    },
    CLEANUP: function () {

        this.conSites = [];
        this.energySources = [];
        this.energyStorage = [];
        this.droppedid = 0;
        for(var id in this.sourceSite)
        {
            this.sourceSite[id]=[];
        }
        
    }
};
module.exports.Helper = Helper;