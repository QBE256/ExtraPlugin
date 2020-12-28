TextRenderer.drawScreenTopText = function(text, textui) {
	var range;
	var x = LayoutControl.getCenterX(-1, UIFormat.SCREENFRAME_WIDTH) - 50;//ここの50の値を変える。増やすと左に移動する
	var y = 0;
	var color = textui.getColor();
	var font = textui.getFont();
	var pic = textui.getUIImage();
		
	if (pic !== null) {	
		pic.draw(x, y);
			
		range = createRangeObject(x + 105, y, UIFormat.SCREENFRAME_WIDTH, 45);
		TextRenderer.drawRangeText(range, TextFormat.LEFT, text, -1, color, font);
	}
};