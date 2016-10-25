var roleTower = {

	/** @param {Creep} creep **/
	run: function (tower,helper) {
	        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
	}

};

module.exports = roleTower;