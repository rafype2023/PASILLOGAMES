import * as THREE from 'three';

class OfficeMaterials {
    constructor() {
        this.loader = new THREE.TextureLoader();
        this.materials = {};
        this.initMaterials();
    }

    initMaterials() {
        // Carpet Texture (Using uploaded authentic office carpet tile texture)
        const carpetTex = this.loader.load('/assets/carpet_texture.jpg');
        carpetTex.wrapS = THREE.RepeatWrapping;
        carpetTex.wrapT = THREE.RepeatWrapping;
        carpetTex.repeat.set(16, 12);

        this.materials.carpet = new THREE.MeshStandardMaterial({
            map: carpetTex,
            roughness: 0.88,
            metalness: 0.05,
            color: 0xffffff
        });

        // Cubicle Fabric Texture
        const fabricTex = this.loader.load('/assets/cubicle_fabric.jpg');
        fabricTex.wrapS = THREE.RepeatWrapping;
        fabricTex.wrapT = THREE.RepeatWrapping;
        fabricTex.repeat.set(2, 2);

        this.materials.cubicleFabric = new THREE.MeshStandardMaterial({
            map: fabricTex,
            roughness: 0.9,
            metalness: 0.02,
            color: 0xb5b0a3 // Beige fabric matching photos
        });

        this.materials.cubicleTrim = new THREE.MeshStandardMaterial({
            color: 0x6e7377, // Grey aluminum trim
            roughness: 0.4,
            metalness: 0.6
        });

        // Wood Desks (Light Birch / Maple)
        this.materials.deskTop = new THREE.MeshStandardMaterial({
            color: 0xddcbb2,
            roughness: 0.5,
            metalness: 0.1
        });

        this.materials.deskLegs = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.3,
            metalness: 0.7
        });

        // Ceiling Drop Tiles
        this.materials.ceiling = new THREE.MeshStandardMaterial({
            color: 0xf5f5f5,
            roughness: 0.95,
            metalness: 0.0
        });

        // Fluorescent Lights (Emissive white)
        this.materials.fluorescentLight = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffee,
            emissiveIntensity: 0.8,
            roughness: 0.2
        });

        // Emergency Light (Red Alert Emissive)
        this.materials.emergencyLight = new THREE.MeshStandardMaterial({
            color: 0xff1111,
            emissive: 0xff0000,
            emissiveIntensity: 1.2,
            roughness: 0.2
        });

        // Perimeter Walls
        this.materials.wall = new THREE.MeshStandardMaterial({
            color: 0xedece6,
            roughness: 0.9,
            metalness: 0.05
        });

        // Glass for conference rooms
        this.materials.glass = new THREE.MeshPhysicalMaterial({
            color: 0xddeeff,
            transparent: true,
            opacity: 0.35,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.8,
            ior: 1.5
        });

        // Whiteboard Texture
        const whiteboardTex = this.loader.load('/assets/whiteboard.png');
        this.materials.whiteboard = new THREE.MeshStandardMaterial({
            map: whiteboardTex,
            roughness: 0.3,
            metalness: 0.1
        });

        // Birthday Banner Texture
        const bannerTex = this.loader.load('/assets/birthday_banner.png');
        this.materials.birthdayBanner = new THREE.MeshStandardMaterial({
            map: bannerTex,
            roughness: 0.4,
            transparent: true
        });

        // Computer Monitors
        this.materials.monitorScreen = new THREE.MeshStandardMaterial({
            color: 0x051a2e,
            emissive: 0x004477,
            emissiveIntensity: 0.6,
            roughness: 0.2
        });

        this.materials.monitorPlastic = new THREE.MeshStandardMaterial({
            color: 0x1f1f1f,
            roughness: 0.6,
            metalness: 0.2
        });

        // FirstBank Green Branding Accent
        this.materials.fbGreen = new THREE.MeshStandardMaterial({
            color: 0x008850,
            roughness: 0.4,
            metalness: 0.2
        });

        // Red Stairwell / Fire Exit Door Material
        this.materials.exitDoor = new THREE.MeshStandardMaterial({
            color: 0xba2d2d,
            roughness: 0.4,
            metalness: 0.3
        });

        // Snacks Spread
        const snacksTex = this.loader.load('/assets/snacks_table.png');
        this.materials.snacksTable = new THREE.MeshStandardMaterial({
            map: snacksTex,
            roughness: 0.6
        });
    }

    get(name) {
        return this.materials[name] || new THREE.MeshStandardMaterial({ color: 0x888888 });
    }
}

export const officeMaterials = new OfficeMaterials();
