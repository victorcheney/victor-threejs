const THREE = require('three');
// const TWEEN = require('tweenjs'); // 需修改tweenjs包package.json main属性值 tweenjs --> ./lib/tween.js
const TWEEN = require('@tweenjs/tween.js');
const TrackballControls = require('three-trackballcontrols');
require('./CSS3DRenderer');

export default class PeriodicTableOfElements {
  constructor() {
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.controls = null;

    this.objects = [];
    this.targets = {
      table: [], // 表格
      sphere: [], // 球形
      helix: [], // 螺旋
      grid: [] // 栅格 
    }
  }
  // 初始化
  init(table) {

    let _this = this;

    // 构造透视投影照相机
    /* THREE.PerspectiveCamera(fov, aspect, near, far) 
　　　- fov 可视角度 
　　　- aspect 实际窗口的纵横比 
　　　- near 近处的裁面的距离
　　　- far 远处的裁面的距离 */
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.z = 3000;

    // 构造场景对象
    this.scene = new THREE.Scene();

    // table布局
    for (var i = 0; i < table.length; i += 5) {

      var element = document.createElement('div');
      element.className = 'element';
      element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';

      var number = document.createElement('div');
      number.className = 'number';
      number.textContent = (i / 5) + 1;
      element.appendChild(number);

      var symbol = document.createElement('div');
      symbol.className = 'symbol';
      symbol.textContent = table[i];
      element.appendChild(symbol);

      var details = document.createElement('div');
      details.className = 'details';
      details.innerHTML = table[i + 1] + '<br>' + table[i + 2];
      element.appendChild(details);

      var object = new THREE.CSS3DObject(element);
      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;
      this.scene.add(object);

      this.objects.push(object);

      //

      var object = new THREE.Object3D();
      object.position.x = (table[i + 3] * 140) - 1330;
      object.position.y = -(table[i + 4] * 180) + 990;

      this.targets.table.push(object);

    }

    // sphere 球形布局
    var vector = new THREE.Vector3();
    for (var i = 0, l = this.objects.length; i < l; i++) {

      var phi = Math.acos(-1 + (2 * i) / l);
      var theta = Math.sqrt(l * Math.PI) * phi;

      var object = new THREE.Object3D();

      object.position.x = 800 * Math.cos(theta) * Math.sin(phi);
      object.position.y = 800 * Math.sin(theta) * Math.sin(phi);
      object.position.z = 800 * Math.cos(phi);

      vector.copy(object.position).multiplyScalar(2);

      object.lookAt(vector);

      this.targets.sphere.push(object);

    }

    // helix 螺旋布局
    var vector = new THREE.Vector3();
    for (var i = 0, l = this.objects.length; i < l; i++) {

      var phi = i * 0.175 + Math.PI;

      var object = new THREE.Object3D();

      object.position.x = 900 * Math.sin(phi);
      object.position.y = -(i * 8) + 450;
      object.position.z = 900 * Math.cos(phi);

      vector.x = object.position.x * 2;
      vector.y = object.position.y;
      vector.z = object.position.z * 2;

      object.lookAt(vector);

      this.targets.helix.push(object);

    }

    // grid栅格布局
    for (var i = 0; i < this.objects.length; i++) {

      var object = new THREE.Object3D();

      object.position.x = ((i % 5) * 400) - 800;
      object.position.y = (-(Math.floor(i / 5) % 5) * 400) + 800;
      object.position.z = (Math.floor(i / 25)) * 1000 - 2000;

      this.targets.grid.push(object);

    }

    //

    this.renderer = new THREE.CSS3DRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.style.position = 'absolute';
    document.getElementById('container').appendChild(this.renderer.domElement);

    //

    this.controls = new TrackballControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 0.5;
    this.controls.minDistance = 500;
    this.controls.maxDistance = 6000;
    this.controls.addEventListener('change', () => {
      _this.render(_this.renderer);
    });

    var button = document.getElementById('table');
    button.addEventListener('click', function (event) {

      this.transform(_this.targets.table, 2000);

    }, false);

    var button = document.getElementById('sphere');
    button.addEventListener('click', function (event) {

      _this.transform(_this.targets.sphere, 2000);

    }, false);

    var button = document.getElementById('helix');
    button.addEventListener('click', function (event) {

      _this.transform(_this.targets.helix, 2000);

    }, false);

    var button = document.getElementById('grid');
    button.addEventListener('click', function (event) {

      _this.transform(_this.targets.grid, 2000);

    }, false);

    this.transform(this.targets.table, 5000);

    //

    window.addEventListener('resize', this.onWindowResize, false);

  }

  // 变换
  transform( targets, duration ) {
    TWEEN.removeAll();

    for (var i = 0; i < this.objects.length; i++) {

      var object = this.objects[i];
      var target = targets[i];

      new TWEEN.Tween(object.position)
        .to({
          x: target.position.x,
          y: target.position.y,
          z: target.position.z
        }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

      new TWEEN.Tween(object.rotation)
        .to({
          x: target.rotation.x,
          y: target.rotation.y,
          z: target.rotation.z
        }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

    }

    let _this = this;
    new TWEEN.Tween(this)
      .to({}, duration * 2)
      .onUpdate(function() {
        _this.render(_this.renderer);
      })
      .start();
  }

  // 监听窗口变化
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  
    this.render(this.renderer);
  }

  // 渲染
  render(renderer) {
    renderer.render( this.scene, this.camera );
  }

  // 动画
  animate() {

    requestAnimationFrame( () => {
      this.animate()
    });

    TWEEN.update();
  
    this.controls.update();
  }
}