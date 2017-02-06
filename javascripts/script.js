$(document).ready(function() {

	var url = "javascripts/cyclist-data.json";
	var formatTime = d3.time.format("%M:%S");
	var formatMinutes = function(d) {
	    var time = new Date(2012, 0, 1, 0, d)
	    time.setSeconds(time.getSeconds() + d);
	    return formatTime(time);
	};

	// GET THE GDP JSON DATA, THEN BUILD THE BAR CHART TO VISUALIZE IT
	d3.json(url, function(error, data) {
		
		// IF THERE WAS AN ERROR, STOP NOW AND SHOW AN ERROR MESSAGE
		if (error) { 
			$(".errorMessage").show();
			return error;
		}
		
		// CHECK WHAT DATA WE HAVE
		console.log(data);

		// SET SOME STYLING VARIABLES FOR THE CHART
		var margin = {
			top: 5,
			right: 10,
			bottom: 50,
			left: 75
		};
		var width = 1000 - margin.left - margin.right;
		var height = 500 - margin.top - margin.bottom;
		var barWidth = Math.ceil(width / data.length);

		// X SCALE
		// TAKE THE MIN AND THE MAX FINISH TIMES AND FIT IT TO THE WIDTH WE SET EARLIER
		// TIME.SCALE IS A MODIFCATION TO SCALE.LINEAR TO WORK WELL WITH DATES
		var x = d3.scale.linear()
			.domain([d3.min(data, function(d) {return d.Seconds;}), d3.max(data, function(d) {return d.Seconds;})])
			.range([0, width]);

		// Y SCALE
		// SET THE DOMAIN TO GO FROM 0 TO THE LARGEST VALUE OF OUR DATA SET
		// AND FIT IT TO OUR HEIGHT WE SET EARLIER
		// BUT IT'S FLIPPED BECAUSE WE GO FROM TOP-LEFT TO BOTTOM-RIGHT WITH SVG
		var y = d3.scale.linear()
			.domain([1,36])
			.range([0, height]);

		// X-AXIS
		// PUT THE X-AXIS ON THE BOTTOM AND FORMAT THE TICKS TO BE YEARS AT 5-YEAR INTERVALS
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickValues([35,36,37,38,39,40])
			.tickFormat(formatMinutes);

		// Y-AXIS
		// PUT THE Y-AXIS ON THE LEFT AND FORMAT THERE TO BE 10 TICKS AND TO HAVE A $ PREFIX AND COMMAS
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(7, "");

		// TOOLTIP, CURRENTLY EMPTY AND HIDDEN
		var tooltip = d3.select(".mainContainer").append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);

		// CREATE A SPACE FOR THE CHART TO BE FORMED
		var chart = d3.select(".chart")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// APPEND THE X-AXIS
		// HAVE IT START IN THE BOTTOM-LEFT CORNER
		chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.append("text")
			.attr("x", width/2)
			.attr("dx", "0em")
			.attr("dy", "2.8em")
			.style("text-anchor", "middle")
			.text("Finish Time (MM:SS)");


		// APPEND THE Y-AXIS
		// ALSO APPEND A LABEL FOR THE Y-AXIS, ROTATE IT 90 DEGREES, AND ANCHOR IT TO THE END
		chart.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.8em")
			.style("text-anchor", "end")
			.text("Ranking");

		// CREATE THE BARS THAT MAKE UP OUR BAR CHART
		// GO THROUGH EACH DATA POINT
		// CREATE A RECTANGLE FOR IT
		// SET THE X COORDINATE FOR IT USING THE DATE IN MILLISECONDS
		// SET THE Y COORDINATE FOR IT USING THE GDP VALUE
		// SET THE HEIGHT OF THE BAR BY FINDING THE DISTANCE FROM THE TOP OF THE BAR TO THE 0 POINT
		// SET THE WIDTH OF THE BAR USING THE EQUALLY DIVIDED WIDTHS WE CALCULATED EARLIER
		// FINALLY, SET THE MOUSEOVER/MOUSEOUT EFFECTS FOR THE TOOLTIP, SETTING THE TOOLTIP CONTENT AND POSITION BASED ON THE BAR HOVERED OVER
		chart.selectAll(".bar")
			.data(data)
			.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) {
				return x(new Date(d[0]));
			})
			.attr("y", function(d) {
				return y(d[1]);
			})
			.attr("height", function(d) {
				return height - y(d[1]);
			})
			.attr("width", barWidth)
			.on("mouseover", function(d) {
				var rect = d3.select(this);
				rect.attr("class", "mouseover");
				var currentDateTime = new Date(d[0]);
				var year = currentDateTime.getUTCFullYear();
				var month = currentDateTime.getUTCMonth();
				var dollars = d[1];
				tooltip.transition()
					.duration(200)
					.style("opacity", 0.9);
				tooltip.html("<span class='amount'>" + formatCurrency(dollars) + " Billion </span><br><span class='year'>" + year + " - " + months[month] + "</span>")
					.style("top", (d3.event.pageY - 50) + "px");
				if (d3.event.offsetX - 80 < width/2) {
					tooltip.style("left", (d3.event.pageX + 5) + "px")
							.style("width", "126px");
				} else {
					if (dollars < 10000) {
						tooltip.style("left", (d3.event.pageX - 145) + "px")
							.style("width", "126px");
					} else {
						tooltip.style("left", (d3.event.pageX - 155) + "px")
							.style("width", "136px");
					}
				}
			})
			.on("mouseout", function() {
				var rect = d3.select(this);
				rect.attr("class", "mouseoff");
				tooltip.transition()
					.duration(500)
					.style("opacity", 0);
			});

	});

});