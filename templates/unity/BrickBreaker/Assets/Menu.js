﻿
public var guiSkin : GUISkin;
public var introSound : AudioClip;
public var winSound : AudioClip;
public var loseSound : AudioClip;
public var logo : GameObject;

private var labelText = "";
private var logoStartPos;
private var elapsedTime = 0.0;

function Start() {
	logoStartPos = logo.transform.position;
	logoStartPos.x = Screen.width * .5;
	logoStartPos.z = Screen.height * .5 - 100 + .5;
	if (Game.lives > 0 && Game.score == 0) {
		audio.PlayOneShot(introSound, 0.5);
		labelText = "BrickBreaker";
	} else if (Game.lives <= 0) {
		audio.PlayOneShot(loseSound, 0.5);
		labelText = "Game Over";
	} else {
		audio.PlayOneShot(winSound, 0.5);
		labelText = "You Win!";
	}
}

function OnGUI() {
	// Create the main label text
	var w = 1000;
	var h = 300;
	var rect = Rect((Screen.width-w)*.5, (Screen.height-h)*.5 - 100, w, h);
	GUI.color = Color(.5, .5, .5, 1);
	GUI.skin = guiSkin;
	GUI.Label(rect, labelText);
}

function Update() {
	// Make the logo float up and down
	logo.transform.position.y = logoStartPos.y + (Mathf.Sin(elapsedTime * 3.1415 * .5));
    elapsedTime += Time.deltaTime;
}
