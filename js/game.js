$(document).ready(function(){

	shark.options = {
		debug : true
	}
	shark.activeScene = level1;
	shark.init();
	
});

/*
 * THE SHARK GAME OBJECT
 */

var shark = new Object();

/*
 * DEFAULTS
 */

shark.defaults = {
	sceneDir 		: "assets/scenes/",
	characterDir 	: "assets/characters/",
	debug			: false,
	tileSize		: 32,
	canvas			: "#canvas"
}

/*
 * INIT THE SHARK GAME OBJECT
 */

shark.init = function(){
	
	shark.options = $.extend(shark.defaults,shark.options);
	
	shark.setSize();
	
	shark.loadScene();
	
	shark.start();
	
	if(shark.options.debug){
		console.log(shark);
	}
	
}

/*
 * STARTS A SCENE ONCE ALL IS LOADED
 */

shark.start = function(){
	
	!function checkLoaded(){
		if(shark.sceneLoaded && shark.charactersLoaded){
			jaws.start(shark.activeScene);
		}else{
			setTimeout(checkLoaded,10);
		}
	}();
	
}

/*
 * USED TO LOAD UP A SCENE
 * loads up which ever game state function is stored in shark.activeScene
 */

shark.loadScene = function(){
	
	shark.sceneLoaded 		= false;
	shark.charactersLoaded  = false;
	shark.characters		= new Object();
	var characters 			= 0;

	$.getScript(shark.options.sceneDir+shark.activeScene.name+".js",function(){
		
		$.each(scene.images,function(key,image){
			jaws.assets.add(image);
		});
		
		scene.rows = 0;
		$.each(scene.map,function(key,row){
			scene.rows++;
			scene.cols = row.length;
		});
		
		shark.sceneLoaded = true;
		shark.scene		  = scene;
		
		$.each(scene.characters,function(i,characterName){
			
			$.getScript(shark.options.characterDir+characterName+".js",function(){
				
				shark.characters[characterName] = character;
				
				characters++;
				if(characters == scene.characters.length){
					shark.charactersLoaded = true;
				} 

			});
			
		});
		
	});

}

/*
 * SETS THE CANVAS SIZE TO THE SREEN SIZE
 */

shark.setSize = function(){
	
	var width  = $(window).width();
	var height = $(window).height();
	
	$(shark.options.canvas)
		.attr("width",width)
		.attr("height",height)
		.css({
			width 	: width,
			height 	: height
		})
	;
	
}

/*
 * LEVEL 1
 * 
 * a level or scene consitsts of three functions
 * 
 * setup() where we define all our variables etc - called once
 * 
 * update() where we update all outr logic - called every tick
 * 
 * draw() where we draw all our data to the canvas - called every tick
 */

function level1(){
	
	var player,
	playerAnim,
	world,
	viewport,
	obstacles,
	tiles,
	obstacleMap;
	
	this.setup = function(){
		
		/*
		 * handle building the world
		 */
		
		world = new jaws.Rect(0,0,shark.scene.cols*shark.options.tileSize,shark.scene.rows*shark.options.tileSize);
		
		tiles 		= new Array();
		obstacles 	= new Array();
		
		var top = 0;
		$.each(shark.scene.map,function(i,row){
			
			var left = 0;
			$.each(row,function(i,tile){
				
				if(tile == "blank" || tile == ""){
					left += shark.options.tileSize;
					return;
				}
				
				tile = shark.scene.tiles[tile];
				
				tileSprite = new jaws.Sprite({
					image 	: shark.scene.images[tile.img],
					x		: left,
					y		: top
				});
				
				tiles.push(tileSprite);
				
				if(tile.solid){
					obstacles.push(tileSprite);
				}
				
				left += shark.options.tileSize;
				
			});
			
			top += shark.options.tileSize;
			
		});
		
		obstacleMap = new jaws.TileMap({
			size 		: [shark.scene.cols*shark.scene.rows,shark.scene.cols*shark.scene.rows],
			cell_size 	: [shark.options.tileSize,shark.options.tileSize]
		});
		obstacleMap.push(obstacles);
		
		/*
		 * setup the viewport
		 */
		
		viewport = new jaws.Viewport({
			max_x : world.width,
			max_y : world.height
		});
		
		/*
		 * setup the player
		 */
		
		player = new jaws.Sprite({
			x		: shark.characters[scene.player].attributes.startX,
			y		: shark.characters[scene.player].attributes.startY,
			anchor	: "center_top"
		});
		
		player.shark = shark.characters[scene.player];
		
		playerAnim = new jaws.Animation({
			sprite_sheet 	: scene.images[scene.player],
			frame_size	 	: [40,28],
			frame_duration	: 100
		});
		
		player.speed 			= player.shark.attributes.speed;
		player.defaultSpeed 	= player.shark.attributes.speed;
		
		player.animDefault 	= playerAnim.frames[4];
		player.animRight	= playerAnim.slice(5,8);
		player.animLeft		= playerAnim.slice(0,3);
		player.animUp		= playerAnim.frames[3];
		player.animDown		= playerAnim.frames[4];
		
		player.setImage(player.animDefault);
		
		jaws.preventDefaultKeys(["up","down","left","right","space"]);
		
		/*
		 * what to do when the player moves
		 */
		
		player.move = function(movebyX,movebyY){
        
        	var playerRect = player.rect();
        	playerRect.x  += movebyX;
        	playerRect.y  += movebyY;
        
        	var obstacle = obstacleMap.atRect(playerRect)[0];
        	
        	this.x += movebyX;
        	this.y += movebyY;

        	if(obstacle){
        		/*console.log(this.x,this.y,obstacle);
        		this.x -= movebyX;
        		this.y -= movebyY;*/
        	}
        	
        }
		
	}
	
	this.update = function(){
	
		if(jaws.pressed("left")){ 
			player.move(-player.speed,0); 
			player.setImage(player.animLeft.next()); 
		}
		
        if(jaws.pressed("right")){ 
        	player.move(player.speed,0); 
        	player.setImage(player.animRight.next());
        }
        
        if(jaws.pressed("up")){ 
        	player.move(0,-player.speed); 
        	player.setImage(player.animUp);
        }
        
        if(jaws.pressed("down")){ 
        	player.move(0,player.speed); 
        	player.setImage(player.animDown);
        }
        
        $(document).bind("keyup","left right up down",function(){
			player.setImage(player.animDefault);
        });
        
        viewport.centerAround(player);
        
	}
	
	this.draw = function(){
		
		jaws.clear();
		
		viewport.apply(function(){
			$.each(tiles,function(){
				this.draw();
			});
			player.draw();
		});
        	
	}
	
}


