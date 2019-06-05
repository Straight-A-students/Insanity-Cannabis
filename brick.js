import { BRICKFACEKEYS } from './material.js';

const POSSIBLEQUATERNION = [];
for (let y = 0; y < 4; y++) {
  for (let z = 0; z < 4; z++) {
    POSSIBLEQUATERNION.push(
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, y * Math.PI / 2, z * Math.PI / 2, 'YZX')
      )
    );
  }
}
[1, -1].forEach(x => {
  for (let z = 0; z < 4; z++) {
    POSSIBLEQUATERNION.push(
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(x * Math.PI / 2, 0, z * Math.PI / 2, 'XZY')
      )
    );
  }
});

/**
 * 方塊
 */
class Brick {
  /**
   * 初始化方塊
   * @param {App} app
   * @param {number} brickId - 第幾個方塊，從0開始
   * @param {{top:number, bottom:number, left:number, right:number, front:number, back:number}} facePattern
   */
  constructor(app, facePattern) {
    let textures = app.materialManager.get(app.materialName)
      , geometry = new THREE.BoxGeometry(2, 2, 2)
      , material = BRICKFACEKEYS.map(k => 
        new THREE.MeshPhongMaterial({
          map: textures[facePattern[k]],
          transparent: true,
        }))
    this.app = app
    this.materialName = app.materialName
    this.facePattern = facePattern
    this.facePatternOriginal = { ...facePattern }
    this.renderObject = new THREE.Mesh(geometry, material)
    this.mouseStartX = 0
    this.mouseStartY = 0
    this.mouseLastX = 0
    this.mouseLastY = 0
    this.mouseDown = false
    this.disableMouse = false;
  }

  /**
   * 以 x 為軸，朝向 x- 順時針旋轉
   * @param {number} brickId - 第幾個 Brick
   * @param {number} angle - 旋轉了幾個90度，應為1~3
   */
  rotateX(angle) {
    if (!Number.isInteger(angle)) {
      throw Error('angle is not a integer');
    }

    angle = (angle % 4 + 4) % 4;

    for (let i = 0; i < angle; i++) {
      [
        this.facePattern.top,
        this.facePattern.left,
        this.facePattern.bottom,
        this.facePattern.right,
      ] =
        [
          this.facePattern.right,
          this.facePattern.top,
          this.facePattern.left,
          this.facePattern.bottom,
        ];
    }
  }

  /**
   * 以 y 為軸，朝向 y- 順時針旋轉
   * @param {number} brickId - 第幾個 Brick
   * @param {number} angle - 旋轉了幾個90度，應為1~3
   */
  rotateY(angle) {
    if (!Number.isInteger(angle)) {
      throw Error('angle is not a integer');
    }

    angle = (angle % 4 + 4) % 4;

    for (let i = 0; i < angle; i++) {
      [
        this.facePattern.top,
        this.facePattern.front,
        this.facePattern.bottom,
        this.facePattern.back,
      ] =
        [
          this.facePattern.back,
          this.facePattern.top,
          this.facePattern.front,
          this.facePattern.bottom,
        ];
    }
  }

  /**
   * 以 z 為軸，朝向 z- 順時針旋轉
   * @param {number} brickId - 第幾個 Brick
   * @param {number} angle - 旋轉了幾個90度，應為1~3
   */
  rotateZ(angle) {
    if (!Number.isInteger(angle)) {
      throw Error('angle is not a integer');
    }

    angle = (angle % 4 + 4) % 4;

    for (let i = 0; i < angle; i++) {
      [
        this.facePattern.front,
        this.facePattern.right,
        this.facePattern.back,
        this.facePattern.left,
      ] =
        [
          this.facePattern.left,
          this.facePattern.front,
          this.facePattern.right,
          this.facePattern.back,
        ];
    }
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {number} faceX
   * @param {number} faceY
   * @param {number} faceZ
   */
  mouseDownEvent(x, y, faceX, faceY, faceZ) {
    this.mouseStartX = x
    this.mouseStartY = y
    this.mouseLastX = x
    this.mouseLastY = y
    this.faceX = faceX
    this.faceY = faceY
    this.faceZ = faceZ
    this.face = new THREE.Vector3(faceX, faceY, faceZ)
    this.faceNormalVector = new THREE.Vector3(faceX, faceY, faceZ).applyQuaternion(this.renderObject.quaternion).round()
    this.startQuaternion = this.renderObject.quaternion.clone()
    this.mouseDown = true
    this.lockOnX = false
    this.lockOnY = false
    this.axisX = new THREE.Vector3(0, 1, 0)
    this.axisY = new THREE.Vector3(0, 1, 0).cross(this.faceNormalVector)
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   */
  mouseMoveEvent(x, y) {
    if (!this.mouseDown) {
      return
    }

    if (this.disableMouse) {
      return
    }

    // 暫時停用拖曳上下面
    if (this.faceNormalVector.equals(this.axisX) || this.faceNormalVector.clone().negate().equals(this.axisX)) {
      return
    }

    if (!this.lockOnX && !this.lockOnY) {
      if (Math.abs(x - this.mouseStartX) > 10) {
        this.lockOnX = true;
        this.rotaryAxis = this.axisX;
      } else if (Math.abs(y - this.mouseStartY) > 10) {
        this.lockOnY = true;
        this.rotaryAxis = this.axisY;
      }
    }

    let dx = x - this.mouseLastX
    let dy = y - this.mouseLastY
    if (this.lockOnX) {
      this.renderObject.rotateOnWorldAxis(this.axisX, Math.PI * dx / 150)
    }
    if (this.lockOnY) {
      this.renderObject.rotateOnWorldAxis(this.axisY, Math.PI * dy / 150)
    }
    this.mouseLastX = x
    this.mouseLastY = y
  }

  /**
   *
   */
  mouseUpEvent() {
    if (this.disableMouse) {
      return
    }

    this.mouseDown = false
    this.lockOnX = false
    this.lockOnY = false
    this.disableMouse = true

    let closestQuaternion = null;
    let minAngle = 999;

    POSSIBLEQUATERNION.forEach(quaternion => {
      let angle = this.renderObject.quaternion.angleTo(quaternion);
      if (angle < minAngle) {
        minAngle = angle;
        closestQuaternion = quaternion;
      }
    });

    var intX = setInterval(() => {
      let prevQuaternion = this.renderObject.quaternion.clone();
      this.renderObject.quaternion.rotateTowards(closestQuaternion, Math.PI / 10);
      if (this.renderObject.quaternion.equals(prevQuaternion)) {
        clearInterval(intX)
        this.disableMouse = false
      }
    }, 25);

    let angle = Math.round(closestQuaternion.angleTo(this.startQuaternion) / Math.PI * 180 / 90);

    if (angle == 0) {
      return;
    }

    let newFaceNormalVector = new THREE.Vector3(this.faceX, this.faceY, this.faceZ).applyQuaternion(this.renderObject.quaternion).round();
    let rotaryAxisCross = this.faceNormalVector.clone().cross(newFaceNormalVector);

    if (this.rotaryAxis.equals(new THREE.Vector3(0, 0, -1)) || this.rotaryAxis.equals(new THREE.Vector3(0, 0, 1))) {
      if (this.rotaryAxis.equals(new THREE.Vector3(0, 0, 1))) {
        angle = 4 - angle;
      }
      if (this.rotaryAxis.equals(rotaryAxisCross)) {
        angle = 4 - angle;
      }
      this.rotateX(angle);
      return;
    }

    if (this.rotaryAxis.equals(new THREE.Vector3(1, 0, 0)) || this.rotaryAxis.equals(new THREE.Vector3(-1, 0, 0))) {
      if (this.rotaryAxis.equals(new THREE.Vector3(-1, 0, 0))) {
        angle = 4 - angle;
      }
      if (this.rotaryAxis.clone().negate().equals(rotaryAxisCross)) {
        angle = 4 - angle;
      }
      this.rotateY(angle);
      return;
    }

    if (this.rotaryAxis.equals(new THREE.Vector3(0, 1, 0)) || this.rotaryAxis.equals(new THREE.Vector3(0, -1, 0))) {
      if (this.rotaryAxis.equals(new THREE.Vector3(0, -1, 0))) {
        angle = 4 - angle;
      }
      if (this.rotaryAxis.clone().negate().equals(rotaryAxisCross)) {
        angle = 4 - angle;
      }
      this.rotateZ(angle);
      return;
    }
  }
}

class GameBrick extends Brick {
  /**
   * 初始化遊戲方塊
   * @param {App} app
   * @param {!string} materialName - 材質名稱
   * @param {{top:number, bottom:number, left:number, right:number, front:number, back:number}} facePattern
   */
  constructor(app, facePattern) {
    super(app, facePattern)
  }

  rotateX(angle) {
    super.rotateX(angle)
    this.app.draw()
    this.app.game.stepCounter++;
    this.app.updateMove();
  }

  rotateY(angle) {
    super.rotateY(angle)
    this.app.draw()
    this.app.game.stepCounter++;
    this.app.updateMove();
  }

  rotateZ(angle) {
    super.rotateZ(angle)
    this.app.draw()
    this.app.game.stepCounter++;
    this.app.updateMove();
  }
}

class SelectorBrick extends Brick {
  /**
   * 初始化樣式選擇方塊
   * @param {App} app
   * @param {!string} materialName - 材質名稱
   * @param {{top:number, bottom:number, left:number, right:number, front:number, back:number}} facePattern
   */
  constructor(app, facePattern, materialName) {
    [ app.materialName, materialName ] = [ materialName, app.materialName ]
    super(app, facePattern);
    [ app.materialName, materialName ] = [ materialName, app.materialName ]
  }

  mouseUpEvent() {
    super.mouseUpEvent()
    this.app.materialName = this.materialName
    this.app.storeData()
  }
}

export { GameBrick, SelectorBrick }
