var roleHarvester = {
	/** @param {Creep} creep **/
	run: function (creep, helper) {
	
			var source = Game.getObjectById("58133a93eac46a5651635d4a");
		var attempt = creep.pickup(source);

		console.log(attempt);
	}
};

module.exports = roleHarvester;