const SKIP_ELEM_IDS = new Set([ 'pauseBackgroundPage', 'pause', 'tip', 'submit', 'timemoveblock' ])

/**
 * 顯示方塊
 */
class Displayer {
  /**
   * 初始化
   * @param {*} appElem
   */
  constructor(appElem) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera( 50, 0, 0.1, 1000 )
    this.pointLight = new THREE.PointLight(0xffffff, 1.2)
    this.cameraInfo = {
      r: 18,
      theta: 1/4,
      phi: 1/4,
      displayer: this,
      deltaXY (dx, dy) {
        let { displayer: { displayType } } = this
        this.theta += (dy / 500) * (displayType == Displayer.GAMMING || displayType == Displayer.SELECTING ? 1 : -1)
        this.phi += (dx / 500) * (displayType == Displayer.GAMMING || displayType == Displayer.SELECTING ? 1 : -1)
        if (this.theta > .4)
          this.theta = .4
        else if (this.theta < -.4)
          this.theta = -.4
        if (this.phi > 2)
          this.phi -= 2
        else if (this.phi < -2)
          this.phi += 2
      }
    }
    this.mouseInfo = {
      lastX: 0,
      lastY: 0,
      mouseDown: false,
      touchId: -1,
      interObject: null,
    }
    this.displayType = Displayer.BACKGROUND
    this.rayCaster = new THREE.Raycaster()
    this.mouseVector = new THREE.Vector2(-1, -1)
    this.gameBricks = []
    this.selectorBricks = []
    this.gameGroup = new THREE.Group()
    this.selectorGroup = new THREE.Group()
    this.selectorBrickStartY = 0
    this.appWidth = 0
    this.appHeight = 0
    this.appElem = appElem
    this.domElement = this.renderer.domElement
    appElem && this.appElem.appendChild(this.domElement)
    this.camera.position.set(4, 4, 4)
    this.camera.lookAt(0, 0, 0)
    this.pointLight.position.setFromMatrixPosition(this.camera.matrix)
    this.scene.add(this.pointLight)
    this.scene.add(this.gameGroup)
    this.scene.add(this.selectorGroup)
    this.calcCamera()
    appElem && this.resize()
    window.addEventListener('resize', () => this.resize())
    window.addEventListener('mousedown', e => this.mouseDownEvent(e))
    window.addEventListener('mousemove', e => this.mouseMoveEvent(e))
    window.addEventListener('mouseup', e => this.mouseUpEvent(e))
    window.addEventListener('touchstart', e => this.mouseDownEvent(e))
    window.addEventListener('touchmove', e => this.mouseMoveEvent(e))
    window.addEventListener('touchend', e => this.mouseUpEvent(e))
    window.addEventListener('wheel', e => this.wheelEvent(e))
    setInterval(() =>
      this.renderer.render(this.scene, this.camera), 33)
  }

  /**
   *
   * @param {number} displayType
   */
  display(displayType) {
    let { gameGroup, selectorGroup } = this
    this.displayType = displayType
    gameGroup.visible = (displayType == Displayer.GAMMING)
    selectorGroup.visible = (displayType == Displayer.SELECTING)
  }

  /**
   *
   * @param {number} width
   * @param {number} height
   */
  resize(width, height) {
    let { appElem, renderer, camera } = this
    if (! appElem) 
      return

    if (width == null || height == null) {
      let b = appElem.getBoundingClientRect()
      width = b.width
      height = b.height
    }

    this.appWidth = width
    this.appHeight = height
    renderer.setSize(width, height, true)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  /**
   *
   */
  calcCamera() {
    let { camera, cameraInfo, pointLight } = this
      , { r, theta, phi } = cameraInfo
    let _ = r * Math.cos(theta * Math.PI)
      , x = _ * Math.cos(phi * Math.PI)
      , y = r * Math.sin(theta * Math.PI)
      , z = _ * Math.sin(phi * Math.PI)
    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0)
    pointLight.position.setFromMatrixPosition(camera.matrix)
  }

  /**
   *
   * @param {Brick[]} bricks
   */
  setGameBricks(bricks) {
    let gameBricks = Array.from(bricks)
      , { gameGroup } = this
      , startY = bricks.length / 2 * 3 - 1.5
    this.gameBricks = gameBricks
    gameGroup.children.length = 0
    for (let { renderObject, arrowX, arrowY, arrowZ } of bricks) {
      gameGroup.add(renderObject)
      gameGroup.add(arrowX)
      gameGroup.add(arrowY)
      gameGroup.add(arrowZ)
      renderObject.position.y = startY
      arrowX.position.y = startY
      arrowY.position.y = startY
      arrowZ.position.y = startY
      startY -= 3
    }

  }

  /**
   *
   * @param {Brick[]} bricks
   */
  setBrickSelectors(bricks) {
    let selectorBricks = Array.from(bricks)
      , startY = Math.floor(bricks.length / 5) / 2 * 3 - 1.5
      , k = 0
    this.selectorBrickStartY = startY
    this.selectorBricks = selectorBricks
    this.selectorGroup.children = bricks.map(b => 
      b.renderObject)
    for (let i = 0, l = bricks.length; i < l; i += 5) {
      let r = Math.min(l - i, 5)
        , startX = r / 2 * 3 - 1.5
      for (let j = 0; j < r; j++) {
        Object.assign(bricks[k++].renderObject.position, {
          x: startX,
          y: startY,
        })

        startX -= 3
      }

      startY -= 3
    }
  }

  /**
   *
   * @param {Event} e
   */
  mouseDownEvent(e) {
    let { mouseInfo } = this
    if (e.path.some(e => SKIP_ELEM_IDS.has(e.id)) || mouseInfo.mouseDown)
      return

    if (e.type == 'touchstart') {
      e = e.changedTouches[0]
      mouseInfo.touchId = e.identifier
    } else {
      e.preventDefault()
    }

    mouseInfo.lastX = e.clientX
    mouseInfo.lastY = e.clientY
    mouseInfo.mouseDown = true
    let [ brick, normal ] = this.calcMouseRay(e)
    mouseInfo.interObject = brick
    if (brick) {
      let { x, y, z } = normal
      brick.mouseDownEvent(e.clientX, e.clientY, x, y, z)
    }
  }

  /**
   *
   * @param {Event} e
   */
  mouseMoveEvent(e) {
    let { mouseInfo, cameraInfo } = this
    if (! mouseInfo.mouseDown)
      return

    if (e.type == 'touchmove') {
      e = e.touches[0]
      if (e.identifier != mouseInfo.touchId) 
        return
    }

    let dx = e.clientX - mouseInfo.lastX
    let dy = e.clientY - mouseInfo.lastY
    mouseInfo.lastX = e.clientX
    mouseInfo.lastY = e.clientY
    if (mouseInfo.interObject) {
      mouseInfo.interObject.mouseMoveEvent(e.clientX, e.clientY)
    } else {
      cameraInfo.deltaXY(dx, dy)
      this.calcCamera()
    }
  }

  /**
   *
   * @param {Event} e
   */
  mouseUpEvent(e) {
    let { mouseInfo } = this
      , { interObject } = mouseInfo
    if (e.type == 'touchend') {
      e = e.changedTouches[0]
      if (e.identifier != mouseInfo.touchId) 
        return
    }

    if (interObject)
      interObject.mouseUpEvent()

    mouseInfo.mouseDown = false
    mouseInfo.interObject = null
  }

  /**
   *
   * @param {Event} e
   */
  wheelEvent(e) {
    let { cameraInfo } = this
    cameraInfo.r -= e.wheelDeltaY / 150
    if (cameraInfo.r < 2)
      cameraInfo.r = 2
    else if (cameraInfo.r > 100)
      cameraInfo.r = 100
    this.calcCamera()
  }

  /**
   *
   * @param {Event} e
   */
  calcMouseRay(e) {
    let { displayType, mouseVector, appWidth, appHeight, rayCaster, camera, gameBricks, selectorBricks, appElem } = this
      , relativePoint, appBound, bricks, id2obj = {}, intersects, brick, faceNorm
    appBound = appElem.getBoundingClientRect()
    relativePoint = {
      x: e.clientX - appBound.x,
      y: e.clientY - appBound.y,
    }
    mouseVector.x = ( relativePoint.x / appWidth ) * 2 - 1
    mouseVector.y = - ( relativePoint.y / appHeight ) * 2 + 1
    rayCaster.setFromCamera(mouseVector, camera)
    switch (displayType) {
      case Displayer.BACKGROUND:
        return []
      case Displayer.GAMMING:
        bricks = gameBricks
        break
      case Displayer.SELECTING:
        bricks = selectorBricks
        break
    }

    bricks.forEach(b =>
      id2obj[b.renderObject.uuid] = b)
    intersects = rayCaster.intersectObjects(bricks.map(b =>
      b.renderObject))
    if (intersects.length == 0)
      return []

    brick = id2obj[intersects[0].object.uuid]
    faceNorm = intersects[0].face.normal

    // highlight intersected face?
    // for (let m of brick.renderObject.material)
    //   m.color.set(true ? 0xff0000 : 0xffffff)

    return [ brick, faceNorm ]
  }
}

class Displayer4BrickStyle extends Displayer {
  constructor (appElem) {
    super(appElem)
    this.cameraInfo.deltaXY = function (dx, dy) {
      let { displayer: { displayType } } = this
      this.theta += (dy / 25)
      this.phi += (dx / 500) * (displayType == Displayer.GAMMING || displayType == Displayer.SELECTING ? 1 : -1)
      if (this.theta > 222)
        this.theta = 222
      else if (this.theta < -222)
        this.theta = -222
      if (this.phi > 2)
        this.phi -= 2
      else if (this.phi < -2)
        this.phi += 2
    }
  }

  applyContainer(appElem) {
    appElem.appendChild(this.renderer.domElement)
    this.appElem = appElem
    this.resize()
  }

  mouseDownEvent(e) {
    if (e.path[0] != this.domElement) 
      return
    else 
      super.mouseDownEvent(e)
  }

  wheelEvent(e) {
    if (this.mouseInfo.mouseDown) {
      super.wheelEvent(e)
    } else {
      this.cameraInfo.theta += e.wheelDeltaY / 50
      this.calcCamera()
    }
  }

  calcCamera() {
    let { camera, cameraInfo, pointLight } = this
      , { r, theta, phi } = cameraInfo
    let _ = r
      , x = _ * Math.cos(phi * Math.PI)
      , y = theta
      , z = _ * Math.sin(phi * Math.PI)
    camera.position.set(x, y, z)
    this.camera.lookAt(0, this.camera.position.y, 0)
    pointLight.position.setFromMatrixPosition(camera.matrix)
  }
}

Displayer.BACKGROUND = 0
Displayer.GAMMING = 1
Displayer.SELECTING = 2

export {Displayer,Displayer4BrickStyle};
