import { GameBrick } from './brick.js';
/**
 * 操控方塊遊戲本身
 */
class Game {
  /**
   * 初始化遊戲
   * @param {number} brickCount - 方塊數量
   */
  constructor(app) {
    this.app = app;

    let bricksNumber = [];
    for (let i = 1; i <= this.app.brickCount; i++) {
      const brick = {
        front: i,
        back: i,
        left: i,
        right: i,
        top: Math.floor(Math.random() * this.app.brickCount + 1),
        bottom: Math.floor(Math.random() * this.app.brickCount + 1),
      };
      bricksNumber.push(brick);
    }
    // 打亂同一側面
    ['front', 'back', 'left', 'right'].forEach((face) => {
      for (let bid = 0; bid < this.app.brickCount - 1; bid++) {
        const bid2 = Math.floor(Math.random() * (this.app.brickCount - bid) + bid);
        [bricksNumber[bid][face], bricksNumber[bid2][face]] =
          [bricksNumber[bid2][face], bricksNumber[bid][face]];
      }
    });

    /**
     * 初始化 Brick class
     * @todo 編號應該要統一
     */
    this.bricks = [];
    bricksNumber.forEach((brick, brickId) => {
      this.bricks.push(new GameBrick(this.app, {
        top: brick['top'] - 1,
        bottom: brick['bottom'] - 1,
        front: brick['front'] - 1,
        back: brick['back'] - 1,
        right: brick['right'] - 1,
        left: brick['left'] - 1,
      }));
    });

    // 打亂單個 brick
    let axis = [new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)];
    for (let brickId = 0; brickId < this.app.brickCount; brickId++) {
      for (let i = 0; i < 10; i++) {
        const dir = Math.floor(Math.random() * 3);
        const angle = Math.floor(Math.random() * 3 + 1);
        for (let j = 0; j < angle; j++) {
          switch (dir) {
            case 0:
              [
                this.bricks[brickId].facePattern.top,
                this.bricks[brickId].facePattern.left,
                this.bricks[brickId].facePattern.bottom,
                this.bricks[brickId].facePattern.right,
              ] =
                [
                  this.bricks[brickId].facePattern.right,
                  this.bricks[brickId].facePattern.top,
                  this.bricks[brickId].facePattern.left,
                  this.bricks[brickId].facePattern.bottom,
                ];
              break;
            case 1:
              [
                this.bricks[brickId].facePattern.top,
                this.bricks[brickId].facePattern.front,
                this.bricks[brickId].facePattern.bottom,
                this.bricks[brickId].facePattern.back,
              ] =
                [
                  this.bricks[brickId].facePattern.back,
                  this.bricks[brickId].facePattern.top,
                  this.bricks[brickId].facePattern.front,
                  this.bricks[brickId].facePattern.bottom,
                ];
              break;
            case 2:
              [
                this.bricks[brickId].facePattern.front,
                this.bricks[brickId].facePattern.right,
                this.bricks[brickId].facePattern.back,
                this.bricks[brickId].facePattern.left,
              ] =
                [
                  this.bricks[brickId].facePattern.left,
                  this.bricks[brickId].facePattern.front,
                  this.bricks[brickId].facePattern.right,
                  this.bricks[brickId].facePattern.back,
                ];
              break;
          }
          this.bricks[brickId].renderObject.rotateOnWorldAxis(axis[dir], Math.PI / 2);
        }
      }
      this.bricks[brickId].setOriginal()
    }

    this.app.displayer.setGameBricks(this.bricks);

    this.restart();
  }

  start() {
    this.isPause = false;
    this.lastStartTime = Date.now() / 1000;
  }

  pause() {
    this.isPause = true;
    this.timeCounter += (Date.now() / 1000 - this.lastStartTime);
  }

  getTime() {
    if (this.isPause) {
      return this.timeCounter;
    } else {
      return (Date.now() / 1000 - this.lastStartTime) + this.timeCounter;
    }
  }

  timePadding(n) {
    if (n < 10) {
      return '0' + n;
    }
    return n;
  }

  getTimeFormatted() {
    return Math.floor(this.getTime());
  }

  getStep() {
    return this.stepCounter;
  }

  getStepFormatted() {
    return this.getStep();
  }

  /**
   * 重新開始
   */
  restart() {
    this.app.displayer.setGameBricks(this.bricks);
    for (let bid = 0; bid < this.app.brickCount; bid++) {
      this.bricks[bid].facePattern = { ...this.bricks[bid].facePatternOriginal };
      this.bricks[bid].renderObject.quaternion.copy(this.bricks[bid].quaternionOriginal);
    }
    this.timeCounter = 0;
    this.stepCounter = 0;
    this.start();
  }

  /**
   * @return {boolean} - 是否通關
   */
  isResolve() {
    let result = true;
    ['front', 'back', 'left', 'right'].forEach((face) => {
      const temp = [];
      for (let bid = 0; bid < this.app.brickCount; bid++) {
        temp[this.bricks[bid].facePattern[face]] = 1;
      }
      let sum = 0;
      for (let bid = 0; bid < this.app.brickCount; bid++) {
        sum += temp[bid];
      }
      if (sum != this.app.brickCount) {
        result = false;
      }
    });
    return result;
  }

  /**
   * 取得單一方塊的答案
   * @param {number} brickId - 第幾個方塊
   */
  getSingleAnswer(brickId) {
    let answer = [];
    let quaternion = this.bricks[brickId].renderObject.quaternion.clone();
    let topVector = new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion).round();
    let axis = null, angle;
    if (topVector.equals(new THREE.Vector3(0, 0, 1))) {
      answer.push(['X', 1]);
      axis = new THREE.Vector3(1, 0, 0);
      angle = -Math.PI / 2;
    } else if (topVector.equals(new THREE.Vector3(0, -1, 0))) {
      answer.push(['X', 2]);
      axis = new THREE.Vector3(1, 0, 0);
      angle = -Math.PI / 2 * 2;
    } else if (topVector.equals(new THREE.Vector3(0, 0, -1))) {
      answer.push(['X', 3]);
      axis = new THREE.Vector3(1, 0, 0);
      angle = -Math.PI / 2 * 3;
    } else if (topVector.equals(new THREE.Vector3(1, 0, 0))) {
      answer.push(['Z', 1]);
      axis = new THREE.Vector3(0, 0, 1);
      angle = -Math.PI / 2 * 3;
    } else if (topVector.equals(new THREE.Vector3(-1, 0, 0))) {
      answer.push(['Z', 3]);
      axis = new THREE.Vector3(0, 0, 1);
      angle = -Math.PI / 2 * 3;
    }
    if (axis !== null) {
      quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, angle));
    }

    let rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion).round();
    if (rightVector.equals(new THREE.Vector3(0, 0, 1))) {
      answer.push(['Y', 1]);
    } else if (rightVector.equals(new THREE.Vector3(-1, 0, 0))) {
      answer.push(['Y', 2]);
    } else if (rightVector.equals(new THREE.Vector3(0, 0, -1))) {
      answer.push(['Y', 3]);
    }
    return answer;
  }

  /**
   * 取得所有方塊的答案
   */
  getAnswer() {
    let answer = [];
    for (let brickId = 0; brickId < this.app.brickCount; brickId++) {
      this.getSingleAnswer(brickId).forEach((ans, _) => {
        answer.push([brickId, ans[0], ans[1]]);
      });
    }
    return answer;
  }

  /**
   * 顯示提示
   */
  showTip(tip) {
    if (tip[1] == 'X') {
      this.bricks[tip[0]].showArrowX(tip[2]);
    } else if (tip[1] == 'Y') {
      this.bricks[tip[0]].showArrowY(tip[2]);
    } else if (tip[1] == 'Z') {
      this.bricks[tip[0]].showArrowZ(tip[2]);
    }
  }
}


export { Game };
