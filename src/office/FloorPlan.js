import * as THREE from 'three';
import { officeMaterials } from './Materials.js';
import { officeProps } from './Props.js';

export class FloorPlan {
    constructor(scene) {
        this.scene = scene;
        this.materials = officeMaterials;
        this.props = officeProps;
        this.colliders = []; // List of bounding boxes for physics collision
        this.exits = [];     // List of exit locations (stairwells)
        this.spawnPoint = new THREE.Vector3(0, 0, 0); // "USTED ESTA AQUI"
        this.loungePoint = new THREE.Vector3(18, 0, -4); // Breakroom Lounge
        this.cubicleDesks = [];
        this.lights = [];
        this.interactiveObjects = [];

        this.buildOffice();
    }

    buildOffice() {
        this.group = new THREE.Group();

        // 1. Floor & Ceiling
        this.createFloorAndCeiling();

        // 2. Perimeter Walls
        this.createPerimeterWalls();

        // 3. Central Corridor & "Usted Está Aquí" Location
        this.createCorridors();

        // 4. Cubicle Pods (North, South, West, Central)
        this.createCubicleClusters();

        // 5. Conference Rooms & Executive Offices
        this.createPrivateOffices();

        // 6. Lounge / Cafeteria Area (East Wing)
        this.createLoungeArea();

        // 7. Stairwells / Fire Exits (Matching 3 Pink Zones in plano.png)
        this.createStairwells();

        // 8. Office Decor & Lighting Grid
        this.createCeilingLights();
        this.createDecorations();

        this.scene.add(this.group);
    }

    createFloorAndCeiling() {
        // Floor Mesh (64m x 44m)
        const floorGeo = new THREE.PlaneGeometry(64, 44);
        const floorMesh = new THREE.Mesh(floorGeo, this.materials.get('carpet'));
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.receiveShadow = true;
        this.group.add(floorMesh);

        // Open top for isometric top-down camera (no solid ceiling blocking view)
        // Add subtle overhead perimeter beams
        const beamMat = this.materials.get('cubicleTrim');
        for (let x = -28; x <= 28; x += 14) {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 44), beamMat);
            beam.position.set(x, 3.4, 0);
            this.group.add(beam);
        }
    }

    createPerimeterWalls() {
        // Outer boundaries of Floor 3
        const wallMat = this.materials.get('wall');
        const height = 3.2;

        // North Wall
        this.addWall(0, height / 2, -22, 64, height, 0.3, wallMat);
        // South Wall
        this.addWall(0, height / 2, 22, 64, height, 0.3, wallMat);
        // West Wall
        this.addWall(-32, height / 2, 0, 0.3, height, 44, wallMat);
        // East Wall
        this.addWall(32, height / 2, 0, 0.3, height, 44, wallMat);
    }

    addWall(x, y, z, w, h, d, material, isCubicle = false) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.group.add(mesh);

        // Register collider box for collision detection
        const box = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(x, isCubicle ? 0.8 : y, z),
            new THREE.Vector3(w, isCubicle ? 1.6 : h, d)
        );
        this.colliders.push(box);
        return mesh;
    }

    createCubicleClusters() {
        const cubicleMat = this.materials.get('cubicleFabric');
        const partitionH = 1.55; // Standard 5ft cubicle wall height

        // 1. Central Cluster (Around "Usted Está Aquí")
        const centralX = [-6, -2];
        const centralZ = [4, 8, 12, 16];
        this.generateCubicleGrid(centralX, centralZ, partitionH, cubicleMat);

        // 2. West Wing Cluster (Large cubicle farm)
        const westX = [-26, -22, -18, -14];
        const westZ = [-16, -12, -8, -4, 0, 4, 8, 12, 16];
        this.generateCubicleGrid(westX, westZ, partitionH, cubicleMat);

        // 3. South Wing Cluster
        const southX = [8, 12, 16, 20, 24];
        const southZ = [10, 14, 18];
        this.generateCubicleGrid(southX, southZ, partitionH, cubicleMat);

        // 4. North-Central Cluster
        const northX = [-8, -4, 0];
        const northZ = [-16, -12, -8];
        this.generateCubicleGrid(northX, northZ, partitionH, cubicleMat);
    }

    generateCubicleGrid(xCoords, zCoords, h, mat) {
        for (let i = 0; i < xCoords.length; i++) {
            const x = xCoords[i];
            for (let j = 0; j < zCoords.length; j++) {
                const z = zCoords[j];

                // Cubicle Dividers (Back & Side partitions)
                this.addWall(x, h / 2, z - 1.2, 2.6, h, 0.08, mat, true);
                this.addWall(x - 1.3, h / 2, z, 0.08, h, 2.4, mat, true);

                // Add Desk & Equipment
                const desk = this.props.createCubicleDesk(2.2, 1.4, 0.75);
                desk.position.set(x, 0, z);
                this.group.add(desk);
                this.cubicleDesks.push({ x, z });

                // Cubicle collider box
                const deskBox = new THREE.Box3().setFromCenterAndSize(
                    new THREE.Vector3(x, 0.4, z),
                    new THREE.Vector3(2.0, 0.8, 1.2)
                );
                this.colliders.push(deskBox);
            }
        }
    }

    createCorridors() {
        // "USTED ESTA AQUI" (Starting Spawn Point from plano.png)
        this.spawnPoint.set(-2, 0, 0);

        // Visual floor decal for "USTED ESTA AQUI" (Green circle from blueprint)
        const decalGeo = new THREE.RingGeometry(0.5, 0.7, 32);
        const decalMat = new THREE.MeshBasicMaterial({ color: 0x00aa44, side: THREE.DoubleSide });
        const decal = new THREE.Mesh(decalGeo, decalMat);
        decal.rotation.x = -Math.PI / 2;
        decal.position.set(-2, 0.01, 0);
        this.group.add(decal);

        const centerDot = new THREE.Mesh(
            new THREE.CircleGeometry(0.35, 32),
            new THREE.MeshBasicMaterial({ color: 0x00cc44, side: THREE.DoubleSide })
        );
        centerDot.rotation.x = -Math.PI / 2;
        centerDot.position.set(-2, 0.012, 0);
        this.group.add(centerDot);
    }

    createPrivateOffices() {
        const wallMat = this.materials.get('wall');
        const glassMat = this.materials.get('glass');
        const h = 3.2;

        // North-West Executive Offices
        this.addWall(-28, h / 2, -18, 7.5, h, 0.2, wallMat);
        this.addWall(-20, h / 2, -18, 7.5, h, 0.2, glassMat);

        // Center Conference Room (Near Lounge)
        this.addWall(4, h / 2, -6, 6, h, 0.2, wallMat);
        this.addWall(10, h / 2, -6, 6, h, 0.2, glassMat);
        this.addWall(7, h / 2, -12, 12, h, 0.2, wallMat);
    }

    createLoungeArea() {
        // East Wing: Breakroom / Lounge (Where the birthday buffet table is)
        const buffet = this.props.createSnacksBuffet();
        buffet.position.set(18, 0, -4);
        this.group.add(buffet);
        this.loungePoint.set(18, 0, -4);

        // Lounge Round Table & Green Armchairs (matching IMG_4358)
        const tableGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.05, 24);
        const tableMesh = new THREE.Mesh(tableGeo, this.materials.get('deskTop'));
        tableMesh.position.set(22, 0.75, -10);
        this.group.add(tableMesh);

        // Table leg
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.75, 16), this.materials.get('deskLegs'));
        leg.position.set(22, 0.375, -10);
        this.group.add(leg);

        // Green Lounge Chairs
        const chairMat = new THREE.MeshStandardMaterial({ color: 0x5a7a4f, roughness: 0.8 });
        [[-1.2, 0], [1.2, 0], [0, -1.2], [0, 1.2]].forEach(([dx, dz]) => {
            const chair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.6), chairMat);
            chair.position.set(22 + dx, 0.35, -10 + dz);
            this.group.add(chair);
        });

        // Birthday Banner over lounge entrance (matching IMG_9457)
        const bannerGeo = new THREE.PlaneGeometry(3.5, 0.65);
        const bannerMesh = new THREE.Mesh(bannerGeo, this.materials.get('birthdayBanner'));
        bannerMesh.position.set(12, 2.4, -4);
        bannerMesh.rotation.y = Math.PI / 2;
        this.group.add(bannerMesh);

        // Balloon Clusters around lounge
        const balloon1 = this.props.createBalloonCluster(0x33cc55, 0xff4499);
        balloon1.position.set(16, 0, -6);
        this.group.add(balloon1);

        const balloon2 = this.props.createBalloonCluster(0x00aaff, 0xffbb00);
        balloon2.position.set(21, 0, -2);
        this.group.add(balloon2);
    }

    createStairwells() {
        // 3 Stairwells marked in plano.png:
        // 1. West Stairwell (Left Pink Zone)
        const stairWest = this.props.createStairwellExit();
        stairWest.position.set(-30, 0, 8);
        stairWest.rotation.y = Math.PI / 2;
        this.group.add(stairWest);
        this.exits.push({ id: 'west', pos: new THREE.Vector3(-30, 0, 8), name: 'West Stairs (Escalera Oeste)' });

        // 2. North Stairwell (Top Center Pink Zone)
        const stairNorth = this.props.createStairwellExit();
        stairNorth.position.set(-6, 0, -20);
        this.group.add(stairNorth);
        this.exits.push({ id: 'north', pos: new THREE.Vector3(-6, 0, -20), name: 'North Stairs (Escalera Norte)' });

        // 3. South-East Stairwell (Bottom Center/East Pink Zone - Primary Evacuation Route)
        const stairSouth = this.props.createStairwellExit();
        stairSouth.position.set(6, 0, 18);
        stairSouth.rotation.y = -Math.PI / 2;
        this.group.add(stairSouth);
        this.exits.push({ id: 'south', pos: new THREE.Vector3(6, 0, 18), name: 'South Emergency Stairs (Ruta Principal)' });

        // 4. Far East Stairwell
        const stairEast = this.props.createStairwellExit();
        stairEast.position.set(28, 0, 12);
        stairEast.rotation.y = -Math.PI / 2;
        this.group.add(stairEast);
        this.exits.push({ id: 'east', pos: new THREE.Vector3(28, 0, 12), name: 'East Stairs (Escalera Este)' });
    }

    createCeilingLights() {
        // Grid of Fluorescent Ceiling Light Fixtures
        const lightMat = this.materials.get('fluorescentLight');
        const fixtureGeo = new THREE.BoxGeometry(2.0, 0.04, 0.6);

        for (let x = -28; x <= 28; x += 8) {
            for (let z = -18; z <= 18; z += 6) {
                const fixture = new THREE.Mesh(fixtureGeo, lightMat);
                fixture.position.set(x, 3.18, z);
                this.group.add(fixture);

                // Add PointLight for soft office glow
                const pLight = new THREE.PointLight(0xfff5ea, 0.45, 12, 1.8);
                pLight.position.set(x, 2.9, z);
                this.group.add(pLight);
                this.lights.push(pLight);
            }
        }
    }

    createDecorations() {
        // Whiteboards on select cubicle pillars
        const wbMat = this.materials.get('whiteboard');
        const wbGeo = new THREE.PlaneGeometry(1.6, 1.0);

        const wb1 = new THREE.Mesh(wbGeo, wbMat);
        wb1.position.set(-6.1, 1.6, 6);
        wb1.rotation.y = Math.PI / 2;
        this.group.add(wb1);

        const wb2 = new THREE.Mesh(wbGeo, wbMat);
        wb2.position.set(-14.1, 1.6, -4);
        wb2.rotation.y = Math.PI / 2;
        this.group.add(wb2);

        // Guillo's Red Valentine Heart Foil Balloon at his desk!
        const guilloBalloon = this.props.createHeartBalloon();
        guilloBalloon.position.set(-2.6, 1.2, 0.3);
        this.group.add(guilloBalloon);
    }

    setEmergencyLighting(isEmergency = true) {
        if (isEmergency) {
            this.lights.forEach(l => {
                l.color.setHex(0xff1111);
                l.intensity = 0.7;
            });
        } else {
            this.lights.forEach(l => {
                l.color.setHex(0xfff5ea);
                l.intensity = 0.45;
            });
        }
    }
}
