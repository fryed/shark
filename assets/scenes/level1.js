var scene = {
	images : {
		wall  : "assets/images/level1/wall.jpg", 
		floor : "assets/images/level1/floor.jpg",
		mario : "assets/images/characters/mario_sprite1.png"
	},
	characters : ["mario"],
	player	   : "mario",
	tiles : {
		wall : {
			img 	 : "wall",
			spriteNo : 0,
			solid 	 : true
		},
		floor: {
			img 	 : "floor",
			spriteNo : 0,
			solid 	 : false
		}
	},
	map : {
		0 	 : ["wall","wall","wall","wall","wall","wall","wall","wall","wall","wall"],
		1 	 : ["wall","floor","floor","floor","floor","floor","floor","floor","floor","wall"],
		2 	 : ["wall","floor","floor","floor","floor","floor","floor","floor","floor","wall"],
		3 	 : ["wall","floor","floor","floor","floor","floor","floor","floor","floor","wall"],	
		4 	 : ["wall","floor","floor","floor","wall","wall","floor","floor","floor","wall"],	
		5 	 : ["wall","floor","floor","floor","floor","floor","floor","floor","floor","wall"],	
		6 	 : ["wall","floor","floor","floor","floor","floor","floor","floor","floor","wall"],	
		7 	 : ["wall","floor","floor","floor","floor","floor","floor","floor","floor","wall"],	
		8 	 : ["wall","wall","wall","wall","wall","wall","wall","wall","wall","wall"],
	}
}
