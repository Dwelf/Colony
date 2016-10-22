var roleHarvester = require('role.harvester');
var roledrone = require('role.drone');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roletransporter = require('role.transporter');
var popControl = require('CreepPopulationControl');
var MaxCreeps = 40;
module.exports.loop = function () {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    Memory.Rooms = {}

    for (var name in Game.rooms) {
        var sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);
        if (Memory.Rooms[name] === undefined) {
            Memory.Rooms[name] = {};
            var room = Memory.Rooms[name];
            room.Harveters = 0;
            room.Builders = 0;
            room.Upgraders = 0;
            room.Transporters = 0;
            room.CreepTotal = 0;
            room.Sources = sources.length;
        }
        var rm = Memory.Rooms[name];

        rm.sourceAssingment = {};
        for (var item in sources) {
            rm.sourceAssingment[sources[item].id] = 0;
        }        
    }


    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        var room = Memory.Rooms[creep.room];
        room.CreepTotal++;
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);           
            room.Harveters++;
            if (creep.memory.AssignedResource !== undefined) {
               Rooms[roomName].sourceAssingment[creep.memory.AssignedResource]++;
            }
        }
        else if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
            room.Upgraders++;
        }
        else if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
            room.Builders++;
        }
        else if (creep.memory.role == 'transporter') {
            roletransporter.run(creep);
            room.Transporters++;
        }        
    }
}