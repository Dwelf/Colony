
var Harvester = {
    0: [WORK,MOVE],
    1: [WORK, WORK,MOVE],
    2: [WORK,WORK,WORK, MOVE],
    3: [WORK,WORK,WORK,MOVE,MOVE],
    scale:false
}
var Builder = 
{
    0: [WORK,MOVE,CARRY],
     scale:true
}

var Upgrader = 
{
    0: [WORK,MOVE,CARRY],
    1: [WORK,MOVE,MOVE,CARRY,CARRY],
    2: [WORK,WORK,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY],
     scale:true
}

var Transporter =
{
    0:[CARRY.MOVE],
    1:[CARRY,MOVE,MOVE],
    scale:true
}

var Repair = 
{
    0: [WORK,MOVE,CARRY],
    1: [WORK,WORK,MOVE,CARRY],
    2: [WORK,WORK,MOVE,CARRY],
     scale:true
}

var Champion = 
{
    0: [ATTACK,MOVE],
     scale:true
}

var RolesBodies = [
    Harvester,
    Upgrader,
    Builder,
    Transporter,
    Champion,
    Repair
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
    DesignCreeper: function (body, room) {
        if(Memory.RoleBodyCosts == undefined)
        {
            Memory.RoleBodyCosts = [];
            for(var i =0; i < RolesBodies.length;  i++)
            {
                Memory.RoleBodyCosts.push([]);
                for(var k = 0; k< RolesBodies[i].length; k++)
                {
                      Memory.RoleBodyCosts[i][k] = CostCreeper(RolesBodies[i][k]);
                }
            }
        }

        var level = Memory.Rooms[room.name].Level;

        if (level < 2) {
            return body;
        }

        if (body.length > 2) {
            level--;
        }

        var bodyDesign = [];

        var i = 0;
        for (var part in body) {
            for (var i = 0; i < level; i++) {
                bodyDesign.push(body[part]);
            }
        }

        if (this.CostCreeper(bodyDesign) <= room.energyCapacityAvailable) {

            return bodyDesign;
        }
        else if (Memory.TurnsTryingToBuild > 90) {
            return body;
        }
    },
    CreateCreeper: function (body, role, room) {
        if (room.energyAvailable < 150) {
            return;
        }

        body = this.DesignCreeper(body, room);

        if (Game.spawns['Spawn1'].canCreateCreep(body, undefined) == 0) {
            Game.spawns['Spawn1'].createCreep(body, undefined, { role: role, room: room.name });
            Memory.TurnsTryingToBuild = 0;
            console.log("Current Level : " + Memory.Rooms[room.name].Level);
            console.log("Creating " + role + " with body [" + body + "]");
        }
        else {
            Memory.TurnsTryingToBuild++;
        }
    }
};

module.exports = populationControl;