var _ = require('lodash');
var Helper = {
    conSites: [],
    energySources: [],
    energyStorage: [],
    sourceSite: {},
    dropped: {},
    enemies: [],
    droppedid: 0,
    roomStructures: [],
    AllStructures: function (room) {
        if (this.roomStructures.length == 0) {
            this.roomStructures = room.find(FIND_STRUCTURES)
        }
        return this.roomStructures;
    },
    ConstructionSites: function (room) {
        if (this.conSites.length == 0) {
            this.conSites = room.find(FIND_CONSTRUCTION_SITES);
        }
        return this.conSites;
    },
    Enemies: function (room) {
        if (this.enemies.length == 0) {
            this.enemies = room.find(FIND_HOSTILE_CREEPS);
        }
        return this.enemies;
    },
    StorageSites: function (room) {
        if (this.energyStorage.length == 0) {
            this.energyStorage = _.filter(this.AllStructures(room), function (structure) {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_STORAGE ||
                    structure.structureType == STRUCTURE_TOWER ||
                    structure.structureType == STRUCTURE_CONTAINER) &&
                    ((structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) ?
                        _.sum(structure.store) < structure.storeCapacity
                        : structure.energy < structure.energyCapacity)
            });
        }
        return this.energyStorage;
    },
    EnergySites: function (room) {
        if (this.energySources.length == 0) {
            this.energySources = _.filter(this.AllStructures(room), function (structure) {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_STORAGE ||
                        structure.structureType == STRUCTURE_CONTAINER) &&
                        (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) ?
                        structure.store[RESOURCE_ENERGY] > 0
                        : structure.energy > 0                
            });
        }
        return this.energySources;
    },
    InspectSite: function (id, room) {
        if (this.sourceSite[id] == undefined) {
            var source = Game.getObjectById(id);
            var targets = source.pos.findInRange(FIND_DROPPED_ENERGY, 3);
            targets = _.sortBy(targets, function (item) {
                return item.amount;
            });
            this.sourceSite[id] = targets;
        }

        if (this.sourceSite[id].length == 0) {
            // console.log("no resouces found at "+ id);
            return undefined;
        }

        if (this.droppedid == this.sourceSite[id].length) {
            this.droppedid = 0;
        }

        var droppedE = this.sourceSite[id][this.droppedid];
        this.droppedid++;
        return droppedE;
    },
    Dropped: function (room) {
        if (this.dropped == undefined) {
            var source = creep.room.find(FIND_DROPPED_ENERGY);
            this.dropped = source;
        }
        return this.dropped;
    },
    CLEANUP: function () {

        this.conSites = [];
        this.energySources = [];
        this.energyStorage = [];
        this.droppedid = 0;
        this.dropped = [];
        for (var id in this.sourceSite) {
            this.sourceSite[id] = [];
            delete this.sourceSite[id];
        }
        this.roomStructures = [];
        this.sourceSite = [];
        delete this.conSites;
        delete this.energySources;
        delete this.energyStorage;
        delete this.sourceSite;
        delete this.dropped;
    }
};

var HelperManager = {
    _helpers: {},
    Helpers: function (room) {
        if (this._helpers == undefined) {
            this._helpers = {};
        }
        if (this._helpers[room] == undefined) {
            this._helpers[room] = Object.create(Helper)
        }
        return this._helpers[room];
    },
    CleanUp: function () {
        for (var name in this._helpers) {
            this._helpers[name].CLEANUP();
            delete this._helpers[name];
        }
        this._helpers = {};
        delete this._helpers;
    }
};

module.exports = HelperManager;