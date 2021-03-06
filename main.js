var roleHarvester = require('role.harvester');
var basicHarvester = require('role.BasicHarvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleChampion = require('role.Champion');
var roletransporter = require('role.Transporter');
var roleTank = require('role.Tank');
var roleRepair = require('role.Repair');
var roleTower = require('role.Tower');
var roleScout = require('role.Scout');
var popControl = require('CreepPopulationControl');
var memoryManagement = require('MemoryManagement');
var roomManagement = require('RoomManagement');
var roomEconomyManagement = require('RoomEconomyManagement');
var helperManagement = require('roomHelper');
var Roles = require('Roles');
var _ = require('lodash');



module.exports.SetupProperties = function () {
    Memory.TurnsTryingToBuild = 0;
}

module.exports.SetupRooms = function () {
    memoryManagement.CleanUpCreeps();
    roomManagement.ProcessRooms();
}

module.exports.RunTasks = function () {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        var roomData = creep.room.memory.roomData;
        var helper = helperManagement.Helpers(creep.room.name);
        roomData.CreepTotal++;
        switch (creep.memory.role) {
            case Roles.Harvester:
                roleHarvester.run(creep, helper);
                roomData.HarvestersAverageLevel += creep.memory.Level;
                roomData.Harvesters++;
                break;
            case Roles.Upgrader:
                roleUpgrader.run(creep, helper);
                roomData.Upgraders++;
                roomData.UpgradersAverageLevel += creep.memory.Level;
                break;
            case Roles.Builder:
                roleBuilder.run(creep, helper);
                roomData.Builders++;
                roomData.BuildersAverageLevel += creep.memory.Level;
                break;
            case Roles.Transporter:
                roletransporter.run(creep, helper);
                roomData.Transporters++;
                roomData.TransportersAverageLevel += creep.memory.Level;
                break;
            case Roles.Champion:
                roleChampion.run(creep, helper);
                roomData.Champions++;
                roomData.ChampionsAverageLevel += creep.memory.Level;
                break;
            case Roles.Repair:
                roleRepair.run(creep, helper);
                roomData.Repairs++;
                roomData.RepairsAverageLevel += creep.memory.Level;
                break;
            case Roles.Scout:
                roleScout.run(creep, helper);
                // roomData.Repairs++;
                break;
            case Roles.Tank:
                roleTank.run(creep, helper);
                 roomData.Tanks++;
                break;
            case Roles.BasicHarvester:
                basicHarvester.run(creep, helper);
                roomData.BasicHarvesters++;
                break;
        }
    }

    //console.log(helper.CleanUp);

    for (var name in Game.rooms) {
        var room = Game.rooms[name]
        //var helper = helpers[name];
        var roomData = room.memory.roomData;

        var all = helperManagement.Helpers(name).AllStructures(room);

        var towers = _.filter(all, function (structure) {
            return structure.structureType == STRUCTURE_TOWER;
        });

        for (var tower in towers) {
            roleTower.run(towers[tower], helper)
        }

        if (roomData.Transporters <= roomData.TransporterMax) {
            for (var name in Game.spawns) {
                var spawn = Game.spawns[name]
                if (spawn.room == room) {
                    var creeps = spawn.pos.findInRange(FIND_MY_CREEPS, 1)
                    if (creeps.length > 0) {
                        for (var i = 0; i < creeps.length; i++) {
                            if (creeps[i].ticksToLive < 500) {
                                spawn.renewCreep(creeps[0]);
                            }
                        }
                    }
                }
            }
        }

        roomData.HarvestersAverageLevel = roomData.HarvestersAverageLevel / roomData.Harvesters;
        roomData.UpgradersAverageLevel = roomData.UpgradersAverageLevel / roomData.Upgraders;
        roomData.RepairsAverageLevel = roomData.RepairsAverageLevel / roomData.Repairs;
        roomData.TransportersAverageLevel = roomData.TransportersAverageLevel / roomData.Transporters;
        roomData.ChampionsAverageLevel = roomData.ChampionsAverageLevel / roomData.Champions;
    }
}

module.exports.SpawnCreep = function () {
    for (var name in Game.rooms) {
        var room = Game.rooms[name];
        var roomData = room.memory.roomData;
        var helper = helperManagement.Helpers(name)

        if (room.find(FIND_HOSTILE_CREEPS).length > 1) {
            popControl.CreateCreeper(Roles.Champion, room);
            room.controller.activateSafeMode();
        }
        else {
            roomEconomyManagement.ManageRoomEconomy(room, roomData);
        }
    }
}

module.exports.Assign = function () {
    //Assign for Haversters 
    // need to modify for minerals
    for (var name in Game.rooms) {
        var roomData = Game.rooms[name].memory.roomData;
        var sources = roomData.Sources;

        for (var source in sources) {
            if (roomData.unAssigned.Harvesters.length > 0) {
               
                if (roomData.HarvesterSourceAssingment[sources[source]] < roomData.HarvesterSourceSourceMax[sources[source]]) {
                    for (var creep in roomData.unAssigned.Harvesters) {
                        var creeper = Game.creeps[roomData.unAssigned.Harvesters.pop()];
                        creeper.memory.AssignedResource = sources[source];
                    }
                }
            }
            if (roomData.unAssigned.Transporters.length > 0) {
                if (roomData.TransportersSourceAssingment[sources[source]] < roomData.TransportersSourceMax[sources[source]]) {
                    for (var creep in roomData.unAssigned.Transporters) {
                        var creeper = Game.creeps[roomData.unAssigned.Transporters.pop()];
                        creeper.memory.AssignedResource = sources[source];
                    }
                }
            }
        }
    }
}



module.exports.loop = function () {
    if (Memory.TurnsTryingToBuild === undefined) {
        module.exports.SetupProperties();
    }
    module.exports.SetupRooms();
    module.exports.RunTasks();
    module.exports.SpawnCreep();
    module.exports.Assign();
    helperManagement.CleanUp();
}