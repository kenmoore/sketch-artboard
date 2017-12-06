// Next Artboard
// Move the next artboard into view:
//  - maintains vertical scroll offset between artboards
//  - zooms to width of the new artboard
//  - supports random access (select artboard in layers list and invoke Next Artboard)

var view;
var scrollOrigin;
var zoomValue;
var viewportWidth;
var viewportHeight;
var artboards;

var nextArtboard = function(context) {
  var doc = context.document;
  var selection = context.selection;

  var page = [doc currentPage];
  artboards = [page artboards];
  view = [doc contentDrawView];
  scrollOrigin = [doc scrollOrigin];
  zoomValue = [doc zoomValue];
  var viewportFrame = [view frame];
  viewportWidth = viewportFrame.size.width;
  viewportHeight = viewportFrame.size.height;

  // First warn the user to turn off "Animate Zoom" preference
  var defs = [[NSUserDefaultsController sharedUserDefaultsController] defaults];
  var animateZoom = defs.valueForKey("animateZoom"); 
  var defsStandard = [NSUserDefaults standardUserDefaults]
  var warningSeen = defsStandard.valueForKey("com.kenmooredesign.sketchplugin.NextArtboard.animateZoomWarningSeen")
  if (animateZoom && !warningSeen) {
    var app = [NSApplication sharedApplication];
    [app displayDialog:"For best results with the Next / Previous Artboard plugins, uncheck 'Animate Zoom' in Sketch > Preferences > General." withTitle:"Next Artboard"]

    [defsStandard setObject: true forKey: "com.kenmooredesign.sketchplugin.NextArtboard.animateZoomWarningSeen"]
  }

  var currentArtboardIndex = getInViewArtboardIndex(zoomValue)
  var currentArtboard = [artboards objectAtIndex: currentArtboardIndex];
  var currentArtboardRect = [currentArtboard absoluteRect];

  var nextArtboardIndex = (currentArtboardIndex + [artboards count] - 1) % [artboards count];
  var nextArtboard;

  if (currentArtboard == [page currentArtboard] || [page currentArtboard] == null) {
    // If the current artboard is the one that's in view, next = next in sequence
    nextArtboard = [artboards objectAtIndex: nextArtboardIndex];
  } else {
    // If user has manually selected an artboard that's not the current in-view artboard,
    // use the selected one as next
    nextArtboard = [page currentArtboard];  
  }

  var nextArtboardRect = [nextArtboard absoluteRect];

  context.api().selectedDocument.selectedPage.selectedLayers.clear();
  [nextArtboard select:true byExpandingSelection:true]

  var newX = [nextArtboardRect x];
  var newWidth = [nextArtboardRect width];
  var newZoomValue = viewportWidth / newWidth;
  var newY = Math.max([nextArtboardRect y], [nextArtboardRect y] - ([currentArtboardRect y] + scrollOrigin.y / zoomValue));
  if (newY > [nextArtboardRect y] + [nextArtboardRect height]) {
    // Ensure that the transition doesn't leave the user viewing an empty patch of artboard
    newY = [nextArtboardRect y] + [nextArtboardRect height] - viewportHeight;
  }
  var newHeight = viewportHeight / newZoomValue;
  var newRect = NSMakeRect(newX, newY, newWidth, newHeight);

  // center new rect without animation
  view.zoomToFitRect(newRect);  
}

// Get the in-view artboard index (closest to the center of the viewport)
function getInViewArtboardIndex() {

  // Calculate the coordinates of the midpoint of the viewport (in Viewport coordinate space)
  viewportCenterX = (viewportWidth / 2 - scrollOrigin.x) / zoomValue;
  viewportCenterY = (viewportHeight / 2 - scrollOrigin.y) / zoomValue;

  // See which artboard (if any) includes the center point of the viewport
  var inViewArtboardIndex = 0;  // initialize to the first artboard
  var minDistance = 1000000;  // to calculate closest artboard in case none include the center point of the viewport
  for(var i = 0; i < [artboards count]; i++) {
    artboard = [artboards objectAtIndex: i];
    artboardRect = [artboard absoluteRect];

    // If artboard contains center point, we're done searching
    if ([artboardRect x] < viewportCenterX && [artboardRect x] + [artboardRect width] > viewportCenterX && [artboardRect y] < viewportCenterY && [artboardRect y] + [artboardRect height] > viewportCenterY) {
        inViewArtboardIndex = i;
        break;
    } else {
      // Calculate sum of x offset and y offset from the center of the artboard to the center of the viewport
      distance = Math.abs(viewportCenterX - ([artboardRect x] + [artboardRect width] / 2)) + Math.abs(viewportCenterY - ([artboardRect y] + [artboardRect height] / 2));

      // If it's shorter than the current minimum, then it's the new choice for nearest
      if (distance < minDistance) {
        inViewArtboardIndex = i;
        minDistance = distance;
      }
    }
  }

  return inViewArtboardIndex;
}

