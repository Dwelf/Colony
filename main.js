var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleChampion = require('role.Champion')
var roletransporter = require('role.transporter');
var roleRepair = require('role.Repair');
var popControl = require('CreepPopulationControl');
var roleTower = require('role.Tower');

var helperControl = require('helperCache');
var Roles = {
    Harvester: 0,
    Upgrader: 1,
    Builder: 2,
    Transporter: 3,
    Champion: 4,
    Repair: 5
};

module.exports.SetupProperties = function () {
    Memory.TurnsTryingToBuild = 0;
}

module.exports.SetupRooms = function () {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    for (var name in Game.rooms) {

        var sources = Game.rooms[name].find(FIND_SOURCES);
        if (Memory.Rooms == undefined) {
            Memory.Rooms = {};
        }

        if (Memory.Rooms[name] == undefined) {            
            Memory.Rooms[name] = {};
            Memory.Rooms[name].AverageResource = 0;
            Memory.Rooms[name].Ticks = 0;
            Memory.Rooms[name].TotalResource = 0;

            var sourceIds = [];
            for (var source in sources) {
                sourceIds.push(sources[source].id);
            }

            Memory.Rooms[name].Sources = sourceIds;
            Memory.Rooms[name].SourcesCount = room.Sources.length;
        }
        var room = Memory.Rooms[name];
        room.unAssigned = {};
        room.unAssigned.Harveters = [];
        room.unAssigned.Transporters = [];
        room.Harveters = 0;
        room.Builders = 0;
        room.Upgraders = 0;
        room.Transporters = 0;
        room.CreepTotal = 0;
        room.Repairs = 0;
        room.Ticks++;
        room.TotalResource += Game.rooms[name].energyAvailable;
        room.AverageResource = room.TotalResource / room.Ticks;
        room.Level = Math.ceil(room.AverageResource / 250);
        room.HarvesterMax = (room.Sources.length * 3) / room.Level;
        room.TransportersMax = (room.HarvesterMax * 3) / room.Level;

        if (room.Ticks > 2000) {
            room.Ticks = 0;
            room.TotalResource = 0;
        }

        var rm = Memory.Rooms[name];

        rm.HarvesterSourceAssingment = {};
        for (var item in sources) {
            rm.HarvesterSourceAssingment[sources[item].id] = 0;
        }

        rm.TransportersSourceAssingment = {};
        for (var item in sources) {
            rm.TransportersSourceAssingment[sources[item].id] = 0;
        }
    }

    var helpers = {};
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        var roomData = Memory.Rooms[creep.room.name];
        if (helpers[creep.room.name] == undefined) {
            helpers[creep.room.name] = Object.create(helperControl.Helper);
        }
        var helper = helpers[creep.room.name];
        roomData.CreepTotal++;

        switch (creep.memory.role) {
            case Roles.Harvester:
                roleHarvester.run(creep, helper);
                roomData.Harveters++;
                break;
            case Roles.Upgrader:
                roleUpgrader.run(creep, helper);
                roomData.Upgraders++;
                break;
            case Roles.Builder:
                roleBuilder.run(creep, helper);
                roomData.Builders++;
                break;
            case Roles.Transporter:
                roletransporter.run(creep, helper);
                roomData.Transporters++;
                break;
            case Roles.Champion:
                roleChampion.run(creep, helper);
                break;
            case Roles.Repair:
                roleRepair.run(creep, helper);
                roomData.Repairs++;
                break;
        }

    }

    for (var name in Game.rooms) {
        var helper = helpers[name];
        var towers = Game.rooms[name].find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER }
        });
        for (var tower in towers) {
            roleTower.run(towers[tower], helper)
        }
    }
}

module.exports.Assign = function () {

    //Assign for Haversters 
    // need to modify for minerals

    for (var room in Memory.Rooms) {
        var roomData = Memory.Rooms[room];
        var sources = roomData.Sources;

        for (var source in sources) {
            if (roomData.unAssigned.Harveters.length > 0) {
                if (roomData.HarvesterSourceAssingment[sources[source]] < roomData.HarvesterMax / roomData.SourcesCount) {
                    for (var creep in roomData.unAssigned.Harveters) {
                        var creeper = Game.creeps[roomData.unAssigned.Harveters.pop()];
                        creeper.memory.AssignedResource = sources[source];
                    }
                }
            }
            if (roomData.unAssigned.Transporters.length > 0) {
                if (roomData.TransportersSourceAssingment[sources[source]] < roomData.TransportersMax / roomData.SourcesCount) {
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


    for (var name in Game.rooms) {
        var roomData = Memory.Rooms[name];
        var room = Game.rooms[name];

        if (room.find(FIND_HOSTILE_CREEPS) > 1) {
            popControl.CreateCreeper([ATTACK, MOVE], Roles.Champion, room);
            room.controller.activateSafeMode();
        }
        else {
            if (roomData.Transporters < (roomData.Harvesters * 3) / roomData.Level) {
                popControl.CreateCreeper([CARRY, MOVE], Roles.Transporter, room);
            }
            else if (roomData.Harveters < roomData.HarvesterMax) {
                popControl.CreateCreeper([WORK, MOVE], Roles.Harvester, room);
            }
            else if (roomData.Upgraders / roomData.CreepTotal < 0.2) {
                popControl.CreateCreeper([CARRY, WORK, MOVE], Roles.Upgrader, room);
            }
            else if (roomData.Builders / roomData.CreepTotal < 0.05) {
                popControl.CreateCreeper([CARRY, MOVE, WORK], Roles.Builder, room);
            }
            else if (roomData.Level > 1 && roomData.Repairs < 1) {
                popControl.CreateCreeper([CARRY, MOVE, WORK], Roles.Repair, room);
            }
        }
    }

    module.exports.Assign();
}