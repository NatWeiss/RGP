///
/// > Created using [RapidGame](http://wizardfu.com/rapidgame). See the `LICENSE` file for the license governing this code.
///

#pragma once

#include "AppDelegate.h"

namespace Game
{
	/// Get the scale of one pixel.
	float getPixelScale();
	
	/// Set the scale for one pixel.
	void setPixelScale(float scale);
	
	/// Centralize and scale the given position.
	Vec2 centralize(const Vec2& position);
	Vec2 centralize(float x, float y);
};