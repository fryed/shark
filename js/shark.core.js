/*
 * THE SHARK OBJECT
 */

var shark = new Object();

/*
 * INIT SHARK
 */

shark.init = function(){
	
	//defaults
	shark.defaults = {
		canvas  : "#canvas",
		debug 	: false
	}
	
	//merge defaults and options
	$.extend(shark.defaults,shark.options);
	
	//grab the canvas and context etc
	shark.canvas 	= $(shark.options.canvas);
	shark._canvas 	= shark.canvas.get(0);
	shark.ctx		= shark._canvas.getContext("2d");
	
	//define some vars
	shark.scale			= "1:60"; //1m equals 60px 
	shark.objects		= new Object();
	shark.objectNo 		= 0;
	shark.rubbishBin  	= new Array();
	
	//create the world
	shark.world = new b2World(
		new b2Vec2(0,20), 	//gravity
		true				//allow sleep
	);
	
	//init the collision listener
	shark.collisions.init();
	
	//*****TEMP BOUNDRIES*****//
	
	//floor
	var floor = {
		id		: "floor",
		x 		: shark.px2m(shark.canvas.width()),
		y 		: shark.px2m(shark.canvas.height())*2,
		width 	: shark.px2m(shark.canvas.width()),
		height 	: shark.px2m(2)
	}
	shark.shape(floor);
	
	//ceiling
	var ceiling = {
		id		: "ceiling",
		x 		: shark.px2m(shark.canvas.width()),
		y 		: 0,
		width 	: shark.px2m(shark.canvas.width()),
		height 	: shark.px2m(2)
	}
	shark.shape(ceiling);
	
	//walls
	var wall = {
		id		: "leftWall",
		x 		: 0,
		y 		: shark.px2m(shark.canvas.height()),
		width 	: shark.px2m(2),
		height 	: shark.px2m(shark.canvas.height())
	}
	shark.shape(wall);
	var wall = {
		id		: "rightWall",
		x 		: shark.px2m(shark.canvas.width())*2,
		y 		: shark.px2m(shark.canvas.height()),
		width 	: shark.px2m(2),
		height 	: shark.px2m(shark.canvas.height())
	}
	shark.shape(wall);
	
	//*****TEMP PLAYER*****//
	var player = {
		id		: "player",
		x		: shark.px2m(shark.canvas.width()),
		y 		: shark.px2m(shark.canvas.height())*2,
		radius	: shark.px2m(20),
		type 	: "dynamic",
		shape	: "circle"
	}
	player = shark.shape(player);
	
	//init the player
	shark.player.init(player);
	
	//*****TEMP OBSTACLES*****//
	var obNo = 10;
	for(i=0; i < obNo; i++){
		var ob = {
			id 				: "ob"+i,
			x				: shark.px2m(50),
			y				: shark.px2m(30),
			width			: Math.random()+0.1,
			height			: Math.random()+0.1,
			type			: "dynamic",
			destructable 	: true
		}
		shark.shape(ob);
	}
	
	//*****TEMP SLOW MO*****//
	$(document).bind("keydown","shift",function(){
		if(shark.slowMo){
			shark.slowMo = false;
		}else{
			shark.slowMo = true;
		}
		return false;
	});

	//*****ADD PRELOADER HERE*****//
	
	//*****ADD LEVEL LOADER HERE*****//
	shark.sceneLoaded 		= true;
	shark.charactersLoaded  = true;
	
	//check all if loaded then continue
	!function checkLoaded(){
		if(shark.sceneLoaded && shark.charactersLoaded){
			shark.draw();
		}else{
			setTimeout(checkLoaded,10);
		}
	}();
	
	//if in debug mode
	if(shark.options.debug){
		shark.debugDraw();
		console.log(shark);
	}
	
}

/*
 * DRAW SHARK
 */

shark.draw = function(){
	
	//step the world
	shark.world.Step(1/60,10,10);
	
	//draw the player
	shark.player.draw();
	
	//clear all forces
	shark.world.ClearForces();

	//if in debug then draw debug
	if(shark.options.debug){
		shark.world.DrawDebugData();
	}
	
	//remove unwanted items
	//any body needed to be removed should be pushed to
	//shark.rubbishBin to be removed safely
	$.each(shark.rubbishBin,function(i,item){
		shark.world.DestroyBody(item.m_body);
	});
	shark.rubbishBin = new Array();
	
	//if in slowMo mode use timeout to draw frame for more control
	if(shark.slowMo){
		setTimeout(shark.draw,200);
	//else use request anim frame for better performance
	}else{
		requestAnimationFrame(shark.draw);
	}
	
}

/*
 * CREATE A SHAPE
 */

shark.shape = function(params){
	
	//box defaults
	var defaults = {
		id			: "Ob_"+shark.objectNo,
		x			 : 0,
		y			 : 0,
		radius		 : 1,
		width		 : 1,
		height		 : 1,
		density  	 : 1,
		friction 	 : 1,
		restitution  : 0.1,
		type		 : "static",
		shape		 : "box",
		destructable : false
	}
	
	//merge params and defaults
	var params = $.extend(defaults,params);
	
	//set the fixdef
	var fixDef = new b2FixtureDef;
	fixDef.density 		= params.density;
	fixDef.friction 	= params.friction;
	fixDef.restitution 	= params.restitution;
	
	//set the body def
	var bodyDef = new b2BodyDef;
	
	//set type
	if(params.type == "static"){
		bodyDef.type = b2Body.b2_staticBody;
	}else if(params.type == "dynamic"){
		bodyDef.type = b2Body.b2_dynamicBody;
	}else{
		bodyDef.type = b2Body.b2_kinematicbody;
	}
	
	//set shape
	if(params.shape == "box"){
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox(params.width,params.height);
	}else if(params.shape == "circle"){
		fixDef.shape = new b2CircleShape(params.radius);
	}
	
	//position
	bodyDef.position.Set(params.x,params.y);
	
	//create shape
	var shape = shark.world.CreateBody(bodyDef).CreateFixture(fixDef);
	
	//merge shape and params
	shape = $.extend(shape,params);
	
	//add shape to objects
	shark.objects[params.id] = shape;
	
	shark.objectNo++;
	
	//return shape
	return shape;
	
}

/*
 * CONVERT PX TO METERS
 */

shark.px2m = function(px){
	var ratio = shark.scale.split(":");
	ratio = parseInt(ratio[0])/parseInt(ratio[1]);
	return px*ratio;
}

/*
 * CONVERT METERS TO PX 
 */

shark.m2px = function(m){
	var ratio = shark.scale.split(":");
	ratio = parseInt(ratio[1])/parseInt(ratio[0]);
	return m*ratio;
}

/*
 * DEBUG DRAW
 */

shark.debugDraw = function(){
	
	//setup debug draw
	shark.debugDraw = new b2DebugDraw();
	shark.debugDraw.SetSprite(shark.ctx);
	shark.debugDraw.SetDrawScale(30.0);
	shark.debugDraw.SetFillAlpha(0.5);
	shark.debugDraw.SetLineThickness(1.0);
	shark.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	shark.world.SetDebugDraw(shark.debugDraw);
	
}

/*
 * BOX2D SHORTCUTS
 */

var b2Vec2 			= Box2D.Common.Math.b2Vec2;
var b2BodyDef 		= Box2D.Dynamics.b2BodyDef;
var b2Body 			= Box2D.Dynamics.b2Body;
var b2FixtureDef 	= Box2D.Dynamics.b2FixtureDef;
var b2Fixture 		= Box2D.Dynamics.b2Fixture;
var b2World 		= Box2D.Dynamics.b2World;
var b2MassData 		= Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape 	= Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape 	= Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw 	= Box2D.Dynamics.b2DebugDraw;
var b2Listener 		= Box2D.Dynamics.b2ContactListener;

/*
 * REQUEST ANIMATION FRAME SHIM
 */

window.requestAnimationFrame = (function(){
	return  window.requestAnimationFrame   	   || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(callback){
				window.setTimeout(callback,1000/60);
			};
})();