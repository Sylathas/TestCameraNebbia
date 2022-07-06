import * as THREE from 'three';
import { MapControls } from 'OrbitControls';


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

    const game = this;
    const loader = new THREE.FileLoader();
    loader.setMimeType("application/xml");

    loader.load(
      'perniccolo/xml/putti.xml',

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
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    // controls
		this.controls = new MapControls( this.camera, this.renderer.domElement );

    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
		this.controls.dampingFactor = 0.05;

    //lights
    //const ambientLight = new THREE.AmbientLight( 0x222222 );
		//this.scene.add( ambientLight );

		this.camera.position.z = 5;

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
      const scale = new THREE.Vector3(parseFloat($(this).children("scalax").first().text())* scalePos, parseFloat($(this).children("scalay").first().text())* scalePos, parseFloat($(this).children("scalaz").first().text())* scalePos);
      const layers = this;

      //find total rotation
      const rotx = THREE.MathUtils.degToRad(parseFloat($(this).children("rotx").first().text()))
      const roty = THREE.MathUtils.degToRad(parseFloat($(this).children("roty").first().text()))
      const rotz = THREE.MathUtils.degToRad(parseFloat($(this).children("rotz").first().text()))
      const xAng = new THREE.Quaternion();
      xAng.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ),  -rotx);
      const yAng = new THREE.Quaternion();
      yAng.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ),  roty);
      const zAng = new THREE.Quaternion();
      zAng.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ),  -rotz);
      let rotation = new THREE.Quaternion();
      rotation = xAng;
      rotation.multiply(yAng);
      rotation.multiply(zAng);

      let xmlElement = new XMLElement(type, src, nome, offset, position, rotation, scale, game);

      if($(this).children("type").first().text() == "comp"){
        xmlElement = new XMLComp(type, src, nome, offset, position, rotation, scale, layers);
        game.compositions.push(xmlElement);
      } else {
        game.images.push(xmlElement);
      }
      for (var j = 0; j < game.compositions.length; j++){
        for (var i = 0; i < $(game.compositions[j].layers).children("media").children("nome").length; i++) {
          if($(game.compositions[j].layers).children("media").children("nome")[i] == $(layers).children("nome")[0]){
            //console.log(game.compositions[j].object);
            game.compositions[j].object.add(xmlElement.object);
          }
        }
      }
    });
    if(this.compositions.length == 0){
      for(var i = 0; i < game.images.length; i++){
        this.scene.add(this.images[i].object);
      }
    } else{
      this.scene.add(this.compositions[0].object);
    }

    window.addEventListener( 'resize', () => game.onWindowResize(), true );

    this.animate();
  }

  animate() {
    const game = this;
    this.controls.update();

    for (var j = 0; j < game.images.length; j++){
        game.images[j].object.quaternion.copy(game.camera.quaternion);
    }

    requestAnimationFrame( function(){ game.animate(); } );
    this.render();
  }

  render() {
    this.renderer.render( this.scene, this.camera );
  }

  onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.controls.update();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
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
    this.planescalex;
    this.planescaley;
    this.layers = layers;
    this.object = new THREE.Object3D();
    //this.object.position.set(position.x - offset.x, position.y - offset.y, position.z);
    this.object.position.set(position.x, position.y, position.z);
    this.object.scale.set(scale.x, scale.y, scale.z);
    this.object.applyQuaternion(this.rotation);
    this.object.name = nome;
  }
}

class XMLElement{
  constructor(type, src, nome, offset, position, rotation, scale, game){
    this.type = type;
    this.src = src;
    this.nome = nome;
    this.offset = offset;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.planescalex;
    this.planescaley;
    this.game = game;
    this.material;
    this.object;

    const element = this;

    const loader = new THREE.TextureLoader();

    if(type == "img"){
      const texture = loader.load(
        "./perniccolo/putti/" + src,
        function() {
          plane.scale.set(element.scale.x * texture.image.width / 100, element.scale.y * texture.image.height / 100);
        }
      );
      const geometry = new THREE.PlaneGeometry( 1, 1 );
      const material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: texture,
        transparent: true,
      });
      console.log("ciao");
      const plane = new THREE.Mesh( geometry, material );
      //plane.position.set(element.position.x - element.offset.x, element.position.y - element.offset.y, element.position.z);
      plane.position.set(element.position.x, element.position.y, element.position.z);
      plane.applyQuaternion(this.rotation);
      plane.name = element.nome;
      element.object = plane;
    }
  }
}
