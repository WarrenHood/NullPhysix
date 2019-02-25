base_id = 0;
enviroment_height = 500;
enviroment_width = 800;
global_forces = [{name:"gravity", x: 0, y:9.8, z:0}];
colliders = [];
air_friction = 0.9955555;
collision_friction = 0.9;
wall_friction = 0.8;
function vec2(x,y){
	var vec = {};
	vec.x = x || 0;
	vec.y = y || 0;
	return vec;
}
function vec_add(v1,v2){
	var vec = {};
	vec.x = v1.x+v2.x;
	vec.y = v1.y+v2.y;
	return vec;
}
function vec_sub(v1,v2){
	return vec_add(v1,vec_opposite_dir(v2));
}
function vec_multiply_const(c,vec){
	var vec2 = {};
	vec2.x = vec.x*c;
	vec2.y = vec.y*c;
	return vec2;
}
function vec_divide_const(c,vec){
	return vec_multiply_const(1.0/c,vec);
}
function vec_opposite_dir(vec){
	return vec_multiply_const(-1,vec);
}
function vec_magnitude(vec){
	return Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
}
function vec_normalised(vec){
	return vec_divide_const(vec_magnitude(vec),vec);
}
function vec_do_normalise(vec){
	vec = vec_normalised(vec);
	return vec;
}
function update_obj(o,delta_t){
	o.vel = vec_multiply_const(air_friction,o.vel);
	var restricted = {down : false,
			  left : false,
			  right: false,
			  left : false};
	if(o.position.y + o.h >= enviroment_height)restricted.down = true;
	for(var other=0; other < colliders.length; other++){
                if(colliders[other].base_id == o.base_id)continue;
		if(!collide_check(colliders[other],o))continue;
		o.vel = vec_multiply_const(collision_friction,o.vel);
		if(o.position.x < colliders[other].position.x){
			if(Math.abs(o.vel.x) > 20)restricted.right = true;
			if(o.vel.x > 0){
				o.vel.x *= -1;
				o.vel.x += (o.vel.x/Math.abs(o.vel.x))*colliders[other].vel.x*colliders[other].mass/o.mass;

			}

		}
		else{
			if(Math.abs(o.vel.x) > 20)restricted.left = true;
			if(o.vel.x > 0){
				o.vel.x *= -1;
				o.vel.x += (o.vel.x/Math.abs(o.vel.x))*colliders[other].vel.x*colliders[other].mass/o.mass;
			}
		}
		if(o.position.y > colliders[other].position.y){
                        if(Math.abs(o.vel.y) > 20)restricted.up = true;
			if(o.vel.y < 0){
				o.vel.y *= -1;
				o.vel.y += (o.vel.y/Math.abs(o.vel.y))*colliders[other].vel.y*colliders[other].mass/o.mass;
			}
                }
		else{
			restricted.down = true;
			if(o.vel.y > 0){
				o.vel.y *= -1;
				o.vel.y += (o.vel.y/Math.abs(o.vel.y))*colliders[other].vel.y*colliders[other].mass/o.mass;
			}
		}
	}
	for(var i=0; i<global_forces.length; i++){
		o.vel.x += pm_ratio * global_forces[i].x * o.mass * delta_t;
		o.vel.y += pm_ratio * global_forces[i].y * o.mass * delta_t;
	}
	for(var i=0; i<o.forces.length; i++){
                o.vel.x += pm_ratio * o.forces[i].x * o.mass * delta_t;
                o.vel.y += pm_ratio * o.forces[i].y * o.mass * delta_t;
        }
	o.forces = [];
	if(o.position.y <= 0 && o.vel.y < 0){
		o.vel.y *= wall_friction;
		o.vel.y *= -1;
	}
        if(o.position.y + o.h >= enviroment_height && o.vel.y > 0){
		o.vel.y *= wall_friction;
		o.vel.y *= -1;
	}
	if(o.position.x <= 0 && o.vel.x < 0){
		o.vel.x *= wall_friction;
		o.vel.x *= -1;
	}
	if(o.position.x + o.w >= enviroment_width && o.vel.x > 0){
		o.vel.x *= wall_friction;
		o.vel.x *= -1;
	}
	if(o.vel.x < 0 && restricted.left)o.vel.x = 0;
	if(o.vel.x > 0 && restricted.right)o.vel.x = 0;
	if(o.vel.y < 0 && restricted.up)o.vel.y = 0;
	if(o.vel.y > 0 && restricted.down)o.vel.y = 0;
	o.position.x += pm_ratio*o.vel.x*delta_t;
	o.position.y += pm_ratio*o.vel.y*delta_t;
	o.getElem().style.left = o.position.x + "px";
	o.getElem().style.top = o.position.y + "px";
}
function update_params(){
	pm_ratio = document.getElementById("pixels").value/document.getElementById("metres").value;
	time_sensitivity = document.getElementById("time-sensitivity").value;
	//enviroment_height = document.getElementById("enviroment").style.height;
	//enviroment_width = document.getElementById("enviroment").style.width;

}
function MakeRect(x,y,w,h,mass,rgb){
	var o = {};
	o.position = {
		x : x,
		y : y
	}
	o.ovel = {
		x : x,
		y : y
	}
	o.h = h || 10;
	o.w = w || 10;
	o.mass = mass;
	o.forces = [];
	o.vel = {
		x : 40,
		y : 15
	}
	o.forces = [];
	o.type = "rect";
	o.rgb = rgb || [255,0,0];
	o.base_id = base_id;
	var ht_elem = "<div id='user_obj_"+base_id+"' style='position:absolute;left:"+o.position.x+"px;top:"+o.position.y+"px;"+"height:"+o.h+"px;width:"+o.w+"px;background:rgba("+o.rgb[0]+","+rgb[1]+","+rgb[2]+");border:1px solid black;'></div>";
	document.getElementById("enviroment").innerHTML += ht_elem;
	o.getElem = function(){
		return document.getElementById("user_obj_"+this.base_id);
	};
	base_id++;
	colliders.push(o);
	return o;

}
function collide_check(o1,o2){
	if(o1.position.x+o1.w < o2.position.x)return false;
	if(o1.position.x > o2.position.x + o2.w)return false;
	if(o1.position.y+o1.h < o2.position.y)return false;
	if(o1.position.y > o2.position.y + o2.h)return false;
	return true;
		
}
function test(){
	var rec = MakeRect(200,200,30,30,1,[255,0,0]);
	setInterval(
		function(){
			update_obj(rec,0.015);
		}
		,15);
}
window.onload = function(){
	console.log("Test");
	update_params();
	document.getElementById("simulate").onclick = test;
	document.getElementById("enviroment").onclick = function(e){
		e = e || event;
		var rec = MakeRect(e.clientX,e.clientY,30,30,1,[0,255,0]);
        	setInterval(
                function(){
                        update_obj(rec,0.015);
                }
                ,15);

	}
}
