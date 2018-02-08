/*	
	https://en.wikipedia.org/wiki/Girih_tiles
	
*/

// Point array, tile array and epsilon to test the distance of two points
var points = [], pointdistances = [], tiles = [], epsilon = 0.1;

////////

//Style presets
var stylepresets = {
	indigo:{ fillcolors:['Indigo','Indigo','Indigo','Indigo','Indigo'], edgecolors: ['Blue','Blue','Blue','Blue','Blue'], edgewidth:1, linecolor1:'black', linewidth1:14, linecolor2:'white', linewidth2:6 },
	wikipedia:{ fillcolors:['LightSkyBlue', 'LightGreen', 'LightSalmon', 'MediumSlateBlue', 'Khaki' ], edgecolors: ['white','white','white','white','white'], edgewidth:2, linecolor1:'grey', linewidth1:5, linecolor2:'black', linewidth2:1 },
	onlygirih:{ fillcolors:['transparent','transparent','transparent','transparent','transparent'], edgecolors: ['transparent','transparent','transparent','transparent','transparent'], edgewidth:1, linecolor1:'gray', linewidth1:14, linecolor2:'cyan', linewidth2:6 },
	indigo2:{ fillcolors:['rgb(75,0,130)','rgb(85,0,120)','rgb(65,0,140)','rgb(75,0,150)','rgb(95,0,130)'], edgecolors: ['rgb(100,30,220)','rgb(100,30,220)','rgb(100,30,220)','rgb(100,30,220)','rgb(100,30,220)'], edgewidth:1, linecolor1:'black', linewidth1:14, linecolor2:'white', linewidth2:6 },
	pale:{ fillcolors:['Lavender','Bisque','Gainsboro','MistyRose','LightCyan'], edgecolors: ['LightGray','LightGray','LightGray','LightGray','LightGray'], edgewidth:2, linecolor1:'DarkGray', linewidth1:6, linecolor2:'Silver', linewidth2:2 },
};

// Tile angles in 36 degree units
var tileangles = [[4,4,4,4,4,4,4,4,4,4],
				  [2,4,4,2,4,4],
				  [2,2,6,2,2,6],
				  [2,3,2,3],
				  [3,3,3,3,3]];

// Girih line lengths
var dlens = [
	[[0.96,0.96],[0.96,0.96],[0.96,0.96],[0.96,0.96],[0.96,0.96], [0.96,0.96],[0.96,0.96],[0.96,0.96],[0.96,0.96],[0.96,0.96]],
	[[0.61,0.61],[0.61,0.61],[0.61,0.61],[0.61,0.61],[0.61,0.61],[0.61,0.61]],
	[[0.38,0.38],[0.38,0.38],[0.38,0.38],[0.38,0.38],[0.38,0.38],[0.38,0.38]],
	[[0.44,0.44],[0.44,0.44],[0.44,0.44],[0.44,0.44]],
	[[0.44,0.44],[0.44,0.44],[0.44,0.44],[0.44,0.44],[0.44,0.44]]
];

//////////////////////////////////////////////////
//
//  Geometry
//
//////////////////////////////////////////////////

//Getting the middle point of the edge
function getmid(tileid,pointidx){
	var x1 = points[ tiles[tileid].pointindexes[(pointidx+tiles[tileid].pointindexes.length-tiles[tileid].offset-1)%tiles[tileid].pointindexes.length] ].coords[0],
		x2 = points[ tiles[tileid].pointindexes[(pointidx+tiles[tileid].pointindexes.length-tiles[tileid].offset)%tiles[tileid].pointindexes.length] ].coords[0],
		y1 = points[ tiles[tileid].pointindexes[(pointidx+tiles[tileid].pointindexes.length-tiles[tileid].offset-1)%tiles[tileid].pointindexes.length] ].coords[1],
		y2 = points[ tiles[tileid].pointindexes[(pointidx+tiles[tileid].pointindexes.length-tiles[tileid].offset)%tiles[tileid].pointindexes.length] ].coords[1];
	var alf = Math.atan2((x2-x1),(y2-y1)), bet = (Math.PI/2-alf) + (Math.PI*54/180), gam = (Math.PI/2-alf) + (Math.PI*126/180);
	return {x:(x2+x1)/2, y:(y2+y1)/2, alfa:alf, beta:bet, gamma:gam};
}

// Check point mask collisions
function checkmasks(m1,m2){
	var cnt = 0;
	for(var i=0; i<10; i++){ 
		if(m1[i]+m2[i]>1){ return false; }
		if(m1[i]+m2[i]===1){ cnt++; }
	}
	if(cnt === 9){ return false; }
	return true; 
}

// Adding and subtracting(removing) point masks
function addmasks(m1,m2){ for(var i=0; i<10; i++){ m1[i]+=m2[i]; } return m1; }
function removemask(id,m){ for(var i=0; i<10; i++){ if(m[i]===1){ points[id].mask[i] = 0; } } }
function masksum(id){ if(points[id]){ var sum=0; for(var i=0; i<10; i++){ if(points[id].mask[i]===1){ sum++; }  } return sum; } return 0; }

// Testing overlapping tiles, returning true if there's no overlapping
function testtilepoints(idxs,len){
	for(var j=0; j<idxs.length; j++){
		for(var i=0; i<points.length; i++){
			if(Math.hypot( (points[i].coords[0]-points[idxs[j]].coords[0]), (points[i].coords[1]-points[idxs[j]].coords[1]) ) < ((1-epsilon)*len) ){ 
				var issametile = false;
				for(var k=0; k<idxs.length; k++){
					if(i===idxs[k]){ issametile = true; }
				}
				if(!issametile){ return false; }
			}
		}
	}
	return true;
}

// Adding a point, using an existing one or returning -1
function addpoint(len,cs,msk){
	for(var i=0; i<points.length; i++){
		if( (Math.abs(points[i].coords[0]-cs[0]) < epsilon*len) && (Math.abs(points[i].coords[1]-cs[1]) < epsilon*len) ){
			if( checkmasks(points[i].mask,msk) ){
				points[i].mask = addmasks(points[i].mask,msk);
				return i;
			}else{
				return -1;
			}
		}//else if(!/*testallpoint(len,cs)*/testallpoly(cs)){ console.log('in poly collision'); return -1; } // TODO?
	}
	points.push({coords:cs, mask: msk});
	registerpointdistance(points.length-1,Math.hypot(cs[0],cs[1]));
	return points.length-1;
}// End of addpoint()

// Registering point to get indexes sorted on distance from origin
function registerpointdistance(idx,dist){
	for(var i=0; i<pointdistances.length; i++){ if(pointdistances[i][0] === idx ){ return; } }
	for(var i=0; i<pointdistances.length; i++){
		if(pointdistances[i][1] > dist){ pointdistances.splice(i, 0, [idx,dist,0]); return; }
	}
	pointdistances.push([idx,dist,0]);
}

// Removing point distance
/*function removepointdistance(idx){
	for(var i=0; i<pointdistances.length; i++){
		if(pointdistances[i][0] === idx){ pointdistances.splice(i, 1); return; }
	}
}*/

// Destroying point
function destroypoint(id){
	var usedpointids = []; for(var i=0; i<points.length; i++){ usedpointids[i]=0; }
	
	//console.log('tiles.length '+tiles.length+' '+JSON.stringify(tiles));
	// Find and destroy tiles using this point
	for(var i=tiles.length-1; i>=0; i--){
		for(var j=0; j<tiles[i].pointindexes.length; j++){
			
			usedpointids[tiles[i].pointindexes[j]]++;
			
			if(tiles[i].pointindexes[j] === id){
				for(var k=j; k>=0; k--){ usedpointids[tiles[i].pointindexes[k]]--; }
				
				for(var k in tiles[i].masks){ removemask(k,tiles[i].masks[k]); }
				
				tiles.splice(i, 1);
				break;
			}
		}
	}
	
	// TODO: remove point masks for destroyed tiles
	
	//console.log('tiles.length '+tiles.length+' '+JSON.stringify(tiles));
	// Remove orphan points
	//console.log(JSON.stringify(usedpointids));
	for(var i=usedpointids.length-1; i>=0; i--){ 
		if(usedpointids[i]<1){ 
			points[i].coords = [-99999999,-99999999];
		} 
	}
	//console.log(JSON.stringify(points));
}// End of destroypoint()

// Checking if point is visible
function isvisiblepoint(i,w,h){
	if(points[i]){
		if((points[i].coords[0]>=-w/2)&&(points[i].coords[0]<=w/2)&&(points[i].coords[1]>=-h/2)&&(points[i].coords[1]<=h/2)){ return true; }
	}
	return false;
}

// Adding a tile or returning -1
function addtile(mtype,ofs,len,x,y,alfa){
	var idxs = [], rollback = points.length + 0, maskrollbacks = {};

	for(var i=0; i<tileangles[mtype].length; i++){
		
		// Angle mask
		var angle = tileangles[mtype][ (i+ofs) % tileangles[mtype].length ];
		var thisangle = tileangles[mtype][ (i+ofs+tileangles[mtype].length-1) % tileangles[mtype].length ];
		
		var beta = alfa/36;
		var mask = []; for(var j=0; j<10; j++){ mask[j]=0; } for(var j=0; j<thisangle; j++){ mask[ (j+beta+10) % 10 ]=1; }
		
		// Adding point
		var pidx = addpoint(len, [x, y], mask );
		if(pidx>-1){
			maskrollbacks[pidx] = mask;
			idxs.push( pidx );
		}else{
			for(var k in maskrollbacks){ removemask(k,maskrollbacks[k]); /*removepointdistance(k);*/ }
			var rem = (points.length-rollback);
			if(rem>0){ points.splice( rollback, rem ); }
			return -1;
		}
		
		// Vector movement
		x += Math.cos( alfa *Math.PI/180 ) * len;
		y += Math.sin( alfa *Math.PI/180 ) * len;
		alfa += ( 180 - angle * 36 );
		
	}// End of points loop
	
	var newidxs = []; for(var i=rollback;i<points.length;i++){ newidxs.push(i); }
	
	if(testtilepoints(newidxs,len)){
		tiles.push({ type: mtype, pointindexes: idxs, offset: ofs, sidelength: len, rotation: alfa, masks: maskrollbacks });
		return tiles.length-1;
	}else{
		for(var k in maskrollbacks){ removemask(k,maskrollbacks[k]); /*removepointdistance(k);*/ }
		var rem = (points.length-rollback);
		if(rem>0){ points.splice( rollback, rem ); }
		return -1;
	}
	
}// End of addtile()

// Filling the space around a point with tiles
function fillpoint(idx, len){
	var firstfree = -2, freecnt = 0;
	
	// Searching for first free slot
	for(var i=0; i<11; i++){
		if(points[idx]){
		if((points[idx].mask[i%10]===1)&&(firstfree===-2)){ firstfree = -1; }
		if((points[idx].mask[i%10]===0)&&(firstfree===-1)){ firstfree = i%10; }
		}
	}
	if(firstfree<0){ return -1; }
	
	// Finding the length of the slot
	while((points[idx].mask[firstfree%10]===0)&&(freecnt<12)){
		freecnt++; firstfree++;
	}
	firstfree -= freecnt;
	if(freecnt>10){ return -1; }
	
	// Partitioning and filling the slot
	fillslot(len, points[idx].coords[0], points[idx].coords[1], firstfree, freecnt);
	
}// End of fillpoint()

/*
	Partitioning space around a point to angles.
	Angle distributions:
		0: invalid
		1: invalid
		2: tileangles[1][0] tileangles[1][3] tileangles[2][0] tileangles[2][1] tileangles[3][0]
		3: tileangles[3][1] tileangles[4][0]
		4: 2 + 2 | 4
		5: 2 + 3 | 3 + 2
		6: 2 + 2 + 2 | 3 + 3 | 2 + 4 | 4 + 2 | 6
		7: 2 + 2 + 3 | 2 + 3 + 2 | 3 + 2 + 2 | 4 + 3 | 3 + 4
		8: 2 + 2 + 2 + 2 | 2 + 2 + 4 | 2 + 4 + 2 | 4 + 2 + 2 | 3 + 3 + 2 | 3 + 2 + 3 | 2 + 3 + 3 | 2 + 6 | 6 + 2 | 4 + 4
		9: invalid
		10: invalid
*/
function fillslot(len, x, y, ff, n){

	if((n<2)||(n>8)){ console.log('fillslot() error n = '+n); return -1; }

	if(n===2){
		var vertices = [[1,1],[1,4],[2,1],[2,2],[3,1]], r = Math.floor(Math.random()*vertices.length);
		addtile(vertices[r][0], vertices[r][1], len, x, y, ff*36);
	}
	
	if(n===3){
		var vertices = [[3,2],[4,1]], r = Math.floor(Math.random()*vertices.length);
		addtile(vertices[r][0], vertices[r][1], len, x, y, ff*36);
	}
	
	if(n===4){
		if(Math.random()>0.5){
			var vertices = [[0,1],[1,2],[1,3]], r = Math.floor(Math.random()*vertices.length);
			addtile(vertices[r][0], vertices[r][1], len, x, y, ff*36);
		}else{
			fillslot(len, x, y, ff, 2);
			fillslot(len, x, y, ff+2, 2);
		}
	}
	
	if(n===5){
		if(Math.random()>0.5){
			fillslot(len, x, y, ff, 2);
			fillslot(len, x, y, ff+2, 3);
		}else{
			fillslot(len, x, y, ff, 3);
			fillslot(len, x, y, ff+3, 2);
		}
	}
	
	if(n===6){
		var r = Math.floor(Math.random()*5);
		if(r===0){
			addtile(2,3, len, x, y, (ff+3)*36);
		}
		if(r===1){
			fillslot(len, x, y, ff, 2);
			fillslot(len, x, y, ff+2, 2);
			fillslot(len, x, y, ff+4, 2);
		}
		if(r===2){
			fillslot(len, x, y, ff, 3);
			fillslot(len, x, y, ff+3, 3);
		}
		if(r===3){
			fillslot(len, x, y, ff, 2);
			fillslot(len, x, y, ff+2, 4);
		}
		if(r===4){
			fillslot(len, x, y, ff, 4);
			fillslot(len, x, y, ff+4, 2);
		}
	}

	// 7: 2 + 2 + 3 | 2 + 3 + 2 | 3 + 2 + 2 | 4 + 3 | 3 + 4
	if(n===7){
		var r = Math.floor(Math.random()*5);
		if(r===0){
			fillslot(len, x, y, ff, 2);
			fillslot(len, x, y, ff+2, 2);
			fillslot(len, x, y, ff+4, 3);
		}
		if(r===1){
			fillslot(len, x, y, ff, 2);
			fillslot(len, x, y, ff+2, 3);
			fillslot(len, x, y, ff+5, 2);
		}
		if(r===2){
			fillslot(len, x, y, ff, 3);
			fillslot(len, x, y, ff+3, 2);
			fillslot(len, x, y, ff+5, 2);
		}
		if(r===3){
			fillslot(len, x, y, ff, 3);
			fillslot(len, x, y, ff+3, 4);
		}
		if(r===4){
			fillslot(len, x, y, ff, 4);
			fillslot(len, x, y, ff+4, 3);
		}
	}

	// 8: 2 + 2 + 2 + 2 | 2 + 2 + 4 | 2 + 4 + 2 | 4 + 2 + 2 | 3 + 3 + 2 | 3 + 2 + 3 | 2 + 3 + 3 | 2 + 6 | 6 + 2 | 4 + 4
	if(n===8){
		var r = Math.floor(Math.random()*10);
		if(r===0){
			fillslot(len, x, y, ff, 2);
			fillslot(len, x, y, ff+2, 2);
			fillslot(len, x, y, ff+4, 2);
			fillslot(len, x, y, ff+6, 2);
		}
		if(r===1){
			fillslot(len, x, y, ff, 2);
			fillslot(len, x, y, ff+2, 2);
			fillslot(len, x, y, ff+4, 4);
		}
		if(r===2){
			fillslot(len, x, y, ff, 2);
			fillslot(len, x, y, ff+2, 4);
			fillslot(len, x, y, ff+6, 2);
		}
		if(r===3){
			fillslot(len, x, y, ff, 4);
			fillslot(len, x, y, ff+4, 2);
			fillslot(len, x, y, ff+6, 2);
		}
		if(r===4){
			fillslot(len, x, y, ff, 2);
			fillslot(len, x, y, ff+2, 3);
			fillslot(len, x, y, ff+5, 3);
		}
		if(r===5){
			fillslot(len, x, y, ff, 3);
			fillslot(len, x, y, ff+3, 2);
			fillslot(len, x, y, ff+5, 3);
		}
		if(r===6){
			fillslot(len, x, y, ff, 3);
			fillslot(len, x, y, ff+3, 3);
			fillslot(len, x, y, ff+6, 2);
		}
		if(r===7){
			fillslot(len, x, y, ff, 4);
			fillslot(len, x, y, ff+4, 4);
		}
		if(r===8){
			fillslot(len, x, y, ff, 2);
			fillslot(len, x, y, ff+2, 6);
		}
		if(r===9){
			fillslot(len, x, y, ff, 6);
			fillslot(len, x, y, ff+6, 2);
		}
	}

}// End of fillslot()


//////////////////////////////////////////////////
//
//  Drawing
//
//////////////////////////////////////////////////

// Drawing a tile
function drawtile(id,fillcolor,strokecolor,strokewidth){
	if(id<0){ console.log('drawtile() Polygon collision '+id); return ''; }
	var str = '<path fill="'+fillcolor+'" stroke="'+strokecolor+'" stroke-width='+strokewidth+' desc="tile'+id+'"  d="M '+(w/2+points[tiles[id].pointindexes[0]].coords[0])+' '+(h/2+points[tiles[id].pointindexes[0]].coords[1])+' ';
	for(var i=1; i<tiles[id].pointindexes.length; i++){
		str += 'L '+(w/2+points[tiles[id].pointindexes[i]].coords[0])+' '+(h/2+points[tiles[id].pointindexes[i]].coords[1])+' ';
	}
	str += 'Z" />\n';
	return str;
}// End of drawtile()
		
/*
	Girih are lines (strapwork) that decorate the tiles. The tiles are used to form girih patterns, 
	from the Persian word گره, meaning "knot".[1] In most cases, only the girih (and other minor 
	decorations like flowers) are visible rather than the boundaries of the tiles themselves. 
	The girih are piece-wise straight lines that cross the boundaries of the tiles at 
	the center of an edge at 54° (3π/10) to the edge. Two intersecting girih cross each edge of a tile. 
	Most tiles have a unique pattern of girih inside the tile that are continuous and follow 
	the symmetry of the tile. However, the decagon has two possible girih patterns one of which 
	has only fivefold rather than tenfold rotational symmetry.
*/

// Drawing the Girih (knot) lines
function drawlines(id,strokecolor,strokewidth){
	if(id<0){ console.log('drawlines() Polygon collision '+id); return ''; }
	var str = '<path fill="transparent" stroke="'+strokecolor+'" stroke-width='+strokewidth+' desc="tile'+id+'lines" d="';
	
	for(var i=0; i<tiles[id].pointindexes.length; i++){
		
		var o = getmid(id,i);
		var x2 = o.x + Math.cos(o.beta) * tiles[id].sidelength * dlens[tiles[id].type][(i+tiles[id].offset)%tiles[id].pointindexes.length][0];
		var y2 = o.y + Math.sin(o.beta) * tiles[id].sidelength * dlens[tiles[id].type][(i+tiles[id].offset)%tiles[id].pointindexes.length][0];
		var x3 = o.x + Math.cos(o.gamma) * tiles[id].sidelength * dlens[tiles[id].type][(i+tiles[id].offset)%tiles[id].pointindexes.length][1];
		var y3 = o.y + Math.sin(o.gamma) * tiles[id].sidelength * dlens[tiles[id].type][(i+tiles[id].offset)%tiles[id].pointindexes.length][1];
		
		str += 'M '+(o.x+w/2)+' '+(o.y+h/2)+' L '+(x2+w/2)+' '+(y2+h/2)+' ';
		str += 'M '+(o.x+w/2)+' '+(o.y+h/2)+' L '+(x3+w/2)+' '+(y3+h/2)+' ';
		
	}
	
	str += '" />\n';
	return str;
}// End of drawlines()

function drawpoints(){
	var str = '';
	for(var i=0; i<points.length; i++){
		str += '<text x="'+(w/2+points[i].coords[0])+'" y="'+(h/2+points[i].coords[1])+'" font-family="Verdana" font-size="8" stroke="'+(masksum(i)===10?'blue':'red')+'">'+i+'</text>\n';
		for(var j=0; j<10; j++){
			if(points[i].mask[j]===1){
				str += '<circle cx="'+(w/2+points[i].coords[0]+le/3*Math.cos(Math.PI*(j*36+18)/180))+'" cy="'+(h/2+points[i].coords[1]+le/3*Math.sin(Math.PI*(j*36+18)/180))+'" r="2" style="fill: blue; stroke: blue; stroke-width: 1" />\n';
			}
		}
	}
	return str;
}// End of drawpoints()

// Creating the SVG string
function createSVGString(w,h,style,drp){
	var svgstr = '<svg width="'+w+'px" height="'+h+'px" transform="translate('+(w/2)+','+(h/2)+')" version="1.1" xmlns="http://www.w3.org/2000/svg" desc="Girih tiles" style="background-color:rgb(0,0,0)">';
	for(var i=0; i<tiles.length; i++){
		svgstr += drawtile(i, style.fillcolors[tiles[i].type], style.edgecolors[tiles[i].type], style.edgewidth);
		svgstr += drawlines(i, style.linecolor1, style.linewidth1 );
		svgstr += drawlines(i, style.linecolor2, style.linewidth2 );
	}
	if(drp){ svgstr += drawpoints(); }
	svgstr += '</svg>';
	return svgstr;
}// End of createSVGString()

// Appending an SVG string to a container
function appendSVGString(svgstr,parentid){
	var div;
	if(parentid){
		div = document.getElementById(parentid);
		if(!div){
			div = document.createElement('div');
			div.id = parentid;
			document.body.appendChild(div);
		}
	}else{
		div = document.createElement('div');
		document.body.appendChild(div);
	}
	div.innerHTML += svgstr;
}// End of appendSVGString()

//////////////////////////////////////////////////
//
//  Program entry point
//
//////////////////////////////////////////////////

var itercnt, iter, retries, retrycnt, le, w, h, maxpointnum, drawp, stylepr, v1, v2, v3, v4, v5, v6;

function resetvars(){ 
	itercnt = 0; iter = 500; retries = 10; retrycnt=0; le = 50; w = 1000; h = 1000; maxpointnum = 1000;
	points = []; pointdistances = []; tiles = [];
	drawp = false;
	stylepr = 'indigo2';

	try { iter = parseInt(v1.trim()); }catch(e){ console.log('!!!! ERROR : iterinput parseInt '+e+' '+JSON.stringify(e)); };
	try { w = parseInt(v2.trim()); }catch(e){ console.log('!!!! ERROR : widthinput parseInt '+e+' '+JSON.stringify(e)); };
	try { h = parseInt(v3.trim()); }catch(e){ console.log('!!!! ERROR : heightinput parseInt '+e+' '+JSON.stringify(e)); };
	try { le = parseInt(v4.trim()); }catch(e){ console.log('!!!! ERROR : leinput parseInt '+e+' '+JSON.stringify(e)); };
	try { stylepr = v5.trim().toLowerCase(); }catch(e){ console.log('!!!! ERROR : iterinput parseInt '+e+' '+JSON.stringify(e)); };
	
	drawp = v6;
	
	console.log(iter,w,h,le,stylepr);
}

function getvars(){
	v1 = document.getElementById('iterinput').value;
	v2 = document.getElementById('widthinput').value;
	v3 = document.getElementById('heightinput').value;
	v4 = document.getElementById('leinput').value;
	v5 = document.getElementById('styleinput').value;
	v6 = document.getElementById('debuginput').checked;
}

function startgen(){
	
	getvars();
	
	resetvars();
	gen1();
	
	resetvars();
	gen2();
	
	resetvars();
	gen3();
	
}// End of onload_init()


// Generator heuristic 1 : trying to fill the plane around a visible point, increase point index 
function gen1(){
	// First tile
	addtile(0, 0, le, -le/2, -1.5388*le, 0);
	
	// Generating tiles around points
	for(var i=0; i<iter; i++){
		if( isvisiblepoint(i,w,h) ){
			for(var j=0; j<retries; j++){ fillpoint(i, le); }
			//if(masksum(i)<10){ destroypoint(i); } // optional destroying point if it can't be filled
		}
	}
	// Rendering SVG
	var svgstr = createSVGString(w,h,stylepresets[stylepr],drawp);
	
	// Appending SVG string
	appendSVGString(svgstr,'mainbody');
	
	// Stats
	console.log('Number of tiles: '+tiles.length+' Number of points: '+points.length+' SVG string length: '+svgstr.length+' Avg. points/tiles: '+points.length/tiles.length+' Tiles/iter: '+tiles.length/iter);

}// End of gen1()

// Generator heuristic 2 : trying to fill the plane around a point, order by point distance from center, repeat
function gen2(){
	// First tile
	addtile(0, 0, le, -le/2, -1.5388*le, 0);
	
	// Generating with pointdistances
	var i = 0;
	while(i<iter){
		for(var j=0; j<pointdistances.length; j++){
			
			if( pointdistances.length > maxpointnum ){ console.log(points.length+' '+pointdistances.length); break; }
			if( points[pointdistances[j][0]] ){
				
				for(var k=0;k<retries;k++){ 
					fillpoint(pointdistances[j][0], le); 
				}
				
				// if(masksum(pointdistances[j][0])<10){ destroypoint(pointdistances[j][0]); } // optional destroying point if it can't be filled
				
			}
		}
		i++;
	}
	
	// Rendering SVG
	var svgstr = createSVGString(w,h,stylepresets[stylepr],drawp);
	
	// Appending SVG string
	appendSVGString(svgstr,'mainbody');
	
	// Stats
	console.log('Number of tiles: '+tiles.length+' Number of points: '+points.length+' SVG string length: '+svgstr.length+' Avg. points/tiles: '+points.length/tiles.length+' Tiles/iter: '+tiles.length/iter);
}// End of gen2()

// Generator heuristic 3 : like 1, but animated 
function gen3(){
	
	if(tiles.length<1){ addtile(0, 0, le, -le/2, -1.5388*le, 0); }
	
	// Generation step
	if( isvisiblepoint(itercnt,w,h) ){
		for(var j=0; j<retries; j++){ 
			fillpoint(itercnt, le); 
		}
		//if(masksum(itercnt)<10){ destroypoint(itercnt); }
	}
	
	// Creating and appending SVG string 
	// TODO: this should be optimized only to calculate and update the delta DOM/SVG elements
	var svgstr = createSVGString(w,h,stylepresets[stylepr],drawp);
	document.getElementById('svgcontainer').innerHTML = svgstr;
	
	// Repeat
	if(retrycnt<retries){
		if(itercnt<iter){
			itercnt++;
			setTimeout(gen3,10); 
		}else{
			itercnt = 0; retrycnt++;
			setTimeout(gen3,10);
		}
	}else{
		console.log('Number of tiles: '+tiles.length+' Number of points: '+points.length+' SVG string length: '+svgstr.length+' Avg. points/tiles: '+points.length/tiles.length+' Tiles/iter: '+tiles.length/iter);
	}
	
}// End of gen3()
