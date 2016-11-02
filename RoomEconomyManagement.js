var popControl = require('CreepPopulationControl');
var memoryManagement = require('MemoryManagement');
var roomManagement = require('RoomManagement');
var helperManagement = require('roomHelper');
var Roles = require('Roles');
var RoomEconomyManagement =
    {
        HarvestStore: function (room, roomData) {
            if (roomData.BasicHarvesters < roomData.HarvesterMax) {
                popControl.CreateCreeper(Roles.BasicHarvester, room);
            }
            else if (roomData.Upgraders < Math.ceil(roomData.Level / 3)) {
                popControl.CreateCreeper(Roles.Upgrader, room);
            }
            else if (helperManagement.Helpers(room.name).ConstructionSites(room).length > 0 && roomData.Builders < Math.ceil(roomData.Level / 3)) {
                popControl.CreateCreeper(Roles.Builder, room);
            }            
        },
        HarvestDropGather: function (room, roomData) {
            var helper = helperManagement.Helpers(room.name)
            if (roomData.Transporters < roomData.Harvesters * 2 && roomData.Transporters < roomData.TransporterMax) {
                popControl.CreateCreeper(Roles.Transporter, room);
            }
            else if (roomData.Harvesters < roomData.HarvesterMax) {
                popControl.CreateCreeper(Roles.Harvester, room);
            }
            else if (roomData.Upgraders < Math.ceil(roomData.Level / 3)) {
                popControl.CreateCreeper(Roles.Upgrader, room);
            }
            else if (helper.ConstructionSites(room).length > 0 && roomData.Builders < Math.ceil(roomData.Level / 3)) {
                popControl.CreateCreeper(Roles.Builder, room);
            }
            else if (roomData.Level > 1 && roomData.Repairs < 1) {
                popControl.CreateCreeper(Roles.Repair, room);
            }
        },
        HarvestStoreAndTransport: function (room, roomData) {
            if (roomData.Transporters < roomData.Harvesters * 2 && roomData.Transporters < roomData.TransporterMax) {
                popControl.CreateCreeper(Roles.Transporter, room);
            }
            else if (roomData.Harvesters < roomData.HarvesterMax) {
                popControl.CreateCreeper(Roles.Harvester, room);
            }
            else if (roomData.Upgraders < Math.ceil(roomData.Level / 3)) {
                popControl.CreateCreeper(Roles.Upgrader, room);
            }
            else if (helper.ConstructionSites(room).length > 0 && roomData.Builders < Math.ceil(roomData.Level / 3)) {
                popControl.CreateCreeper(Roles.Builder, room);
            }
            else if (roomData.Level > 1 && roomData.Repairs < 1) {
                popControl.CreateCreeper(Roles.Repair, room);
            }
        },
        UpgradeFromHarvestStore: function () {
            var MakeT = false;
            for (var name in Game.creeps) {
                var creep = Game.creeps[name];

                if (creep.memory.role == Roles.BasicHarvester) {
                    if (MakeT) {
                        creep.memory.role = Roles.Harvester;
                        MakeT = false;
                    }
                    else {
                        creep.memory.role = Roles.Transporter;
                        MakeT= true
                    }
                }
            }
        },
        HarvestStoreUpgrade: function (room, roomData) {
            var helper = helperManagement.Helpers(room.name)
            var extensions = _.filter(helper.AllStructures(room), function (structure) {
                return structure.structureType == STRUCTURE_EXTENSION
            });

            if (extensions.length > 4) {
                this.UpgradeFromHarvestStore();
                roomData.Stage = 1;
            }
        },
        ManageRoomEconomy: function (room, roomData) {
            switch (roomData.Stage) {
                case 0:
                    this.HarvestStore(room, roomData);
                    this.HarvestStoreUpgrade(room, roomData);
                    break;
                case 1:
                    this.HarvestDropGather(room, roomData);
                    break;
                case 2:
                    this.HarvestStoreAndTransport(room, roomData);
                    break;
            }
        }
    };

module.exports = RoomEconomyManagement;