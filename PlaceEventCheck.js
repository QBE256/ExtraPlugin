/*
PlaceEventCheck

Author: cube

The square with the waiting event will turn blue.

Copyright (c) 2022 Cube
This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php

*/
(function () {
	var _MapLayer_drawMapLayer = MapLayer.drawMapLayer;
	MapLayer.drawMapLayer = function () {
		_MapLayer_drawMapLayer.apply(this, arguments);
		var session = root.getCurrentSession();
		if (session !== null) {
			var placeEventList = session.getPlaceEventList();
			for (var index = 0; index < placeEventList.getCount(); index++) {
				var event = placeEventList.getData(index).getPlaceEventInfo();
				if (event.getPlaceEventType() === PlaceEventType.WAIT) {
					root.getGraphicsManager().fillRange(
						event.getX() * 32 - session.getScrollPixelX(),
						event.getY() * 32 - session.getScrollPixelY(),
						32,
						32,
						0x00ffff,
						168
					);
				}
			}
		}
	};
})();
