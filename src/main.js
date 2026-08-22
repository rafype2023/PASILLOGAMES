import * as THREE from 'three';
import { FloorPlan } from './office/FloorPlan.js';
import { Player } from './entities/Player.js';
import { ParticleSystem } from './entities/Particles.js';
import { CovidLevel } from './levels/CovidLevel.js';
import { LoungeRaceLevel } from './levels/LoungeRaceLevel.js';
import { ActiveShooterLevel } from './levels/ActiveShooterLevel.js';
import { HUD } from './ui/HUD.js';
import { sounds } from './audio/SoundEffects.js';

export class Game {
    constructor() {
        this.container = document.getElementById('game-container');
        this.currentLevelIndex = 0;
        this.clock = new THREE.Clock();

        this.initThree();
        this.initScene();
        this.initUI();
    }

    initThree() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);

        // Scene & Camera
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x10141a);
        this.scene.fog = new THREE.FogExp2(0x10141a, 0.018);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 150);

        // Ambient Light
        this.ambientLight = new THREE.AmbientLight(0xfffaed, 0.75);
        this.scene.add(this.ambientLight);

        // Directional Sun / Overhead Key Light (Casting long shadows like in reference)
        this.dirLight = new THREE.DirectionalLight(0xffeedd, 1.3);
        this.dirLight.position.set(24, 32, 18);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 2048;
        this.dirLight.shadow.mapSize.height = 2048;
        this.dirLight.shadow.camera.near = 0.5;
        this.dirLight.shadow.camera.far = 100;
        this.dirLight.shadow.camera.left = -35;
        this.dirLight.shadow.camera.right = 35;
        this.dirLight.shadow.camera.top = 35;
        this.dirLight.shadow.camera.bottom = -35;
        this.dirLight.shadow.bias = -0.0005;
        this.scene.add(this.dirLight);

        // Fill Light
        const fillLight = new THREE.DirectionalLight(0xaaccff, 0.4);
        fillLight.position.set(-20, 20, -20);
        this.scene.add(fillLight);

        // Resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initScene() {
        // Floor Plan & 3D Office Environment
        this.floorPlan = new FloorPlan(this.scene);

        // Particles
        this.particles = new ParticleSystem(this.scene);

        // Player (Guillo)
        this.player = new Player(this.scene, this.camera, this.renderer.domElement);

        // Levels
        this.levels = [
            new CovidLevel(this.scene, this.floorPlan, this.particles, this.player),
            new LoungeRaceLevel(this.scene, this.floorPlan, this.particles, this.player),
            new ActiveShooterLevel(this.scene, this.floorPlan, this.particles, this.player)
        ];

        // HUD & Minimap
        this.hud = new HUD(this);

        // Start render loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initUI() {
        // Level selection cards
        document.querySelectorAll('.level-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const lvl = parseInt(card.getAttribute('data-level'), 10);
                this.startLevel(lvl);
            });
        });
    }

    startLevel(index) {
        // Cleanup previous
        if (this.currentLevel) {
            this.currentLevel.cleanup();
        }
        this.particles.clear();
        this.hud.hideModal();

        this.currentLevelIndex = index;
        this.currentLevel = this.levels[index];

        // Hide Menu, Show Game HUD
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('game-hud').style.display = 'block';

        // Update Level Title Banner
        const titles = [
            '🦠 Nivel 1: Brote de COVID-19 (Evita los Estornudos)',
            '🏃 Nivel 2: La Gran Carrera al Lounge (Snacks & Cumpleaños)',
            '🚨 Nivel 3: Evacuación de Emergencia (Plano Desalojo Piso 3)'
        ];
        const objectives = [
            'Navega los cubículos, recolecta mascarillas N95 y desinfectante, y llega a la Estación Segura.',
            '¡Corre al lounge contra Fernan, Alejandro y Hector! Agarra café para turbo velocidad y llega primero al buffet.',
            '¡Alarma activada! Agáchate detrás de los cubículos para no ser detectado, rescata a tus compañeros y sal por las escaleras.'
        ];

        document.getElementById('hud-level-title').innerText = titles[index];
        document.getElementById('hud-objective-text').innerText = objectives[index];

        // Start the level logic
        this.currentLevel.start();
        sounds.init();
    }

    restartLevel() {
        this.startLevel(this.currentLevelIndex);
    }

    nextLevel() {
        const next = (this.currentLevelIndex + 1) % this.levels.length;
        this.startLevel(next);
    }

    showMenu() {
        if (this.currentLevel) {
            this.currentLevel.cleanup();
        }
        this.particles.clear();
        this.hud.hideModal();
        document.getElementById('main-menu').style.display = 'flex';
        document.getElementById('game-hud').style.display = 'none';
    }

    animate() {
        requestAnimationFrame(this.animate);
        const delta = Math.min(this.clock.getDelta(), 0.1);

        if (this.currentLevel) {
            // Update Player
            this.player.update(delta, this.floorPlan.colliders);

            // Update Current Level logic
            this.currentLevel.update(delta, this.camera);

            // Update Particles
            this.particles.update(delta, this.camera);

            // Update HUD & Minimap
            this.hud.update(this.currentLevelIndex, this.currentLevel, this.player);

            // Check Victory / Defeat triggers
            if (this.currentLevel.isComplete) {
                if (this.currentLevelIndex === 0) {
                    this.hud.showVictory('¡Sobreviviste al Brote!', 'Llegaste a la Estación Segura sin contagiarte.');
                } else if (this.currentLevelIndex === 1) {
                    const place = this.currentLevel.rank === 1 ? '🥇 1er Lugar' : (this.currentLevel.rank === 2 ? '🥈 2do Lugar' : '🥉 3er Lugar');
                    this.hud.showVictory(`¡Llegaste al Lounge! (${place})`, `Tiempo: ${this.currentLevel.raceTime.toFixed(1)}s`);
                } else if (this.currentLevelIndex === 2) {
                    this.hud.showVictory('¡Evacuación Exitosa!', `Escapaste a salvo por la Escalera de Emergencia junto a ${this.currentLevel.rescuedColleagues} compañeros.`);
                }
            } else if (this.currentLevel.isFailed) {
                if (this.currentLevelIndex === 0) {
                    this.hud.showDefeat('¡Te Contagiaste!', 'La carga viral llegó al 100%. Usa mascarillas y desinfectante para protegerte.');
                } else if (this.currentLevelIndex === 2) {
                    this.hud.showDefeat('¡Fuiste Detectado!', 'Agáchate [C] detrás de las paredes de los cubículos para pasar desapercibido.');
                }
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
