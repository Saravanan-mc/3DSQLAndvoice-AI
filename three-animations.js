// three-animations.js
// Specialized 3D visualizer for Gemini SQL Academy using WebGL/Three.js

class SQLAnimator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        // Setup Three.js Scene
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 4, 10);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0x58a6ff, 1);
        this.directionalLight.position.set(5, 10, 5);
        this.scene.add(this.directionalLight);

        this.currentObjects = [];
        this.animationFrameId = null;
        this.clock = new THREE.Clock();
        
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        
        this.animate = this.animate.bind(this);
        this.animate();
    }

    onWindowResize() {
        if (!this.container) return;
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    clearScene() {
        this.currentObjects.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if(Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
            this.scene.remove(obj);
        });
        this.currentObjects = [];
    }

    playAnimation(topic) {
        if (!this.container) return;
        this.clearScene();
        this.clock.start();
        
        const t = topic.toLowerCase();
        
        if (t.includes("introduction")) {
            this.createDatabaseAnim();
        } else if (t.includes("select")) {
            this.createSelectAnim();
        } else if (t.includes("where")) {
            this.createWhereAnim();
        } else if (t.includes("order by") || t.includes("limit")) {
            this.createOrderByAnim();
        } else if (t.includes("insert")) {
            this.createInsertAnim();
        } else if (t.includes("update")) {
            this.createUpdateAnim();
        } else if (t.includes("delete")) {
            this.createDeleteAnim();
        } else if (t.includes("join")) {
            this.createJoinAnim();
        } else if (t.includes("group by") || t.includes("having")) {
            this.createGroupByAnim();
        } else if (t.includes("aggregate")) {
            this.createAggregateAnim();
        } else if (t.includes("subqueries")) {
            this.createSubqueryAnim();
        } else if (t.includes("indexes") || t.includes("views")) {
            this.createIndexAnim();
        } else if (t.includes("procedures")) {
            this.createProcedureAnim();
        } else if (t.includes("optimization")) {
            this.createOptimizationAnim();
        } else {
            this.createDefaultAnim();
        }
    }

    // 1. INTRO
    createDatabaseAnim() {
        const geometry = new THREE.CylinderGeometry(2, 2, 1, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0x58a6ff, transparent: true, opacity: 0.8, shininess: 100 });
        for(let i=0; i<3; i++) {
            const cylinder = new THREE.Mesh(geometry, material);
            cylinder.position.y = (i * 1.5) - 1.5;
            this.scene.add(cylinder);
            this.currentObjects.push(cylinder);
            cylinder.userData = { animType: 'intro', speed: 0.01 * (i+1), offset: i };
        }
        this.camera.position.set(0, 4, 12);
        this.camera.lookAt(0,0,0);
    }

    // 2. SELECT
    createSelectAnim() {
        const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const normalMat = new THREE.MeshPhongMaterial({ color: 0x333333, transparent: true, opacity: 0.5 });
        const highlightMat = new THREE.MeshPhongMaterial({ color: 0xbd56ff, emissive: 0x5a189a });

        for(let row=0; row<4; row++) {
            for(let col=0; col<5; col++) {
                const isSelected = (col === 2); 
                const box = new THREE.Mesh(boxGeo, isSelected ? highlightMat : normalMat);
                box.position.set(col * 1 - 2, 0, row * 1 - 1.5);
                this.scene.add(box);
                this.currentObjects.push(box);
                box.userData = { animType: 'select', bobSpeed: isSelected ? 0.05 : 0, time: row * 0.5 };
            }
        }
        this.camera.position.set(0, 5, 8);
        this.camera.lookAt(0,0,0);
    }

    // 3. WHERE
    createWhereAnim() {
        const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const keepMat = new THREE.MeshPhongMaterial({ color: 0x2ea043, emissive: 0x0f5132 });
        const discardMat = new THREE.MeshPhongMaterial({ color: 0xf85149, transparent: true });

        for(let row=0; row<4; row++) {
            for(let col=0; col<5; col++) {
                const isKept = Math.random() > 0.5;
                const box = new THREE.Mesh(boxGeo, isKept ? keepMat : discardMat);
                box.position.set(col * 1 - 2, 0, row * 1 - 1.5);
                this.scene.add(box);
                this.currentObjects.push(box);
                box.userData = { animType: 'where', isKept: isKept, time: 0, delay: Math.random() * 50 };
            }
        }
        this.camera.position.set(0, 5, 8);
        this.camera.lookAt(0,0,0);
    }

    // 4. ORDER BY
    createOrderByAnim() {
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        const heights = [3, 1, 4, 2, 5]; // Unsorted
        const material = new THREE.MeshPhongMaterial({ color: 0x58a6ff });
        
        for(let i=0; i<heights.length; i++) {
            const h = heights[i];
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, h * 0.8, 0.8), material);
            mesh.position.set(i * 1.2 - 2.5, (h * 0.8)/2 - 2, 0);
            this.scene.add(mesh);
            this.currentObjects.push(mesh);
            mesh.userData = { animType: 'order', id: i, heightVal: h, targetX: (h-1) * 1.2 - 2.5, time: 0 };
        }
        this.camera.position.set(0, 3, 10);
        this.camera.lookAt(0,0,0);
    }

    // 5. INSERT
    createInsertAnim() {
        const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const mat = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const newMat = new THREE.MeshPhongMaterial({ color: 0x2ea043, emissive: 0x0f5132 });

        // Existing Grid
        for(let i=0; i<3; i++) {
            const box = new THREE.Mesh(boxGeo, mat);
            box.position.set(i * 1 - 1, 0, 0);
            this.scene.add(box);
            this.currentObjects.push(box);
        }

        // 飞来的新数据 (Flying new data)
        const newBox = new THREE.Mesh(boxGeo, newMat);
        newBox.position.set(3, 5, 0);
        this.scene.add(newBox);
        this.currentObjects.push(newBox);
        newBox.userData = { animType: 'insert', targetX: 2, targetY: 0 };

        this.camera.position.set(0, 4, 8);
        this.camera.lookAt(0,0,0);
    }

    // 6. UPDATE
    createUpdateAnim() {
        const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const normalMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const highlightMat = new THREE.MeshPhongMaterial({ color: 0xffd33d, emissive: 0xd29922 }); // Yellow

        for(let col=0; col<5; col++) {
            const isTarget = (col === 2);
            const box = new THREE.Mesh(boxGeo, normalMat.clone());
            box.position.set(col * 1 - 2, 0, 0);
            this.scene.add(box);
            this.currentObjects.push(box);
            if (isTarget) {
                box.userData = { animType: 'update', time: 0, materialToChange: highlightMat };
            }
        }
        this.camera.position.set(0, 4, 8);
        this.camera.lookAt(0,0,0);
    }

    // 7. DELETE
    createDeleteAnim() {
        const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const normalMat = new THREE.MeshPhongMaterial({ color: 0x58a6ff });

        for(let row=0; row<4; row++) {
            const isTarget = (row === 2);
            const box = new THREE.Mesh(boxGeo, normalMat.clone());
            box.position.set(0, row * -1 + 1.5, 0);
            this.scene.add(box);
            this.currentObjects.push(box);
            box.userData = { 
                animType: 'delete', 
                isTarget: isTarget, 
                targetY: isTarget ? box.position.y : (row > 2 ? box.position.y + 1 : box.position.y),
                time: 0 
            };
        }
        this.camera.position.set(0, 2, 8);
        this.camera.lookAt(0,0,0);
    }

    // 8. JOIN
    createJoinAnim() {
        const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const matA = new THREE.MeshPhongMaterial({ color: 0x58a6ff });
        const matB = new THREE.MeshPhongMaterial({ color: 0xbd56ff });

        for(let row=0; row<4; row++) {
            const box1 = new THREE.Mesh(boxGeo, matA);
            box1.position.set(-4, 0, row * 1 - 1.5);
            this.scene.add(box1);
            this.currentObjects.push(box1);
            box1.userData = { animType: 'join', targetX: -0.42 };

            const box2 = new THREE.Mesh(boxGeo, matB);
            box2.position.set(4, 0, row * 1 - 1.5);
            this.scene.add(box2);
            this.currentObjects.push(box2);
            box2.userData = { animType: 'join', targetX: 0.42 };
        }
        this.camera.position.set(0, 6, 9);
        this.camera.lookAt(0,0,0);
    }

    // 9. GROUP BY
    createGroupByAnim() {
        const boxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const colors = [0xf85149, 0x2ea043, 0x58a6ff];
        const mats = colors.map(c => new THREE.MeshPhongMaterial({ color: c }));
        const targets = [{x:-2, y:0}, {x:0, y:0}, {x:2, y:0}];

        for(let i=0; i<15; i++) {
            const type = i % 3;
            const box = new THREE.Mesh(boxGeo, mats[type]);
            box.position.set((Math.random()-0.5)*8, (Math.random()-0.5)*4, (Math.random()-0.5)*4);
            this.scene.add(box);
            this.currentObjects.push(box);
            
            // grouping offset
            const tx = targets[type].x + (Math.random()-0.5)*0.8;
            const ty = targets[type].y + (Math.random()-0.5)*0.8;
            const tz = (Math.random()-0.5)*0.8;
            
            box.userData = { animType: 'groupby', targetX: tx, targetY: ty, targetZ: tz, time: 0 };
        }
        this.camera.position.set(0, 3, 10);
        this.camera.lookAt(0,0,0);
    }

    // 10. AGGREGATE
    createAggregateAnim() {
        const boxGeo = new THREE.BoxGeometry(1, 0.4, 1);
        const mat = new THREE.MeshPhongMaterial({ color: 0x58a6ff });
        const group = new THREE.Group();
        this.scene.add(group);
        this.currentObjects.push(group);

        for(let i=0; i<5; i++) {
            const box = new THREE.Mesh(boxGeo, mat);
            box.position.set(0, i * 0.5 - 1, 0);
            group.add(box);
        }
        group.userData = { animType: 'aggregate', time: 0 };
        
        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0,0,0);
    }

    // 11. SUBQUERIES
    createSubqueryAnim() {
        const outerGeo = new THREE.BoxGeometry(3, 3, 3);
        const innerGeo = new THREE.BoxGeometry(1, 1, 1);
        
        const outerMat = new THREE.MeshPhongMaterial({ color: 0x58a6ff, transparent: true, opacity: 0.3, wireframe: true });
        const innerMat = new THREE.MeshPhongMaterial({ color: 0xbd56ff, emissive: 0x5a189a });

        const outerBox = new THREE.Mesh(outerGeo, outerMat);
        const innerBox = new THREE.Mesh(innerGeo, innerMat);
        
        this.scene.add(outerBox);
        this.scene.add(innerBox);
        this.currentObjects.push(outerBox, innerBox);

        innerBox.userData = { animType: 'subquery_inner', time: 0 };
        outerBox.userData = { animType: 'subquery_outer', time: 0, inner: innerBox };

        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0,0,0);
    }

    // 12. INDEXES
    createIndexAnim() {
        const boxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const normalMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const targetMat = new THREE.MeshPhongMaterial({ color: 0xffd33d, emissive: 0xd29922 });

        for(let i=0; i<8; i++) {
            const isTarget = (i === 6);
            const box = new THREE.Mesh(boxGeo, isTarget ? targetMat : normalMat);
            box.position.set(i * 0.8 - 3, 0, 0);
            this.scene.add(box);
            this.currentObjects.push(box);
        }

        // The "Index" node
        const idxGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
        const idxMat = new THREE.MeshPhongMaterial({ color: 0x2ea043, emissive: 0x0f5132 });
        const idxMesh = new THREE.Mesh(idxGeo, idxMat);
        idxMesh.position.set(0, 3, 0);
        this.scene.add(idxMesh);
        this.currentObjects.push(idxMesh);

        idxMesh.userData = { animType: 'index', time: 0 };
        
        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0,0,0);
    }

    // 13. PROCEDURES
    createProcedureAnim() {
        const dbGeo = new THREE.CylinderGeometry(1.5, 1.5, 2, 32);
        const dbMat = new THREE.MeshPhongMaterial({ color: 0x58a6ff, transparent: true, opacity: 0.5, wireframe: false });
        const db = new THREE.Mesh(dbGeo, dbMat);
        this.scene.add(db);
        this.currentObjects.push(db);

        const codeGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const codeMat = new THREE.MeshPhongMaterial({ color: 0xbd56ff, emissive: 0x5a189a });
        const code = new THREE.Mesh(codeGeo, codeMat);
        code.position.set(-4, 0, 0);
        this.scene.add(code);
        this.currentObjects.push(code);

        code.userData = { animType: 'procedure_code', time: 0 };
        db.userData = { animType: 'procedure_db', time: 0, codeRef: code };

        this.camera.position.set(0, 4, 10);
        this.camera.lookAt(0,0,0);
    }

    // 14. OPTIMIZATION
    createOptimizationAnim() {
        // Slow lane vs Fast lane
        const boxGeo = new THREE.SphereGeometry(0.3, 16, 16); // Spheres rolling
        const matSlow = new THREE.MeshPhongMaterial({ color: 0xf85149 });
        const matFast = new THREE.MeshPhongMaterial({ color: 0x2ea043, emissive: 0x0f5132 });

        const s1 = new THREE.Mesh(boxGeo, matSlow);
        s1.position.set(-4, 1, 0);
        this.scene.add(s1);
        this.currentObjects.push(s1);
        s1.userData = { animType: 'opt_slow' };

        const s2 = new THREE.Mesh(boxGeo, matFast);
        s2.position.set(-4, -1, 0);
        this.scene.add(s2);
        this.currentObjects.push(s2);
        s2.userData = { animType: 'opt_fast', delay: 100, time: 0 };

        this.camera.position.set(0, 0, 8);
        this.camera.lookAt(0,0,0);
    }

    // Default
    createDefaultAnim() {
        const geo = new THREE.IcosahedronGeometry(1.5, 1);
        const mat = new THREE.MeshPhongMaterial({ color: 0xbd56ff, wireframe: true });
        const sphere = new THREE.Mesh(geo, mat);
        this.scene.add(sphere);
        this.currentObjects.push(sphere);
        sphere.userData = { animType: 'default', rotX: 0.01, rotY: 0.02 };
        this.camera.position.set(0, 0, 8);
        this.camera.lookAt(0,0,0);
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(this.animate);
        const delta = this.clock.getDelta();

        this.currentObjects.forEach(obj => {
            const data = obj.userData;
            if (!data) return;

            switch(data.animType) {
                case 'intro':
                    obj.rotation.y += data.speed;
                    obj.position.y += Math.sin(Date.now() * 0.002 + data.offset) * 0.005;
                    break;
                case 'select':
                    if (data.bobSpeed) {
                        data.time += data.bobSpeed;
                        obj.position.y = Math.sin(data.time) * 0.5;
                    }
                    break;
                case 'where':
                    data.time++;
                    if (!data.isKept && data.time > data.delay) {
                        obj.position.y -= 0.05;
                        obj.material.opacity = Math.max(0, obj.material.opacity - 0.05);
                    }
                    if (data.isKept && data.time > 100) {
                        obj.position.y = Math.sin(Date.now()*0.005) * 0.2; 
                    }
                    break;
                case 'order':
                    data.time++;
                    if (data.time > 60) {
                        // Smoothly move to target X
                        obj.position.x += (data.targetX - obj.position.x) * 0.05;
                    }
                    break;
                case 'insert':
                    if(Date.now() % 3000 > 1000) {
                        obj.position.x += (data.targetX - obj.position.x) * 0.1;
                        obj.position.y += (data.targetY - obj.position.y) * 0.1;
                    } else {
                        // reset occasionally for loop
                        if(obj.position.x > 1.9) obj.position.set(3, 5, 0);
                    }
                    break;
                case 'update':
                    data.time++;
                    if (data.time > 100 && data.materialToChange) {
                        obj.material = data.materialToChange;
                        obj.scale.set(1.2, 1.2, 1.2);
                        data.materialToChange = null; // trigger once
                    }
                    if(data.time > 250) {
                        obj.scale.set(1, 1, 1);
                        data.time = 0; // loop
                    }
                    break;
                case 'delete':
                    data.time++;
                    if (data.time > 100) {
                        if (data.isTarget) {
                            obj.scale.multiplyScalar(0.9);
                            obj.material.transparent = true;
                            obj.material.opacity *= 0.9;
                        } else {
                            obj.position.y += (data.targetY - obj.position.y) * 0.05;
                        }
                    }
                    if(data.time > 300) {
                        // reset
                        if(data.isTarget) { obj.scale.set(1,1,1); obj.material.opacity=1; }
                        obj.position.y = data.targetY + (data.isTarget ? 0 : (obj.userData.initialY > 0 ? 1 : 0)); // simple reset 
                        data.time = 0;
                    }
                    break;
                case 'join':
                    obj.position.x += (data.targetX - obj.position.x) * 0.03;
                    break;
                case 'groupby':
                    data.time++;
                    if (data.time > 60) {
                        obj.position.x += (data.targetX - obj.position.x) * 0.05;
                        obj.position.y += (data.targetY - obj.position.y) * 0.05;
                        obj.position.z += (data.targetZ - obj.position.z) * 0.05;
                    }
                    if(data.time > 300) {
                        obj.position.set((Math.random()-0.5)*8, (Math.random()-0.5)*4, (Math.random()-0.5)*4);
                        data.time = 0;
                    }
                    break;
                case 'aggregate':
                    data.time += delta;
                    if(data.time > 1 && data.time < 3) {
                        // Merge downwards
                        obj.children.forEach((c, idx) => {
                            if(idx > 0) c.position.y += (0 - c.position.y) * 0.05;
                        });
                    } else if (data.time > 4) {
                        obj.children.forEach((c, idx) => c.position.set(0, idx*0.5-1, 0));
                        data.time = 0;
                    }
                    break;
                case 'subquery_inner':
                    data.time += delta;
                    obj.rotation.x += 0.02;
                    obj.rotation.y += 0.03;
                    if(data.time > 1 && data.time < 2) obj.scale.setScalar(1 + Math.sin(data.time * 10) * 0.2);
                    else obj.scale.setScalar(1);
                    break;
                case 'subquery_outer':
                    if (data.inner.userData.time > 2) {
                        obj.material.opacity = 0.8;
                        obj.material.color.setHex(0xbd56ff);
                    } else {
                        obj.material.opacity = 0.3;
                        obj.material.color.setHex(0x58a6ff);
                    }
                    break;
                case 'index':
                    data.time++;
                    if(data.time > 60) {
                        // "beam" connecting to target box 6
                        obj.rotation.x += 0.05;
                        obj.position.y += (1 - obj.position.y) * 0.1;
                    }
                    if(data.time > 200) {
                        obj.position.set(0,3,0);
                        data.time = 0;
                    }
                    break;
                case 'procedure_code':
                    data.time++;
                    if(data.time > 30 && obj.position.x < 0) {
                        // slide into DB
                        obj.position.x += 0.1;
                    }
                    if(data.time > 250) {
                        obj.position.set(-4,0,0);
                        data.time = 0;
                    }
                    break;
                case 'procedure_db':
                    if(data.codeRef.position.x >= 0) {
                        // Executing
                        obj.rotation.y += 0.1;
                        obj.material.emissive.setHex(0x111111);
                    } else {
                        obj.rotation.y = 0;
                        obj.material.emissive.setHex(0x000000);
                    }
                    break;
                case 'opt_slow':
                    obj.position.x += 0.02; // slow
                    if(obj.position.x > 4) obj.position.x = -4;
                    break;
                case 'opt_fast':
                    data.time++;
                    if(data.time > data.delay) {
                        obj.position.x += 0.15; // fast!
                        if(obj.position.x > 4) {
                            obj.position.x = -4; 
                            data.time = 0; 
                        }
                    }
                    break;
                case 'default':
                    obj.rotation.x += data.rotX;
                    obj.rotation.y += data.rotY;
                    break;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }
}
