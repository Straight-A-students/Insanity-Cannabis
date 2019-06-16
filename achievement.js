const ACHIEVEMENTEVENT = {
  MOVE_CHANGED: 1,
  ROTATE_BRICK: 2,
  CHECK_ANSWER: 3,
}

const ACHIEVEMENTTYPE = {
  NORMAL: 0,
  SPECIAL: 1,
  HIDDEN: 2,
}

/**
 * 成就管理器
 */
class AchievementManager {
  constructor() {
    this.listeners = {};
    for (let event in ACHIEVEMENTEVENT) {
      this.listeners[ACHIEVEMENTEVENT[event]] = [];
    }
    this.list = [];
  }

  addAchievement(achievementEntry) {
    achievementEntry.event.forEach(event => {
      this.listeners[event].push(achievementEntry);
    });
    this.list.push(achievementEntry);
  }

  triggerEvent(event, value) {
    this.listeners[event].forEach(achievementEntry => {
      achievementEntry.eventListener(event, value);
    });
  }
}

/**
 * 成就項目
 */
class AchievementEntry {
  /**
   * 初始化成就
   * @param {App} app - App
   * @param {string} id - ID
   * @param {string[]} event - 監聽事件
   * @param {string} name - 名稱，顯示於成就頁
   * @param {string} achieveTitle - 達成成就後的通知標題
   * @param {string} achieveMessage - 達成成就後的通知訊息
   */
  constructor(app, id, event, type, name, achieveTitle, achieveMessage, ticket) {
    this.app = app;
    this.id = id;
    this.event = event;
    this.type = type;
    this.name = name;
    this.achieveTitle = achieveTitle;
    this.achieveMessage = achieveMessage;
    this.ticket = ticket;
    this.unlocked = app.unlockedAchievement.has(id);
  }

  eventListener(type, value) {
    throw Error('Not implemented');
  }

  achieve() {
    this.app.showAchievement(this.achieveTitle, this.achieveMessage);
    this.unlocked = true;
    this.app.unlockedAchievement.add(this.id);
    if (this.ticket) {
      this.app.unlockRandomBrick();
    }
    this.app.storeData();
  }
}

export { AchievementManager, AchievementEntry, ACHIEVEMENTEVENT, ACHIEVEMENTTYPE }
