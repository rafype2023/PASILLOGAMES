import * as THREE from 'three';
import { FernanNPC, AlejandroNPC, HectorNPC, HostileNPC } from '../entities/NPCs.js';
import { sounds } from '../audio/SoundEffects.js';

export class ActiveShooterLevel {
    constructor(scene, floorPlan, particles, player) {
        this.scene = scene;
        this.floorPlan = floorPlan;
        this.particles = particles;
        this.player = player;

        this.npcs = [];
        this.hostiles = [];
        this.rescuedColleagues = 0;
        this.totalColleagues = 3;
        this.isComplete = false;
        this.isFailed = false;
        this.detectionMeter = 0; // 0 to 100%
        this.evacRouteArrows = [];
    }

    start() {
        this.cleanup();
        this.isComplete = false;
        this.isFailed = false;
        this.detectionMeter = 0;
        this.rescuedColleagues = 0;

        // 1. Set Emergency Red Lighting & Start Siren
        this.floorPlan.setEmergencyLighting(true);
        sounds.startSiren();

        // 2. Spawn Player at "Usted Está Aquí"
        this.player.spawn(this.floorPlan.spawnPoint);

        // 3. Spawn Hostile patrolling central hallways
        const patrolWp = [
            new THREE.Vector3(0, 0, 4),
            new THREE.Vector3(0, 0, 16),
            new THREE.Vector3(-14, 0, 16),
            new THREE.Vector3(-14, 0, 4)
        ];
        const h1 = new HostileNPC(this.scene, new THREE.Vector3(0, 0, 4), patrolWp);
        this.hostiles.push(h1);

        const patrolWp2 = [
            new THREE.Vector3(12, 0, 0),
            new THREE.Vector3(12, 0, 14),
            new THREE.Vector3(20, 0, 14),
            new THREE.Vector3(20, 0, 0)
        ];
        const h2 = new HostileNPC(this.scene, new THREE.Vector3(12, 0, 0), patrolWp2);
        this.hostiles.push(h2);

        // 4. Spawn Colleagues to Rescue
        this.fernan = new FernanNPC(this.scene, new THREE.Vector3(-4, 0, 12), this.particles);
        this.fernan.rescued = false;
        this.npcs.push(this.fernan);

        this.alejandro = new AlejandroNPC(this.scene, new THREE.Vector3(-18, 0, 8), this.particles);
        this.alejandro.rescued = false;
        this.npcs.push(this.alejandro);

        this.hector = new HectorNPC(this.scene, new THREE.Vector3(2, 0, 14));
        this.hector.rescued = false;
        this.npcs.push(this.hector);

        // 5. Draw Emergency Evacuation Route Visual Aids (Red glowing arrows on floor)
        this.createEvacuationArrows();
    }

    createEvacuationArrows() {
        // Points following red line in plano.png: (0, 0) -> (0, 16) -> (6, 18)
        const arrowPath = [
            new THREE.Vector3(-2, 0.02, 2),
            new THREE.Vector3(-2, 0.02, 6),
            new THREE.Vector3(-2, 0.02, 10),
            new THREE.Vector3(-2, 0.02, 14),
            new THREE.Vector3(0, 0.02, 16),
            new THREE.Vector3(3, 0.02, 16),
            new THREE.Vector3(6, 0.02, 17)
        ];

        const arrowGeo = new THREE.PlaneGeometry(0.6, 0.8);
        const arrowMat = new THREE.MeshBasicMaterial({
            color: 0xff3333,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        arrowPath.forEach((pt, idx) => {
            const arrow = new THREE.Mesh(arrowGeo, arrowMat);
            arrow.position.copy(pt);
            arrow.rotation.x = -Math.PI / 2;
            if (idx < 4) arrow.rotation.z = 0; // Downward South
            else arrow.rotation.z = -Math.PI / 2; // East toward stairs
            this.scene.add(arrow);
            this.evacRouteArrows.push(arrow);
        });
    }

    update(delta, camera) {
        if (this.isComplete || this.isFailed) return;

        // 1. Update Hostiles & Line-of-sight detection
        let beingSpotted = false;
        this.hostiles.forEach(h => {
            h.update(delta, camera, this.player);
            if (h.checkLineOfSight(this.player)) {
                beingSpotted = true;
            }
        });

        if (beingSpotted) {
            this.detectionMeter = Math.min(100, this.detectionMeter + delta * 45);
            sounds.playAlert();
        } else {
            this.detectionMeter = Math.max(0, this.detectionMeter - delta * 20);
        }

        if (this.detectionMeter >= 100) {
            this.isFailed = true;
            this.player.isDead = true;
            sounds.stopSiren();
            sounds.playGameOver();
            return;
        }

        // 2. Update Rescued Colleagues (Follow player convoy)
        this.npcs.forEach(npc => {
            if (!npc.rescued) {
                // Check if player came close to rescue them
                const dist = npc.position.distanceTo(this.player.position);
                if (dist < 2.0) {
                    npc.rescued = true;
                    this.rescuedColleagues++;
                    sounds.playPickup();
                }
            } else {
                // Follow behind player
                npc.setDestination(this.player.position);
            }
            npc.update(delta, camera);
        });

        // 3. Check for Emergency Exit Stairwell Escapes
        for (const exit of this.floorPlan.exits) {
            const dist = exit.pos.distanceTo(this.player.position);
            if (dist < 2.5) {
                // ESCAPED TO SAFETY!
                this.isComplete = true;
                sounds.stopSiren();
                sounds.playVictory();
                this.particles.createConfetti(this.player.position);
                break;
            }
        }

        // Pulse evacuation floor arrows
        this.evacRouteArrows.forEach((arr, i) => {
            arr.material.opacity = 0.4 + Math.sin(Date.now() * 0.005 + i) * 0.4;
        });
    }

    cleanup() {
        sounds.stopSiren();
        this.floorPlan.setEmergencyLighting(false);
        this.npcs.forEach(npc => npc.destroy());
        this.npcs = [];
        this.hostiles.forEach(h => h.destroy());
        this.hostiles = [];
        this.evacRouteArrows.forEach(arr => this.scene.remove(arr));
        this.evacRouteArrows = [];
    }
}
