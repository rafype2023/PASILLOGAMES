import * as THREE from 'three';
import { sounds } from '../audio/SoundEffects.js';

// Base NPC class with stylized arms and animated limbs
export class BaseNPC {
    constructor(scene, name, shirtColor, startPos) {
        this.scene = scene;
        this.name = name;
        this.position = startPos.clone();
        this.targetPos = null;
        this.speed = 3.6;
        this.facingAngle = 0;
        this.isFalling = false;
        this.fallTimer = 0;
        this.mesh = new THREE.Group();

        this.initMesh(shirtColor);
        this.scene.add(this.mesh);
    }

    initMesh(shirtColor) {
        // Head
        const headGeo = new THREE.BoxGeometry(0.34, 0.36, 0.32);
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xedc2a4, roughness: 0.6 });
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x332211, roughness: 0.9 });
        const headMaterials = [skinMat, skinMat, hairMat, skinMat, skinMat, hairMat];

        this.head = new THREE.Mesh(headGeo, headMaterials);
        this.head.position.y = 1.55;
        this.head.castShadow = true;
        this.mesh.add(this.head);

        // Name Tag above head
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.roundRect ? ctx.roundRect(0, 0, 160, 40, 8) : ctx.fillRect(0, 0, 160, 40);
        ctx.fill();
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, 80, 26);

        const nameTex = new THREE.CanvasTexture(canvas);
        const nameMat = new THREE.MeshBasicMaterial({ map: nameTex, side: THREE.DoubleSide, transparent: true });
        this.nameTag = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.25), nameMat);
        this.nameTag.position.y = 2.0;
        this.mesh.add(this.nameTag);

        // Torso
        const torsoGeo = new THREE.BoxGeometry(0.48, 0.58, 0.28);
        const torsoMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 });
        this.torso = new THREE.Mesh(torsoGeo, torsoMat);
        this.torso.position.y = 1.06;
        this.torso.castShadow = true;
        this.mesh.add(this.torso);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.12, 0.52, 0.14);
        this.leftArm = new THREE.Mesh(armGeo, torsoMat);
        this.leftArm.position.set(-0.31, 1.05, 0);
        this.leftArm.castShadow = true;
        this.mesh.add(this.leftArm);

        this.rightArm = new THREE.Mesh(armGeo, torsoMat);
        this.rightArm.position.set(0.31, 1.05, 0);
        this.rightArm.castShadow = true;
        this.mesh.add(this.rightArm);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.17, 0.7, 0.2);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.85 });

        this.leftLeg = new THREE.Mesh(legGeo, legMat);
        this.leftLeg.position.set(-0.13, 0.35, 0);
        this.leftLeg.castShadow = true;
        this.mesh.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(legGeo, legMat);
        this.rightLeg.position.set(0.13, 0.35, 0);
        this.rightLeg.castShadow = true;
        this.mesh.add(this.rightLeg);

        this.mesh.position.copy(this.position);
    }

    setDestination(target) {
        this.targetPos = target.clone();
    }

    update(delta, camera) {
        if (this.nameTag && camera) {
            this.nameTag.lookAt(camera.position);
        }
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}

// 1. Fernan: Always Falling!
export class FernanNPC extends BaseNPC {
    constructor(scene, startPos, particles) {
        super(scene, 'Fernan 😵', 0x2e6b9e, startPos); // Blue polo
        this.particles = particles;
        this.fallCooldown = 3.5 + Math.random() * 3.5;
        this.isDown = false;
    }

    update(delta, camera) {
        super.update(delta, camera);

        if (this.isDown) {
            this.fallTimer -= delta;
            if (this.fallTimer <= 0) {
                // Recover from floor
                this.isDown = false;
                this.mesh.rotation.x = 0;
                this.mesh.position.y = 0;
                this.fallCooldown = 4.0 + Math.random() * 5.0;
            }
            return;
        }

        this.fallCooldown -= delta;
        if (this.fallCooldown <= 0) {
            this.tripAndFall();
            return;
        }

        if (this.targetPos) {
            const dir = this.targetPos.clone().sub(this.position);
            dir.y = 0;
            const dist = dir.length();
            if (dist > 0.5) {
                dir.normalize();
                this.position.addScaledVector(dir, this.speed * delta);
                this.mesh.position.copy(this.position);
                this.mesh.rotation.y = Math.atan2(dir.x, dir.z);

                const swing = Math.sin(Date.now() * 0.01) * 0.5;
                this.leftLeg.rotation.x = swing;
                this.rightLeg.rotation.x = -swing;
                this.leftArm.rotation.x = -swing;
                this.rightArm.rotation.x = swing;
            }
        }
    }

    tripAndFall() {
        this.isDown = true;
        this.fallTimer = 2.2;
        sounds.playFernanFall();

        this.mesh.rotation.x = Math.PI / 2;
        this.mesh.position.y = -0.3;

        if (this.particles) {
            this.particles.createStumbleStars(this.position);
        }
    }
}

// 2. Alejandro: Always Laughing!
export class AlejandroNPC extends BaseNPC {
    constructor(scene, startPos, particles) {
        super(scene, 'Alejandro 😂', 0xcc7722, startPos); // Orange polo
        this.particles = particles;
        this.laughCooldown = 2.5 + Math.random() * 3.0;
        this.laughingTimer = 0;
    }

    update(delta, camera) {
        super.update(delta, camera);

        this.laughCooldown -= delta;
        if (this.laughCooldown <= 0) {
            this.laughCooldown = 4.0 + Math.random() * 4.0;
            this.laughingTimer = 1.2;
            sounds.playLaugh();
            if (this.particles) {
                this.particles.createLaughEmoji(this.position);
            }
        }

        if (this.laughingTimer > 0) {
            this.laughingTimer -= delta;
            this.torso.rotation.x = Math.sin(Date.now() * 0.025) * 0.35;
            this.head.rotation.x = Math.sin(Date.now() * 0.025) * 0.35;
            this.leftArm.rotation.x = Math.sin(Date.now() * 0.025) * 0.5;
            this.rightArm.rotation.x = Math.sin(Date.now() * 0.025) * 0.5;
        } else {
            this.torso.rotation.x = 0;
            this.head.rotation.x = 0;
        }

        if (this.targetPos) {
            const dir = this.targetPos.clone().sub(this.position);
            dir.y = 0;
            const dist = dir.length();
            if (dist > 0.5) {
                dir.normalize();
                this.position.addScaledVector(dir, this.speed * delta);
                this.mesh.position.copy(this.position);
                this.mesh.rotation.y = Math.atan2(dir.x, dir.z);

                const swing = Math.sin(Date.now() * 0.01) * 0.5;
                this.leftLeg.rotation.x = swing;
                this.rightLeg.rotation.x = -swing;
                if (this.laughingTimer <= 0) {
                    this.leftArm.rotation.x = -swing;
                    this.rightArm.rotation.x = swing;
                }
            }
        }
    }
}

// 3. Hector: Tactical Coworker
export class HectorNPC extends BaseNPC {
    constructor(scene, startPos) {
        super(scene, 'Hector ⚡', 0x228844, startPos); // Green polo
        this.speed = 4.6;
    }

    update(delta, camera) {
        super.update(delta, camera);

        if (this.targetPos) {
            const dir = this.targetPos.clone().sub(this.position);
            dir.y = 0;
            const dist = dir.length();
            if (dist > 0.5) {
                dir.normalize();
                this.position.addScaledVector(dir, this.speed * delta);
                this.mesh.position.copy(this.position);
                this.mesh.rotation.y = Math.atan2(dir.x, dir.z);

                const swing = Math.sin(Date.now() * 0.012) * 0.5;
                this.leftLeg.rotation.x = swing;
                this.rightLeg.rotation.x = -swing;
                this.leftArm.rotation.x = -swing;
                this.rightArm.rotation.x = swing;
            }
        }
    }
}

// 4. Sneezer NPC (COVID Hazard - Stalks and pursues our hero Guillo!)
export class SneezerNPC extends BaseNPC {
    constructor(scene, startPos, waypoints, particles) {
        super(scene, 'Sick Worker 🤧', 0x992222, startPos);
        this.waypoints = waypoints;
        this.currentWpIndex = 0;
        this.particles = particles;
        this.sneezeTimer = 2.0 + Math.random() * 2.0;
        this.speed = 2.8; // Active pursuit speed
        this.detectionRange = 25.0; // Notices player across the office
    }

    update(delta, camera, player) {
        super.update(delta, camera);

        let target = null;

        // Actively seek and move towards Guillo if nearby
        if (player && !player.isDead) {
            const distToPlayer = this.position.distanceTo(player.position);
            if (distToPlayer < this.detectionRange) {
                target = player.position.clone();
            }
        }

        if (!target && this.waypoints.length > 0) {
            target = this.waypoints[this.currentWpIndex];
        }

        if (target) {
            const dir = target.clone().sub(this.position);
            dir.y = 0;
            const dist = dir.length();

            // Aim sneeze when close to Guillo
            if (player && dist < 4.0) {
                this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
            }

            if (dist > 1.2) {
                dir.normalize();
                this.position.addScaledVector(dir, this.speed * delta);
                this.mesh.position.copy(this.position);
                this.mesh.rotation.y = Math.atan2(dir.x, dir.z);

                const swing = Math.sin(Date.now() * 0.012) * 0.45;
                this.leftLeg.rotation.x = swing;
                this.rightLeg.rotation.x = -swing;
                this.leftArm.rotation.x = -swing;
                this.rightArm.rotation.x = swing;
            } else if (!player && this.waypoints.length > 0) {
                this.currentWpIndex = (this.currentWpIndex + 1) % this.waypoints.length;
            }
        }

        // Periodic Sneeze aimed at player
        this.sneezeTimer -= delta;
        if (this.sneezeTimer <= 0) {
            this.sneezeTimer = 2.8 + Math.random() * 2.2;
            sounds.playSneeze();

            const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
            const sneezePos = this.position.clone().add(new THREE.Vector3(0, 1.4, 0));
            this.particles.createSneezeBurst(sneezePos, forward);
        }
    }
}

// 5. Hostile / Active Threat
export class HostileNPC extends BaseNPC {
    constructor(scene, startPos, waypoints) {
        super(scene, '⚠️ HAZARD', 0x111111, startPos);
        this.waypoints = waypoints;
        this.currentWpIndex = 0;
        this.speed = 3.0;

        // Flashlight cone
        const spotGeo = new THREE.ConeGeometry(2.5, 9.0, 16);
        const spotMat = new THREE.MeshBasicMaterial({
            color: 0xff2222,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide
        });
        this.visionCone = new THREE.Mesh(spotGeo, spotMat);
        this.visionCone.position.set(0, 1.2, 4.5);
        this.visionCone.rotation.x = -Math.PI / 2;
        this.mesh.add(this.visionCone);
    }

    checkLineOfSight(player) {
        const dirToPlayer = player.position.clone().sub(this.position);
        dirToPlayer.y = 0;
        const dist = dirToPlayer.length();

        if (dist > 10.0) return false;

        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
        dirToPlayer.normalize();

        const angle = forward.angleTo(dirToPlayer);
        if (angle < Math.PI / 4) {
            if (player.isCrouching && dist > 2.8) {
                return false; // Hidden behind cubicle wall!
            }
            return true;
        }
        return false;
    }

    update(delta, camera, player) {
        super.update(delta, camera);

        if (this.waypoints.length > 0) {
            const target = this.waypoints[this.currentWpIndex];
            const dir = target.clone().sub(this.position);
            dir.y = 0;
            const dist = dir.length();
            if (dist < 0.8) {
                this.currentWpIndex = (this.currentWpIndex + 1) % this.waypoints.length;
            } else {
                dir.normalize();
                this.position.addScaledVector(dir, this.speed * delta);
                this.mesh.position.copy(this.position);
                this.mesh.rotation.y = Math.atan2(dir.x, dir.z);

                const swing = Math.sin(Date.now() * 0.01) * 0.5;
                this.leftLeg.rotation.x = swing;
                this.rightLeg.rotation.x = -swing;
                this.leftArm.rotation.x = -swing;
                this.rightArm.rotation.x = swing;
            }
        }
    }
}
