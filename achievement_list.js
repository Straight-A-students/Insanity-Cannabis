import { ACHIEVEMENTEVENT, AchievementEntry } from './achievement.js';

/**
 * 零步通關
 */
class ZeroStepPassGame extends AchievementEntry {
  /**
   * @param {App} app - App
   * @param {number} time - 在X秒內
   * @param {number} move - 轉動次數
   */
	constructor(app, id) {
		super(
			app,
			id,
			[ACHIEVEMENTEVENT.CHECK_ANSWER, ACHIEVEMENTEVENT.MOVE_CHANGED],
			0,
			'千載難逢',
			'成就通知',
			`千載難逢─沒有任何移動就通關`,
			true,
		);
		this.move = 0;
	}

	eventListener(type, value) {
		if (this.unlocked) { // trigger only once
			return;
		}
		if (type == ACHIEVEMENTEVENT.MOVE_CHANGED) {
			this.count++;
		} else if (type == ACHIEVEMENTEVENT.CHECK_ANSWER) {
			if (value) {
				this.achieve();
			}
		}
	}
}

export { ZeroStepPassGame }
