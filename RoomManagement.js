var helperManagement = require('roomHelper');
var RoomManagement = {
    TerrainUnionBy: function (terraina, terrainb) {
        if (terraina == undefined || terrainb == undefined) {
            console.log("Arugments are invalid");
            return [];
        }

        var unList = terraina;
        var unq = true
        for (var x = 0; x < terrainb.length; x++) {
            var item = terrainb[x];
            unq = true;
            for (var y = 0; y < unList.length; y++) {
                if (item.x == unList[y].x && item.y == unList[y].y) {
                    unq = false;
                }
            }

            if (unq == true) {
                // console.log("pushed " + item.x + ":" + item.y)
                unList.push(item);
            }
        }

        return unList;
    },
    CountTraversableCells: function (cells) {
        if (cells == undefined) {
            console.log("Arugments are invalid");
            return 0;
        }

        if (cells.length == 0) {
            return 0;
        }

        if (cells[0].terrain == undefined) {
            console.log("Arugments are invalid");
            return 0;
        }

        var count = 0;

        for (var i = 0; i < cells.length; i++) {

            if (cells[i].terrain == 'plain' || cells[i].terrain == 'swamp') {
                count++;
            }
        }

        return count;
    },
    ProcessRooms: function () {
        for (var name in Game.rooms) {
            var room = Game.rooms[name];
            var roomData = room.memory.roomData;

            if (roomData == undefined) {     
                roomData = {};
                var sources = room.find(FIND_SOURCES);
                roomData.Harvesters = 0;
                roomData.BasicHarvesters = 0;
                roomData.Builders = 0;
                roomData.Upgraders = 0;
                roomData.Transporters = 0;
                roomData.Repairs = 0;
                roomData.Tanks = 0;
                roomData.Champions = 0;
                roomData.CreepTotal = 0;
                roomData.AverageResource = 0;
                roomData.Ticks = 0;
                roomData.TotalResource = 0;
                roomData.HarvesterMax = 0;
                roomData.TransporterMax = 0;
                roomData.TransportersSourceAssingment = {};
                roomData.TransportersSourceMax = {};
                roomData.HarvesterSourceAssingment = {};
                roomData.HarvesterSourceSourceMax = {};
                roomData.TransportersSourceMax = {};
                roomData.Sources = [];
                roomData.SourcesCount = 0;
                roomData.Stage = 0;
                roomData.TransporterMax = 0;
                //sets up a list of room sources to be used in memory
                var sourceIds = [];
                for (var source in sources) {
                    sourceIds.push(sources[source].id);
                }

                roomData.Sources = sourceIds;
                roomData.SourcesCount = sources.length;

                //works out how many harvesters can be at each source
                var grid = [];
                for (var i in sources) {
                    var esoource = sources[i];
                    var sourceInfo = room.lookForAtArea(LOOK_TERRAIN, esoource.pos.y - 1, esoource.pos.x - 1, esoource.pos.y + 1, esoource.pos.x + 1, true);
                    var maxHarvestersThatFit = this.CountTraversableCells(sourceInfo);
                    // if more than 3 harvesters fit round it then default it to 3 has more than 3 is overkill

                    roomData.HarvesterSourceSourceMax[sources[i].id] = maxHarvestersThatFit > 3 ? 3 : maxHarvestersThatFit;
                    roomData.HarvesterMax += roomData.HarvesterSourceSourceMax[sources[i].id];
                    grid = this.TerrainUnionBy(grid, sourceInfo);
                }

                //works out the maxium number of harvesters           
                this.CountTraversableCells(grid);

                var stores = helperManagement.Helpers(name).AllStructures(room);
                for (var i = 0; i < sources.length; i++) {
                    stores = _.sortBy(stores, function (structure) {
                        return sources[i].pos.getRangeTo(structure.x, structure.y);
                    });

                    var path = room.findPath(stores[0].pos, sources[i].pos, { ignoreCreeps: true, maxRooms: 0 })
                    roomData.TransportersSourceMax[sources[i].id] = (1 + Math.floor(path.length / 8))
                    roomData.TransporterMax += roomData.TransportersSourceMax[sources[i].id];
                }

                room.memory.roomData = roomData;
            }

            roomData.unAssigned = {};
            roomData.unAssigned.Harvesters = [];
            roomData.unAssigned.Transporters = [];
            roomData.GatheringTransporter = {};
            roomData.Ticks++;
            roomData.TotalResource += room.energyAvailable;
            roomData.AverageResource = roomData.TotalResource / roomData.Ticks;
            roomData.Level = Math.ceil(roomData.AverageResource / 250);

            for (var index in roomData.Sources) {
                roomData.HarvesterSourceAssingment[roomData.Sources[index]] = 0;
                roomData.TransportersSourceAssingment[roomData.Sources[index]] = 0;
            }

            roomData.Harvesters = 0;
            roomData.Builders = 0;
            roomData.Upgraders = 0;
            roomData.Transporters = 0;
            roomData.Repairs = 0;
            roomData.Champions = 0;
            roomData.CreepTotal = 0;
            roomData.BasicHarvesters = 0;
            roomData.HarvestersAverageLevel = 0;
            roomData.BuildersAverageLevel = 0;
            roomData.UpgradersAverageLevel = 0;
            roomData.TransportersAverageLevel = 0;
            roomData.RepairsAverageLevel = 0;
            roomData.ChampionsAverageLevel = 0;

            if (roomData.Ticks > 2000) {
                roomData.Ticks = 0;
                roomData.TotalResource = 0;
            }
        }
    }
};

module.exports = RoomManagement;