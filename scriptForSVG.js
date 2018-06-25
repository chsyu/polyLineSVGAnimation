let buildSVGPath = ($polyline, $path) => {

      function transformPolylineToPath(element) {
         let newElement = {};
         newElement.debug = 'modified-polyline';
         let points = element.attr("points").split(' ');
         let path = "M" + points[0];
         for (let i = 1; i < points.length; i++) {
            path += "L" + points[i];
         }
         return path;
      }

      function pointsConverter(element) {
         let tmpPoints = new Array();
         let newPoints = new Array();
         let points = element.attr("points").split(' ');
         for (let i = 0; i < points.length; i++) {
            tmpPoints[i] = (points[i]).split(',');
            newPoints[i] = {
               "x": Number(tmpPoints[i][0]),
               "y": Number(tmpPoints[i][1])
            };
         }
         return newPoints;
      }

      let path = transformPolylineToPath($polyline);
      $path.attr("d", path);
      let pathPoints = pointsConverter($polyline);

      let totalLength = 0,
         sumRatio = 0;
      let dX = [],
         dY = [],
         distance = [],
         drawRatio = [];
      let pathLength = pathPoints.length;

      for (let i = 1; i < pathLength; i++) {
         dX[i] = pathPoints[i].x - pathPoints[i - 1].x;
         dY[i] = pathPoints[i].y - pathPoints[i - 1].y;
         distance[i] = Math.sqrt(dX[i] * dX[i] + dY[i] * dY[i]);
         totalLength += distance[i];
      }
      for (let i = 1; i < pathLength; i++) {
         let dRatio = (distance[i] / totalLength * 5000);
         let yRatio = (dY[i] / pathPoints[pathLength - 1].y * 5000);
         let ratio = Math.floor(dRatio / yRatio * 100) / 5000;
         yRatio = Math.round(yRatio);
         for (let j = 0; j < yRatio; j++) {
            sumRatio = sumRatio + ratio;
            drawRatio.push(`${sumRatio}%`);
         }
      }


      // init controller
      var controller = new ScrollMagic.Controller();

      // build tween
      var tlPath = new TimelineMax();
      tlPath.add(TweenLite.fromTo($path, 0.0001, {
         drawSVG: "0%"
      }, {
         drawSVG: drawRatio[1]
      }));
      for (let i = 2; i < drawRatio.length; i++) {
         tlPath.add(TweenLite.to($path, 0.0001, {
            drawSVG: drawRatio[i]
         }));
      };

      // Path Scene
      var pathScene = new ScrollMagic.Scene({
            triggerElement: "#wrapper", // set the start line element
            triggerHook: 0.3, // set the trigger line position 
            offset: 0, // offset the start line position
            // when start line cross the trigger line, SVG line starts to draw
            duration: 6157, // the scroll region beginning from the start line, which is relative to 0~100% SVG path and should be equal to the height of the SVG figure
            // tweenChanges: true  //Smoothing effects which does not work for this case.
         })
         .setTween(tlPath)
      //    .addIndicators()
         .addTo(controller);

}