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
			[ACHIEVEMENTEVENT.CHECK_ANSWER, ACHIEVEMENTEVENT.MOVE_CHANGED],
			ACHIEVEMENTTYPE.SPECIAL,
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

export { ZeroStepPassGame, GiveupRecord }
