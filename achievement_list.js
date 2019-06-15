import { ACHIEVEMENTEVENT, AchievementEntry } from './achievement.js';

/**
 * 在轉了第X次時發出通知
 */
class MoveTip extends AchievementEntry {
  /**
   * @param {App} app - App
   * @param {number} move - 要發出通知的轉動次數
   */
	constructor(app, move) {
		super(app, [ACHIEVEMENTEVENT.MOVE_CHANGED], `已經移動${move}步了！`);
		this.move = move;
	}

	eventListener(type, value) {
		if (type == ACHIEVEMENTEVENT.MOVE_CHANGED && value == this.move) {
			this.achieve();
		}
	}
}

/**
 * 在開始遊戲後的X秒內轉了Y次發出通知
 */
class QuickRotate extends AchievementEntry {
  /**
   * @param {App} app - App
   * @param {number} time - 在X秒內
   * @param {number} move - 轉動次數
   */
	constructor(app, time, move) {
		super(app, [ACHIEVEMENTEVENT.MOVE_CHANGED], `轉得非常快！你在${time}秒內轉了${move}次！`);
		this.time = time;
		this.move = move;
	}

	eventListener(type, value) {
		if (type == ACHIEVEMENTEVENT.MOVE_CHANGED && value == this.move && this.app.game.getTime() < this.time) {
			this.achieve();
		}
	}
}

/**
 * 在沒有轉動下連續按送出X次發出通知
 */
class ContinuousSubmit extends AchievementEntry {
  /**
   * @param {App} app - App
   * @param {number} limit - 連續點擊的次數
   */
	constructor(app, limit) {
		super(app, [ACHIEVEMENTEVENT.CHECK_ANSWER, ACHIEVEMENTEVENT.MOVE_CHANGED], `不要再按送出了！`);
		this.limit = limit;
		this.count = 0;
	}

	eventListener(type, value) {
		if (type == ACHIEVEMENTEVENT.MOVE_CHANGED) {
			this.count = 0;
		} else if (type == ACHIEVEMENTEVENT.CHECK_ANSWER) {
			if (value) {
				this.count = 0;
				return;
			}
			this.count++;
			if (this.count >= this.limit) {
				this.count = 0;
				this.achieve();
			}
		}
	}
}

export { MoveTip, QuickRotate, ContinuousSubmit }
