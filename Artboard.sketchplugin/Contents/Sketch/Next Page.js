// Previous Page
// Move to the next page and zoom to fit width

var nextPage = function(context) {
  var doc = context.document;

  // First warn the user to turn off "Animate Zoom" preference
  var defs = [[NSUserDefaultsController sharedUserDefaultsController] defaults];
  var animateZoom = defs.valueForKey("animateZoom"); 
  var defsStandard = [NSUserDefaults standardUserDefaults]
  var warningSeen = defsStandard.valueForKey("com.kenmooredesign.sketchplugin.NextArtboard.animateZoomWarningSeen")
  if (animateZoom && !warningSeen) {
    var app = [NSApplication sharedApplication];
    [app displayDialog:"For best results with the Next / Previous plugins, uncheck 'Animate Zoom' in Sketch > Preferences > General." withTitle:"Next Page"]

    [defsStandard setObject: true forKey: "com.kenmooredesign.sketchplugin.NextArtboard.animateZoomWarningSeen"]
  }


  var pages = [doc pages]
  var num_pages = [pages count]
  var current_page = [doc currentPage]
  var current_page_index = [pages indexOfObject:current_page]
  var new_page_index

  if (current_page_index < num_pages - 1) {
    new_page_index = current_page_index + 1
  } else {
    new_page_index = 0
  }

  current_page = pages[new_page_index]
  [doc setCurrentPage:current_page]
  doc.sidebarController().pagesViewController().reloadData()

  var all_artboards = [current_page artboards]
  var num_artboards = [all_artboards count]

  if (num_artboards > 0) {
    // center new rect without animation
    var current_artboard = all_artboards[0]
    var current_rect = [current_artboard rect]
    [[doc contentDrawView] zoomToFitRect:current_rect]
  }
}
