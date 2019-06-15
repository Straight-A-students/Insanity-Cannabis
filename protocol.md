# <center> DEPRECATED, CODE ANYWAY </center>

# <center> Const </center>

# <center> Class </center>
### MaterialEntry
#### MaterialEntry(materialName, fileNames)
  + String    materialName
  + Array     fileNames[String]

### AchievementEntry
#### new AchievementEntry(type, description, gifts, unlocked, hasGift)
  + Number    type
    0. 一般
    1. 特殊
    2. 隱藏
  + String    description
  + Number    gifts
    0. 兌換券
    n. 第n方塊
  + Boolean   unlocked
  + Boolean   hasGift

### Displayer
#### new Displayer(appElem)
  + Object    renderer
  + Object    scene
  + Object    camera
  + Object    pointLight
  + Object    cameraInfo
  + Object    mouseInfo
  + Number    displayType
  + Object    rayCaster
  + Array     gameBricks[Brick]
  + Array     selectorBricks[Brick]
  + Object    gameGroup
  + Object    selectorGroup
  + Object    mouseVector
  + Number    appWidth
  + Number    appHeight
  + Object    appElem
  + Function  display(displayType)
    0. just Background
    1. gaming bricks
    2. select bricks
  + Function  resize(width, height)
  + Function  calcCamera()
  + Function  setGameBricks(bricks)
    + Array   bricks[Brick]
  + Function  setBrickSelectors(bricks)
    + Array   bricks[Brick]

  <!-- mouse events -->
  + Function  mouseDownEvent(e)
  + Function  mouseMoveEvent(e)
  + Function  mouseUpEvent(e)
  + Function  wheelEvent(e)
  + Function  calcMouseRay(e)

### Brick
#### new Brick(app, facePattern)
  + App       app
  + Object    facePattern
    + get top,bottom,left,right,front,back [faceId: 0-5]
  + Object    renderObject
  + Number    mouseStartX
  + Number    mouseStartY
  + Number    mouseLastX
  + Number    mouseLastY
  + Boolean   mouseDown
  + Boolean   disableMouse
  + Function  rotateX()
  + Function  rotateY()
  + Function  rotateZ()
  + Object    orientation
    + get x,y,z [0,1,2,3]
  + Function  updateFacePattern()

  <!-- mouse events  -->
  + Function  mouseDownEvent(x, y, faceX, faceY, faceZ)
  + Function  mouseMoveEvent(x, y)
  + Function  mouseUpEvent()

### GameBrick
#### new GameBrick(app, facePattern)
  + ...Brick

### SelectorBrick
#### new SelectorBrick(app, facePattern)
  + ...Brick

### Game
#### new Game(app)
  + App          app
  + GameBrick[]  bricks[]
  + Number       timeCounter
  + Number       stepCounter
  + Function     start() - Added in 1032c93
  + Function     pause() - Added in 1032c93
  + Function     getTime() - Added in 1032c93
  + Function     timePadding() - Added in 1032c93
  + Function     getTimeFormatted() - Added in 1032c93
  + Function     getStep() - Added in 1032c93
  + Function     getStepFormatted() - Added in 1032c93
  + Function     isResolve() - Added in da44d08

### App
#### new App()
  + Displayer displayer
  + Number    brickCount
  + String    materialName
  + Game      game
  + Number    volume
  + Audio     bgm

  <!-- 主頁 -->
  + Function  start()
  + Function  gotoSetting()
  + Function  gotoAchievement()

  <!-- 遊戲畫面 -->
  + Function  pause()
  + Function  submit()

  <!-- 遊戲畫面_暫停中 -->
  + Function  continue()
  + Function  restarting()
  + Function  exit()
  + Function  setVolume(value)

  <!-- setting page -->
  + Function  increaseBrickCount()
  + Function  decreaseBrickCount()
  + Function  setBrickTexture(textureId)

  <!-- achievement page -->
  + Function  pickupGift(achievementId)

# <center> Html </center>
### 主畫面
  + <button onclick="app.start()">開始按鈕</button>
  + etc...
