import {
    BaseScene
} from "./baseScene";
import {
    Align
} from "../common/util/align";
import {FormUtil} from "../common/util/formUtil";
import bgr1 from '../../assets/images/far.png';
import bgr2 from '../../assets/images/sand.png';
import bgr3 from '../../assets/images/foreground-1.png';
import bgr32 from '../../assets/images/foreground-2.png';
import ground1 from '../../assets/images/tiles-sand-coral.png';
import hero from '../../assets/images/bobHero.png';
import { AlignGrid } from "../common/util/alignGrid";

//
//
//
var player;

export class SceneMain extends BaseScene {
    constructor() {
        super('SceneMain');
    }
    preload() {
        this.load.image('bkgr1', bgr1);
        this.load.image('bkgr2', bgr2);
        this.load.image('bkgr3', bgr3);
        this.load.image('bkgr32', bgr32);
        this.load.image('ground1', ground1);
        this.load.spritesheet('hero', hero, { frameWidth: 43, frameHeight: 48 });
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    create() {
        //set up the base scene
        super.create();
        //set the grid for the scene
        this.makeAlignGrid(11, 11);

        this.blockGrid = new AlignGrid({
            scene: this,
            rows: 11,
            cols: 120,
            width: 800*10, 
        })
        //show numbers for layout and debugging 
        //
        this.dbJump = true;
        this.jumping = false;
        this.jumpTime = 0;
        this.brickGroup = this.physics.add.group();

        const totalWidth = this.sys.game.config.width * 10;
        
        let bg1 = this.add.image(0,0,'bkgr1').setScrollFactor(0);
        bg1.displayHeight = this.sys.game.config.height;
        bg1.scaleX = bg1.scaleY;
        bg1.y = this.sys.game.config.height/2;
        bg1.x = this.sys.game.config.width/2;
        
        this.backGroundAlign(totalWidth, 'bkgr2', 'bkgr2', 0.25);
        this.backGroundAlign(totalWidth, 'bkgr3', 'bkgr32', 0.50);
        
        this.cameras.main.setBounds(0,0,this.sys.game.config.width*10,this.sys.game.config.height)
        this.makeFloor(1200, 1319, 'ground1');
        this.physics.world.setBounds(0,0,this.sys.game.config.width*10,this.sys.game.config.height)

        player = this.physics.add.sprite(100, 450, 'hero');
        player.setGravityY(250);
        player.setCollideWorldBounds(true);
        this.physics.add.collider(player, this.brickGroup);
        
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });
    
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'hero', frame: 4 } ],
            frameRate: 20
        });
    
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('hero', { start: 2, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.cameras.main.startFollow(player);
        //
        //
        this.blockGrid.showNumbers();
        this.makeUi();     
    }
    
    backGroundAlign(totalWidth, texture, texture2, scrollFactor) {
      const w = this.textures.get(texture).getSourceImage().width;
      const count = Math.ceil(totalWidth / w) * scrollFactor;
      let x = 0;
      let actText = texture;
      for (let i = 0; i < count; i++) {
        const m = this.add.image(x, 0, actText)
            .setScrollFactor(scrollFactor)
        m.displayHeight = this.sys.game.config.height;
        m.scaleX = m.scaleY;
        m.y = (this.sys.game.config.height/2) * 0.81;
        m.x = this.sys.game.config.width/2 + x;
        x += m.width * m.scaleY;
        if (i % 4 === 0) {
          actText = texture2;
        } else {
          actText = texture;
        }
      }
    }

    makeFloor(fromPos, toPos, key) {
      for (var i = fromPos; i < toPos + 1; i++) {
        this.placeBlock(i, key);
      }
    }

    placeBlock(pos,key) {
        let block = this.physics.add.sprite(0,0,key);
        this.blockGrid.placeAtIndex(pos,block);
        this.brickGroup.add(block);
        block.setImmovable();
        Align.scaleToGameW(block, 0.1, this);
    }
    
   
    makeUi() {
        super.makeSoundPanel();
        super.makeGear();
    }
    update() {
        const cam = this.cameras.main;

        if (this.cursors.left.isDown)
        {
            player.setVelocityX(-960);
    
            player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown)
        {
            player.setVelocityX(960);
    
            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);
    
            player.anims.play('turn');
            this.cursors.up.getDuration()
        }

        if (player.body.touching.down) {
          this.dbJump = true;
        }

        if (this.cursors.up.isDown && this.dbJump)
        { 
          if (this.jumpTime !== this.cursors.up.timeDown) {
            this.jumping = false;
          }
          if (!player.body.touching.down && ((this.jumpTime + 50) < this.cursors.up.timeDown)) {
            this.dbJump = false;
          }
          this.jumpTime = this.cursors.up.timeDown
          if (!this.jumping) {
            player.setVelocityY(-330);
          }
          this.jumping = true;
        } 
    }
}