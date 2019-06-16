import { ACHIEVEMENTEVENT, ACHIEVEMENTTYPE, AchievementEntry } from './achievement.js';

/**
 * 零步通關
 */
class ZeroStepPassGame extends AchievementEntry {
  /**
   * @param {App} app - App
   * @param {number} id - ID
   */
	constructor(app, id) {
		super(
			app,
			id,
			[
				ACHIEVEMENTEVENT.CHECK_ANSWER,
				ACHIEVEMENTEVENT.MOVE_CHANGED,
				ACHIEVEMENTEVENT.RESTART_GAME,
				ACHIEVEMENTEVENT.GIVEUP
			],
			ACHIEVEMENTTYPE.SPECIAL,
			'千載難逢',
			'成就通知',
			`千載難逢─沒有任何移動就通關`,
			true,
		);
		this.data = {
			move: 0,
		};
	}

	eventListener(type, value) {
		if (this.unlocked) { // trigger only once
			return;
		}
		if (type == ACHIEVEMENTEVENT.MOVE_CHANGED) {
			this.data.move++;
		} else if (type == ACHIEVEMENTEVENT.CHECK_ANSWER) {
			if (value) {
				if (this.data.move == 0) {
					this.achieve();
				}
				this.data.move = 0;
			}
		} else if ([ACHIEVEMENTEVENT.RESTART_GAME, ACHIEVEMENTEVENT.GIVEUP].includes(type)) {
			this.data.move = 0;
		}
	}
}

/**
 * 前功盡棄
 */
class GiveupRecord extends AchievementEntry {
  /**
   * @param {App} app - App
   * @param {number} id - ID
   * @param {number} name_suffix - 名稱後綴
   * @param {number} target - 放棄次數
   */
	constructor(app, id, name_suffix, target) {
		super(
			app,
			id,
			[ACHIEVEMENTEVENT.MOVE_CHANGED, ACHIEVEMENTEVENT.RESTART_GAME, ACHIEVEMENTEVENT.GIVEUP],
			ACHIEVEMENTTYPE.HIDDEN,
			`前功盡棄-${name_suffix}`,
			'成就通知',
			`前功盡棄─放棄遊戲${target}次`,
			true,
		);
		this.target = target;
		this.data = {
			is_move: false,
			giveup_count: 0,
		};
	}

	eventListener(type, value) {
		if (this.unlocked) { // trigger only once
			return;
		}
		if (type == ACHIEVEMENTEVENT.MOVE_CHANGED) {
			this.data.is_move = true;
		} else if ([ACHIEVEMENTEVENT.RESTART_GAME, ACHIEVEMENTEVENT.GIVEUP].includes(type)) {
			if (this.data.is_move) {
				this.data.giveup_count++;
				this.data.is_move = false;
				if (this.data.giveup_count == this.target) {
					this.achieve();
				}
			}
		}
	}
}

/**
* 在沒有轉動下連續按送出X次發出通知
*/
class ContinuousSubmit extends AchievementEntry {
  /**
   * @param {App} app - App
   * @param {number} target - 連續點擊的次數
   */
	constructor(app, id, target) {
		super(
			app,
			id,
			[
				ACHIEVEMENTEVENT.CHECK_ANSWER,
				ACHIEVEMENTEVENT.MOVE_CHANGED,
				ACHIEVEMENTEVENT.RESTART_GAME,
				ACHIEVEMENTEVENT.GIVEUP
			],
			ACHIEVEMENTTYPE.HIDDEN,
			`躍躍欲試`,
			'成就通知',
			`躍躍欲試─連續送出答案${target}次`,
			true,
		);
		this.target = target;
		this.data = {
			count: 0,
		};
	}

	eventListener(type, value) {
		if (this.unlocked) { // trigger only once
			return;
		}
		if ([ACHIEVEMENTEVENT.MOVE_CHANGED, ACHIEVEMENTEVENT.RESTART_GAME, ACHIEVEMENTEVENT.GIVEUP].includes(type)) {
			this.data.count = 0;
		} else if (type == ACHIEVEMENTEVENT.CHECK_ANSWER) {
			if (value) {
				this.data.count = 0;
				return;
			}
			this.data.count++;
			if (this.data.count == this.target) {
				this.data.count = 0;
				this.achieve();
			}
		}
	}
}

/**
 * 欲罷不能
 */
class PassGameRecord extends AchievementEntry {
  /**
   * @param {App} app - App
   * @param {number} id - ID
   * @param {number} name_suffix - 名稱後綴
   * @param {number} target - 放棄次數
   */
	constructor(app, id, name_suffix, target) {
		super(
			app,
			id,
			[ACHIEVEMENTEVENT.CHECK_ANSWER],
			ACHIEVEMENTTYPE.NORMAL,
			`欲罷不能-${name_suffix}`,
			'成就通知',
			`欲罷不能─通關${target}次`,
			true,
		);
		this.target = target;
		this.data = {
			pass_count: 0,
		};
	}

	eventListener(type, value) {
		if (this.unlocked) { // trigger only once
			return;
		}
		if (type == ACHIEVEMENTEVENT.CHECK_ANSWER && value) {
			this.data.pass_count++;
			if (this.data.pass_count == this.target) {
				this.achieve();
			}
		}
	}
}

/**
* 在X秒內通關
*/
class QuickPass extends AchievementEntry {
  /**
   * @param {App} app - App
   * @param {number} id - ID
   * @param {number} name_suffix - 名稱後綴
   * @param {number} time - 在X秒內
   */
	constructor(app, id, name_suffix, time) {
		super(
			app,
			id,
			[
				ACHIEVEMENTEVENT.CHECK_ANSWER,
			],
			ACHIEVEMENTTYPE.NORMAL,
			`慧心巧手-${name_suffix}`,
			'成就通知',
			`慧心巧手─在${time}秒內通關`,
			true,
		);
		this.time = time;
	}

	eventListener(type, value) {
		if (this.unlocked) { // trigger only once
			return;
		}
		if (type == ACHIEVEMENTEVENT.CHECK_ANSWER && value && this.app.game.getTime() < this.time) {
			this.achieve();
		}
	}
}

export {
	ZeroStepPassGame,
	GiveupRecord,
	ContinuousSubmit,
	PassGameRecord,
	QuickPass,
}
