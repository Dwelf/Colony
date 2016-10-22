
var populationControl = {
    DesignCreeper: function(body,room)
    {
      var level = room.controller.level * room.controller.level;
      
       var bodyLength = body.length * level;
       
       var bodyDesign = [];

       var  i = 0;
       for(var part in body)
       {           
           for(var i=0; i < level; i++){
           bodyDesign.push(body[part]);
           }

           if(level > 1)
           {
           level--;
           }
       }
       return bodyDesign;
    },
    CreateCreeper: function(body,role,room)
    {           
        body = this.DesignCreeper(body,room);
        console.log(body); 
        if(Game.spawns['Spawn1'].canCreateCreep(body,undefined) == 0)
        {        
         Game.spawns['Spawn1'].createCreep(body, undefined, {role: role});
          console.log("Creating " + role);
        }
    }
};

module.exports = populationControl;