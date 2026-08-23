import * as THREE from 'three';
import { officeMaterials } from './Materials.js';

export class OfficeProps {
    constructor() {
        this.materials = officeMaterials;
    }

    createCubicleDesk(width = 2.4, depth = 1.6, height = 0.75) {
        const group = new THREE.Group();

        // Main Desktop
        const topGeo = new THREE.BoxGeometry(width, 0.05, depth);
        const topMesh = new THREE.Mesh(topGeo, this.materials.get('deskTop'));
        topMesh.position.y = height;
        topMesh.castShadow = true;
        topMesh.receiveShadow = true;
        group.add(topMesh);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.03, 0.03, height);
        const legMat = this.materials.get('deskLegs');
        const xOffset = width / 2 - 0.1;
        const zOffset = depth / 2 - 0.1;

        const positions = [
            [-xOffset, height / 2, -zOffset],
            [xOffset, height / 2, -zOffset],
            [-xOffset, height / 2, zOffset],
            [xOffset, height / 2, zOffset]
        ];

        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            group.add(leg);
        });

        // Dual Monitors on desk
        const monitor1 = this.createMonitor();
        monitor1.position.set(-0.35, height + 0.025, -depth / 4);
        monitor1.rotation.y = 0.15;
        group.add(monitor1);

        const monitor2 = this.createMonitor();
        monitor2.position.set(0.35, height + 0.025, -depth / 4);
        monitor2.rotation.y = -0.15;
        group.add(monitor2);

        // Desk Phone
        const phone = this.createDeskPhone();
        phone.position.set(-width / 2 + 0.35, height + 0.025, 0.1);
        phone.rotation.y = 0.25;
        group.add(phone);

        // FirstBank Water Bottle
        const bottle = this.createWaterBottle();
        bottle.position.set(width / 2 - 0.25, height + 0.025, -0.2);
        group.add(bottle);

        // Office Chair
        const chair = this.createOfficeChair();
        chair.position.set(0, 0, 0.7);
        chair.rotation.y = Math.PI;
        group.add(chair);

        // Small Trash Can under desk
        const bin = this.createTrashCan();
        bin.position.set(width / 2 - 0.3, 0, depth / 2 + 0.1);
        group.add(bin);

        return group;
    }

    createMonitor() {
        const group = new THREE.Group();

        // Stand base
        const baseGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.02, 16);
        const baseMesh = new THREE.Mesh(baseGeo, this.materials.get('monitorPlastic'));
        baseMesh.position.y = 0.01;
        group.add(baseMesh);

        // Stand neck
        const neckGeo = new THREE.BoxGeometry(0.04, 0.22, 0.04);
        const neckMesh = new THREE.Mesh(neckGeo, this.materials.get('monitorPlastic'));
        neckMesh.position.set(0, 0.12, -0.02);
        group.add(neckMesh);

        // Screen bezel
        const screenWidth = 0.55;
        const screenHeight = 0.35;
        const bezelGeo = new THREE.BoxGeometry(screenWidth, screenHeight, 0.03);
        const bezelMesh = new THREE.Mesh(bezelGeo, this.materials.get('monitorPlastic'));
        bezelMesh.position.set(0, 0.28, 0);
        group.add(bezelMesh);

        // Screen display face
        const displayGeo = new THREE.PlaneGeometry(screenWidth - 0.03, screenHeight - 0.03);
        const displayMesh = new THREE.Mesh(displayGeo, this.materials.get('monitorScreen'));
        displayMesh.position.set(0, 0.28, 0.016);
        group.add(displayMesh);

        return group;
    }

    createDeskPhone() {
        const group = new THREE.Group();
        const bodyGeo = new THREE.BoxGeometry(0.2, 0.06, 0.22);
        const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.get('monitorPlastic'));
        bodyMesh.position.y = 0.03;
        bodyMesh.rotation.x = 0.15;
        group.add(bodyMesh);

        const handsetGeo = new THREE.BoxGeometry(0.06, 0.04, 0.24);
        const handsetMesh = new THREE.Mesh(handsetGeo, this.materials.get('monitorPlastic'));
        handsetMesh.position.set(-0.06, 0.06, 0);
        group.add(handsetMesh);
        return group;
    }

    createWaterBottle() {
        const group = new THREE.Group();
        const bodyGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 16);
        const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.get('fbGreen'));
        bodyMesh.position.y = 0.11;
        group.add(bodyMesh);

        const capGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.04, 16);
        const capMesh = new THREE.Mesh(capGeo, this.materials.get('monitorPlastic'));
        capMesh.position.y = 0.23;
        group.add(capMesh);

        return group;
    }

    createOfficeChair() {
        const group = new THREE.Group();

        // 5-Star Base
        const baseGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.04, 5);
        const baseMesh = new THREE.Mesh(baseGeo, this.materials.get('deskLegs'));
        baseMesh.position.y = 0.08;
        group.add(baseMesh);

        // Center post
        const postGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35);
        const postMesh = new THREE.Mesh(postGeo, this.materials.get('deskLegs'));
        postMesh.position.y = 0.24;
        group.add(postMesh);

        // Seat cushion
        const seatGeo = new THREE.BoxGeometry(0.48, 0.08, 0.48);
        const seatMesh = new THREE.Mesh(seatGeo, new THREE.MeshStandardMaterial({ color: 0x242b35, roughness: 0.8 }));
        seatMesh.position.y = 0.45;
        group.add(seatMesh);

        // Backrest (Ergonomic curved)
        const backGeo = new THREE.BoxGeometry(0.44, 0.52, 0.06);
        const backMesh = new THREE.Mesh(backGeo, new THREE.MeshStandardMaterial({ color: 0x2f3844, roughness: 0.8 }));
        backMesh.position.set(0, 0.72, -0.22);
        backMesh.rotation.x = -0.05;
        group.add(backMesh);

        return group;
    }

    createTrashCan() {
        const group = new THREE.Group();
        const canGeo = new THREE.CylinderGeometry(0.14, 0.11, 0.36, 12);
        const canMesh = new THREE.Mesh(canGeo, this.materials.get('monitorPlastic'));
        canMesh.position.y = 0.18;
        group.add(canMesh);
        return group;
    }

    createBalloonCluster(colorA = 0x33cc55, colorB = 0xff55aa) {
        const group = new THREE.Group();
        const balloonMatA = new THREE.MeshStandardMaterial({ color: colorA, roughness: 0.2, metalness: 0.1 });
        const balloonMatB = new THREE.MeshStandardMaterial({ color: colorB, roughness: 0.2, metalness: 0.1 });

        const offsets = [
            [-0.12, 0.15, 0, balloonMatA],
            [0.12, 0.18, 0.05, balloonMatB],
            [0, 0.32, -0.04, balloonMatA],
            [-0.08, -0.05, 0.08, balloonMatB],
            [0.08, -0.02, -0.08, balloonMatA]
        ];

        offsets.forEach(([x, y, z, mat]) => {
            const geo = new THREE.SphereGeometry(0.16, 16, 16);
            geo.scale(1.0, 1.25, 1.0);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y + 1.8, z);
            group.add(mesh);

            // String
            const stringGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.6);
            const stringMesh = new THREE.Mesh(stringGeo, new THREE.MeshBasicMaterial({ color: 0xcccccc }));
            stringMesh.position.set(x, y + 1.4, z);
            group.add(stringMesh);
        });

        return group;
    }

    createHeartBalloon() {
        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({
            color: 0xdd1133,
            roughness: 0.15,
            metalness: 0.7
        });

        // Stylized heart balloon
        const leftSphere = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), mat);
        leftSphere.position.set(-0.1, 0.1, 0);
        group.add(leftSphere);

        const rightSphere = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), mat);
        rightSphere.position.set(0.1, 0.1, 0);
        group.add(rightSphere);

        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.32, 16), mat);
        cone.position.set(0, -0.05, 0);
        cone.rotation.z = Math.PI;
        group.add(cone);

        return group;
    }

    createSnacksBuffet() {
        const group = new THREE.Group();

        // Round or Long Banquet Table
        const tableGeo = new THREE.BoxGeometry(3.2, 0.08, 1.4);
        const tableMesh = new THREE.Mesh(tableGeo, this.materials.get('deskTop'));
        tableMesh.position.y = 0.8;
        group.add(tableMesh);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8);
        const legMat = this.materials.get('deskLegs');
        [[-1.4, 0.4, -0.5], [1.4, 0.4, -0.5], [-1.4, 0.4, 0.5], [1.4, 0.4, 0.5]].forEach(p => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(...p);
            group.add(leg);
        });

        // Food Platter on Table
        const platterGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.04, 24);
        const platterMesh = new THREE.Mesh(platterGeo, this.materials.get('snacksTable'));
        platterMesh.position.set(0, 0.85, 0);
        group.add(platterMesh);

        // Chips bags & dips
        const chipBagMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.4 });
        const chipBag = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.15), chipBagMat);
        chipBag.position.set(-0.8, 0.98, 0.2);
        chipBag.rotation.z = 0.1;
        group.add(chipBag);

        const salsaMat = new THREE.MeshStandardMaterial({ color: 0x008822, roughness: 0.3 });
        const salsaBag = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.15), salsaMat);
        salsaBag.position.set(0.8, 0.95, -0.2);
        group.add(salsaBag);

        return group;
    }

    createHandSanitizer() {
        const group = new THREE.Group();
        const bottleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.15, 12);
        const bottleMat = new THREE.MeshStandardMaterial({
            color: 0x66ccff,
            transparent: true,
            opacity: 0.85,
            roughness: 0.2
        });
        const mesh = new THREE.Mesh(bottleGeo, bottleMat);
        mesh.position.y = 0.075;
        group.add(mesh);

        const pumpGeo = new THREE.BoxGeometry(0.04, 0.03, 0.08);
        const pumpMesh = new THREE.Mesh(pumpGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
        pumpMesh.position.set(0, 0.16, 0.02);
        group.add(pumpMesh);

        // Glowing ring for pickup
        const ringGeo = new THREE.RingGeometry(0.15, 0.2, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.01;
        group.add(ring);

        return group;
    }

    createMaskPickup() {
        const group = new THREE.Group();
        const maskGeo = new THREE.BoxGeometry(0.18, 0.12, 0.06);
        const maskMat = new THREE.MeshStandardMaterial({ color: 0x3399ff, roughness: 0.7 });
        const mask = new THREE.Mesh(maskGeo, maskMat);
        mask.position.y = 0.1;
        group.add(mask);

        // Floating glow
        const glowGeo = new THREE.SphereGeometry(0.18, 12, 12);
        const glowMat = new THREE.MeshBasicMaterial({ color: 0x33bbff, wireframe: true, transparent: true, opacity: 0.4 });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.y = 0.1;
        group.add(glow);

        return group;
    }

    createCoffeeCup() {
        const group = new THREE.Group();
        const cupGeo = new THREE.CylinderGeometry(0.05, 0.035, 0.12, 16);
        const cupMat = new THREE.MeshStandardMaterial({ color: 0xffeedd, roughness: 0.3 });
        const cup = new THREE.Mesh(cupGeo, cupMat);
        cup.position.y = 0.06;
        group.add(cup);

        // Coffee liquid
        const coffeeGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.01, 16);
        const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x331a00, roughness: 0.1 });
        const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
        coffee.position.y = 0.11;
        group.add(coffee);

        return group;
    }

    createStairwellExit(doorWidth = 1.2, doorHeight = 2.3) {
        const group = new THREE.Group();

        // Door Frame
        const frameMat = this.materials.get('cubicleTrim');
        const frameGeo = new THREE.BoxGeometry(doorWidth + 0.1, doorHeight + 0.05, 0.15);
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.y = doorHeight / 2;
        group.add(frame);

        // Red Exit Door
        const doorGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.06);
        const door = new THREE.Mesh(doorGeo, this.materials.get('exitDoor'));
        door.position.set(0, doorHeight / 2, 0);
        group.add(door);

        // Push Bar
        const barGeo = new THREE.BoxGeometry(doorWidth * 0.7, 0.06, 0.06);
        const bar = new THREE.Mesh(barGeo, this.materials.get('cubicleTrim'));
        bar.position.set(0, doorHeight * 0.45, 0.05);
        group.add(bar);

        // Illuminated EXIT / SALIDA Sign above door
        const signGeo = new THREE.BoxGeometry(0.5, 0.2, 0.08);
        const signMat = new THREE.MeshStandardMaterial({
            color: 0x00ff44,
            emissive: 0x00ee33,
            emissiveIntensity: 0.9
        });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, doorHeight + 0.2, 0.06);
        group.add(sign);

        return group;
    }

    createGreenArmchair() {
        const group = new THREE.Group();
        const mat = this.materials.get('greenArmchair');
        const darkMat = this.materials.get('deskLegs');

        // Seat Cushion
        const seatGeo = new THREE.BoxGeometry(0.7, 0.22, 0.7);
        const seat = new THREE.Mesh(seatGeo, mat);
        seat.position.y = 0.38;
        seat.castShadow = true;
        group.add(seat);

        // Backrest
        const backGeo = new THREE.BoxGeometry(0.7, 0.65, 0.2);
        const back = new THREE.Mesh(backGeo, mat);
        back.position.set(0, 0.7, -0.28);
        back.castShadow = true;
        group.add(back);

        // Left Armrest
        const armGeo = new THREE.BoxGeometry(0.18, 0.42, 0.74);
        const leftArm = new THREE.Mesh(armGeo, mat);
        leftArm.position.set(-0.38, 0.52, 0);
        leftArm.castShadow = true;
        group.add(leftArm);

        // Right Armrest
        const rightArm = new THREE.Mesh(armGeo, mat);
        rightArm.position.set(0.38, 0.52, 0);
        rightArm.castShadow = true;
        group.add(rightArm);

        // 4 Legs
        const legGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.26);
        const legPositions = [
            [-0.32, 0.13, -0.3],
            [0.32, 0.13, -0.3],
            [-0.32, 0.13, 0.3],
            [0.32, 0.13, 0.3]
        ];
        legPositions.forEach(p => {
            const leg = new THREE.Mesh(legGeo, darkMat);
            leg.position.set(p[0], p[1], p[2]);
            group.add(leg);
        });

        return group;
    }

    createConferenceTable(width = 4.2, depth = 1.8, chairCount = 8) {
        const group = new THREE.Group();
        const tableMat = this.materials.get('confTableWood');
        const legMat = this.materials.get('elevatorSteel');

        // Large Oval Conference Tabletop
        const topGeo = new THREE.BoxGeometry(width, 0.08, depth);
        const topMesh = new THREE.Mesh(topGeo, tableMat);
        topMesh.position.y = 0.76;
        topMesh.castShadow = true;
        group.add(topMesh);

        // Cable trough in center
        const troughGeo = new THREE.BoxGeometry(width * 0.4, 0.01, 0.15);
        const trough = new THREE.Mesh(troughGeo, legMat);
        trough.position.set(0, 0.805, 0);
        group.add(trough);

        // Heavy pedestal base columns
        const colGeo = new THREE.CylinderGeometry(0.22, 0.32, 0.72, 16);
        const col1 = new THREE.Mesh(colGeo, legMat);
        col1.position.set(-width * 0.28, 0.36, 0);
        group.add(col1);

        const col2 = new THREE.Mesh(colGeo, legMat);
        col2.position.set(width * 0.28, 0.36, 0);
        group.add(col2);

        // Surrounding Conference Chairs
        const chairsPerSide = Math.floor((chairCount - 2) / 2);
        for (let i = 0; i < chairsPerSide; i++) {
            const x = -width * 0.35 + (i / Math.max(1, chairsPerSide - 1)) * (width * 0.7);

            // North side
            const chairN = this.createOfficeChair();
            chairN.position.set(x, 0, -depth / 2 - 0.35);
            chairN.rotation.y = 0;
            group.add(chairN);

            // South side
            const chairS = this.createOfficeChair();
            chairS.position.set(x, 0, depth / 2 + 0.35);
            chairS.rotation.y = Math.PI;
            group.add(chairS);
        }

        // End Head Chairs
        const chairW = this.createOfficeChair();
        chairW.position.set(-width / 2 - 0.4, 0, 0);
        chairW.rotation.y = Math.PI / 2;
        group.add(chairW);

        const chairE = this.createOfficeChair();
        chairE.position.set(width / 2 + 0.4, 0, 0);
        chairE.rotation.y = -Math.PI / 2;
        group.add(chairE);

        return group;
    }

    createRoundMeetingTable(radius = 1.0, chairCount = 4) {
        const group = new THREE.Group();
        const topGeo = new THREE.CylinderGeometry(radius, radius, 0.06, 24);
        const top = new THREE.Mesh(topGeo, this.materials.get('deskTop'));
        top.position.y = 0.75;
        top.castShadow = true;
        group.add(top);

        const legGeo = new THREE.CylinderGeometry(0.08, 0.25, 0.72, 16);
        const leg = new THREE.Mesh(legGeo, this.materials.get('elevatorSteel'));
        leg.position.y = 0.36;
        group.add(leg);

        for (let i = 0; i < chairCount; i++) {
            const angle = (i / chairCount) * Math.PI * 2;
            const chair = this.createOfficeChair();
            chair.position.set(Math.cos(angle) * (radius + 0.4), 0, Math.sin(angle) * (radius + 0.4));
            chair.rotation.y = -angle - Math.PI / 2;
            group.add(chair);
        }

        return group;
    }

    createElevatorBank() {
        const group = new THREE.Group();
        const steelMat = this.materials.get('elevatorSteel');
        const trimMat = this.materials.get('cubicleTrim');

        // 3 Elevator Doors
        for (let i = 0; i < 3; i++) {
            const z = (i - 1) * 3.2;

            // Frame
            const frameGeo = new THREE.BoxGeometry(0.15, 2.6, 2.0);
            const frame = new THREE.Mesh(frameGeo, trimMat);
            frame.position.set(0, 1.3, z);
            group.add(frame);

            // Left & Right Sliding Doors
            const doorGeo = new THREE.BoxGeometry(0.06, 2.4, 0.88);
            const leftDoor = new THREE.Mesh(doorGeo, steelMat);
            leftDoor.position.set(0.05, 1.2, z - 0.46);
            group.add(leftDoor);

            const rightDoor = new THREE.Mesh(doorGeo, steelMat);
            rightDoor.position.set(0.05, 1.2, z + 0.46);
            group.add(rightDoor);

            // Floor indicator screen (Level 3)
            const indGeo = new THREE.BoxGeometry(0.08, 0.2, 0.35);
            const indMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00cc66, emissiveIntensity: 0.8 });
            const ind = new THREE.Mesh(indGeo, indMat);
            ind.position.set(0.1, 2.45, z);
            group.add(ind);
        }

        return group;
    }

    createFilingCabinet() {
        const group = new THREE.Group();
        const mat = this.materials.get('filingCabinet');
        const bodyGeo = new THREE.BoxGeometry(0.48, 0.72, 0.58);
        const body = new THREE.Mesh(bodyGeo, mat);
        body.position.y = 0.36;
        body.castShadow = true;
        group.add(body);

        // Drawer handles
        const handleGeo = new THREE.BoxGeometry(0.03, 0.04, 0.18);
        const handleMat = this.materials.get('deskLegs');
        for (let y of [0.22, 0.52]) {
            const h = new THREE.Mesh(handleGeo, handleMat);
            h.position.set(0.25, y, 0);
            group.add(h);
        }
        return group;
    }

    createWhiteboard(width = 3.0, height = 1.4) {
        const group = new THREE.Group();
        const frameMat = this.materials.get('cubicleTrim');
        const boardMat = this.materials.get('whiteboard');

        // Frame
        const frameGeo = new THREE.BoxGeometry(width + 0.1, height + 0.1, 0.04);
        const frame = new THREE.Mesh(frameGeo, frameMat);
        group.add(frame);

        // Whiteboard Face
        const boardGeo = new THREE.PlaneGeometry(width, height);
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.z = 0.025;
        group.add(board);

        // Marker tray
        const trayGeo = new THREE.BoxGeometry(width * 0.7, 0.02, 0.08);
        const tray = new THREE.Mesh(trayGeo, frameMat);
        tray.position.set(0, -height / 2 - 0.01, 0.04);
        group.add(tray);

        return group;
    }
}

export const officeProps = new OfficeProps();
