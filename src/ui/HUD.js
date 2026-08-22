import { sounds } from '../audio/SoundEffects.js';

export class HUD {
    constructor(game) {
        this.game = game;
        this.minimapCanvas = document.getElementById('minimap');
        this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
        this.missionTime = 15 * 60; // 15:00 countdown timer

        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('btn-mute')?.addEventListener('click', () => {
            const muted = sounds.toggleMute();
            const btn = document.getElementById('btn-mute');
            if (btn) btn.innerText = muted ? '🔇 Silenciado' : '🔊 Sonido';
        });

        document.getElementById('btn-cam')?.addEventListener('click', () => {
            if (this.game.player) {
                this.game.player.toggleCameraMode();
                this.updateCamButton();
            }
        });

        document.getElementById('btn-restart')?.addEventListener('click', () => {
            this.game.restartLevel();
        });

        document.getElementById('btn-next-level')?.addEventListener('click', () => {
            this.game.nextLevel();
        });

        document.getElementById('btn-menu')?.addEventListener('click', () => {
            this.game.showMenu();
        });
    }

    updateCamButton() {
        const btn = document.getElementById('btn-cam');
        if (btn && this.game.player) {
            const mode = this.game.player.cameraMode;
            if (mode === 'isometric') btn.innerText = '🎥 Vista: Isométrica';
            else if (mode === 'third') btn.innerText = '🎥 Vista: 3ra Persona';
            else btn.innerText = '👁️ Vista: 1ra Persona';
        }
    }

    update(levelIndex, currentLevel, player) {
        if (!player) return;

        // Level tag
        const levelTag = document.getElementById('hud-level-tag');
        if (levelTag) levelTag.innerText = `LEVEL ${levelIndex + 1}`;

        // Timer update
        const timerEl = document.getElementById('hud-timer-val');
        if (timerEl) {
            const mins = Math.floor(this.missionTime / 60);
            const secs = Math.floor(this.missionTime % 60);
            timerEl.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        const healthBar = document.getElementById('hud-health-bar');
        const healthLabel = document.getElementById('hud-health-label');
        const healthVal = document.getElementById('hud-health-val');

        const staminaBar = document.getElementById('hud-stamina-bar');
        const staminaLabel = document.getElementById('hud-stamina-label');
        const staminaVal = document.getElementById('hud-stamina-val');

        const chaosLabel = document.getElementById('hud-chaos-label');
        const statusSub = document.getElementById('hud-status-subtitle');

        if (levelIndex === 0) { // COVID
            const infVal = Math.round(player.infection);
            const healthPct = Math.max(0, 100 - infVal);
            if (healthBar) healthBar.style.width = `${healthPct}%`;
            if (healthLabel) healthLabel.innerText = player.isMasked ? 'MASK IMMUNITY' : 'HEALTH';
            if (healthVal) healthVal.innerText = `${healthPct}%`;

            if (staminaBar) staminaBar.style.width = `${Math.round(player.stamina)}%`;
            if (staminaLabel) staminaLabel.innerText = 'STAMINA';
            if (staminaVal) staminaVal.innerText = `${Math.round(player.stamina)}%`;

            // 45-Second Safe Place Relocation Countdown
            const timeLeft = Math.ceil(currentLevel.safeRelocateTimer || 45);
            if (timerEl) timerEl.innerText = `00:${timeLeft.toString().padStart(2, '0')}`;
            if (chaosLabel) chaosLabel.innerText = `CAMBIO EN ${timeLeft}s`;
            if (statusSub) statusSub.innerText = `ESTACIÓN: ${currentLevel.currentLocationName || 'Lounge'} (45s)`;
        } else if (levelIndex === 1) { // Lounge Race
            const stam = Math.round(player.stamina);
            if (healthBar) healthBar.style.width = `100%`;
            if (healthLabel) healthLabel.innerText = 'ENERGY';
            if (healthVal) healthVal.innerText = `100%`;

            if (staminaBar) staminaBar.style.width = `${stam}%`;
            if (staminaLabel) staminaLabel.innerText = (player.boostTimer > 0) ? 'TURBO BOOST' : 'STAMINA';
            if (staminaVal) staminaVal.innerText = `${stam}%`;

            if (chaosLabel) chaosLabel.innerText = `CARRERA ACTIVA`;
            if (statusSub) statusSub.innerText = `TIEMPO: ${(currentLevel.raceTime || 0).toFixed(1)}s`;
        } else if (levelIndex === 2) { // Active Shooter Evacuation
            const risk = Math.round(currentLevel.detectionMeter || 0);
            const safePct = 100 - risk;
            if (healthBar) healthBar.style.width = `${safePct}%`;
            if (healthLabel) healthLabel.innerText = player.isCrouching ? 'STEALTH (SAFE)' : 'DETECTION RISK';
            if (healthVal) healthVal.innerText = `${risk}%`;

            if (staminaBar) staminaBar.style.width = `${Math.round(player.stamina)}%`;
            if (staminaLabel) staminaLabel.innerText = 'STAMINA';
            if (staminaVal) staminaVal.innerText = `${Math.round(player.stamina)}%`;

            if (chaosLabel) chaosLabel.innerText = `ALERT CHAOS ${risk}%`;
            const rescued = currentLevel.rescuedColleagues || 0;
            if (statusSub) statusSub.innerText = `COMPAÑEROS RESCATADOS: ${rescued}/3`;
        }

        // Inventory slots update
        const countEl = document.getElementById('carrying-count');
        if (countEl) countEl.innerText = `${player.carryingCount || 0}/8`;

        // Update slots visuals
        const slotBoxes = document.querySelectorAll('.slot-box');
        slotBoxes.forEach((box, idx) => {
            if (idx < (player.carryingCount || 0)) {
                box.classList.add('active-slot');
            } else {
                box.classList.remove('active-slot');
            }
        });

        // 2. Draw Dynamic Minimap
        this.drawMinimap(levelIndex, currentLevel, player);
    }

    drawMinimap(levelIndex, currentLevel, player) {
        if (!this.minimapCtx || !this.minimapCanvas) return;
        const ctx = this.minimapCtx;
        const w = this.minimapCanvas.width;
        const h = this.minimapCanvas.height;

        ctx.clearRect(0, 0, w, h);

        const mapX = (x) => ((x + 32) / 64) * (w - 16) + 8;
        const mapY = (z) => ((z + 22) / 44) * (h - 16) + 8;

        // Background
        ctx.fillStyle = '#0f0c09';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(184, 142, 75, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(4, 4, w - 8, h - 8);

        // Draw Lounge Area
        ctx.fillStyle = 'rgba(230, 190, 109, 0.2)';
        ctx.fillRect(mapX(12), mapY(-12), mapX(30) - mapX(12), mapY(4) - mapY(-12));

        // Draw Level 1 Dynamic Safe Station Beacon on Minimap (Green pulsing beacon)
        if (levelIndex === 0 && currentLevel && currentLevel.safeStationPos) {
            const sx = mapX(currentLevel.safeStationPos.x);
            const sy = mapY(currentLevel.safeStationPos.z);
            const pulse = 4 + Math.sin(Date.now() * 0.008) * 3;

            ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
            ctx.beginPath();
            ctx.arc(sx, sy, pulse + 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(sx, sy, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Exits / Stairwells (Red)
        ctx.fillStyle = '#ff3344';
        if (this.game.floorPlan) {
            this.game.floorPlan.exits.forEach(ex => {
                ctx.fillRect(mapX(ex.pos.x) - 3, mapY(ex.pos.z) - 3, 6, 6);
            });
        }

        // Draw "Usted Está Aquí"
        ctx.fillStyle = '#00aa55';
        ctx.beginPath();
        ctx.arc(mapX(-2), mapY(0), 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw NPCs
        if (currentLevel && currentLevel.npcs) {
            currentLevel.npcs.forEach(npc => {
                ctx.fillStyle = npc.name.includes('Fernan') ? '#389cd4' : (npc.name.includes('Alejandro') ? '#e6be6d' : '#00dd66');
                ctx.beginPath();
                ctx.arc(mapX(npc.position.x), mapY(npc.position.z), 3, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Draw Hostiles in Level 3
        if (levelIndex === 2 && currentLevel.hostiles) {
            currentLevel.hostiles.forEach(hostile => {
                ctx.fillStyle = '#ff1111';
                ctx.beginPath();
                ctx.arc(mapX(hostile.position.x), mapY(hostile.position.z), 3.5, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Draw Player (Guillo)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mapX(player.position.x), mapY(player.position.z), 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Direction pointer
        const angle = player.facingAngle;
        ctx.strokeStyle = '#e6be6d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mapX(player.position.x), mapY(player.position.z));
        ctx.lineTo(
            mapX(player.position.x) + Math.sin(angle) * 8,
            mapY(player.position.z) + Math.cos(angle) * 8
        );
        ctx.stroke();
    }

    showVictory(title, message, score) {
        const modal = document.getElementById('modal-gameover');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('modal-title').innerText = `🎉 ${title}`;
            document.getElementById('modal-title').style.color = '#e6be6d';
            document.getElementById('modal-message').innerText = message;
            document.getElementById('modal-score').innerText = score ? `Score / Time: ${score}` : '';
            document.getElementById('btn-next-level').style.display = 'inline-block';
        }
    }

    showDefeat(title, message) {
        const modal = document.getElementById('modal-gameover');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('modal-title').innerText = `💥 ${title}`;
            document.getElementById('modal-title').style.color = '#e8637c';
            document.getElementById('modal-message').innerText = message;
            document.getElementById('modal-score').innerText = '';
            document.getElementById('btn-next-level').style.display = 'none';
        }
    }

    hideModal() {
        const modal = document.getElementById('modal-gameover');
        if (modal) modal.style.display = 'none';
    }
}
