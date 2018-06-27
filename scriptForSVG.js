let buildSVGPath = ($polyline, $path, svgHeight) => {

      let transformPolylineToPath = (element) => {
            let newElement = {};
            newElement.debug = 'modified-polyline';
            let points = element.attr("points").split(' ');
            let path = "M" + points[0];
            for (let i = 1; i < points.length; i++) {
                  if (points[i].includes(",")) {
                        path += "L" + points[i];
                  }
            }
            return path;
      }

      let pointsConverter = (element) => {
            let tmpPoints = new Array();
            let newPoints = new Array();
            let points = element.attr("points").split(' ');
            for (let i = 0; i < points.length; i++) {
                  tmpPoints[i] = (points[i]).split(',');
                  if (tmpPoints[i].length == 2) {
                        newPoints[i] = {
                              "x": Number(tmpPoints[i][0]),
                              "y": Number(tmpPoints[i][1])
                        };
                  }
            }
            return newPoints;
      }

      let path = transformPolylineToPath($polyline);
      let pathPoints = pointsConverter($polyline);
      let totalLength = 0, sumLength = 0;
      let dX = [],dY = [], distance = [], drawRatio = [];
      let pointNumber = pathPoints.length;
      for (let i = 1; i < pointNumber; i++) {
            dX[i] = pathPoints[i].x - pathPoints[i - 1].x;
            dY[i] = pathPoints[i].y - pathPoints[i - 1].y;
            distance[i] = Math.sqrt(dX[i] * dX[i] + dY[i] * dY[i]);
            totalLength += distance[i];
      }
      $path.attr("d", path);
      $path.attr("stroke-dasharray", totalLength);
      $path.attr("stroke-dashoffset", totalLength);

      // distance: the path length between points
      // dPath: distance between point(i) and point(i-1)
      // yPercentage: the percentage of each point scroll position dY in total SVG height
      // pseudoPointNumber: we break the total points into 5000 points, and the pseudoPoint Number is the point number in the segment between two points 
      // subLength: the length between each pseudoPoint
      for (let i = 1; i < pointNumber; i++) {
            let dPath = distance[i] ;
            let yPercentage = dY[i] / parseFloat(svgHeight, 10) ;
            let pseudoPointNumber = Math.round(yPercentage * 5000);
            let subLength = Math.round(dPath / yPercentage * 100) / 5000 ;
            for (let j = 0; j < pseudoPointNumber; j++) {
                  sumLength += subLength;
                  drawRatio.push(totalLength - sumLength / 100);
            }
      }
      console.log(drawRatio);
      // init controller
      var controller = new ScrollMagic.Controller();

      // build tween
      var tlPath = new TimelineMax();
      drawRatio.map(offset => {
            tlPath.add(TweenLite.to($path, 0.0001, {
                  strokeDashoffset: offset
            }));
      });

      // Path Scene
      let pathScene = new ScrollMagic.Scene(
            {
                  triggerElement: "#wrapper", // set the start line element
                  triggerHook: 0.3, // set the trigger line position 
                  reverse: false, //set the scene does not reverse play (default = true)
                  offset: 0, // offset the start line position
                  // when start line cross the trigger line, SVG line starts to draw
                  duration: svgHeight, // the scroll region beginning from the start line, which is relative to 0~100% SVG path and should be equal to the height of the SVG figure
            })
            .setTween(tlPath)
            .addTo(controller);

}
