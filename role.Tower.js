var roleTower = {

	/** @param {Creep} creep **/
	run: function (tower, helper) {
		var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if (closestHostile) {
			tower.attack(closestHostile);
		} else {
			var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: (structure) => structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL
			});

			if (closestDamagedStructure) {
				tower.repair(closestDamagedStructure);
			}
		}
	}
};

module.exports = roleTower;