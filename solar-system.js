// solar-system.js - نظام المجموعة الشمسية
// =========================================

class SolarSystemRenderer {
    constructor(scene, astroBridge) {
        this.scene = scene;
        this.astroBridge = astroBridge;
        
        this.sun = null;
        this.moon = null;
        this.planets = [];
        
        this.settings = {
            showSun: true,
            showMoon: true,
            showPlanets: true,
            showOrbits: false,
            scale: 0.1 // مقياس النظام الشمسي بالنسبة للكرة السماوية
        };
    }
    
    async initialize() {
        console.log('☀️ تهيئة نظام المجموعة الشمسية...');
        
        // إنشاء الشمس
        this.createSun();
        
        // إنشاء القمر
        this.createMoon();
        
        // إنشاء الكواكب
        this.createPlanets();
        
        console.log('✅ نظام المجموعة الشمسية جاهز');
        return true;
    }
    
    createSun() {
        // حساب موقع الشمس الحالي
        const sunPosition = this.calculateSunPosition();
        
        // هندسة الشمس
        const geometry = new THREE.SphereGeometry(15, 32, 32);
        
        // مادة الشمس مع تأثيرات خاصة
        const material = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            emissive: 0xFF4500,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.9
        });
        
        this.sun = new THREE.Mesh(geometry, material);
        this.sun.position.set(sunPosition.x, sunPosition.y, sunPosition.z);
        this.sun.name = 'sun';
        
        // إضافة هالة (corona)
        this.createSunCorona();
        
        // إضافة توهج (glow)
        this.createSunGlow();
        
        this.scene.add(this.sun);
    }
    
    createSunCorona() {
        const coronaGeometry = new THREE.SphereGeometry(25, 32, 32);
        const coronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 }
            },
            vertexShader: `
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vPosition;
                
                void main() {
                    float distance = length(vPosition);
                    float intensity = 1.0 - smoothstep(0.0, 25.0, distance);
                    
                    // تأثير موجي
                    float wave = sin(distance * 0.5 - time * 0.001) * 0.5 + 0.5;
                    intensity *= wave * 0.3 + 0.7;
                    
                    // تدرج لوني
                    vec3 innerColor = vec3(1.0, 0.9, 0.6);
                    vec3 outerColor = vec3(1.0, 0.6, 0.2);
                    vec3 color = mix(outerColor, innerColor, intensity);
                    
                    gl_FragColor = vec4(color, intensity * 0.3);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        
        const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        corona.name = 'sun-corona';
        this.sun.add(corona);
    }
    
    createSunGlow() {
        // تأثير توهج إضافي
        const glowGeometry = new THREE.SphereGeometry(40, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF6600,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.name = 'sun-glow';
        this.sun.add(glow);
    }
    
    createMoon() {
        const moonPosition = this.calculateMoonPosition();
        
        const geometry = new THREE.SphereGeometry(8, 32, 32);
        
        // نسيج القمر (يمكن إضافة texture حقيقي)
        const material = new THREE.MeshStandardMaterial({
            color: 0xCCCCCC,
            roughness: 0.8,
            metalness: 0.1,
            bumpScale: 0.05
        });
        
        this.moon = new THREE.Mesh(geometry, material);
        this.moon.position.set(moonPosition.x, moonPosition.y, moonPosition.z);
        this.moon.name = 'moon';
        
        // إضافة توهج خفيف
        this.createMoonGlow();
        
        this.scene.add(this.moon);
    }
    
    createMoonGlow() {
        const glowGeometry = new THREE.SphereGeometry(12, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x8888FF,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.name = 'moon-glow';
        this.moon.add(glow);
    }
    
    createPlanets() {
        const planetsData = this.astroBridge.planets;
        
        planetsData.forEach(planetData => {
            const planetPosition = this.calculatePlanetPosition(planetData);
            
            const geometry = new THREE.SphereGeometry(
                planetData.radius * this.settings.scale * 50, 
                24, 
                24
            );
            
            const material = new THREE.MeshStandardMaterial({
                color: planetData.color,
                roughness: 0.7,
                metalness: 0.3,
                emissive: planetData.color,
                emissiveIntensity: 0.1
            });
            
            const planet = new THREE.Mesh(geometry, material);
            planet.position.set(
                planetPosition.x, 
                planetPosition.y, 
                planetPosition.z
            );
            planet.name = `planet-${planetData.name}`;
            planet.userData = { ...planetData };
            
            // إضافة تسمية
            this.createPlanetLabel(planet, planetData);
            
            this.scene.add(planet);
            this.planets.push(planet);
        });
    }
    
    createPlanetLabel(planet, planetData) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100;
        canvas.height = 30;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(planetData.arabicName, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture, 
            transparent: true,
            opacity: 0.8
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(10, 3, 1);
        sprite.position.y = planetData.radius * this.settings.scale * 50 + 5;
        planet.add(sprite);
    }
    
    calculateSunPosition(date = new Date()) {
        // حساب مبسط لموقع الشمس
        const dayOfYear = this.getDayOfYear(date);
        const declination = 23.44 * Math.sin((dayOfYear - 80) * (2 * Math.PI / 365));
        
        // حساب RA مبسط (تقريبي)
        const sunRA = ((dayOfYear + 10) % 365) * 0.9856; // تقريب RA
        
        // تحويل إلى إحداثيات سمتية
        const spherical = this.astroBridge.equatorialToHorizontal(
            sunRA,
            declination,
            currentLatitude,
            localSiderealTime
        );
        
        return this.astroBridge.horizontalToCartesian(
            spherical.azimuth,
            spherical.altitude,
            SYSTEM.SPHERE_RADIUS * 0.95 // داخل القبة قليلاً
        );
    }
    
    calculateMoonPosition(date = new Date()) {
        // حساب تقريبي لموقع القمر
        const moonPhase = this.getMoonPhase(date);
        const moonAge = this.getMoonAge(date);
        
        // حساب مبسط - القمر يتحرك أسرع من الشمس
        const moonRA = (localSiderealTime + moonAge * 0.5) % 24;
        const moonDeclination = Math.sin(moonAge * 0.2) * 28;
        
        const spherical = this.astroBridge.equatorialToHorizontal(
            moonRA,
            moonDeclination,
            currentLatitude,
            localSiderealTime
        );
        
        return this.astroBridge.horizontalToCartesian(
            spherical.azimuth,
            spherical.altitude,
            SYSTEM.SPHERE_RADIUS * 0.97
        );
    }
    
    calculatePlanetPosition(planetData) {
        // حساب موقع كوكب (تقريبي)
        // في نظام حقيقي، نحتاج إلى حسابات إهليلجية دقيقة
        
        const planetRA = (localSiderealTime + planetData.id * 2) % 24;
        const planetDeclination = Math.sin(planetData.id * 0.5) * 20;
        
        const spherical = this.astroBridge.equatorialToHorizontal(
            planetRA,
            planetDeclination,
            currentLatitude,
            localSiderealTime
        );
        
        return this.astroBridge.horizontalToCartesian(
            spherical.azimuth,
            spherical.altitude,
            SYSTEM.SPHERE_RADIUS * 0.99
        );
    }
    
    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }
    
    getMoonPhase(date) {
        // حساب طور القمر التقريبي
        const lunarCycle = 29.53; // أيام
        const knownNewMoon = new Date('2024-01-11');
        const diffDays = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
        const age = diffDays % lunarCycle;
        
        return age / lunarCycle; // 0 = محاق، 0.5 = بدر
    }
    
    getMoonAge(date) {
        const lunarCycle = 29.53;
        const knownNewMoon = new Date('2024-01-11');
        const diffDays = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
        return diffDays % lunarCycle;
    }
    
    update(time) {
        // تحديث مواقع الأجرام
        if (this.sun) {
            const sunPos = this.calculateSunPosition();
            this.sun.position.set(sunPos.x, sunPos.y, sunPos.z);
            
            // دوران الشمس
            this.sun.rotation.y += 0.001;
        }
        
        if (this.moon) {
            const moonPos = this.calculateMoonPosition();
            this.moon.position.set(moonPos.x, moonPos.y, moonPos.z);
            
            // تحدطور القمر
            const phase = this.getMoonPhase(new Date());
            this.updateMoonPhase(phase);
        }
        
        // تحديث الكواكب
        this.planets.forEach((planet, index) => {
            const planetData = planet.userData;
            const planetPos = this.calculatePlanetPosition(planetData);
            planet.position.set(planetPos.x, planetPos.y, planetPos.z);
            
            // دوران الكواكب
            planet.rotation.y += 0.002 * (index + 1);
        });
    }
    
    updateMoonPhase(phase) {
        if (!this.moon) return;
        
        // تحديث مظهر القمر حسب الطور
        // يمكن هنا تغيير النسيج أو اللون
        const darkness = Math.abs(phase - 0.5) * 2; // 0 = مضيء بالكامل، 1 = مظلم بالكامل
        
        if (this.moon.material) {
            this.moon.material.emissiveIntensity = 0.1 * (1 - darkness);
        }
    }
    
    setVisibility(sun, moon, planets) {
        if (this.sun) this.sun.visible = sun;
        if (this.moon) this.moon.visible = moon;
        this.planets.forEach(planet => {
            planet.visible = planets;
        });
    }
    
    dispose() {
        // تنظيف الذاكرة
        if (this.sun) {
            this.scene.remove(this.sun);
            this.sun.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
        
        if (this.moon) {
            this.scene.remove(this.moon);
            this.moon.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
        
        this.planets.forEach(planet => {
            this.scene.remove(planet);
            planet.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });
        
        this.planets = [];
    }
}

// تصدير للاستخدام العام
window.SolarSystemRenderer = SolarSystemRenderer;