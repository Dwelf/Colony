var States = {
    Gathering: 0,
    FindingStore: 1,
    MovingToStore: 2,
    WaitingForStore: 3
};

var roletransporter = {
    /** @param {Creep} creep **/
    run: function (creep, helper) {

        var roomData = Memory.Rooms[creep.room.name];

        if (creep.memory.AssignedResource == undefined) {
            roomData.unAssigned.Transporters.push(creep.name);
            creep.memory.state = States.Gathering;
        }
        else {
            roomData.TransportersSourceAssingment[creep.memory.AssignedResource]++;
            switch (creep.memory.state) {
                //Gathering
                case States.Gathering:
                    if (creep.carry.energy == creep.carryCapacity) {
                        creep.memory.state = States.WaitingForStore;
                        return;
                    }

                    var droppedEnergy = helper.InspectSite(creep.memory.AssignedResource, creep.room);
                    if (droppedEnergy != undefined) {
                        var error = creep.pickup(droppedEnergy);
                        if (error == ERR_NOT_IN_RANGE) {
                            creep.moveTo(droppedEnergy);
                        }
                        else if (error != 0) {
                           console.log("Creep :" +creep.name+  " error: " + error );
                            creep.moveTo(Game.flags["TransporterStandBy"]);
                        }
                    }
                    else {
                       creep.moveTo(Game.flags["TransporterStandBy"]);
                       //console.log("Creep :" +creep.name+  " can't find any resource to collect" );
                    }
                    break;
                case States.FindingStore:
                    var targets = helper.StorageSites(creep.room);

                    if (targets.length > 0) {
                        targets = _.sortBy(targets, function (structure) {
                            return creep.pos.getRangeTo(structure);
                        });
                        creep.memory.StorageLocation = targets[0].id;
                        creep.memory.state = States.MovingToStore;
                    }
                    else {
                        // wait for store
                        creep.memory.state = States.WaitingForStore;

                    }
                    break;
                case States.MovingToStore:
                    if (creep.carry.energy == 0) {
                        creep.memory.state = States.Gathering;
                        return;
                    }

                    var target = Game.getObjectById(creep.memory.StorageLocation);

                    if (target.structureType != STRUCTURE_CONTAINER) {
                        if (target.energy < target.energyCapacity) {

                            var attempt = creep.transfer(target, RESOURCE_ENERGY);
                            if (attempt == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target);
                            }
                            else if (attempt != 0) {
                                console.log(attempt);
                            }
                        }
                        else {
                            creep.memory.state = States.WaitingForStore;
                        }
                    }
                    else if (_.sum(target.store) < target.storeCapacity) {
                        var attempt = creep.transfer(target, RESOURCE_ENERGY);
                        if (attempt == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                        else if (attempt != 0) {
                            console.log(attempt);
                        }
                    }
                    else {
                        creep.memory.state = States.WaitingForStore;
                    }
                    break;
                case States.WaitingForStore:
                    creep.moveTo(Game.flags["TransporterStandBy"]);

                    var targets = helper.StorageSites(creep.room);
                    targets = _.sortBy(targets, function (structure) {
                        return creep.pos.getRangeTo(structure);
                    });
                    if (targets.length > 0) {
                        creep.memory.StorageLocation = targets[0].id;
                        creep.memory.state = States.MovingToStore;
                    }
                    else {
                        // wait for store
                        creep.memory.state = States.WaitingForStore;
                    }
                    break;
            }
        }
    }
};

module.exports = roletransporter;