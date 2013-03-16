var kInfectedClass = "infected";
var kImmunizedClass = "immunized";
var kNonInfectableClass = "noninfectable";
var kCellLength = 60;

var infection_table = [];

var gCanvas;

var cols = 0;
var rows = 0;
var step_count = 0;

function setup_canvas()
{
	gCanvas = $(".canvas");

	var w = gCanvas.outerWidth(true);
	var h = gCanvas.outerHeight(true);

	cols = Math.floor(w/kCellLength);
	rows= Math.floor(h/kCellLength);
}

function draw_circles()
{
	for(var col = 0; col < cols; ++col)
	{
		infection_table[col] = [];
		for(var row = 0; row < rows; ++row)
		{
			var p = new Person(draw_circle(col, row));
			infection_table[col][row] = p;
		}
	}
}

function draw_circle(col, row)
{
	var x = (col*kCellLength);
	var y = (row*kCellLength);
	var circle = $("<div class='circle'></div>");
	circle.css("top", y);
	circle.css("left", x);
	circle.data("col", col);
	circle.data("row", row);
	gCanvas.append(circle);
	return circle;
}

function infect_patient_zero()
{
    var p = gCanvas.find(".circle");
	var index = Math.floor(Math.random() * p.length);
	var i = p.eq(index);
	infect(i.data("col"), i.data("row"));
}

function infect(col, row)
{
	infection_table[col][row].infect();
	infected_list.push({ col: col, row: row});
}

function run_next()
{
	++step_count;
	var numImmunized = gCanvas.find("." + kImmunizedClass + ",." + kNonInfectableClass).length;
	var infected = gCanvas.find("." + kInfectedClass);
	var numToInfect = Math.min((cols*rows)-numImmunized, Math.pow(2, step_count)) - infected.length;
	if(numToInfect === 0)
		return;

	/*var near_uninfected_list = [];
	for(var i =0; i < infected_list.length; ++i)
	{
		var cell = infected_list[i];
		if(near_uninfected(cell.col, cell.row))
			near_uninfected_list.push(cell);
	}*/
	step(numToInfect);
}

function step(numToInfect)
{
	if(numToInfect === 0)
		return;

	var infected = gCanvas.find("." + kInfectedClass);
	var index = Math.floor(Math.random() * infected.length);
	var i = infected.eq(index);
	var cell = { col: i.data("col"), row: i.data("row")};
	if(near_infectable(cell.col, cell.row) && infect_next(cell))
	{
		--numToInfect;
		setTimeout(function(){ step(numToInfect); }, 10);
	}
	else
	{
		step(numToInfect);
	}

}

function near_infected(col, row)
{
	return  ( infection_table[Math.max(col-1, 0)][row ].infected ) ||
			( infection_table[Math.min(col + 1, cols-1)][row].infected ) ||
			( infection_table[col][Math.max(row-1, 0) ].infected ) ||
			( infection_table[col][Math.min(row+1, rows-1).infected ]);
}

function near_infectable(col, row)
{
	return  ( infection_table[Math.max(col-1, 0)][row ].infectable ) ||
			( infection_table[Math.min(col + 1, cols-1)][row].infectable ) ||
			( infection_table[col][Math.max(row-1, 0) ].infectable ) ||
			( infection_table[col][Math.min(row+1, rows-1).infectable ]);
}

function infect_next(cell)
{
	var direction = Math.floor ( Math.random() * 4);
	var col = cell.col;
	var row = cell.row;
	while(true)
	{
		switch(direction)
		{
			case 0:
				row -= 1;
				break;
			case 1:
				col += 1;
				break;
			case 2:
				row += 1;
				break;
			case 3:
				col -= 1;
				break;
			default:
				return false;
		}
		if(row < 0 || row >= rows || col < 0 || col >= cols)
			return false;
		if(infection_table[col][row].infectable)
		{
			infect(col, row);
			return true;
		}
		else if (infection_table[col][row].infected)
		{
			continue;
		}
		else
		{
			break;
		}
	}
	return false;
}

function reset()
{
	infection_table = [];
	infected_list = [];

	gCanvas = null;

	cols = 0;
	rows = 0;
	step_count = 0;

	$(".canvas").empty();

	setup_canvas();
	draw_circles();
	infect_patient_zero();
}

function Person(el)
{
	var element = el;
	this.infectable = true;
	this.infected = false;
	this.immunized = false;

	this.infect = function() {
		element.addClass(kInfectedClass);
		this.infectable = false;
		this.infected = true;
	};

	this.healthify = function(infectionType) {
		if(this.infected)
		{
			element.removeClass(kInfectedClass);
			this.infected = false;
			if(infectionType == 1)
			{
				this.infectable = false;
				element.addClass(kNonInfectableClass);
			}
			else
			{
				this.infectable = true;
			}
		}
	};

	this.immunize = function() {
		if(!this.immunized)
		{
			element.addClass(kImmunizedClass);
			this.infectable = false;
		}
		else
		{
			element.removeClass(kImmunizedClass);
			this.infectable = true;
		}
	};
}

function immunize()
{
	var self = $(this);
	var c = self.data("col");
	var r = self.data("row");
	var p = infection_table[c][r];
	if(p.infected)
		p.healthify($('input:radio[name=infectionType]:checked').val());
	else
		p.immunize();
}

$(function()
{
	$("#startBtn").click(function(){
		$("#timestamp").text(step_count+1);
		run_next();
	});

	$(".canvas").delegate(".circle", "click", immunize);
	reset();
});