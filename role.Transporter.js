var States = {
    Gathering: 0,
    WaitingForStore: 1,
    MovingToStore: 2,
    GatheringFromSource: 3,
    WaitingToGather: 4
};

var roletransporter = {
    CheckCapacity: function (creep, helper) {
        if (_.sum(creep.carry) == creep.carryCapacity) {
            this.WaitingForStore(creep, helper);
        }
    },
    Gathering: function (creep, helper) {
        creep.memory.state = 0;
        if (_.sum(creep.carry) == creep.carryCapacity) {
            this.WaitingForStore(creep, helper);;
            return;
        }
        var droppedEnergy = helper.InspectSite(creep.memory.AssignedResource, creep.room);
        if (droppedEnergy) {
            var attempt = creep.pickup(droppedEnergy);
            if (attempt == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedEnergy);
            }

            if (attempt == 0) {
                if (_.sum(creep.carry) == creep.carryCapacity) {
                    this.WaitingForStore(creep, helper);
                    return;
                }
            }
        }
    },
    GatheringFromSource: function (creep, helper) {
        creep.memory.state = 3;
        if (_.sum(creep.carry) == creep.carryCapacity) {
            this.WaitingForStore(creep, helper);
            return;
        }
        var sources = helper.Dropped();
        if (sources.length > 0) {
            var attempt = creep.pickup(sources[0]);
            if (attempt == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }

            if (attempt == 0) {
                this.Gathering(creep, helper);
                return;
            }
        }
        else {
            this.Gathering(creep, helper);
            return;
        }
    },
    WaitingForStore: function (creep, helper) {
        creep.memory.state = 1;
        creep.moveTo(Game.flags["TransporterStandBy"]);
        var targets = [];
        if (_.sum(creep.carry) != creep.carry.energy) {
            targets = _.filter(helper.AllStructures(creep.room), function (structure) {
                return (structure.structureType == STRUCTURE_STORAGE ||
                    structure.structureType == STRUCTURE_CONTAINER) &&
                    _.sum(structure.store) < structure.storeCapacity
            });
        }
        else {
            targets = helper.StorageSites(creep.room);
        }

        if (targets.length == 0 || targets == undefined) {
            return;
        }

        targets = _.sortBy(targets, function (structure) {
            return creep.pos.getRangeTo(structure)
        });

        creep.memory.StorageLocation = targets[0].id;
        this.MovingToStore(creep, helper)
    },
    MovingToStore: function (creep, helper) {
        creep.memory.state = 2;
        if (_.sum(creep.carry) == 0) {
            this.GatheringFromSource(creep, helper);
            return;
        }

        var target = Game.getObjectById(creep.memory.StorageLocation);
        var CanTransfer = false;
       
        if(target == undefined || target == null)
        {
            console.log("Error " + creep.name + " : " + creep.memory.StorageLocation)
             creep.memory.state = 1;
             return;
        }


        if (target.structureType == STRUCTURE_CONTAINER || target.structureType == STRUCTURE_STORAGE) {
            CanTransfer = (_.sum(target.store) < target.storeCapacity);
        }
        else {
            CanTransfer = (target.energy < target.energyCapacity);
        }

        if (CanTransfer == false) {
            this.WaitingForStore(creep, helper);
            return;
        }

        var attemptTransfer = undefined;
        for (var resourceType in creep.carry) {
            attemptTransfer = creep.transfer(target, resourceType);
        }
        if (attemptTransfer == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
        //if transfered
        if (attemptTransfer == 0) {
            // if still has energy left          
            if (_.sum(creep.carry) > 0) {
                // look for another store              
                creep.memory.state = 1;
            } // go back to Gathering
            else {
                this.GatheringFromSource(creep, helper);
            }
        }
    },
    /** @param {Creep} creep **/
    run: function (creep, helper) {
        var roomData = creep.room.memory.roomData;
        if (creep.memory.state == undefined || creep.memory.AssignedResource == undefined) {
            creep.memory.state = States.Gathering;
            roomData.unAssigned.Transporters.push(creep.name);
            return;
        }

        roomData.TransportersSourceAssingment[creep.memory.AssignedResource]++;
        switch (creep.memory.state) {
            case States.Gathering:
                this.Gathering(creep, helper);
                break;
            case States.WaitingToGather:
                break;
            case States.GatheringFromSource:
                this.GatheringFromSource(creep, helper);
                break;
            case States.WaitingForStore:
                this.WaitingForStore(creep, helper);
            case States.MovingToStore:
                this.MovingToStore(creep, helper);
                break;
        }
    }
};

module.exports = roletransporter; 