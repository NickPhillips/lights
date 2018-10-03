var simLEDs = [];
var simNumLEDs = 64;
var simPalette = [];
var simOffset = 0;
var simTime = 0;
var simDelay = 0.25;
var simBlend = 0;
var simEffect = 0;

function sendSettings()
{
    var settings = {brightness:128};
	settings.brightness = $( "#red" ).slider( "value" );
	$.ajax({
        url: "set",
        data: settings,
		success: function(data) {
		   $( "#green" ).slider( "value", parseInt(data) );
		}
    });
	refreshSwatch();
}

function randomColors()
{
	var arr = $.map($('input:checkbox:checked'), function(e, i) {
		return +e.value;
	});
	len = arr.length;
	if (len == 0)
		return;
	for (var i=0; i < len; i++)
	{
		var H = Math.floor((Math.random() * 360) + 1);
		$("#c"+arr[i]).spectrum("set", "hsv "+H+" 100 100");
		// sendColor
	}
	
	updateSimPalette();
}

function autoBlend()
{
	var arr = $.map($('input:checkbox:checked'), function(e, i) {
		return +e.value;
	});
	if (arr.length == 0)
		return;
	var first = arr[0];
	var last = arr[arr.length-1];
	var x = last - first;
	if (x == 0)
	{
		if (first < 2 || first > 7)
			return;
		last = 1;
		x = 8 + 1 - first;
	}
	var colorA = $("#c"+first).spectrum("get");
	var colorB = $("#c"+last).spectrum("get");

	for (var i=1; i < x; i++)
	{
		var cNum = first + i;
		$("#c"+cNum).spectrum("set", tinycolor.mix(colorA, colorB, amount = i/x * 100));
		// sendColor
	}
	
	updateSimPalette();
}

function loadValues()
{
	var data = ["87ceeb","87ceeb","87ceeb","87ceeb","87ceeb","87ceeb","87ceeb","87ceeb",0,127,80,0,0];
	$.ajax({
        url: "get",
        dataType: "json",
		success: function(jsonArray) {
		   data = jsonArray;
		}
    });

	$("#c1").spectrum("set", data[0]);
	$("#c2").spectrum("set", data[1]);
	$("#c3").spectrum("set", data[2]);
	$("#c4").spectrum("set", data[3]);
	$("#c5").spectrum("set", data[4]);
	$("#c6").spectrum("set", data[5]);
	$("#c7").spectrum("set", data[6]);
	$("#c8").spectrum("set", data[7]);
	
	if (data[8] == 1) {
		$("#On").prop("checked", true).button("refresh");
	} else {
		$("#Off").prop("checked", true).button("refresh");
	}

	$("#brightness").slider("value", data[9]);
	$("#speed").slider("value", data[10]);
	$("#blend").val(data[11].toString());
	$("#blend").selectmenu("refresh");
	$("#effect").val(data[12].toString());
	$("#effect").selectmenu("refresh");
}

function changeTheme(theme)
{
	switch (theme)
	{
		case "Winter":
			configure("00008b", "0000ff", "87ceeb", "ffffff", "00008b", "87ceeb", "add8e6", "ffffff", "1");
			break;
		case "Valentine's Day":
			configure("ff0000", "ffc0cb", "ffffff", "ffc0cb", "ff0000", "ffc0cb", "ffffff", "ffc0cb", "1");
			break;
		case "St. Patrick's Day":
			configure("38aa37", "00ff00", "38aa37", "00ff00", "38aa37", "00ff00", "38aa37", "00ff00", "1");
			break;
		case "Easter":
			configure("69ffb9", "69ffb9", "76ecfb", "76ecfb", "c1fda0", "c1fda0", "9386e6", "f298f4", "0");
			break;
		case "Independence Day":
			configure("0000ff", "ffffff", "0000ff", "ff0000", "ffffff", "ff0000", "ffffff", "ff0000", "0");
			break;
		case "Autumn":
			configure("ff9900", "e41313", "efef4e", "ff9900", "da0f0f", "efef4e", "da0f0f", "ff9900", "0");
			break;
		case "Halloween":
			configure("ff9900", "000000", "ff9900", "000000", "ff9900", "000000", "ff9900", "000000", "1");
			break;
		case "Christmas":
			configure("00ff00", "00ff00", "ff0000", "ff0000", "00ff00", "00ff00", "ff0000", "ff0000", "0");
	}
	
	updateSimPalette();
}

function configure(c1, c2, c3, c4, c5, c6, c7, c8, blend)
{
	$("#c1").spectrum("set", c1);
	$("#c2").spectrum("set", c2);
	$("#c3").spectrum("set", c3);
	$("#c4").spectrum("set", c4);
	$("#c5").spectrum("set", c5);
	$("#c6").spectrum("set", c6);
	$("#c7").spectrum("set", c7);
	$("#c8").spectrum("set", c8);
	$("#blend").val(blend);
	$("#blend").selectmenu("refresh");
	// Call sendColor function to send colors to the controller
	var c={c1:""};
	c.c1 = c1;
	sendColor(c);
	c={c2:""};
	c.c2 = c2;
	sendColor(c);
	c={c3:""};
	c.c3 = c3;
	sendColor(c);
	c={c4:""};
	c.c4 = c4;
	sendColor(c);
	c={c5:""};
	c.c5 = c5;
	sendColor(c);
	c={c6:""};
	c.c6 = c6;
	sendColor(c);
	c={c7:""};
	c.c7 = c7;
	sendColor(c);
	c={c8:""};
	c.c8 = c8;
	sendColor(c);
	
	sendBlend(blend);
}
function sendMode(mode)
{
	var settings = {md:0};
	settings.md = mode;
	$.ajax({
        url: "set",
        data: settings
    });
}
function sendBrightness()
{
	var settings = {i:128};
	settings.i = $("#brightness").slider("value");
	$.ajax({
        url: "set",
        data: settings
    });
}
function sendSpeed()
{
	var settings = {sp:20};
	settings.sp = $("#speed").slider("value");
	$.ajax({
        url: "set",
        data: settings
    });
	
	simDelay = -0.002 * settings.sp + 0.3;
	if (settings.sp < 1)
		simDelay = 0.7;
}
function sendBlend(blend)
{
	var settings = {bl:0};
	settings.bl = parseInt(blend);
	$.ajax({
        url: "set",
        data: settings
    });
	
	simBlend = settings.bl;
}
function sendEffect(effect)
{
	var settings = {ef:0};
	settings.ef = parseInt(effect);
	$.ajax({
        url: "set",
        data: settings
    });
	
	simEffect = settings.ef;
	
	//Testing gradient preview code
	if (effect == "1")
		$("#gBox").addClass('gradTest');
	if (effect == "2")
		$("#gBox").removeClass('gradTest').addClass('bhw128');
}
function sendColor(obj)
{
	// alert(JSON.stringify(obj));
	/*
	$.ajax({
        url: "set",
        data: obj
    }); */
}
$(document).ready(function() {
	$("#mode").buttonset();
	$("#On").click(function() { sendMode(1); });
	$("#Off").click(function() { sendMode(0); });
	
	$("#theme").append("<option>Winter</option>");
	$("#theme").append("<option>Valentine's Day</option>");
	$("#theme").append("<option>St. Patrick's Day</option>");
	$("#theme").append("<option>Easter</option>");
	$("#theme").append("<option>Independence Day</option>");
	$("#theme").append("<option>Autumn</option>");
	$("#theme").append("<option>Halloween</option>");
	$("#theme").append("<option>Christmas</option>");
	
	$("#theme").selectmenu({
		change: function(event, data) { changeTheme(data.item.value); }
	});
    $("#brightness").slider({
      orientation: "horizontal",
      range: "min",
      max: 255,
      value: 127,
      change: sendBrightness
    });
	$("#speed").slider({
      orientation: "horizontal",
      range: "min",
      max: 100,
      value: 20,
      change: sendSpeed
    });
	$("#blend").selectmenu({
		change: function(event, data) { sendBlend(data.item.value); updateSimPalette(); }
	});
	$("#effect").selectmenu({
		change: function(event, data) { sendEffect(data.item.value); }
	});
	
	$(".picker").spectrum({
		color: "black",
		showInput: true,
		className: "ColorPicker",
		showPalette: true,
		showSelectionPalette: true,
		maxSelectionSize: 9,
		preferredFormat: "hex",
		localStorageKey: "spectrum.palette",
		palette: [
			["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", "rgb(204, 204, 204)", "rgb(217, 217, 217)","rgb(255, 255, 255)"],
			["rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)", "rgb(0, 255, 255)",
			"rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
			["rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)", 
			"rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)"],
			["rgb(147, 196, 125)", "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)",
			"rgb(194, 123, 160)", "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)"],
			["rgb(241, 194, 50)", "rgb(106, 168, 79)", "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)",
			"rgb(103, 78, 167)", "rgb(166, 77, 121)", "rgb(91, 15, 0)", "rgb(102, 0, 0)"],
			["rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)"]
		]
	});
	$("#c1").on('change.spectrum', function(e, color) { var c={c1:""}; c.c1=color.toHex(); sendColor(c); updateSimPalette(); });
	$("#c2").on('change.spectrum', function(e, color) { var c={c2:""}; c.c2=color.toHex(); sendColor(c); updateSimPalette(); });
	$("#c3").on('change.spectrum', function(e, color) { var c={c3:""}; c.c3=color.toHex(); sendColor(c); updateSimPalette(); });
	$("#c4").on('change.spectrum', function(e, color) { var c={c4:""}; c.c4=color.toHex(); sendColor(c); updateSimPalette(); });
	$("#c5").on('change.spectrum', function(e, color) { var c={c5:""}; c.c5=color.toHex(); sendColor(c); updateSimPalette(); });
	$("#c6").on('change.spectrum', function(e, color) { var c={c6:""}; c.c6=color.toHex(); sendColor(c); updateSimPalette(); });
	$("#c7").on('change.spectrum', function(e, color) { var c={c7:""}; c.c7=color.toHex(); sendColor(c); updateSimPalette(); });
	$("#c8").on('change.spectrum', function(e, color) { var c={c8:""}; c.c8=color.toHex(); sendColor(c); updateSimPalette(); });

	$("#btnRandom").button();
	$("#btnAuto").button();
	$("#btnRandom").click(function(event) { randomColors(); });
	$("#btnAuto").click(function(event) { autoBlend(); });

	//set up canvas with Paper
	$('#paperCanvas').attr({width:400,height:450})
	paper.install(window);
	paper.setup('paperCanvas');
	var original_width = 400;
	var ratio = $('#paperCanvas').innerWidth()/original_width;
	var raster = new Raster('artificial-christmas-tree.gif');
	raster.onLoad = function(){
        raster.position = paper.view.center;
        raster.size = paper.view.size;
		ratio = $('#paperCanvas').innerWidth()/original_width;
	};
	
	var points = [[188,55], [196,63], [206,67], [218,70], [0,0], [0,0], [0,0], [0,0],
				[176,77], [188,85], [204,91], [222,92], [0,0], [0,0], [0,0], [0,0],
				[164,101], [175,109], [188,117], [203,123], [224,125], [242,125], [0,0], [0,0], [0,0], [0,0], [0,0],
				[155,137], [168,143], [184,149], [202,152], [221,155], [240,156], [0,0], [0,0], [0,0], [0,0], [0,0],	
				[150,175], [172,183], [189,185], [207,189], [226,190], [247,192], [0,0], [0,0], [0,0], [0,0], [0,0],
				[144,200], [160,209], [177,212], [196,216], [220,222], [241,221], [260,215], [0,0], [0,0], [0,0], [0,0], [0,0],
				[133,236], [152,241], [173,247], [193,251]	];
	var numPoints = points.length;
	for (var i=0; i < numPoints; i++)
	{
		var x = points[i][0] * ratio;
		var y = points[i][1] * ratio;
		simLEDs[i] = new Path.Circle(new Point(x,y), 3 * ratio);
		simLEDs[i].fillColor = 'red';
		if (x == 0)
			simLEDs[i].visible = false;
	}
	
	//Animation code for simulation
	view.onFrame = function(event)
	{
		simTime = simTime + event.delta;
		if (simTime < simDelay)
			return;
		simTime = 0;
		if (simDelay < 0.7)
			simOffset = (simOffset + 1) % simNumLEDs;
		
		for (var i=0; i < simNumLEDs; i++)
		{
			var j = simNumLEDs - 1 - i;
			if (simEffect == 0)
				simLEDs[j].fillColor = simPalette[(i + simOffset) % simNumLEDs];
			else
				simLEDs[j].fillColor = simPalette[simOffset];
		}
	}
	
	loadValues(); //Load current values from controller
	updateSimPalette();
});

function updateSimPalette()
{
	if (simBlend == 0)
	{
		for (var i=0; i < simNumLEDs; i++)
		{
			var cNum = Math.floor(i * 8 / simNumLEDs) + 1;
			simPalette[i] = $("#c"+cNum).spectrum("get").toHexString();
		}
	}
	else
	{
		var x = simNumLEDs / 8;
		for (var i=0; i < simNumLEDs; i++)
		{
			var cNum = Math.floor(i * 8 / simNumLEDs) + 1;
			var cNext = cNum + 1;
			if (cNext > 8)
				cNext = 1;
			var colorA = $("#c"+cNum).spectrum("get");
			var colorB = $("#c"+cNext).spectrum("get");
			simPalette[i] = tinycolor.mix(colorA, colorB, amount = (i%8)/x * 100).toHexString();
		}
	}
}
