
/* 
	game.js
	
	Falling Time

	A kinda shooter game in a falling tunnel
	g12345, for LD 48, 2021
*/

window.onload = function()
{
	Game.launch("screen");
}

dataFiles = ["font3.png", "rocks.png"];
soundFiles = []; 

filesLeft = 10;  

Images = [];
Sounds = [];

musicPlaying = 0;

mx = 0;
my = 0;

TileSize = 16;
TilesPerRow = 8;

map0 = 0;
map1 = 0;

distanceToEnd = 100;

initHP = 10;

var HP = initHP;
ATK = 1;
DEF = 1;
ITEMS = [25, 27, 26, 25, 27];

totalClicks = 0;

var score = 0;
var coins = 0;

KEYS = { LEFT:37, UP:38, RIGHT:39, DOWN:40, SPACE:32, ENTER:13, BACKSPACE:8, X:88, C:67, R:82 };

var Keyboard = function()
{
	var keysPressed = {};
	
	window.onkeydown = function(e) { 	keysPressed[e.keyCode] = true;
		if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) { e.preventDefault(); } ;
	}
	window.onkeyup = function(e) { keysPressed[e.keyCode] = false;	};
	this.isDown = function(keyCode)	{ return keysPressed[keyCode] === true; };
};



function fileLoaded(filename)
{
	filesLeft --;
	console.log(filename + " loaded.");
}

function loadFile(filename, nr)
{
	var img = new Image();
	img.addEventListener('load', fileLoaded(filename));
	img.src = filename;
	Images.push(img);
}

function loadMusicFile(filename)
{
	var snd = new Audio();
	snd.addEventListener('load', fileLoaded(filename));
	snd.src = filename;
	Sounds.push(snd);
}

fontSize = 16;
function sprint(screen,x,y,s)
// prints a string at x,y, no wrapping
{
	var px = x;
	var py = y;
	for (var i=0; i<s.length; i++)
	{
		c = s.charCodeAt(i);
		if ( (c>=97) && (c<=122) ) c-=32;
		if ( (c>=32) && (c<=95) )
		screen.drawImage (Images[0], (c-32)*fontSize,0, fontSize,fontSize, px,py, fontSize,fontSize);
		px += fontSize;
	}
}

function sprintnum(screen,x,y,n)
// prints a number at x,y, no wrapping
{
	sprint(screen,x,y,n+'');
}


Buttons = [ {x: 30, y: 60, w:64, h:64 }, {x: 30, y: 128, w:64, h:64 }, {x: 30, y: 192, w:64, h:64 }, {x: 30, y: 256, w:64, h:64 }, 
			{x: (800/2), y: 60, w:64, h:64 }, {x: (800/2), y: 128, w:64, h:64 }, {x: (800/2), y: 192, w:64, h:64 }, {x: (800/2), y: 256, w:64, h:64 },  ];


function is_wall(x,y)
// check if map coord (x,y) is a wall block or not
// monsters doesn't count.
{
	var c = map0[y][x];
	if (c == 4) 
	{
		score += (level+0) * 10;
		coins ++;
		map0[y][x] = 0;
		//console.log(x,y,score);
	}
	if (c == 5) 
	{
		map0[y][x] = 0;
		HP --;
		//console.log(x,y,score);
	}
	return ((c > 0) && (c != 4));
}

function is_floor(x,y)
// check if map coord (x,y) is a wall block or not
// monsters doesn't count.
{
	return (map0[y][x] > 10);
}

function is_wall2(x,y)
// check if PIXEL coord (x,y) is a wall block or not
// monsters doesn't count.
{
	return is_wall(Math.floor(x/TileSize), Math.floor(y/TileSize));
}

function is_floor2(x,y)
// check if PIXEL coord (x,y) is a wall block or not
// monsters doesn't count.
{
	return is_floor(Math.floor(x/TileSize), Math.floor(y/TileSize));
}

var mouseX = 0;
var mouseY = 0;
var mouseP = 0;
var mouseI = 0;
var mouseJ = 0;
var canvasi;
	
function getMousePos(canvas, event) 
{
	var rect = canvas.getBoundingClientRect();
	if ((event.pageX != undefined) && (event.pageY != undefined))
	{
		mouseX = event.pageX;
		mouseY = event.pageY;
	}
	else
	{
		mouseX = event.clientX;
		mouseY = event.clientY;
	}
	mouseX -= rect.left;
	mouseY -= rect.top;
	mouseX = Math.floor(mouseX);
	mouseY = Math.floor(mouseY);
}
	
function mouse_is_inside(b)
{
	if  ((mouseX > b.x) && (mouseY > b.y) && (mouseX < b.x+b.w) && (mouseY < b.y+b.h))
		return 1;
	return 0;
}

buildings = [];

window.onmousemove = function(e) 
				{ 
					getMousePos( canvasi, e );
				};
					
window.onmousedown = function(e) 
				{ 
					getMousePos( canvasi, e );
					if ((mouseP == 0) && (e.buttons == 1))
					{
						mouseJ = 0;
						for (var i=0; i< Buttons.length; i++)
							if (mouse_is_inside(Buttons[i]))
								mouseJ = i+1;
						if (mouseJ > 0)
						{
							// console.log("mouseJ :"+mouseJ);
							if (buildings.length >= mouseJ)
							{
								//for (var i=0; i< 25; i++)
								buildings[mouseJ-1].buy();
							}
						}
					}
					mouseP = e.buttons;
				};

window.onmouseup = function(e) 
				{ 
					getMousePos( canvasi, e );
					mouseP = 0;
				};

Game = {};

people = [];
money = 0;
ticks = 0;
level = 1;

Game.launch = function(canvasId)
{
	var canvas = document.getElementById(canvasId);
	var screen = canvas.getContext('2d');
	var gameSize = { x: canvas.width, y: canvas.height };
	
	// gameMode: 0 = start screen; 1 = game; 2 = game over;
	var gameMode = 0;
	
	canvasi = canvas;
	
	    my = 100+2;
		my = 70+2;
	    mx = 16+2;
	
	people = [ new Player([[4,5],[14,5],[24,5],[4,15]]) ];
	
	
	filesLeft = dataFiles.length + soundFiles.length;
	
	for (var i=0; i<dataFiles.length; i++)
		loadFile(dataFiles[i], i);
	for (var i=0; i<soundFiles.length; i++)
		loadMusicFile(soundFiles[i], i);
	
	
	score = 0;
	var depth = 0;
	
	{
		totalClicks = 0;
	}

	var update = function()
	{
		if (gameMode === 1)
		{
			tlist = [];
			for (var i=0; i<=people.length-1; i++)
			{
				t = people[i].update();
				if (t)
				{
					tlist.push(people[i]);
				}
			}

			people = tlist.slice();
			tlist = [];
			
			if (people[0].end == 1)
			{
				gameMode = 3;
			}
			
			if (people[0].end == 2)
			{
				gameMode = 4;
			}
			
			if (people[0].keyb.isDown(KEYS.ENTER))
			{
				//level = Math.floor(Math.random()*10);
				makeMap();
				score = 0;
				//people[0].x = 10;
				//people[0].y = 5;
				people[0].r = 0;
				people[0].end = 0;
				//people[0].tile=	Math.floor(Math.random()*7)+1;
				//if (people[0].tile>6) people[0].tile=6;
				
				ITEMS = [25, 27, 26, 25, 27];
				HP = initHP;
				ATK = 1;
				DEF = 1;
			}
			
		}
		else
		{
			if (people[0].keyb.isDown(KEYS.ENTER))
			{
				if (gameMode != 1)
				{
					makeMap();
					coins = 0;
					HP = 10;
					people[0].x = 128;
					people[0].y = 0;
					level = 1;
					score = 0;
				}
				if (gameMode === 0) gameMode = 1;
				if (gameMode === 3) gameMode = 1;
				if (gameMode === 4) gameMode = 1;
			}
		}
	}
	
	var camerax = 0;
	var cameray = 0;
	var clockticks = -1;
	
	
	
	var sy = my;
	var sx = mx;
	
	
	map0 = new Array(my);
	map1 = new Array(my);
	
	for (var y=0; y<my; y++)
	{
		map0[y] = new Array(mx);
		map1[y] = new Array(mx);
	}

	var makeMap = function()
	{
		for (var y=0; y<my; y++)
		{
			for (var x=0; x<mx; x++)
			{
				var c = 0;
				var d = 0;
				map0[y][x] = 0;
				map1[y][x] = 0;
								
				// muurtjes
				e = Math.floor(Math.random()*20);			
				d = Math.floor(Math.random()*10);			
				f = Math.floor(Math.random()*16);
				c = -1;
				
				if (e>19-level/5) { d=0; c=4; }
				
				if ( f==4 ) { c = 3; d = 0; }
				
				if ((y==12)) { d=0; c=5; }
				if ((y==my-13)) { d=0; c=6; }
				if ((y<12) || (y>=my-2-5-5)) { d=0; c=-1; };				
				if ((x<1) || (x>=mx-1)) c=d=0;
				
				if ((d==0))
				if (c==0)
					map0[y][x] = (level%3)+1;
				else
					map0[y][x] = 1+c;
				// map0[y][x] = 22+((x+y)%2);
				
				/*
				c = Math.floor(Math.random()*5);
				if (c>1) d = 17;
				else 
				{
					c = Math.floor(Math.random()*4);
					d = [38,39,25,7][c];
				}
				
				map1[y][x] = d;
				
				
				if (Math.random()<.25)
				{
					map1[y][x] = 17;
				}
								
				if (Math.random()<.1)
				{
					c = Math.floor(Math.random()*4);
					map1[y][x] = 48+c;
				}
				
				// muurtjes
				c = Math.floor(Math.random()*3);
				if (y === my-1) { map0[y][x] = 8+c; map1[y][x] = 81+c; }
				if (y === 0)    { map0[y][x] = 8+c; map1[y][x] = 1+c; }
				if (x === 0)    { map0[y][x] = 8+c; map1[y][x] = 86+c; }
				if (x === mx-1) { map0[y][x] = 8+c; map1[y][x] = 86+c; }				
				*/
			}
		}
		
		//map1[my-5][mx-5] = 6; // exit 69
		//map1[people[0].y][people[0].x] = 64;

		/*
		l = people[0].all;

		for (var i=0; i<l.length; i++)
		{
			if (l[i].length==2)
			{
				//console.log(l[i]);
				map1[l[i][1]][l[i][0]] = 64+i;
			}
		}
		*/
	}
	
	makeMap();
	score = 0;
	coins = 0;
	HP = 10;
	

	var draw = function(screen, gameSize, clockticks)
	{
		var drawTile = function(y, x, t)
		{
			screen.drawImage (Images[1], 
				(t%TilesPerRow)*TileSize, (Math.floor(t/TilesPerRow)) *TileSize, 
				TileSize,TileSize, 
				x,y, 
				TileSize,TileSize);						
		}
		
		if (gameMode === 1)
		{
			screen.fillStyle="black";
			screen.fillRect(0,0, gameSize.x, gameSize.y);
/*
			camerax = (people[0].center.x / TileSize) - (sx/2);
			if (camerax < 0) camerax = 0;
			if (camerax > mx-sx) camerax = mx-sx;

			cameray = (people[0].center.y / TileSize) - (sy/2);
			if (cameray < 0) cameray = 0;
			if (cameray > my-sy) cameray = my-sy;
*/
			camerax = 0;
			
			//cameray = 0;
			cameray = ((people[0].y+16) / TileSize);
			if (cameray < 0) cameray = 0;
			//if (cameray > my-sy) cameray = my-sy;
			
			startx = 200;
			starty = 0;
			var startx = Math.floor(camerax); 
			var restx = Math.floor( (camerax - startx) * TileSize );
			var starty = Math.floor(cameray); 
			var resty = Math.floor( (cameray - starty) * TileSize );
			// console.log(startx, starty);
			
			for (var x=0; x<sx; x++)
			//for (var y=0; y<sy; y++)
			for (var y=0; y<26; y++)
			{
				screen.drawImage (Images[1],
					0,0, 
					TileSize,TileSize, 
					x*TileSize - restx,y*TileSize - resty, 
					TileSize,TileSize);
				if ( (starty+y<my) && (map0[starty+y][startx+x] > 0) )
				{
					screen.drawImage (Images[1], 
						(map0[starty+y][startx+x]%TilesPerRow)*TileSize, (Math.floor(map0[starty+y][startx+x]/TilesPerRow)) *TileSize, 
						TileSize,TileSize, 
						x*TileSize - restx,y*TileSize - resty, 
						TileSize,TileSize);
				}
				if ( (starty+y<my) && (map1[starty+y][startx+x] > 0) )
				{
					screen.drawImage (Images[1], 
						(map1[starty+y][startx+x]%TilesPerRow)*TileSize, (Math.floor(map1[starty+y][startx+x]/TilesPerRow)) *TileSize, 
						TileSize,TileSize, 
						x*TileSize - restx,y*TileSize - resty, 
						TileSize,TileSize);
				}
			}
			
			//people[i].draw(screen, camerax, cameray);

			// draw player
			qx = 0;
			if (people[0].sy<0) qx = TileSize;
			
			screen.drawImage (Images[1], 
				qx, 32, 
				TileSize,TileSize, 
				people[0].x, 200-8, 
				TileSize,TileSize);
				
			for (var i=1; i<people.length; i++)
			{
				people[i].draw(screen, camerax, cameray);
			}
				
			vx = 536-16*6;
			vy = 1;
			
			/*
			sprint (screen, vx, (vy++)*20, " x : "+people[0].x);
			sprint (screen, vx, (vy++)*20, " y : "+people[0].y);
			sprint (screen, vx, (vy++)*20, " sy : "+starty);
			sprint (screen, vx, (vy++)*20, " ry : "+resty);
			sprint (screen, vx, (vy++)*20, " cy : "+cameray);
			*/
			sprint (screen, vx, (vy++)*20, " level : "+level);
			sprint (screen, vx, (vy++)*20, " score : "+score);
			sprint (screen, vx, (vy++)*20, " HP : "+HP);
			sprint (screen, vx, (vy++)*20, " Coins : "+coins);

			//sprint (screen, vx-16, 20+people[0].select*20, "=>");
			//sprint (screen, vx+144, 20+people[0].select*20, "<=");
			//sprint (screen, vx, 80, "Items :");
			/*
			for (pp=0; pp<4; pp++)
			{
				drawTile(20+20*pp, vx+32, 48+pp)
			}
			
			/*
			sprint (screen, vx, 120, "X Key to select");
			sprint (screen, vx, 160, "Arrow keys move");
			sprint (screen, vx, 180, " selected robot.");
			sprint (screen, vx, 220, "Batteries give");
			sprint (screen, vx, 240, " 5 extra turns.");
			sprint (screen, vx, 280, "Move top left");
			sprint (screen, vx, 300, " robot to the");
			sprint (screen, vx, 320, " tree to win!");
			*/
			vy = 10;
			sprint (screen, vx, (vy++)*20, "Collect 25 coins");
			if (level < 9)
			sprint (screen, vx, (vy++)*20, "for next level.");
			else
			sprint (screen, vx, (vy++)*20, "to win!");
		
			vy ++;
			
			sprint (screen, vx, (vy++)*20, "left right to move.");
			sprint (screen, vx, (vy++)*20, "x space to fire.");
			
			sprint (screen, vx, 360, "Enter for new game!");
			// sprint (screen, vx, 380, " game!");
			
			sprint (screen, 300, 360, "LD 48");
			sprint (screen, 300, 380, "Falling Time - G12345");

			if (coins >=25)
			{
				level ++;
				if (level>9) gameMode = 3;
				else
				{
					makeMap();
					coins = 0;
					HP = 10;
					people[0].x = 128;
					people[0].y = 0;
				}
			}
			
			if (HP < 1)
			{
				gameMode = 4;
			}
		}
	
		if (gameMode === 0)
		{
			screen.fillStyle="black";
			screen.fillRect(0,0, gameSize.x, gameSize.y);
			
			sprint (screen, 16, 50, "Falling Time (LD 48)");

			sprint (screen, 16, 100, "You are tasked to collect coins in a mine.");
			sprint (screen, 16, 120, "");
			sprint (screen, 16, 140, "The tunnel has little gravity, so you are.");
			sprint (screen, 16, 160, "falling down but you can also fall up.");
			sprint (screen, 16, 200, "Collect 25 coins in each level to ");
			sprint (screen, 16, 220, "reach the next level.");

			sprint (screen, 16, 250, "Left and right keys to move left and right,");
			sprint (screen, 16, 270, "X/space to switch direction,");
		
			sprint (screen, 100, 330, "Press ENTER to (re)start.");
			sprint (screen, 100, 370, "Made for Ludum Dare 48, by g12345");
//			sprint (screen, 16, 384-8-32, "Total Clicks: " + totalClicks );
		}
		
		if (gameMode === 3)
		{		
			screen.fillStyle="black";
			screen.fillRect(230, 130, 400, 100);
			sprint (screen, 250, 150, "Well done, you won!");
			sprint (screen, 250, 190, "Press ENTER to restart.");
			//people = [ new Player([[4,5],[14,5],[24,5],[4,15]]) ];
		}
		
		if (gameMode === 4)
		{		
			screen.fillStyle="black";
			screen.fillRect(230, 130, 400, 100);
			sprint (screen, 250, 150, "Sorry, you died!");
			sprint (screen, 250, 190, "Press ENTER to restart.");
		}
	}
	
	var tick = function()
	{
		if (filesLeft === 0)
		{
			// console.log ("All files loaded");
			update();
			clockticks ++;
			draw(screen, gameSize, clockticks);
			
			if (!musicPlaying)
			{
				musicPlaying = 1;
				if (Sounds.length > 0)
				{
					Sounds[0].loop = true;
					Sounds[0].play();
				}
			}
		}
		requestAnimationFrame(tick);
	}

	// This to start a game
	tick();
};


var Player = function(l)
{
	this.tile = 0;
	this.x = 128; this.y=0;
	this.sx = 0; this.sy=1;			// speed
	this.r = 0;
	
	this.powers = [5,5,5,5];
	
	this.keyb = new Keyboard();
	this.counter = 0;
	this.frame1 = 0;
	this.framenr = 1;
	this.type = 0; // player type = 0
	
	this.onfloor = 0; // 0 = falling, 1 = onfloor, 2 = jumping
	this.hold = 0; // how long has the player holding a key?
	this.dir = 0;  // which direction is the player holding?
	
	this.end = 0; // end == 1 => win
	
	this.select = 0; // 0-3 type of robot: 0 = black, 1 = red, 2 = cyan, 3 = yellow
	this.all = l;
	
}

Player.prototype =
{
	touche: function(dx,dy)
	{
/*
				// Check if falling touches any existing tile
				t2 = tiles[this.tile][this.r+1];
				
				for (y=0; y<t2[1]; y++)
				for (x=0; x<t2[0]; x++)
				{
					if (t2[2+y][x]>0) 
						if (map0[this.y+y+dy][this.x+x+dx]>0)
						{
							return 1;
						}
				}
				return 0;
*/	
	},
	update: function()
	{

	//	if (this.counter%5 === 0)	
		
		var nx = this.x;
		var ny = this.y;
		
		
		if (this.hold==0 && (this.keyb.isDown(KEYS.X) || this.keyb.isDown(KEYS.SPACE)) )
		{
			bull = new Bullet(this.x, this.y+192+16+this.sy*16, this.sy);
			people.push(bull);
			//console.log(people);
			this.sy = -this.sy;
			this.hold = 25;
		}
		
		if (this.hold==0 && this.keyb.isDown(KEYS.LEFT))
		{
			if (this.x>1+TileSize)
			{
					nx = this.x-16;
			}
			this.hold = 10;
		}
		else
		if (this.hold==0 && this.keyb.isDown(KEYS.RIGHT))
		{
			if (this.x<=(mx-2)*TileSize-1)
			{
					nx = this.x+16;
			}
			this.hold = 10;
		}
		
		if (this.sy<0)
		{
			if (this.y>0)
			{
					ny = this.y+this.sy*2;
			}
			else
			{
				this.sy = -this.sy;
			}
		}
		else
		if (this.sy>0)
		{
			if (this.y<=(my-20-7)*TileSize-1)
			{
					ny = this.y+this.sy*2;
			}
			else
			{
				this.sy = -this.sy;
			}
		}

		is_wall (Math.floor(this.x/TileSize), Math.floor(this.y/TileSize+13));
		is_wall (Math.floor(this.x/TileSize), Math.floor(this.y/TileSize+14));
		/*
		else
		if (this.hold==0 && this.keyb.isDown(KEYS.UP))
		{
			if (this.y>0)
			{
					ny = this.y-1;
			}
			this.hold = 10;
		}
		else
		if (this.hold==0 && this.keyb.isDown(KEYS.DOWN))
		{
			if (this.y<=(my-20-7)*TileSize-1)
			{
					ny = this.y+1;
			}
			this.hold = 10;
		}
		*/
		
		/*
		else
		if (this.hold==0 && (this.keyb.isDown(KEYS.X) || this.keyb.isDown(KEYS.SPACE)) )
		{
			
			//if (ITEMS.length>1)
			//{
			//	ITEMS.push(ITEMS.shift());
			//}
			
			// Switch robot
			this.all[this.select] = [this.x, this.y];
			map1[this.y][this.x] = 64+this.select;
			
			b = true;
			while (b)
			{
				this.select += 1;
				if (this.select > 3) 
				{
					this.select = 0;
				}
				b = (this.all[this.select].length<2)
			}
			nx = this.all[this.select][0];
			ny = this.all[this.select][1];
			this.y = ny;
			this.x = nx;
						
			this.hold = 10;
		}
		else
		if (this.hold==0 && this.keyb.isDown(KEYS.C))
		{
			if (ITEMS.length>1)
			{
				ITEMS.unshift(ITEMS.pop());
			}
			this.hold = 10;
		}
		*/
		
		/*		
		if ( (nx != this.x) || (ny != this.y) )
		{
			np = map1[ny][nx];
			wall = 1;
			if ((np>=17) && (np<=23)) wall = 0;
			if ((np>=48) && (np<=63)) wall = 0;
			if ((np>=96) && (np<=108)) wall = 0;
			if ((np==6) && (this.select==0)) wall = 0; // 69
			if (wall)
			{
				nx = this.x;
				ny = this.y;
			}
		}
		
		if ( (nx != this.x) || (ny != this.y) )
		{
			q = map1[ny][nx];
			
			//console.log(q);
			moved = 1;
			
			if ( (q==48) || (q==49) || (q==50) || (q==51) )
			{
				// Batteries
				this.powers[q-48] += 5;
			}
			else
			if (q==6) // exit 69
			{
				if (this.select==0)
					this.end = 1;
			}
		}
		

		if ( (nx != this.x) || (ny != this.y) )
		{
			if (this.powers[this.select]>0)
			{
				this.powers[this.select] -= 1;
				
				// MOVING
				map1[this.y][this.x] = 17;
				this.y = ny;
				this.x = nx;
				//map1[this.y][this.x] = 64;
			}
			else
			{
				// NOT MOVING
				nx = this.x;
				ny = this.y;
			}
		}
		*/
		if ( (nx != this.x) || (ny != this.y) )
		{
			this.y = ny;
			this.x = nx;
		}
		
		if (this.hold>0) this.hold=this.hold-1;
		
		this.counter = this.counter+1;
		//if (this.counter>25) map1[this.y][this.x] = 64+48+this.select; else map1[this.y][this.x] = 64+this.select;
		if (this.counter>50) this.counter = this.counter - 50;
		
		return 1;
	},
	
	draw: function(screen, camerax, cameray)
	{
/*
		t = tiles[this.tile];
		t2 = t[this.r+1];
		
		for (y=0; y<t2[1]; y++)
		for (x=0; x<t2[0]; x++)
		{
			if (t2[2+y][x]>0) 
				screen.drawImage (Images[1], 
					(this.tile+1)*TileSize,0, 
					TileSize, TileSize, 
					(this.x+x)*TileSize,(this.y+y)*TileSize, 
					TileSize, TileSize );
		}
*/
	}
}

var Bullet = function(x,y,dy)
{
	this.tile = 0;
	this.x = x; this.y = y;
	this.sx = 0; this.sy = dy*8;			// speed
	if (this.sy<0) this.y+=8;
	this.alive = 1; // alive
	//console.log("Bullet "+x+" "+y+" "+dy);
}

Bullet.prototype =
{
	touche: function(dx,dy)
	{
/*
				// Check if falling touches any existing tile
				t2 = tiles[this.tile][this.r+1];
				
				for (y=0; y<t2[1]; y++)
				for (x=0; x<t2[0]; x++)
				{
					if (t2[2+y][x]>0) 
						if (map0[this.y+y+dy][this.x+x+dx]>0)
						{
							return 1;
						}
				}
				return 0;
*/	
	},
	update: function()
	{
		//console.log(this.y);
		if (this.alive)
		{
			this.y += this.sy;
			
			if ((this.y<3*TileSize) || (this.y>(my+12-3)*TileSize))
			{ 
				this.alive = 0;
			}
		}
		//return 1;
		return this.alive;
	},
	
	draw: function(screen, camerax, cameray)
	{
		//console.log(camerax, cameray);
		if (this.alive)
		if ((this.y >= cameray*TileSize) && (this.y <= (cameray+26)*TileSize))
		{				
			if (this.sy>0) {q = 0;} else {q = TileSize;}
			
			screen.drawImage (Images[1], 
					q,48, 
					TileSize, TileSize, 
					(this.x-camerax*TileSize),(this.y-cameray*TileSize), 
					TileSize, TileSize );
		}

	}
}





