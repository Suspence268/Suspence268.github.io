let gameState = {
    gameStart: false,
    currentTime: 0,
    pipeArr: [],
    pipeXArr: [],
    groundArr: [],
    score: 0,
    scoreText: {},
    alive: true,
    audio: {},
    timeDead: 0,
    keyDown: false
}

function preload(){
    this.load.image('bg', 'assets/background-day.png');
    this.load.image('bird', 'assets/yellowbird-midflap.png');
    this.load.image('ground', 'assets/base.png');
    this.load.image('pipe', 'assets/pipe-green.png');
    this.load.spritesheet('spritesheet', 'assets/spritesheet.png', {frameWidth: 36, frameHeight: 26})
    this.load.font('PressStart2P', 'assets/PressStart2P-Regular.ttf');
    this.load.audio('wing', 'assets/wing.wav');
    this.load.audio('point', 'assets/point.wav');
    this.load.audio('hit', 'assets/hit.wav');
    this.load.audio('swoosh', 'assets/swoosh.wav');
    this.load.audio('die', 'assets/die.wav');
}

function create(){
    //background
    this.add.sprite(144, 256, 'bg');

    //fade in
    this.cameras.main.fadeIn(500, 255,255,255)

    // score text
    gameState.scoreText = this.add.text(144, 50, '0', { fontFamily: 'PressStart2P', fontSize: '24px'});
    gameState.scoreText.setDepth(4)
    gameState.scoreText.setOrigin(0.5)

    //add audio
    gameState.audio.wing = this.sound.add('wing');
    gameState.audio.hit = this.sound.add('hit');
    gameState.audio.point = this.sound.add('point');
    gameState.audio.swoosh = this.sound.add('swoosh');
    gameState.audio.die = this.sound.add('die')

    //ground
    gameState.groundArr.push(this.physics.add.sprite(144, 500, 'ground'));
    gameState.groundArr[0].setDepth(3)
    gameState.groundArr[0].body.setAllowGravity(false)
    gameState.groundArr[0].body.setImmovable(true);
    gameState.groundArr[0].setVelocityX(-100)

    gameState.groundArr.push(this.physics.add.sprite(144, 500, 'ground'));
    gameState.groundArr[1].setDepth(3)
    gameState.groundArr[1].body.setAllowGravity(false)
    gameState.groundArr[1].body.setImmovable(true);
    gameState.groundArr[1].setVelocityX(-100)

    this.physics.world.setBounds(0, 0, 288, 446); 

    //adds bird and disables gravity
    gameState.player = this.physics.add.sprite(130, 256, 'spritesheet').setImmovable(true);
    gameState.player.setDepth(5)
    gameState.player.body.setAllowGravity(false);
    gameState.player.setCollideWorldBounds(true);
    gameState.player.collideWorldBounds = true;
    gameState.player.setScale = 0.9;



    //key input
    this.input.keyboard.on('keydown-SPACE', function() {
        if(!gameState.keyDown){
            gameState.keyDown = true;
            //enables gravity
            gameState.player.body.setAllowGravity(true);
                

            // jumps
            gameState.player.setVelocityY(-250);

            // rotates bird up
            gameState.player.angle = -45;

            //game has started
            gameState.gameStart = true;

            //play audio
            gameState.audio.wing.play();
        }
    });
    
    //makes it so you cant hold down space
    this.input.keyboard.on('keyup-SPACE', function() {
        gameState.keyDown = false;
    });
    
    //animation creation
    this.anims.create({
      key: 'flap',
      frames: this.anims.generateFrameNumbers('spritesheet', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    //sound and visual effect
    gameState.audio.swoosh.play()
 }

function update(){
    //alive logic
    if(gameState.alive){
        //sprite animation
        gameState.player.anims.play('flap', true);
    }
    
    
    //dead logic
    if(!gameState.alive && gameState.gameStart){
        gameState.gameStart = false
        //play hit sound effect
        gameState.audio.hit.play()

        //stop sprite animation
        gameState.player.anims.stop();
        
        //stops pipes and ground from moving
        gameState.pipeArr.forEach(pipes =>{
            pipes.topPipe.setVelocity(0);
            pipes.bottomPipe.setVelocity(0);
        })
        
        gameState.groundArr.forEach(ground =>{
            ground.setVelocity(0);
            ground.setVelocity(0);
        })
        
        //disables key input
        this.input.keyboard.enabled = false;
    }

    //tracks time after death
    if(!gameState.alive){
        gameState.timeDead++;
        if(gameState.timeDead === 100){
            gameState.audio.die.play();
        }
        
        //fadeout
        if(gameState.timeDead === 200){
            this.cameras.main.fadeOut(300, 255,255,255)
        }

        //reloads game
        if(gameState.timeDead === 400){
            location.reload();
        }
    }

    //checks if bird hit floor
    if(gameState.player.y >= 432){
        gameState.alive = false
    }
    
    //rotates bird down when falling
    if(gameState.player.body.velocity.y > 0 && gameState.player.angle <= 90){
        gameState.player.angle += 1.5;
    }

    //creates moving ground
    if(gameState.groundArr[1].x <= 144 ){
        gameState.groundArr.push(this.physics.add.sprite(432, 500, 'ground'))
        gameState.groundArr[2].setDepth(3)
        gameState.groundArr[2].body.setAllowGravity(false)
        gameState.groundArr[2].body.setImmovable(true);
        gameState.groundArr[2].setVelocityX(-100)
        gameState.groundArr[0].destroy();
        gameState.groundArr.shift()
    }
    
    if(gameState.gameStart){
        // pipe factory, returns pipes object, should use rNum between [300, 550] 
        const createPipes = (rNum) => {
            const pipes = {
                topPipe: this.physics.add.sprite(350, rNum-400, 'pipe'),
                bottomPipe: this.physics.add.sprite(350, rNum, 'pipe'),
                delete(){
                    this.topPipe.destroy();
                    this.bottomPipe.destroy();
                }
            }
            pipes.topPipe.body.setAllowGravity(false);
            pipes.bottomPipe.body.setImmovable(true);
            pipes.topPipe.body.setImmovable(true);
            pipes.bottomPipe.body.setAllowGravity(false);
            pipes.topPipe.angle = 180
            pipes.topPipe.flipX = true;
            pipes.topPipe.setVelocityX(-100);
            pipes.bottomPipe.setVelocityX(-100);
            return pipes;
        }

        //gets time in second 
        let newTime = Math.floor(this.time.now*0.001);

        //checks second change
        if(newTime > gameState.currentTime+1){
            gameState.currentTime = newTime;

            //creates new pipes with random height
            let newPipe = createPipes(Math.random()*250+300)

            //collision logic
            const collision = function(){
                gameState.alive = false;
            }

            //adds collions to pipes
            this.physics.add.collider(gameState.player, newPipe.topPipe, collision)
            this.physics.add.collider(gameState.player, newPipe.bottomPipe, collision)
            gameState.pipeArr.push(newPipe);
            gameState.pipeXArr.push(newPipe)
        }
        
        //checks if first pipe object has left screen and deletes object
        if(gameState.pipeArr.length > 0 && gameState.pipeArr[0].topPipe.x <-50){
            gameState.pipeArr[0].delete();
            gameState.pipeArr.shift();
        }

        //checks if bird passed pipe and increases score
        if(gameState.pipeXArr.length > 0 && gameState.pipeXArr[0].topPipe.x <130){
            gameState.score++;
            gameState.pipeXArr.shift();
            gameState.scoreText.setText(''+gameState.score)
            gameState.audio.point.play()
        }
    }
}


const config = {
  type: Phaser.AUTO,
  width: 288,
  height: 512,
  backgroundColor: '#808080',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 700 },
    //   debug: true
    }
  },
  scene: {preload, create, update},
};

const game = new Phaser.Game(config);
