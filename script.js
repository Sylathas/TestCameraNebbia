import * as THREE from './three.module.js';
import { MapControls } from './OrbitControls.js';


var game;
document.addEventListener("DOMContentLoaded", function(){
  game = new Game();
});

class Game{
  constructor(){
    this.renderer;
    this.scene;
    this.cube;
    this.camera;
    this.compositions = [];
    this.images = [];
    this.controls;
    this.maxAnisotropy;
    this.accelleration = 0;

    const game = this;
    const loader = new THREE.FileLoader();
    loader.setMimeType("application/xml");

    loader.load(
      'perniccolo/xml/tutto.xml',

      function( data ) {
        game.init(data);
      }
    )
  }

  init(data){
    //Create Three.js Scene
    const game = this;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x000000 );
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    this.renderer = new THREE.WebGLRenderer();
    this.maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    // controls
		/*this.controls = new MapControls( this.camera, this.renderer.domElement );

    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
		this.controls.dampingFactor = 0.05;*/

    //lights
    //const ambientLight = new THREE.AmbientLight( 0x222222 );
		//this.scene.add( ambientLight );

    this.camera.rotation.set(Math.PI, 0, Math.PI);

    //Parse through the XML File
    const doc = $.parseXML(data);
    let $media = $(doc).find("media");

    $media.each(function(index, element) {
      const scalePos = 0.01
      const type = $(this).children("type").first().text();
      const src = $(this).children("src").first().text();
      const nome = $(this).children("nome").first().text();
      const offset = new THREE.Vector2(parseFloat($(this).children("offsetcompx").first().text()) * scalePos, parseFloat($(this).children("offsetcompy").first().text()) * scalePos);
      const position = new THREE.Vector3(parseFloat($(this).children("x").first().text())* scalePos, parseFloat($(this).children("y").first().text())* scalePos, parseFloat($(this).children("z").first().text())* scalePos) ;
      const scale = new THREE.Vector3(parseFloat($(this).children("scalax").first().text()) * scalePos, parseFloat($(this).children("scalay").first().text()) * scalePos, parseFloat($(this).children("scalaz").first().text()) * scalePos);
      const layers = this;

      //find total rotation
      const rotx = THREE.MathUtils.degToRad(parseFloat($(this).children("rotx").first().text()))
      const roty = THREE.MathUtils.degToRad(parseFloat($(this).children("roty").first().text()))
      const rotz = THREE.MathUtils.degToRad(parseFloat($(this).children("rotz").first().text()))
      const xAng =  new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ),  -rotx);
      const yAng =   new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ),  roty);
      const zAng =  new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), -rotz);
      let rotation = new THREE.Quaternion();
      rotation.multiplyQuaternions(xAng, yAng, zAng);

      let xmlElement = new XMLElement(type, src, nome, offset, position, rotation, scale, game);

      if($(this).children("type").first().text() == "comp"){
        xmlElement = new XMLComp(type, src, nome, offset, position, rotation, scale, layers, game.maxAnisotropy);
        game.compositions.push(xmlElement);
      } else {
        game.images.push(xmlElement);
      }
      for (var j = 0; j < game.compositions.length; j++){
        for (var i = 0; i < $(game.compositions[j].layers).children("media").children("nome").length; i++) {
          if($(game.compositions[j].layers).children("media").children("nome")[i] == $(layers).children("nome")[0]){
            //console.log(game.compositions[j].object);
            game.compositions[j].object.add(xmlElement.object);
            xmlElement.parent = true;
          }
        }
      }
      console.log("ciao");
    });
    if(this.compositions.length == 0){
      for(var i = 0; i < game.images.length; i++){
        this.scene.add(this.images[i].object);
      }
    } else{
      for(var i = 0; i < game.compositions.length; i++){
        if(!game.compositions[i].parent){
          this.scene.scale.set(-1, -1, 1);
          this.scene.add(this.compositions[i].object);
        }
      }
    }

    window.addEventListener( 'resize', () => game.onWindowResize(), true );
    window.addEventListener( 'wheel', () => game.cameraUpdate(event, game.camera, this.accelleration), true);

    this.animate();
  }

  animate() {
    const game = this;
    this.camera.position.z = this.camera.position.z + this.accelleration;
    this.accelleration = Math.round((this.accelleration + Number.EPSILON) * 100) / 100;
    if(this.accelleration > 0){
      this.accelleration = this.accelleration - 0.03;
    } else if(this.accelleration < 0){
      this.accelleration = this.accelleration + 0.03;
    }
    //this.controls.update();

    requestAnimationFrame( function(){ game.animate(); } );
    this.render();
  }

  render() {
    this.renderer.render( this.scene, this.camera );
  }

  onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		//this.controls.update();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
	}

  cameraUpdate(event, camera, accelleration) {
    this.camera = camera;
    this.accelleration = accelleration;
    if(this.accelleration < 0.8){
      if (event.deltaY < 0){
        this.accelleration = this.accelleration + 0.2;
      }
      else if (event.deltaY > 0)
      {
        this.accelleration = this.accelleration - 0.2;
      }
    }
  }
}

class XMLComp{
  constructor(type, src, nome, offset, position, rotation, scale, layers){
    this.type = type;
    this.src = src;
    this.nome = nome;
    this.offset = offset;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.layers = layers;
    this.parent = false;
    this.object = new THREE.Object3D();
    this.object.position.set(position.x  - offset.x, position.y  - offset.y, position.z);
    this.object.applyQuaternion(this.rotation);
    this.object.scale.set(scale.x, scale.y, scale.z);
    this.object.name = nome;
  }
}

class XMLElement{
  constructor(type, src, nome, offset, position, rotation, scale, game, anisotropy){
    this.type = type;
    this.src = src;
    this.nome = nome;
    this.offset = offset;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.game = game;
    this.material;
    this.object;
    this.anisotropy = anisotropy;
    this.parent = false;

    const element = this;

    const loader = new THREE.TextureLoader();

    if(type == "img"){

      //Create plane geometry
      const geometry = new THREE.PlaneGeometry( 1, 1 );

      //Load texture and create material
      const texture = loader.load(
        "./perniccolo/PNG/" + src,
        function() {
          plane.scale.set(element.scale.x * texture.image.width * 0.01, element.scale.y * texture.image.height * -0.01);
        }
      );

      texture.anisotrpy = element.anisotropy;

      const material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: texture,
        alphaTest : 0.5
      });

      //Create Mesh
      const plane = new THREE.Mesh( geometry, material );

      //Set position and rotation
      plane.position.set(element.position.x - element.offset.x, element.position.y - element.offset.y, element.position.z);
      plane.applyQuaternion(this.rotation);

      plane.name = element.nome;
      element.object = plane;
    }
  }
}
