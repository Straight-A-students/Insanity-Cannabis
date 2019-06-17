import { BRICKFACEKEYS } from './material.js';
import { ACHIEVEMENTEVENT } from './achievement.js';

const ARROW_INTERVAL = 50; // 箭頭刷新間隔 = 影格時長
const ARROW_FRAMES = 20; // 箭頭轉一圈的影格數

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
    let geometry = new THREE.BoxGeometry(2, 2, 2)
    this.app = app
    this.materialName = app.materialName
    this.facePattern = facePattern
    this.facePatternInitial = { ...facePattern }
    this.renderObject = new THREE.Mesh(geometry, null)
    this.setMaterial(app.materialName, facePattern)
    this.mouseStartX = 0
    this.mouseStartY = 0
    this.mouseLastX = 0
    this.mouseLastY = 0
    this.disableMouse = false;

    this.disableTip = false;
    this.arrowX = this.createArrow();
    this.arrowX.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
    this.arrowY = this.createArrow();
    this.arrowY.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    this.arrowY.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
    this.arrowZ = this.createArrow();
  }

  createArrow() {
    let group = new THREE.Group();
    const radius = 2;
    const angle1 = 70;
    const width1 = 1;
    const width2 = 2;

    let material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });

    let curve, points, geometry, mesh, temp;

    curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, angle1 / 180 * Math.PI, false, 0);
    points = curve.getPoints(50);
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    mesh = new THREE.Line(geometry, material);
    mesh.position.z = -width1;
    group.add(mesh);

    curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, angle1 / 180 * Math.PI, false, 0);
    points = curve.getPoints(50);
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    mesh = new THREE.Line(geometry, material);
    mesh.position.z = width1;
    group.add(mesh);

    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(radius, 0, -width1));
    geometry.vertices.push(new THREE.Vector3(radius, 0, width1));
    mesh = new THREE.Line(geometry, material);
    group.add(mesh);

    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(radius * Math.cos(angle1 / 180 * Math.PI), radius * Math.sin(angle1 / 180 * Math.PI), -width1));
    geometry.vertices.push(new THREE.Vector3(radius * Math.cos(angle1 / 180 * Math.PI), radius * Math.sin(angle1 / 180 * Math.PI), -width2));
    mesh = new THREE.Line(geometry, material);
    group.add(mesh);

    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(radius * Math.cos(angle1 / 180 * Math.PI), radius * Math.sin(angle1 / 180 * Math.PI), width1));
    geometry.vertices.push(new THREE.Vector3(radius * Math.cos(angle1 / 180 * Math.PI), radius * Math.sin(angle1 / 180 * Math.PI), width2));
    mesh = new THREE.Line(geometry, material);
    group.add(mesh);

    temp = [];
    for (let ang = angle1; ang <= 90; ang++) {
      temp.push(new THREE.Vector3(
        radius * Math.cos(ang / 180 * Math.PI),
        radius * Math.sin(ang / 180 * Math.PI),
        width2 * (90 - ang) / (90 - angle1)
      ));
    }
    curve = new THREE.CatmullRomCurve3(temp);
    points = curve.getPoints(50);
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    mesh = new THREE.Line(geometry, material);
    group.add(mesh);

    temp = [];
    for (let ang = angle1; ang <= 90; ang++) {
      temp.push(new THREE.Vector3(
        radius * Math.cos(ang / 180 * Math.PI),
        radius * Math.sin(ang / 180 * Math.PI),
        -width2 * (90 - ang) / (90 - angle1)
      ));
    }
    curve = new THREE.CatmullRomCurve3(temp);
    points = curve.getPoints(50);
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    mesh = new THREE.Line(geometry, material);
    group.add(mesh);

    group.visible = false;

    return group;
  }

  /**
   * 顯示X方向提示箭頭
   */
  showArrowX(angle) {
    if (this.disableTip) {
      return;
    }

    this.disableTip = true;
    this.arrowX.visible = true;
    let count = angle * ARROW_FRAMES;
    var int = setInterval(() => {
      this.arrowX.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI * 2 / ARROW_FRAMES);
      count--;
      if (count <= 0) {
        clearInterval(int);
        this.arrowX.visible = false;
        this.disableTip = false;
      }
    }, ARROW_INTERVAL);
  }

  /**
   * 顯示Y方向提示箭頭
   */
  showArrowY(angle) {
    if (this.disableTip) {
      return;
    }

    this.disableTip = true;
    this.arrowY.visible = true;
    let count = angle * ARROW_FRAMES;
    var int = setInterval(() => {
      this.arrowY.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI * 2 / ARROW_FRAMES);
      count--;
      if (count <= 0) {
        clearInterval(int);
        this.arrowY.visible = false;
        this.disableTip = false;
      }
    }, ARROW_INTERVAL);
  }

  /**
   * 顯示Z方向提示箭頭
   */
  showArrowZ(angle) {
    if (this.disableTip) {
      return;
    }

    this.disableTip = true;
    this.arrowZ.visible = true;
    let count = angle * ARROW_FRAMES;
    var int = setInterval(() => {
      this.arrowZ.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), Math.PI * 2 / ARROW_FRAMES);
      count--;
      if (count <= 0) {
        clearInterval(int);
        this.arrowZ.visible = false;
        this.disableTip = false;
      }
    }, ARROW_INTERVAL);
  }

  /**
   * 設定初始狀態facePattern及quaternion
   */
  setOriginal() {
    this.facePatternOriginal = { ...this.facePattern }
    this.quaternionOriginal = this.renderObject.quaternion.clone()
  }

  setMaterial(materialName = 'nope', facePattern) {
    if (!facePattern) {
      facePattern = {}
      for (let k of BRICKFACEKEYS)
        facePattern[k] = 0
    }

    this.materialName = materialName
    let textures = this.app.materialManager.get(materialName)
      , material = BRICKFACEKEYS.map(k =>
        new THREE.MeshPhongMaterial({
          map: textures[facePattern[k]],
          transparent: true,
        }))
    this.renderObject.material = material
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
    if (this.disableMouse || this.app.displayer.processingAnimate) {
      return
    }

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
    if (this.disableMouse || this.app.displayer.processingAnimate) {
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
    if (this.disableMouse || this.app.displayer.processingAnimate) {
      return
    }

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

  /**
   * 匯出資料
   */
  dumps() {
    return {
      facePattern: this.facePattern,
      facePatternInitial: this.facePatternInitial,
      facePatternOriginal: this.facePatternOriginal,
      quaternion: this.renderObject.quaternion.toArray(),
      quaternionOriginal: this.quaternionOriginal.toArray(),
    };
  }

  /**
   * 匯入資料
   * @param {Object} data - 資料
   */
  loads(data) {
    this.facePattern = { ...data.facePattern };
    this.facePatternInitial = { ...data.facePatternInitial };
    this.facePatternOriginal = { ...data.facePatternOriginal };
    this.renderObject.quaternion.fromArray(data.quaternion);
    this.quaternionOriginal = new THREE.Quaternion().fromArray(data.quaternionOriginal);
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
    this.app.game.stepCounter++;
    this.app.updateMove();
    this.app.achievementManager.triggerEvent(ACHIEVEMENTEVENT.MOVE_CHANGED, this.app.game.getStep());
  }

  rotateY(angle) {
    super.rotateY(angle)
    this.app.game.stepCounter++;
    this.app.updateMove();
    this.app.achievementManager.triggerEvent(ACHIEVEMENTEVENT.MOVE_CHANGED, this.app.game.getStep());
  }

  rotateZ(angle) {
    super.rotateZ(angle)
    this.app.game.stepCounter++;
    this.app.updateMove();
    this.app.achievementManager.triggerEvent(ACHIEVEMENTEVENT.MOVE_CHANGED, this.app.game.getStep());
  }
}

class SelectorBrick extends Brick {
  /**
   * 初始化樣式選擇方塊
   * @param {App} app
   * @param {!string} materialName - 材質名稱
   * @param {{top:number, bottom:number, left:number, right:number, front:number, back:number}} facePattern
   */
  constructor(app, materialName) {
    super(app, SelectorBrick.facePattern)
    this.label = materialName
    this.unlocked = false
    this.disable()
  }

  enable() {
    this.unlocked = true
    this.setMaterial(this.label, SelectorBrick.facePattern)
  }

  disable() {
    this.unlocked = false
    this.setMaterial('nope')
  }

  mouseUpEvent() {
    super.mouseUpEvent()
    if (!this.unlocked) {
      return
    }

    this.app.materialName = this.label
    this.app.storeData()
  }
}

SelectorBrick.facePattern = { top: 0, bottom: 1, front: 2, back: 3, right: 4, left: 5 }

export { GameBrick, SelectorBrick }
