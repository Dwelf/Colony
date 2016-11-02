var Roles = require('Roles');
var HarvesterBodies =
    [
        [WORK, MOVE],
        [WORK, WORK, MOVE],
        [WORK, WORK, WORK, MOVE],
        [WORK, WORK, WORK, WORK, MOVE, MOVE],
        [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE],
    ];

var BuilderBodies =
    [
        [WORK, MOVE, CARRY]
    ];

var UpgraderBodies =
    [
        [WORK, MOVE, CARRY],
        [WORK, WORK, MOVE, CARRY, CARRY],
        [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY],
    ];

var TransporterBodies =
    [
        [CARRY, MOVE],
        [CARRY, MOVE, MOVE],
        [CARRY, CARRY, MOVE, MOVE],
        [CARRY, CARRY, MOVE, MOVE, MOVE],
        [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
    ];

var RepairBodies =
    [
        [WORK, MOVE, CARRY],
        [WORK, WORK, MOVE, CARRY],
        [WORK, WORK, MOVE, CARRY]
    ];

var ScoutBodies =
    [
        [MOVE]
    ];

var TankBodies =
    [
        [MOVE, TOUGH],
        [MOVE, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH]
    ];
var BasicHarvesterBodies =
    [
        [WORK, CARRY, MOVE]
    ]


var ChampionBodies =
    [
        [ATTACK, MOVE]
    ];

var Harvester = {
    Designs: HarvesterBodies,
    Scale: false
}
var Builder =
    {
        Designs: BuilderBodies,
        Scale: false
    }

var Upgrader =
    {
        Designs: UpgraderBodies,
        Scale: false
    }

var Transporter =
    {
        Designs: TransporterBodies,
        Scale: false
    }

var Repair =
    {
        Designs: RepairBodies,
        Scale: false
    }

var Champion =
    {
        Designs: ChampionBodies,
        Scale: true
    }

var Scout =
    {
        Designs: ScoutBodies,
        Scale: true
    }

var Tank =
    {
        Designs: TankBodies,
        Scale: true
    }

var BasicHarvester =
    {
        Designs: BasicHarvesterBodies,
        Scale: true
    }

var RolesBodies = [
    Harvester,
    Upgrader,
    Builder,
    Transporter,
    Champion,
    Repair,
    Scout,
    Tank,
    BasicHarvester
];

var populationControl = {
    CostPart: function (part) {
        var cost = 0;
        switch (part) {
            case WORK:
                cost += 100;
                break;
            case MOVE:
            case CARRY:
                cost += 50;
                break;
            case ATTACK:
                cost += 80;
                break;
            case RANGED_ATTACK:
                cost += 150;
                break;
            case HEAL:
                cost += 250;
                break;
            case TOUGH:
                cost += 10;
                break;
        }

        return cost;
    },
    CostCreeper: function (body) {
        var cost = 0;
        for (var part in body) {
            cost = cost + this.CostPart(body[part]);
        }
        return cost;
    },
    DesignHarvester: function (room, roomData) {
        var maxHarvestersToSource = 0;
        var sources = roomData.Sources;

        for (var source in sources) {
            if (roomData.HarvesterSourceAssingment[sources[source]] < roomData.HarvesterSourceSourceMax[sources[source]]) {

                if (maxHarvestersToSource < roomData.HarvesterSourceSourceMax[sources[source]]) {
                    maxHarvestersToSource = roomData.HarvesterSourceSourceMax[sources[source]];
                }
            }
        }

        var optimumDesign = (RolesBodies[0].Designs.length - 1) - (maxHarvestersToSource - 1);
        console.log("Max Harvesters = " + maxHarvestersToSource)
        console.log("optimumDesign = " + optimumDesign)
        console.log(RolesBodies[0].Designs[optimumDesign]);
        var bodyBase = [];
        var CanBuild = false;

        for (var i = optimumDesign; i > -1; i--) {
            CanBuild = Math.floor(roomData.AverageResource / Memory.RoleBodyCosts[0][i]) >= 1 ? true : false;
            if (CanBuild) {
                bodyBase = RolesBodies[0].Designs[i];
                i = 0;
            }
        }

        return bodyBase;
    },
    DesignCreeper: function (role, room) {
        var roomData = room.memory.roomData;
        if (Memory.TurnsTryingToBuild > 150) {
            return RolesBodies[role].Designs[0];
        }

        if (Memory.RoleBodyCosts == undefined) {        
            Memory.RoleBodyCosts = [];
            for (var i = 0; i < RolesBodies.length; i++) {
                Memory.RoleBodyCosts.push([]);
                for (var k = 0; k < RolesBodies[i].Designs.length; k++) {
                    Memory.RoleBodyCosts[i][k] = this.CostCreeper(RolesBodies[i].Designs[k]);
                }
            }
        }

        if (role == Roles.Harvester) {          
            return this.DesignHarvester(room, roomData);
        }

        var bodyDesign = [];
        var bodyBase = [];
        var scale = 0;

        for (var i = RolesBodies[role].Designs.length - 1; i > -1; i--) {
            scale = Math.floor(roomData.AverageResource / Memory.RoleBodyCosts[role][i]);

            if (scale > 0) {
                bodyBase = RolesBodies[role].Designs[i];
                scale = RolesBodies[role].Scale ? scale : 1
                i = 0;
            }
        }
        for (var i = 0; i < scale; i++) {
            bodyDesign = bodyDesign.concat(bodyBase);
        }

        return bodyDesign;
    },
    CreateCreeper: function (role, room) {
        if (room.energyAvailable < 100) {
            return;
        }
        var body = []
        var spawn = undefined;
        for (var name in Game.spawns) {
            var checkspawn = Game.spawns[name];
            if (checkspawn.room == room && checkspawn.spawning == null) {
                spawn = checkspawn;
            }
        }
        if (spawn == undefined) {
            return;
        }
        body = this.DesignCreeper(role, room);
        console.log(body + " " + spawn.name)
        if (spawn.canCreateCreep(body, undefined) == 0) {
            spawn.createCreep(body, undefined, { role: role, room: room.name, Level: room.memory.roomData.Level });
            Memory.TurnsTryingToBuild = 0;
            console.log("Current Level : " + room.memory.roomData.Level);
            console.log("Creating " + role + " with body [" + body + "]");
        }
        else {
            Memory.TurnsTryingToBuild++;
        }
    }
};

module.exports = populationControl;