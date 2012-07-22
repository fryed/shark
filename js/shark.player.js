/*
 * THE SHARK PLAYER OBJECT
 */

shark.player = new Object();

/*
 * INIT THE SHARK PLAYER
 */

shark.player.init = function(player){
	
	//define player
	shark.player.body = player.m_body;
	
	//player speed
	shark.player.speed = 0.1;
	
	//player max speed
	shark.player.maxSpeed = 10;
	
	//if has gun
	shark.player.shooting = false;
	
	//if jumping
	shark.player.jumping = false;
	
	//set default facing
	shark.player.facing = "right";
	
	//going left
	$(document).bind("keydown","left",function(){
		shark.player.left = true;
		return false;
	});
	$(document).bind("keyup","left",function(){
		shark.player.left = false;
	});
	
	//going right
	$(document).bind("keydown","right",function(){
		shark.player.right = true;
		return false;
	});
	$(document).bind("keyup","right",function(){
		shark.player.right = false;
	});
	
	//jumping
	$(document).bind("keydown","up",function(){
		shark.player.up = true;
		return false;
	});
	$(document).bind("keyup","up",function(){
		shark.player.up = false;
	});
	
	//ducking
	$(document).bind("keydown","down",function(){
		shark.player.down = true;
		return false;
	});
	$(document).bind("keyup","down",function(){
		shark.player.down = false;
	});
	
	//shooting
	$(document).bind("keydown","space",function(){
		shark.player.shooting = true;
		shark.player.shoot();
		return false;
	});
	$(document).bind("keyup","space",function(){
		shark.player.shooting = false;
	});
	
}

/*
 * HANDLE DRAWING THE PLAYER
 * called every time the world is drawn
 */

shark.player.draw = function(){
	
	//default impulse
	shark.player.impulse = [0,0];
	
	//get player collisions
	var collisions = shark.player.body.m_contactList;
	
	//get player velocity
	var velocity = shark.player.body.GetLinearVelocity();
	
	//work out if falling or rising and which direction player is facing
	shark.player.ascending 	= false;
	shark.player.decending 	= false;
	shark.player.y			= shark.player.body.GetPosition().y;
	shark.player.x 			= shark.player.body.GetPosition().x;
	if(shark.player.y > shark.player.lasty){
		shark.player.decending = true;
	}
	if(shark.player.y < shark.player.lasty){
		shark.player.ascending = true;
	}
	if(shark.player.x < shark.player.lastx){
		shark.player.facing = "left";
	}
	if(shark.player.x > shark.player.lastx){
		shark.player.facing = "right";
	}
	shark.player.lasty = shark.player.y;
	shark.player.lastx = shark.player.x;
	
	//going left
	if(shark.player.left){
		shark.player.impulse = [-shark.player.speed,0];
		shark.player.facing  = "left";
	}
	
	//going right
	if(shark.player.right){
		shark.player.impulse = [shark.player.speed,0];
		shark.player.facing  = "right";
	}
	
	//jumping
	if(!shark.player.jumping && shark.player.up && collisions){
		velocity.y = -10;
		shark.player.body.SetLinearVelocity(velocity);
		shark.player.jumping = true;
	}
	
	//jumping left
	if(shark.player.left && shark.player.jumping){
		shark.player.impulse = [-shark.player.speed/3,0];
	}
	
	//jumping right
	if(shark.player.right && shark.player.jumping){
		shark.player.impulse = [shark.player.speed/3,0];
	}
	
	//check for collisions
	if(collisions){
		
		//check player is touching another object and allow jumping is true
		if(collisions.contact.IsTouching()){
			shark.player.jumping = false;
		}	
		
	}
	
	//limit speed to max speed
	var speed = shark.player.body.GetLinearVelocity();
	
	//right speed
	if(speed.x > shark.player.maxSpeed){
		speed.x = shark.player.maxSpeed;
		shark.player.body.SetLinearVelocity(speed);
	//left speed
	}else if((speed.x*-1) > shark.player.maxSpeed){
		speed.x = -shark.player.maxSpeed;
		shark.player.body.SetLinearVelocity(speed);
	}
	//up speed
	if((speed.y*-1) > shark.player.maxSpeed){
		speed.y = -shark.player.maxSpeed;
		shark.player.body.SetLinearVelocity(speed);
	}
	
	//linear dampening
	if(!shark.player.jumping && !shark.player.right && !shark.player.left && !shark.player.decending){
		shark.player.body.SetLinearDamping(5);
	}else{
		shark.player.body.SetLinearDamping(0);
	}

	//apply impulse
	var impulse = new b2Vec2(shark.player.impulse[0],shark.player.impulse[1]);
	shark.player.body.ApplyImpulse(impulse,shark.player.body.GetWorldCenter());
	
}

/*
 * MAKE THE PLAYER SHOOT
 */

shark.player.shoot = function(){
	
	//define the bullet
	var bullet = new Object();
	
	//set bullet speed
	bullet.speed 	= 20;
	bullet.antiGrav = -0.7;
	
	//set the bullet start position
	bullet.y = shark.player.y;
	//if facing right
	if(shark.player.facing == "right"){
		bullet.impulse = [bullet.speed,bullet.antiGrav];
		bullet.x = shark.player.x+shark.px2m(30);
	}
	//else facing left
	if(shark.player.facing == "left"){
		bullet.impulse = [-bullet.speed,bullet.antiGrav];
		bullet.x = shark.player.x-shark.px2m(30);
	}
	
	//create unique bullet id
	var bulletId = "bullet_"+(Math.floor(Math.random()*1000));
	
	//add the bullet
	bullet = {
		id 		: bulletId,
		x		: bullet.x,
		y		: bullet.y,
		radius	: shark.px2m(5),
		type	: "dynamic",
		shape	: "circle",
		impulse : bullet.impulse,
		name	: "bullet"
	}
	shark.shape(bullet);
	
	//define bullet ob
	bullet = $.extend(bullet,shark.objects[bulletId]);
	
	//get bullet body
	bullet.body = bullet.m_body;
	
	//set the bullet speed and fire
	var impulse = new b2Vec2(bullet.impulse[0],bullet.impulse[1]);
	bullet.body.ApplyImpulse(impulse,bullet.body.GetWorldCenter());
	
}


