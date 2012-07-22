/*
 * THE SHARK COLLISION OBJECT
 */

shark.collisions = new Object();

/*
 * INIT THE SHARK COLISSION LISTENER
 */

shark.collisions.init = function(){
	
	//define listener
	shark.collisions.listener = new b2Listener();
	
	//set post solve
	shark.collisions.listener.PostSolve = shark.collisions.collision;
	
	//set listener to world
	shark.world.SetContactListener(shark.collisions.listener);
	
}

/*
 * HANDLE COLLISIONS
 */

shark.collisions.collision = function(contact,impulse){
	
	//some init vars
	var A = contact.GetFixtureA();
	var B = contact.GetFixtureB();
	
	/* HANDLE BULLETS */
	if(B.name == "bullet"){
		
		//remove bullet
		shark.rubbishBin.push(B);
		
		//check if target is destructable 
		var target = A;
		if(target.destructable){
			shark.rubbishBin.push(target);
		}
	
	}
		
}
	
